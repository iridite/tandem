import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  FolderOpen,
  Shield,
  Cpu,
  Check,
  Trash2,
  Plus,
} from "lucide-react";
import { ProviderCard } from "./ProviderCard";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  getProvidersConfig,
  setProvidersConfig,
  getUserProjects,
  getActiveProject,
  addProject,
  removeProject,
  setActiveProject,
  type ProvidersConfig,
  type UserProject,
} from "@/lib/tauri";
import { open } from "@tauri-apps/plugin-dialog";

interface SettingsProps {
  onClose?: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [providers, setProviders] = useState<ProvidersConfig | null>(null);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectLoading, setProjectLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [config, userProjects, activeProj] = await Promise.all([
        getProvidersConfig(),
        getUserProjects(),
        getActiveProject(),
      ]);
      setProviders(config);
      setProjects(userProjects);

      // Set active project from backend
      if (activeProj) {
        setActiveProjectId(activeProj.id);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = async (
    provider: keyof Omit<ProvidersConfig, "custom">,
    enabled: boolean
  ) => {
    if (!providers) return;

    const updated = {
      ...providers,
      [provider]: { ...providers[provider], enabled },
    };
    setProviders(updated);
    await setProvidersConfig(updated);
  };

  const handleSetDefault = async (provider: keyof Omit<ProvidersConfig, "custom">) => {
    if (!providers) return;

    // Reset all defaults and set the new one
    const updated: ProvidersConfig = {
      openrouter: { ...providers.openrouter, default: provider === "openrouter" },
      anthropic: { ...providers.anthropic, default: provider === "anthropic" },
      openai: { ...providers.openai, default: provider === "openai" },
      ollama: { ...providers.ollama, default: provider === "ollama" },
      custom: providers.custom,
    };
    setProviders(updated);
    await setProvidersConfig(updated);
  };

  const handleModelChange = async (
    provider: keyof Omit<ProvidersConfig, "custom">,
    model: string
  ) => {
    if (!providers) return;

    const updated = {
      ...providers,
      [provider]: { ...providers[provider], model },
    };
    setProviders(updated);
    await setProvidersConfig(updated);
  };

  const handleSelectWorkspace = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Project Folder",
      });

      if (selected && typeof selected === "string") {
        setProjectLoading(true);
        const project = await addProject(selected);
        await loadSettings();
        // Set as active
        await setActiveProject(project.id);
        setActiveProjectId(project.id);
      }
    } catch (err) {
      console.error("Failed to add project:", err);
    } finally {
      setProjectLoading(false);
    }
  };

  const handleSetActiveProject = async (projectId: string) => {
    try {
      setProjectLoading(true);
      await setActiveProject(projectId);
      setActiveProjectId(projectId);
      await loadSettings();
    } catch (err) {
      console.error("Failed to set active project:", err);
    } finally {
      setProjectLoading(false);
    }
  };

  const handleRemoveProject = async (projectId: string) => {
    try {
      setProjectLoading(true);
      await removeProject(projectId);
      if (activeProjectId === projectId) {
        setActiveProjectId(null);
      }
      await loadSettings();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to remove project:", err);
    } finally {
      setProjectLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      className="h-full overflow-y-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text">Settings</h1>
              <p className="text-text-muted">Configure your Tandem workspace</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          )}
        </div>

        {/* Projects Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5 text-secondary" />
              <div className="flex-1">
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  Add and manage project folders. Each project is an independent workspace.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects.length === 0 ? (
                <div className="rounded-lg border border-border bg-surface-elevated p-6 text-center">
                  <FolderOpen className="mx-auto mb-2 h-8 w-8 text-text-subtle" />
                  <p className="text-sm text-text-muted">No projects added yet</p>
                  <p className="text-xs text-text-subtle">Add a project folder to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {projects.map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-text">{project.name}</p>
                            {activeProjectId === project.id && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                                <Check className="h-3 w-3" />
                                Active
                              </span>
                            )}
                          </div>
                          <p
                            className="truncate font-mono text-xs text-text-muted"
                            title={project.path}
                          >
                            {project.path}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {activeProjectId !== project.id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSetActiveProject(project.id)}
                              disabled={projectLoading}
                            >
                              Set Active
                            </Button>
                          )}
                          {deleteConfirm === project.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveProject(project.id)}
                                disabled={projectLoading}
                                className="text-error hover:bg-error/10"
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteConfirm(null)}
                                disabled={projectLoading}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteConfirm(project.id)}
                              disabled={projectLoading}
                              className="text-text-subtle hover:text-error"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <Button onClick={handleSelectWorkspace} disabled={projectLoading} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
            </div>

            <p className="mt-3 text-xs text-text-subtle">
              <Shield className="mr-1 inline h-3 w-3" />
              Tandem can only access files within project folders. Sensitive files (.env, .ssh,
              etc.) are always blocked.
            </p>
          </CardContent>
        </Card>

        {/* LLM Providers Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Cpu className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-text">LLM Providers</h2>
              <p className="text-sm text-text-muted">
                Configure your AI providers. OpenRouter is recommended for access to multiple
                models.
              </p>
            </div>
          </div>

          {providers && (
            <div className="space-y-4">
              <ProviderCard
                id="openrouter"
                name="OpenRouter"
                description="Access 100+ models with one API key"
                endpoint="https://openrouter.ai/api/v1"
                model={providers.openrouter.model}
                isDefault={providers.openrouter.default}
                enabled={providers.openrouter.enabled}
                onEnabledChange={(enabled) => handleProviderChange("openrouter", enabled)}
                onModelChange={(model) => handleModelChange("openrouter", model)}
                onSetDefault={() => handleSetDefault("openrouter")}
                docsUrl="https://openrouter.ai/keys"
              />

              <ProviderCard
                id="anthropic"
                name="Anthropic"
                description="Direct access to Claude models"
                endpoint="https://api.anthropic.com"
                model={providers.anthropic.model}
                isDefault={providers.anthropic.default}
                enabled={providers.anthropic.enabled}
                onEnabledChange={(enabled) => handleProviderChange("anthropic", enabled)}
                onModelChange={(model) => handleModelChange("anthropic", model)}
                onSetDefault={() => handleSetDefault("anthropic")}
                docsUrl="https://console.anthropic.com/settings/keys"
              />

              <ProviderCard
                id="openai"
                name="OpenAI"
                description="GPT-4 and other OpenAI models"
                endpoint="https://api.openai.com/v1"
                model={providers.openai.model}
                isDefault={providers.openai.default}
                enabled={providers.openai.enabled}
                onEnabledChange={(enabled) => handleProviderChange("openai", enabled)}
                onModelChange={(model) => handleModelChange("openai", model)}
                onSetDefault={() => handleSetDefault("openai")}
                docsUrl="https://platform.openai.com/api-keys"
              />

              <ProviderCard
                id="ollama"
                name="Ollama"
                description="Run models locally - no API key needed"
                endpoint="http://localhost:11434"
                model={providers.ollama.model}
                isDefault={providers.ollama.default}
                enabled={providers.ollama.enabled}
                onEnabledChange={(enabled) => handleProviderChange("ollama", enabled)}
                onModelChange={(model) => handleModelChange("ollama", model)}
                onSetDefault={() => handleSetDefault("ollama")}
                docsUrl="https://ollama.ai"
              />
            </div>
          )}
        </div>

        {/* Security Info */}
        <Card variant="glass">
          <CardContent className="flex items-start gap-4">
            <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
            <div className="space-y-2">
              <p className="font-medium text-text">Your keys are secure</p>
              <ul className="space-y-1 text-sm text-text-muted">
                <li>• API keys are encrypted with AES-256-GCM</li>
                <li>• Keys never leave your device</li>
                <li>• No telemetry or data collection</li>
                <li>• All network traffic is allowlisted</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
