# r/vibecoding Post Draft

> **Note:** This post follows r/vibecoding Rule #3 — no shilling, focus on *how* you built it (tools/process/insights).

---

## Title

**I vibe-coded an open-source Claude Cowork alternative using AI pair programming — Plan Mode, PPTX export, visual diffs. Here's my actual workflow with AI.**

---

## Body

Just shipped **Tandem** publicly — an open-source, cross-platform desktop AI coworker for Windows, Linux, and macOS.

If you've seen Anthropic's "Claude Cowork" direction, this is my open-source alternative that doesn't lock you to macOS or a single provider.

**But the interesting part**: I built most of it *with* AI pair programming, using the approach r/vibecoding is all about. Here's how it actually worked.

---

### 📌 What Tandem Does

- **Workspace-aware AI**: Works inside a project folder — read/write files, search code, draft docs
- **Plan Mode**: AI proposes changes as a task list → you review diffs side-by-side → batch execute
- **Artifact outputs**: Generates PPTX decks, HTML dashboards/reports with live preview + export
- **Full undo**: Every AI operation is journaled — one-click rollback on any change
- **BYOK everything**: OpenRouter, Anthropic, OpenAI, Ollama (local), or any OpenAI-compatible API
- **Zero telemetry**: No data leaves your machine except to your chosen LLM provider

---

### 🛠️ The Stack

| Layer | Tech |
|-------|------|
| **Desktop Framework** | Tauri 2.0 (Rust core) |
| **Frontend** | React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **AI Runtime** | OpenCode CLI (sidecar process) |
| **PPTX Generation** | ppt-rs (Rust crate) |
| **Encryption** | AES-256-GCM (argon2 key derivation) |
| **Package Manager** | pnpm |
| **Build/Tooling** | Vite 7, ESLint, Husky |

---

### 🔄 How I Actually Vibe-Coded This (The Useful Part)

I didn't just prompt "build me an AI desktop app." The real workflow looked like this:

**1. Start with PRDs, not code**

Before touching code, I wrote short product requirements docs with the AI. Example: `docs/execution_planning.md` lays out the "staging area" feature — what problem it solves, the user flow, success metrics. The AI helped me think through the UX before we wrote a single line.

**2. Plan → Execute loop (I ate my own dogfood)**

Once we had a clear PRD, I'd ask the AI to:
- Propose a detailed outline of what files to create/modify
- I'd review the plan as a checklist
- Approve → AI executes all changes as a batch

This is literally how Plan Mode works in Tandem itself. I was vibe-coding the planning feature *using* planning.

**3. Document as you go**

Every major feature got a summary doc written right after implementation. For example, `docs/IMPLEMENTATION_SUMMARY.md` covers the "Anti-Gravity Pipeline" pattern for PPTX generation — how JSON flows from AI → React preview → Rust export.

These docs helped me pick up context fast after breaks and made it way easier to onboard the AI on follow-up sessions.

**4. Build the supervision layer first**

Before giving the AI write access to real files, I built:
- **Tool Proxy**: Intercepts every tool call
- **Permission toasts**: Visual approval for destructive actions
- **Operation Journal**: Records every change with before/after state
- **Undo system**: Rollback any operation

This "untrusted contractor" model let me trust the AI with more complex tasks because I could always see and reverse what it did.

**5. The canvas moment**

The breakthrough feature was artifacts. I asked the AI to create a full HTML dashboard with Chart.js visualizations. It wrote `docs/internal/canvas.md` — an investment research dashboard with scatter plots, tables, and dynamic filtering. Rendered perfectly inside the app.

Seeing a complete, interactive artifact instead of just chat replies changed my mental model of what these tools can do.

---

### 💡 3 Things I Learned (From Actually Building This Way)

**1. PRDs > Prompts**

A 1-page PRD with problem/solution/user flow gets way better results than trying to explain everything in a chat message. The AI can reference the doc across sessions.

**2. Safety Enables Speed**

The undo system and permission prompts weren't just for users — they let *me* move faster while building. Knowing I could roll back any AI mistake removed the fear of letting it try things.

**3. Artifacts Create Compound Value**

Once the AI could generate PPTX and HTML, I started using Tandem to create *content about Tandem*. Marketing slides, release notes, comparison charts. The tool became self-reinforcing.

---

### 📸 Screenshots Attached

1. Plan Mode with side-by-side diff panel
2. PPTX artifact preview + export
3. HTML dashboard (Canvas) rendered in-app
4. Permission approval toast (zero-trust UX)

---

### 🔗 Links

- **Repo**: [github.com/frumu-ai/tandem](https://github.com/frumu-ai/tandem)
- **Downloads**: [tandem.frumu.ai](https://tandem.frumu.ai/)
- **License**: MIT — fork it, modify it, do whatever

---

### 🤔 Question for r/vibecoding

For those of you building with AI pair programming:

**How do you maintain context across sessions?**

I ended up writing summary docs after each major feature, but curious if others have better systems. Do you keep a running `CONTEXT.md`? Use specific prompting patterns?

What would make this actually useful for your workflow?

---

*Cross-platform • Open source • Privacy-first • Built with vibe-coding*