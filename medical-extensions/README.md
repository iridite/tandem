# Medical Extensions for Tandem

## Overview

This directory contains **medical-specific extensions** for Tandem that are maintained in this fork only. These features are domain-specific and not intended for upstream contribution.

## Why Fork-Only?

These extensions are medical-specific and would not benefit the broader Tandem community. Generic academic features (PDF parsing, citation management, arXiv search) are contributed upstream in `crates/` directory.

## Directory Structure

### `pubmed-provider/`
**PubMed API Integration**

- Search PubMed/MEDLINE database
- Parse PubMed XML responses
- Extract medical metadata (MeSH terms, PMID, etc.)
- Integrate with citation manager

**Status**: 📋 Planned (Week 3-4)

### `medical-pack/`
**Medical Research Starter Pack**

- Literature review templates
- Hypothesis validation workflows
- Evidence synthesis guides
- Clinical trial design templates

**Status**: 📋 Planned (Week 7-8)

### `debate-mode/`
**Multi-Agent Debate Framework (Prototype)**

- Critic, Synthesizer, Validator roles
- Structured debate sessions
- Consensus detection
- Evidence validation

**Status**: 📋 Planned (Week 5-6)

**Note**: Generic version will be extracted and contributed upstream as PR #10

### `ontologies/`
**Medical Ontologies Integration**

- UMLS (Unified Medical Language System)
- SNOMED CT (Clinical Terms)
- ICD-10/11 (Disease Classification)
- MeSH (Medical Subject Headings)

**Status**: 📋 Planned (Week 29-30)

## Feature Flags

Medical extensions are controlled by Cargo features:

```toml
# Enable all medical features
cargo build --features medical

# Enable specific features
cargo build --features medical-pubmed
cargo build --features medical-ontologies
```

## Usage

### Prerequisites

```bash
# Set PubMed API key (optional, increases rate limits)
export PUBMED_API_KEY="your-api-key"

# Download medical ontologies (if using)
./scripts/download-ontologies.sh
```

### Building

```bash
# Build with medical features
cargo build --features medical --release

# Run tests
cargo test --features medical
```

### Development

```bash
# Work in medical-dev branch
git checkout medical-dev

# Create new medical extension
mkdir medical-extensions/my-extension
cd medical-extensions/my-extension
cargo init --lib

# Add to workspace (if needed)
# Edit root Cargo.toml
```

## Integration with Upstream

### Receiving Updates

```bash
# Daily sync from upstream
git checkout main
git pull upstream main
git push origin main

# Weekly merge into medical-dev
git checkout medical-dev
git merge main
```

### Contributing Generic Features

If you develop a feature that could benefit non-medical users:

1. Extract generic parts to `crates/` directory
2. Remove medical-specific references
3. Create feature branch from `main`
4. Submit PR to upstream

Example:
```bash
# Debate mode started in medical-extensions/
# Extract generic framework to crates/tandem-debate/
git checkout -b feature/debate-mode
# ... extract and generalize ...
gh pr create
```

## Architecture

```
medical-extensions/
├── pubmed-provider/      # Medical search
├── medical-pack/         # Medical templates
├── debate-mode/          # Debate prototype (→ upstream later)
└── ontologies/           # Medical knowledge bases

↓ Uses ↓

crates/
├── tandem-document/      # PDF parsing (upstream)
├── tandem-citations/     # Citation management (upstream)
├── tandem-academic/      # Academic search (upstream)
└── tandem-debate/        # Debate framework (upstream, future)
```

## Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [x] Directory structure created
- [ ] PubMed provider implementation
- [ ] Basic medical pack templates

### Phase 2: Debate & Search (Weeks 5-8)
- [ ] Debate mode prototype
- [ ] Medical pack complete
- [ ] Integration testing

### Phase 3: Release (Weeks 9-12)
- [ ] v0.1.0-medical release
- [ ] Documentation complete
- [ ] Real-world testing

### Phase 4: Advanced (Weeks 13-24)
- [ ] Medical ontologies
- [ ] Clinical data tools
- [ ] v0.2.0-medical release

## Contributing

### To This Fork

Medical-specific contributions are welcome:

1. Fork this repository
2. Create feature branch from `medical-dev`
3. Develop in `medical-extensions/`
4. Submit PR to `medical-dev` branch

### To Upstream

Generic features should go to upstream Tandem:

1. Develop in `crates/` directory
2. Create feature branch from `main`
3. Submit PR to `frumu-ai/tandem`

## License

Same as Tandem: MIT OR Apache-2.0

## Resources

- [PARALLEL_ROADMAP.md](../docs/medical-research/PARALLEL_ROADMAP.md) - Development timeline
- [BRANCH_STRATEGY.md](../docs/medical-research/BRANCH_STRATEGY.md) - Branch management
- [IMPLEMENTATION_PLAN.md](../docs/medical-research/IMPLEMENTATION_PLAN.md) - Complete plan

---

**Status**: Active Development  
**Branch**: `medical-dev`  
**Last Updated**: 2025-02-15