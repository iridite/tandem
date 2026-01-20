# README Section: Try a Starter Pack

---

## 🚀 Try a Starter Pack

Tandem Packs are ready-made workflows that showcase Tandem's capabilities while giving you a head start on common tasks. Each pack includes curated inputs, step-by-step prompts, and expected outputs.

### Getting Started

1. Clone the workspace packs repository:
   ```bash
   git clone https://github.com/frumu-ai/tandem
   ```

2. Open Tandem and select a pack folder:
   ```
   workspace-packs/packs/<PACK_NAME>/
   ```

3. Follow the prompts in `pack-docs/PROMPTS.md`

4. Watch Tandem build something amazing

---

### 📚 Research Synthesis Pack

**Turn multiple documents into a single, coherent output.**

Perfect for: Researchers, analysts, knowledge workers

What it builds:
- Claims/evidence matrix from 10+ sources
- Conflict analysis across documents
- Executive summary for stakeholders
- Interactive HTML research dashboard

[Try the Research Pack →](./workspace-packs/packs/research-synthesis-pack/)

---

### 🎬 Micro-Drama Script Studio Pack

**Write structured short-form video scripts.**

Perfect for: Content creators, storytellers, video producers

What it builds:
- Episode premise options
- Beat sheet with scene breakdowns
- Full script in proper format
- Writer's room visual dashboard

[Try the Drama Pack →](./workspace-packs/packs/micro-drama-script-studio-pack/)

---

### 🔍 Web Starter Audit Pack

**Audit web projects for code quality and accessibility.**

Perfect for: Developers, QA engineers, technical leads

What it builds:
- Comprehensive audit findings
- Remediation plan with priorities
- Before/after changelog
- Professional HTML audit report

[Try the Audit Pack →](./workspace-packs/packs/web-starter-audit-pack/)

---

### 🛡️ Security Playbook Pack

**Build a security runbook for your team.**

Perfect for: Security teams, DevOps leads, small organizations

What it builds:
- Threat assessment matrix
- Priority security checklist
- Team-specific runbook
- Interactive security dashboard

[Try the Security Pack →](./workspace-packs/packs/security-playbook-pack/)

---

### 🔄 Web Research Refresh Pack

**Verify and update stale documentation.**

Perfect for: Technical writers, documentation teams, fact-checkers

What it builds:
- Claims inventory from stale docs
- Evidence log with source citations
- Updated facts sheet
- Citable HTML research report

[Try the Research Refresh Pack →](./workspace-packs/packs/web-research-refresh-pack/)

---

### 🎯 Which Pack Should You Try First?

| Your Goal | Try This Pack |
|-----------|---------------|
| Analyze research/notes | Research Synthesis |
| Write structured content | Micro-Drama Script Studio |
| Audit code/projects | Web Starter Audit |
| Build security processes | Security Playbook |
| Update documentation | Web Research Refresh |

---

### 📦 Pack Structure

Each pack follows a consistent structure:

```
packs/<PACK_NAME>/
├── inputs/              # Curated source materials
│   └── *.md            # Documents, papers, code, etc.
├── outputs/             # Generated content (empty, .gitkeep)
│   └── .gitkeep
└── pack-docs/          # User guidance (not visible to Tandem)
    ├── PACK_INFO.md
    ├── START_HERE.md
    ├── PROMPTS.md
    └── EXPECTED_OUTPUTS.md
```

---

### 🛠️ Creating Your Own Pack

Want to build a custom workflow? Tandem Packs are easy to create:

1. Create a folder: `workspace-packs/packs/<your-pack-name>/`
2. Add inputs to the `inputs/` directory
3. Create prompts in `pack-docs/PROMPTS.md`
4. Document expected outputs in `pack-docs/EXPECTED_OUTPUTS.md`

[Learn more about creating packs → docs/creating_packs.md]

---

### 🤝 Contributing Packs

Built something cool with Tandem? We'd love to feature your pack!

- Open a PR with your pack
- Include clear documentation
- Add example inputs and expected outputs

[Submit a Pack → github.com/frumu-ai/tandem/issues]

---

**Tags**: #TandemPacks #LocalFirstAI #OpenSource #Productivity
