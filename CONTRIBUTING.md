# Contributing to GuardQuote

## Development Setup

### Prerequisites

- **Bun 1.0+** (recommended) or Node.js 18+
- **Python 3.12+** (for ML engine)
- **Docker** (optional, for containerized development)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/jag18729/guard-quote.git
cd guard-quote

# Install dependencies
cd backend && bun install
cd ../frontend && bun install
cd ../ml-engine && pip install -e ".[dev]"

# Start development servers
# Terminal 1: Backend
cd backend && bun run dev

# Terminal 2: Frontend
cd frontend && bun run dev

# Terminal 3: ML Engine (optional)
cd ml-engine && uvicorn src.main:app --reload --port 8000
```

---

## Code Quality Standards

### Linting

All code must pass linting before merge.

| Component | Tool | Command |
|-----------|------|---------|
| Frontend | ESLint + Prettier | `bun run lint` |
| Backend | Biome | `bun run lint` |
| ML Engine | Ruff | `ruff check .` |

**Fix lint errors:**
```bash
# Frontend
cd frontend && bun run lint:fix && bun run format

# Backend
cd backend && bun run lint:fix

# ML Engine
cd ml-engine && ruff check --fix . && ruff format .
```

### Type Checking

TypeScript strict mode is enabled for frontend and backend.

```bash
# Frontend
cd frontend && bun run typecheck

# Backend
cd backend && bun run typecheck
```

### Testing

Write tests for new features. Minimum coverage: 50%.

```bash
# Frontend (Vitest)
cd frontend && bun run test
cd frontend && bun run test:coverage  # with coverage

# Backend (Bun Test)
cd backend && bun test

# ML Engine (pytest)
cd ml-engine && pytest tests/ -v
```

---

## CI/CD Pipeline

### PR Check Workflow

Every PR triggers automated checks:

1. **Lint** - Code style validation
2. **Type Check** - TypeScript/Python type safety
3. **Test** - Unit and integration tests
4. **Build** - Verify production build succeeds
5. **Docker** - Verify Docker images build

PRs cannot be merged if any check fails.

### Running CI Locally

Before pushing, run the full CI locally:

```bash
# Backend
cd backend && bun install && bun run lint && bun run typecheck && bun test

# Frontend
cd frontend && bun install && bun run lint && bun run typecheck && bun test && bun run build

# ML Engine
cd ml-engine && ruff check . && pytest tests/ -v
```

### Branch Protection

The `main` branch has protection rules:
- Require PR reviews before merging
- Require status checks to pass
- No direct pushes to main

---

## Commit Guidelines

### Commit Message Format

Use conventional commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code change that neither fixes nor adds
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(frontend): add password strength indicator
fix(backend): resolve JWT refresh race condition
docs(readme): update installation instructions
test(ml): add model accuracy validation tests
```

### Pre-commit Hooks

If configured, pre-commit hooks will:
1. Run linters on staged files
2. Format code automatically
3. Block commits with errors

---

## Pull Request Process

### Before Opening a PR

1. **Create a feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

3. **Run CI locally:**
   ```bash
   # Run all checks
   cd backend && bun run lint && bun run typecheck && bun test
   cd frontend && bun run lint && bun run typecheck && bun test && bun run build
   ```

4. **Push and open PR:**
   ```bash
   git push -u origin feat/your-feature-name
   ```

### PR Requirements

- [ ] All CI checks pass
- [ ] Code is tested (new tests for new features)
- [ ] Documentation updated if needed
- [ ] No merge conflicts with main
- [ ] Descriptive PR title and description

### PR Review

- At least 1 approval required
- Address all review comments
- Re-request review after changes

---

## Project Structure

```
guard-quote/
├── backend/                 # Bun + Hono API
│   ├── src/
│   │   ├── index.ts        # Main server
│   │   ├── db/             # Database connection
│   │   └── services/       # Business logic
│   ├── biome.json          # Linter config
│   └── package.json
│
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── pages/          # Route components
│   │   ├── components/     # Reusable components
│   │   └── context/        # React context
│   ├── eslint.config.js    # Linter config
│   ├── vitest.config.ts    # Test config
│   └── package.json
│
├── ml-engine/              # Python + FastAPI
│   ├── src/                # FastAPI app
│   ├── tests/              # pytest tests
│   ├── models/             # Trained models
│   └── pyproject.toml      # Python config
│
├── .github/workflows/      # CI/CD pipelines
│   ├── pr-check.yml        # PR validation
│   └── train-ml.yml        # ML training
│
├── .claude/skills/         # Claude Code documentation
└── .continue/              # Continue.dev config
```

---

## Getting Help

- **Documentation:** See `.claude/skills/` for detailed guides
- **Issues:** Open a GitHub issue for bugs or features
- **Questions:** Ask in PR comments or team chat

---

## License

MIT License - see [LICENSE](LICENSE) for details.
