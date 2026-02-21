import { useCallback, useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui";
import { AgentCommandCenter } from "@/components/orchestrate/AgentCommandCenter";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { AgentModelRoutingPanel } from "@/components/orchestrate/AgentModelRoutingPanel";
import { ProjectSwitcher } from "@/components/sidebar";
import {
  deleteOrchestratorRun,
  getProvidersConfig,
  onSidecarEventV2,
  type StreamEventEnvelopeV2,
  type UserProject,
} from "@/lib/tauri";
import {
  DEFAULT_ORCHESTRATOR_CONFIG,
  type OrchestratorConfig,
  type OrchestratorModelRouting,
  type RunSummary,
  type RunSnapshot,
  type Task,
} from "@/components/orchestrate/types";
import { CheckCircle2, Loader2, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type QualityPreset = "speed" | "balanced" | "quality";
type SwarmStage = "idle" | "planning" | "awaiting_review" | "executing" | "completed" | "failed";
type TabId = "task-to-swarm" | "advanced";

interface CommandCenterPageProps {
  userProjects: UserProject[];
  activeProject: UserProject | null;
  onSwitchProject: (projectId: string) => void;
  onAddProject: () => void;
  onManageProjects: () => void;
  projectSwitcherLoading?: boolean;
}

function stageFromSnapshot(snapshot: RunSnapshot | null): SwarmStage {
  if (!snapshot) return "idle";
  if (snapshot.status === "planning") return "planning";
  if (snapshot.status === "awaiting_approval") return "awaiting_review";
  if (snapshot.status === "executing" || snapshot.status === "paused") return "executing";
  if (snapshot.status === "completed") return "completed";
  if (snapshot.status === "failed" || snapshot.status === "cancelled") return "failed";
  return "idle";
}

export function CommandCenterPage({
  userProjects,
  activeProject,
  onSwitchProject,
  onAddProject,
  onManageProjects,
  projectSwitcherLoading = false,
}: CommandCenterPageProps) {
  const { t } = useTranslation("commandCenter");
  const [tab, setTab] = useState<TabId>("task-to-swarm");
  const [objective, setObjective] = useState("");
  const [preset, setPreset] = useState<QualityPreset>("balanced");
  const [runId, setRunId] = useState<string | null>(null);
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [snapshot, setSnapshot] = useState<RunSnapshot | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [eventFeed, setEventFeed] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(undefined);
  const [modelRouting, setModelRouting] = useState<OrchestratorModelRouting>({});

  const stage = stageFromSnapshot(snapshot);
  const workspacePath = activeProject?.path ?? null;

  const loadRuns = useCallback(async () => {
    setRunsLoading(true);
    try {
      const listed = await invoke<RunSummary[]>("orchestrator_list_runs");
      listed.sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
      setRuns(listed);
    } catch {
      setRuns([]);
    } finally {
      setRunsLoading(false);
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    if (!runId) {
      setSnapshot(null);
      setTasks([]);
      return;
    }

    const poll = async () => {
      try {
        const [nextSnapshot, nextTasks] = await Promise.all([
          invoke<RunSnapshot>("orchestrator_get_run", { runId }),
          invoke<Task[]>("orchestrator_list_tasks", { runId }),
        ]);
        if (disposed) return;
        setSnapshot(nextSnapshot);
        setTasks(nextTasks);
      } catch {
        if (disposed) return;
      }
    };

    void poll();
    const timer = setInterval(() => void poll(), 1250);
    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [runId]);

  useEffect(() => {
    setRunId(null);
    setSnapshot(null);
    setTasks([]);
    setEventFeed([]);
    void loadRuns();
  }, [activeProject?.id, loadRuns]);

  useEffect(() => {
    void loadRuns();
    const timer = setInterval(() => void loadRuns(), 5000);
    return () => clearInterval(timer);
  }, [loadRuns]);

  useEffect(() => {
    let disposed = false;
    const loadModelDefaults = async () => {
      try {
        const config = await getProvidersConfig();
        if (disposed) return;
        const model = config.selected_model?.model_id;
        let provider = config.selected_model?.provider_id;
        if (provider === "opencode") provider = "opencode_zen";
        if (model) setSelectedModel(model);
        if (provider) setSelectedProvider(provider);
      } catch {
        // best effort only
      }
    };
    void loadModelDefaults();
    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    const setup = async () => {
      unlisten = await onSidecarEventV2((envelope: StreamEventEnvelopeV2) => {
        const payload = envelope?.payload;
        if (!payload || payload.type !== "raw") return;
        if (
          !payload.event_type.startsWith("agent_team.") &&
          !payload.event_type.startsWith("session.run.")
        ) {
          return;
        }
        const at = new Date().toLocaleTimeString();
        setEventFeed((prev) => [`${at} ${payload.event_type}`, ...prev].slice(0, 12));
        void loadRuns();
      });
    };
    void setup();
    return () => {
      if (unlisten) unlisten();
    };
  }, [loadRuns]);

  const launchSwarm = async () => {
    if (!objective.trim()) {
      setError("Please enter an objective.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const configByPreset = {
        speed: { max_parallel_tasks: 6, llm_parallel: 4 },
        balanced: { max_parallel_tasks: 4, llm_parallel: 3 },
        quality: { max_parallel_tasks: 2, llm_parallel: 2 },
      } as const;
      const config: OrchestratorConfig = {
        ...DEFAULT_ORCHESTRATOR_CONFIG,
        max_total_tokens: 250_000,
        max_tokens_per_step: 25_000,
        max_parallel_tasks: configByPreset[preset].max_parallel_tasks,
        llm_parallel: configByPreset[preset].llm_parallel,
        fs_write_parallel: 1,
        shell_parallel: 1,
        network_parallel: 2,
      };
      const createdRunId = await invoke<string>("orchestrator_create_run", {
        objective: objective.trim(),
        config,
        model: selectedModel,
        provider: selectedProvider,
        agentModelRouting: modelRouting,
      });
      setRunId(createdRunId);
      await invoke("orchestrator_start", { runId: createdRunId });
      await loadRuns();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const approvePlan = async () => {
    if (!runId) return;
    setIsLoading(true);
    setError(null);
    try {
      await invoke("orchestrator_approve", { runId });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const pendingTasks = useMemo(() => tasks.filter((task) => task.state !== "done").length, [tasks]);

  const handleDeleteRun = async (targetRunId: string) => {
    try {
      await deleteOrchestratorRun(targetRunId);
      if (runId === targetRunId) {
        setRunId(null);
        setSnapshot(null);
        setTasks([]);
      }
      await loadRuns();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto app-background p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-text">{t("title")}</h2>
              <p className="text-sm text-text-muted">{t("description")}</p>
              <div className="w-full max-w-xl">
                <ProjectSwitcher
                  projects={userProjects}
                  activeProject={activeProject}
                  onSwitchProject={onSwitchProject}
                  onAddProject={onAddProject}
                  onManageProjects={onManageProjects}
                  isLoading={projectSwitcherLoading}
                />
              </div>
              <p className="text-xs text-text-subtle">
                {t("workspace")}{" "}
                <span className="font-mono">{workspacePath ?? t("noActiveProject")}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ModelSelector
                currentModel={selectedModel}
                align="right"
                side="bottom"
                onModelSelect={(modelId, providerId) => {
                  setSelectedModel(modelId);
                  setSelectedProvider(providerId);
                }}
              />
              <Button
                variant={tab === "task-to-swarm" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setTab("task-to-swarm")}
              >
                {t("tabs.taskToSwarm")}
              </Button>
              <Button
                variant={tab === "advanced" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setTab("advanced")}
              >
                {t("tabs.advanced")}
              </Button>
            </div>
          </div>
        </div>

        {tab === "task-to-swarm" ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-wide text-text-subtle">
                  {t("runs.title")}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void loadRuns()}
                  disabled={runsLoading}
                >
                  <RefreshCw className={`mr-1 h-3.5 w-3.5 ${runsLoading ? "animate-spin" : ""}`} />
                  {t("runs.refresh")}
                </Button>
              </div>
              <button
                className={`w-full rounded border px-3 py-2 text-left text-xs ${
                  !runId
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-text-muted hover:bg-surface-elevated"
                }`}
                onClick={() => setRunId(null)}
              >
                {t("runs.newRun")}
              </button>
              {runs.length === 0 ? (
                <div className="text-xs text-text-muted">{t("runs.noRuns")}</div>
              ) : (
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {runs.map((run) => (
                    <div
                      key={run.run_id}
                      className={`rounded border p-2 ${
                        runId === run.run_id
                          ? "border-primary/40 bg-primary/10"
                          : "border-border bg-surface-elevated/30"
                      }`}
                    >
                      <button
                        className="w-full text-left"
                        onClick={() => setRunId(run.run_id)}
                        title={run.objective}
                      >
                        <div className="truncate text-xs text-text">{run.objective}</div>
                        <div className="mt-1 text-[11px] text-text-muted">
                          {run.status.replace("_", " ")} •{" "}
                          {new Date(run.updated_at).toLocaleString()}
                        </div>
                      </button>
                      <button
                        className="mt-2 inline-flex items-center rounded border border-red-500/30 px-2 py-1 text-[11px] text-red-300 hover:bg-red-500/10"
                        onClick={() => void handleDeleteRun(run.run_id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        {t("runs.delete")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="xl:col-span-2 rounded-lg border border-border bg-surface p-4 space-y-3">
              <div className="text-xs uppercase tracking-wide text-text-subtle">
                {t("objective.title")}
              </div>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder={t("objective.placeholder")}
                className="min-h-[120px] w-full rounded-lg border border-border bg-surface-elevated p-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                {(["speed", "balanced", "quality"] as QualityPreset[]).map((nextPreset) => (
                  <button
                    key={nextPreset}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      preset === nextPreset
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border text-text-muted"
                    }`}
                    onClick={() => setPreset(nextPreset)}
                  >
                    {t(`quality.${nextPreset}`)}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => void launchSwarm()}
                  disabled={isLoading || !objective.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 h-4 w-4" />
                  )}
                  {t("actions.launchSwarm")}
                </Button>
              </div>
              {error ? (
                <div className="rounded border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-200">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
              <div className="text-xs uppercase tracking-wide text-text-subtle">
                {t("status.title")}
              </div>
              <div className="text-sm text-text">
                {t("status.stage")} {t(`stages.${stage}`)}
              </div>
              <div className="text-xs text-text-muted">
                {t("status.run")} {runId || t("status.none")}
              </div>
              <div className="text-xs text-text-muted">
                {t("status.tasks")} {tasks.length}
              </div>
              <div className="text-xs text-text-muted">
                {t("status.pending")} {pendingTasks}
              </div>
              {stage === "awaiting_review" ? (
                <Button size="sm" onClick={() => void approvePlan()} disabled={isLoading}>
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  {t("actions.approveExecute")}
                </Button>
              ) : null}
              <div className="text-[11px] text-text-muted">{t("status.safetyNote")}</div>
            </div>

            <div className="xl:col-span-3 rounded-lg border border-border bg-surface p-4">
              <div className="text-xs uppercase tracking-wide text-text-subtle mb-2">
                {t("activity.title")}
              </div>
              {eventFeed.length === 0 ? (
                <div className="text-xs text-text-muted">{t("activity.waiting")}</div>
              ) : (
                <div className="space-y-1 max-h-56 overflow-y-auto">
                  {eventFeed.map((line, idx) => (
                    <div
                      key={`${line}-${idx}`}
                      className="rounded border border-border bg-surface-elevated p-2 text-xs text-text"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AgentModelRoutingPanel routing={modelRouting} onChange={setModelRouting} />
            <div className="rounded-lg border border-border bg-surface-elevated/40 p-3 text-xs text-text-muted">
              {t("advanced.routingNote")}
            </div>
            <div className="rounded-lg border border-border bg-surface p-3 text-xs text-text-muted">
              {t("advanced.controlsNote")}
            </div>
            <AgentCommandCenter />
          </div>
        )}
      </div>
    </div>
  );
}
