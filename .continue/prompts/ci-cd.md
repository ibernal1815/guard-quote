# CI/CD Prompts for GuardQuote

## Overview

This file contains prompts for CI/CD tasks in the GuardQuote project.

## Workflow Patterns

### PR Check Workflow
- Runs on: `ubuntu-latest`
- Triggers: Push/PR to main, develop
- Jobs: lint-backend, lint-frontend, test-ml-engine, docker-build

### Integration Workflow (Disabled)
- Runs on: `self-hosted` (requires Pi1 network access)
- Triggers: Manual only
- Re-enable: Rename `integration.yml.disabled` → `integration.yml`

### ML Training Workflow
- Runs on: `self-hosted`
- Schedule: Weekly Sunday 3am UTC
- Pushes metrics to Prometheus on Pi1

## Testing Frameworks

| Component | Framework | Command |
|-----------|-----------|---------|
| Frontend | Vitest + Testing Library | `bun run test` |
| Backend | Bun Test | `bun test` |
| ML Engine | pytest | `pytest tests/ -v` |

## Linting Tools

| Component | Tool | Command |
|-----------|------|---------|
| Frontend | ESLint + Prettier | `bun run lint` |
| Backend | Biome | `bun run lint` |
| ML Engine | Ruff | `ruff check .` |

## Docker Images

```bash
# Build all images
docker build -t guardquote-frontend ./frontend
docker build -t guardquote-backend ./backend
docker build -t guardquote-ml ./ml-engine

# Run with docker-compose
docker-compose up -d
```

## Common CI/CD Tasks

### Fix Failing Lint
```bash
# Frontend
cd frontend && bun run lint:fix && bun run format

# Backend
cd backend && bun run lint:fix && bun run format

# ML Engine
cd ml-engine && ruff check --fix . && ruff format .
```

### Run Full CI Locally
```bash
# Backend
cd backend && bun install && bun run lint && bun run typecheck && bun test

# Frontend
cd frontend && bun install && bun run lint && bun run typecheck && bun test && bun run build

# ML Engine
cd ml-engine && pip install -e ".[dev]" && ruff check . && pytest tests/ -v
```

### Check Coverage
```bash
# Frontend
cd frontend && bun run test:coverage

# Backend
cd backend && bun test --coverage

# ML Engine
cd ml-engine && pytest tests/ --cov=src --cov-report=html
```

## GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `PI1_DB_PASSWORD` | PostgreSQL password for Pi1 |
| `PI1_REDIS_PASSWORD` | Redis password for Pi1 |
| `CODECOV_TOKEN` | Codecov upload token |
| `GRAFANA_API_KEY` | Grafana API key for annotations |

## Branch Protection Rules

Recommended settings for `main` branch:
- Require PR reviews before merging
- Require status checks to pass (pr-check)
- Require branches to be up to date
- Do not allow bypassing the above settings
