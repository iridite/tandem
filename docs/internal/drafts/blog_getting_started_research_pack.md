# Getting Started with Tandem: The Research Synthesis Pack

*A step-by-step guide to building your first research dashboard*

---

## The Problem: Drowning in Information

You've just finished reviewing 12 research papers on your topic. They're all related, they all have different conclusions, and you need to synthesize them into a coherent argument.

Sound familiar?

You're not alone. Researchers, analysts, and knowledge workers everywhere face the same challenge: **too much information, not enough synthesis.**

Most AI tools make this worse. Upload one file at a time. Ask one question at a time. Get one answer at a time. There's no way to see patterns across documents, identify conflicts between sources, or build a coherent picture from scattered research.

That's where Tandem shines—and the Research Synthesis Pack demonstrates exactly why.

---

## What You'll Build

In about 15 minutes, you'll create:

1. **A claims/evidence matrix** — every claim mapped to its supporting sources
2. **A conflict analysis** — disagreements between papers clearly identified
3. **An executive summary** — synthesized insights for non-technical stakeholders
4. **An interactive HTML dashboard** — professional, presentable, and private

All from 10 Markdown files. All running locally. All with full citation tracking.

---

## Before You Begin

You'll need:

1. **Tandem installed** — [Download from GitHub](https://github.com/frumu-ai/tandem)
2. **An API key** — OpenRouter, Anthropic, OpenAI, or Ollama
3. **The Research Synthesis Pack** — Included in the workspace-packs repo

---

## Step 1: Select Your Workspace

1. Open Tandem
2. Click "Select Workspace" or "Open Folder"
3. Navigate to: `workspace-packs/packs/research-synthesis-pack/`
4. Confirm selection

Tandem will now read the inputs/ directory, which contains 10 research papers on "Local-First AI in Regulated Environments." These are synthetic papers created specifically to demonstrate synthesis—they disagree on several key points, just like real research.

---

## Step 2: Scan the Workspace (Prompt 1)

The first prompt asks Tandem to scan all input files and create a workspace summary.

**Copy Prompt 1:**

```
You are a research synthesis specialist. Scan all files in the inputs/ directory and produce a comprehensive research mapping document.

Read ALL files in inputs/ including:
- All files in inputs/papers/ (10 research papers)
- inputs/questions.md (research questions)
- inputs/glossary.md (terminology)

Create a summary document that includes:

## Research Corpus Overview
- Total papers reviewed and their focus areas
- Publication themes and methodology types
- Overall argument direction and consensus areas

## Key Research Questions Addressed
- How each paper addresses questions from questions.md
- Gaps in question coverage
- Papers that directly answer each question

## Terminology Inventory
- Key terms defined in glossary.md
- How terms are used across papers
- Any inconsistencies in terminology usage

## Preliminary Conflict Areas
- Identify papers with opposing viewpoints
- Note statistical disagreements
- Flag contradictory claims for deeper analysis

Save your summary to outputs/workspace_scan.md
```

**What happens:** Tandem reads all 10 papers, identifies the research questions, maps terminology, and flags potential conflicts. You'll get a `workspace_scan.md` file that gives you the lay of the land.

---

## Step 3: Synthesize Themes and Conflicts (Prompt 2)

Now that Tandem understands the landscape, it can identify common themes and surface disagreements.

**Copy Prompt 2:**

```
You are a research synthesis analyst. Using the workspace scan and all source papers, create a comprehensive synthesis analysis document.

## Common Themes Analysis
Identify 4-5 major themes that appear across multiple papers:
- Theme 1: [Name] - Papers addressing it, key findings, consensus level
- Theme 2: [Name] - Papers addressing it, key findings, consensus level
- [Continue for all major themes...]

## Conflict Identification
For each significant disagreement across sources, provide:

### Conflict Area: [Topic]
**Position A**: [Paper name] claims [specific claim with evidence]
**Position B**: [Paper name] claims [opposing claim with evidence]
**Assessment**: [Your analysis of why they disagree and which may be more valid]
**Implications**: [What this disagreement means for practice]

Identify at least 5 distinct conflicts:

1. [Conflict 1]
2. [Conflict 2]
3. [Conflict 3]
4. [Conflict 4]
5. [Conflict 5]

## Evidence Quality Comparison
- Rank papers by evidence quality
- Identify strongest and weakest sources
- Note which claims are well-supported vs. speculative

## Research Gaps
- Questions from questions.md not adequately addressed
- Methodological gaps in current research
- Areas needing further investigation

Save to outputs/synthesis_analysis.md
```

**What happens:** Tandem produces a `synthesis_analysis.md` that maps common themes and documents at least 5 conflicts between papers. This is the intellectual heavy lifting—identifying what researchers agree on and where they disagree.

---

## Step 4: Build the Claims Matrix (Prompt 3)

Now it's time to organize findings into a structured table.

**Copy Prompt 3:**

```
You are a systematic review specialist. Create a structured claims and evidence table that organizes all major claims from the research papers.

Create outputs/claims_evidence_table.md with the following structure:

# Claims and Evidence Matrix

## Claims by Category

### Category 1: Privacy & Data Sovereignty

| Claim | Evidence | Source(s) | Strength | Consensus |
|-------|----------|-----------|----------|-----------|
| [Specific claim] | [Supporting data] | [Paper #] | High/Medium/Low | Strong/Partial/None |

[Continue for all categories: Security, Governance, Performance, Cost]

## Conflicting Claims Summary

| Topic | Claim A | Claim B | Resolution Attempt |
|-------|---------|---------|-------------------|
| [Conflict topic] | [Position with source] | [Opposing position with source] | [Analysis] |

## Key Findings
- Bullet points of most significant, well-supported findings
- Limitations and caveats

Save to outputs/claims_evidence_table.md
```

**What happens:** You get a `claims_evidence_table.md` with organized claims, evidence strength ratings, and a conflicts summary. This is the foundation for your executive summary.

---

## Step 5: Write for Non-Technical Stakeholders (Prompt 4)

Technical synthesis is great, but you also need to communicate with non-technical audiences.

**Copy Prompt 4:**

```
You are a science communication specialist. Create a one-page executive brief for a non-technical stakeholder about local-first AI in regulated environments.

## Requirements

### Audience
- No technical background assumed
- Needs to understand trade-offs for decision-making
- Values practical implications over technical details

### Format
Maximum 1 page (approximately 500-700 words)
Use clear headings, bullet points where appropriate
Avoid jargon or explain it when used

### Content Sections

## Executive Summary
2-3 sentences capturing the essence of local-first AI trade-offs.

## What is Local-First AI?
Simple explanation in 2-3 sentences.

## Key Findings

### Privacy Benefits
- Main benefit (1-2 sentences)
- Supporting evidence briefly

### Security Trade-offs
- Main finding (1-2 sentences)
- Key consideration

### Cost Considerations
- Bottom line on costs (1-2 sentences)
- When local-first makes economic sense

### Regulatory Landscape
- Current state (1-2 sentences)
- What to watch for

## Recommendations for Decision-Makers

### When to Consider Local-First AI
- Bullet points of ideal scenarios

### Questions to Ask Your Team
- Practical questions for evaluation

### Risk Considerations
- Key risks to evaluate

## Bottom Line
Clear conclusion in 2-3 sentences.

Save to outputs/executive_brief.md
```

**What happens:** You get an `executive_brief.md` written for non-technical readers—perfect for stakeholders, clients, or team members who need the highlights without the detail.

---

## Step 6: Generate the Visual Dashboard (Prompt 5)

Finally, Tandem creates a professional HTML dashboard that you can present, share, or include in reports.

**Copy Prompt 5:**

```
Create a comprehensive HTML dashboard artifact that presents the research synthesis in an interactive, visually engaging format.

## Dashboard Sections Required

### 1. Research Overview Header
- Title: "Local-First AI in Regulated Environments: Research Brief"
- Date of synthesis
- Number of papers reviewed
- Key finding highlight

### 2. Executive Summary Card
- Concise summary (3-4 key points)
- Overall assessment
- Confidence level indicator

### 3. Key Themes Visualization
- Display 4-5 major themes with:
  - Theme name
  - Brief description
  - Number of papers addressing it
  - Consensus indicator (high/medium/low)

### 4. Conflict Dashboard
- Present at least 5 key disagreements:
  - Topic
  - Position A summary
  - Position B summary
  - Assessment summary

### 5. Claims & Evidence Matrix
- Table or grid showing:
  - Category (Privacy, Security, etc.)
  - Key claims
  - Evidence strength color coding
  - Consensus level

### 6. Recommendations Section
- Practical recommendations based on findings
- Audience-appropriate (non-technical)
- Actionable next steps

### 7. Research Gaps
- What's not known
- Areas needing more research
- Caveats

## Styling Requirements
- Clean, professional design
- CSS Grid or Flexbox for layout
- Mobile-responsive
- Print-friendly
- Consistent color scheme (blues and greens for research theme)
- Readable typography

## Technical Requirements
- Single self-contained HTML file
- All CSS inline or in <style> block
- Valid HTML5
- Works offline

Save to: outputs/research_brief_dashboard.html
```

**What happens:** Tandem generates a beautiful `research_brief_dashboard.html` that you can open in any browser, share with stakeholders, or include in reports. It includes all the synthesis work, nicely formatted and visually presented.

---

## What You've Built

After completing all 5 prompts, your outputs/ directory contains:

| File | Purpose |
|------|---------|
| `workspace_scan.md` | Overview of all sources |
| `synthesis_analysis.md` | Themes and conflicts |
| `claims_evidence_table.md` | Structured claims matrix |
| `executive_brief.md` | Non-technical summary |
| `research_brief_dashboard.html` | Professional visual report |

All of this from 10 Markdown files. All running locally. All with full citation tracking.

---

## Next Steps

**Try another pack:**

- 🔍 **Web Audit Pack**: Audit a web project for accessibility and code quality
- 🎬 **Micro-Drama Pack**: Write a structured short-form script
- 🛡️ **Security Playbook Pack**: Build a security runbook for your team
- 🔄 **Research Refresh Pack**: Verify and update stale documentation

**Create your own pack:**

Have a workflow you repeat often? Turn it into a Tandem Pack!

[Learn more about creating packs → docs/creating_packs.md]

---

## Why This Matters

The Research Synthesis Pack demonstrates a core Tandem philosophy:

> **AI should work with your entire workspace, not just one file at a time.**

Whether you're analyzing research, auditing code, or building security runbooks, Tandem gives you folder-wide context and produces tangible outputs.

No subscriptions. No cloud uploads. No vendor lock-in.

Just powerful AI that respects your privacy.

---

**Try the Research Synthesis Pack today:**
https://github.com/frumu-ai/tandem

---

*Built something with Tandem? Share it with #TandemAI*

**Tags**: #TandemPacks #Research #LocalFirstAI #Productivity #Tutorial
