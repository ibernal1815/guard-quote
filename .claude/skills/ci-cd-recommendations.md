# CI/CD Recommendations Skill

Use this skill to implement and maintain CI/CD best practices for GuardQuote.

## Current State Assessment

### Active Workflows

| Workflow | Trigger | Runner | Status |
|----------|---------|--------|--------|
| `pr-check.yml` | Push/PR to main | ubuntu-latest | ✅ Active |
| `train-ml.yml` | Weekly/Manual | self-hosted | ✅ Active |
| `integration.yml.disabled` | Manual | self-hosted | ⏸️ Disabled |

### Quality Tools Status

| Tool | Frontend | Backend | ML Engine |
|------|----------|---------|-----------|
| Linting | ❌ Not configured | ❌ Not configured | ✅ Ruff |
| Type Check | ✅ TypeScript | ✅ TypeScript | ✅ Python typing |
| Formatting | ❌ Missing | ❌ Missing | ❌ Missing |
| Testing | ❌ No framework | ❌ No framework | ⚠️ Placeholder only |
| Build | ✅ Vite | ✅ Bun | ❌ None |

---

## Priority 1: Critical Improvements

### 1.1 Configure ESLint + Prettier (Frontend)

```bash
cd frontend
bun add -d eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh prettier eslint-config-prettier
```

**Create `frontend/eslint.config.js`:**
```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
```

**Create `frontend/.prettierrc`:**
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**Update `frontend/package.json` scripts:**
```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write src/**/*.{ts,tsx,css}",
    "format:check": "prettier --check src/**/*.{ts,tsx,css}"
  }
}
```

---

### 1.2 Configure Biome (Backend)

Biome is faster and simpler than ESLint for backend.

```bash
cd backend
bun add -d @biomejs/biome
```

**Create `backend/biome.json`:**
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "warn"
      },
      "complexity": {
        "noForEach": "off"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "files": {
    "ignore": ["node_modules", "dist"]
  }
}
```

**Update `backend/package.json` scripts:**
```json
{
  "scripts": {
    "lint": "biome lint src",
    "lint:fix": "biome lint src --write",
    "format": "biome format src --write",
    "format:check": "biome format src"
  }
}
```

---

### 1.3 Add Testing Frameworks

#### Frontend (Vitest + Testing Library)

```bash
cd frontend
bun add -d vitest @testing-library/react @testing-library/jest-dom jsdom @types/node
```

**Create `frontend/vitest.config.ts`:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'src/test'],
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50,
      },
    },
  },
});
```

**Create `frontend/src/test/setup.ts`:**
```typescript
import '@testing-library/jest-dom';
```

**Update `frontend/package.json`:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

#### Backend (Bun Test)

**Create `backend/src/__tests__/health.test.ts`:**
```typescript
import { describe, test, expect } from 'bun:test';

describe('Health Check', () => {
  test('GET /health returns healthy status', async () => {
    const res = await fetch('http://localhost:3000/health');
    const data = await res.json();
    expect(data.status).toBe('healthy');
  });
});
```

**Update `backend/package.json`:**
```json
{
  "scripts": {
    "test": "bun test",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage"
  }
}
```

#### ML Engine (Expand pytest)

**Create `ml-engine/tests/test_api.py`:**
```python
import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_event_types():
    response = client.get("/api/v1/event-types")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_quote_prediction():
    response = client.post("/api/v1/quote", json={
        "event_datetime": "2026-03-15T14:00:00",
        "event_type": "corporate",
        "zip_code": "94102",
        "num_guards": 4,
        "hours": 8
    })
    assert response.status_code == 200
    assert "price" in response.json()
```

---

### 1.4 Create Dockerfiles

#### Frontend Dockerfile

**Create `frontend/Dockerfile`:**
```dockerfile
# Build stage
FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Create `frontend/nginx.conf`:**
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Backend Dockerfile

**Create `backend/Dockerfile`:**
```dockerfile
FROM oven/bun:latest
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy source
COPY src ./src
COPY tsconfig.json ./

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
```

#### ML Engine Dockerfile

**Create `ml-engine/Dockerfile`:**
```dockerfile
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY pyproject.toml ./
RUN pip install --no-cache-dir -e .

# Copy source
COPY src ./src
COPY models ./models

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### 1.5 Make CI Checks Hard-Fail

**Update `.github/workflows/pr-check.yml`:**
```yaml
name: PR Check

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: cd backend && bun install --frozen-lockfile

      - name: Lint
        run: cd backend && bun run lint

      - name: Type check
        run: cd backend && bun run typecheck

      - name: Test
        run: cd backend && bun test

  lint-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: cd frontend && bun install --frozen-lockfile

      - name: Lint
        run: cd frontend && bun run lint

      - name: Type check
        run: cd frontend && bun run typecheck

      - name: Test
        run: cd frontend && bun run test

      - name: Build
        run: cd frontend && bun run build

  test-ml-engine:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'

      - name: Install dependencies
        run: |
          cd ml-engine
          pip install -e ".[dev]"

      - name: Lint with ruff
        run: cd ml-engine && ruff check .

      - name: Format check
        run: cd ml-engine && ruff format --check .

      - name: Run tests
        run: cd ml-engine && pytest tests/ -v --tb=short

  docker-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Frontend Docker image
        run: docker build -t guardquote-frontend:test ./frontend

      - name: Build Backend Docker image
        run: docker build -t guardquote-backend:test ./backend

      - name: Build ML Engine Docker image
        run: docker build -t guardquote-ml:test ./ml-engine
```

---

## Priority 2: Important Improvements

### 2.1 Pre-commit Hooks (Husky + lint-staged)

```bash
# Root of project
bun add -d husky lint-staged
bunx husky init
```

**Create `.husky/pre-commit`:**
```bash
#!/bin/sh
bunx lint-staged
```

**Add to root `package.json`:**
```json
{
  "lint-staged": {
    "frontend/src/**/*.{ts,tsx}": [
      "cd frontend && bun run lint:fix",
      "cd frontend && bun run format"
    ],
    "backend/src/**/*.ts": [
      "cd backend && bun run lint:fix",
      "cd backend && bun run format"
    ],
    "ml-engine/src/**/*.py": [
      "cd ml-engine && ruff check --fix",
      "cd ml-engine && ruff format"
    ]
  }
}
```

---

### 2.2 Security Scanning Workflow

**Create `.github/workflows/security.yml`:**
```yaml
name: Security Scan

on:
  schedule:
    - cron: '0 4 * * 1'  # Weekly Monday 4am
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2

      - name: Audit Backend
        run: cd backend && bun audit --level moderate
        continue-on-error: true

      - name: Audit Frontend
        run: cd frontend && bun audit --level moderate
        continue-on-error: true

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Audit ML Engine
        run: |
          pip install pip-audit
          cd ml-engine && pip-audit
        continue-on-error: true

  trivy-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: TruffleHog Secret Scan
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified
```

---

### 2.3 Code Coverage Reporting

**Add to `pr-check.yml` frontend job:**
```yaml
      - name: Test with coverage
        run: cd frontend && bun run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./frontend/coverage/coverage-final.json
          flags: frontend
          fail_ci_if_error: false
```

**Create `codecov.yml` in root:**
```yaml
coverage:
  status:
    project:
      default:
        target: 50%
        threshold: 5%
    patch:
      default:
        target: 60%

comment:
  layout: "reach,diff,flags,files"
  behavior: default
  require_changes: true
```

---

## Priority 3: Nice-to-Have

### 3.1 Release Workflow

**Create `.github/workflows/release.yml`:**
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write
  packages: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate changelog
        id: changelog
        uses: orhun/git-cliff-action@v3
        with:
          config: cliff.toml
          args: --latest

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          body: ${{ steps.changelog.outputs.content }}
          draft: false
          prerelease: ${{ contains(github.ref, 'alpha') || contains(github.ref, 'beta') }}

      - name: Build and push Docker images
        run: |
          echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u $ --password-stdin

          docker build -t ghcr.io/${{ github.repository }}/frontend:${{ github.ref_name }} ./frontend
          docker build -t ghcr.io/${{ github.repository }}/backend:${{ github.ref_name }} ./backend
          docker build -t ghcr.io/${{ github.repository }}/ml-engine:${{ github.ref_name }} ./ml-engine

          docker push ghcr.io/${{ github.repository }}/frontend:${{ github.ref_name }}
          docker push ghcr.io/${{ github.repository }}/backend:${{ github.ref_name }}
          docker push ghcr.io/${{ github.repository }}/ml-engine:${{ github.ref_name }}
```

---

## Implementation Checklist

### Week 1: Foundation
- [ ] Configure ESLint + Prettier for Frontend
- [ ] Configure Biome for Backend
- [ ] Set up Vitest for Frontend
- [ ] Set up Bun test for Backend
- [ ] Create Dockerfiles for all services
- [ ] Make CI checks hard-fail

### Week 2: Testing
- [ ] Write 10+ Frontend component tests
- [ ] Write 10+ Backend API tests
- [ ] Expand ML Engine tests to 15+
- [ ] Add coverage reporting
- [ ] Set 50% coverage threshold

### Week 3: Polish
- [ ] Add pre-commit hooks
- [ ] Add security scanning workflow
- [ ] Add Codecov badge to README
- [ ] Document CI/CD in CONTRIBUTING.md
- [ ] Clean up disabled workflows

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| PR Quality | 0 merged with failures | GitHub branch protection |
| Test Coverage | 50%+ | Codecov dashboard |
| Build Success | 100% PRs pass | GitHub Actions |
| Security | 0 critical vulnerabilities | Trivy/npm audit |
| CI Speed | < 5 minutes | Workflow duration |

---

## Quick Commands

```bash
# Run all linters
cd frontend && bun run lint && cd ../backend && bun run lint && cd ../ml-engine && ruff check .

# Run all tests
cd frontend && bun test && cd ../backend && bun test && cd ../ml-engine && pytest

# Build all Docker images
docker build -t guardquote-frontend ./frontend
docker build -t guardquote-backend ./backend
docker build -t guardquote-ml ./ml-engine

# Full CI simulation locally
bun run lint && bun run typecheck && bun run test && bun run build
```

---

## Lessons Learned (Implementation Notes)

### YAML Syntax in GitHub Actions
- **Don't use `||` in run commands** - causes YAML parsing errors
- Use `continue-on-error: true` instead for soft-fail steps
- Example:
  ```yaml
  # BAD - YAML syntax error
  run: bun run typecheck || echo "warnings"

  # GOOD - proper soft-fail
  run: bun run typecheck
  continue-on-error: true
  ```

### Docker User Creation
- **Bun image is Debian-based**, not Alpine
- Use `groupadd`/`useradd` instead of `addgroup`/`adduser`
- Example:
  ```dockerfile
  # BAD - Alpine commands (won't work in Bun image)
  RUN addgroup --system nodejs && adduser --system bunjs

  # GOOD - Debian commands
  RUN groupadd --system --gid 1001 nodejs && \
      useradd --system --uid 1001 --gid nodejs bunjs
  ```

### ESLint Unused Variables
- `argsIgnorePattern: "^_"` only works for function arguments
- Need ALL three patterns for full underscore support:
  ```javascript
  "@typescript-eslint/no-unused-vars": ["error", {
    argsIgnorePattern: "^_",
    varsIgnorePattern: "^_",
    caughtErrorsIgnorePattern: "^_"
  }]
  ```

### Biome Schema Version
- Biome 2.x uses different schema than 1.x
- Check installed version: `bunx biome --version`
- Use matching schema: `https://biomejs.dev/schemas/2.0.0/schema.json`
- `organizeImports` moved to different location in v2

### TypeScript CSS Modules
- TypeScript doesn't recognize `.module.css` imports by default
- Either add declaration file or use `continue-on-error` in CI
- For strict typing, create `src/types/css.d.ts`:
  ```typescript
  declare module "*.module.css" {
    const classes: { [key: string]: string };
    export default classes;
  }
  ```

### Vitest React Testing
- Console warnings about `act()` are normal, not failures
- Use `vi.waitFor()` for async state updates
- Mock `global.fetch` with `vi.fn()` for API tests

### CI Pipeline Order
- Run lint before typecheck (faster feedback)
- Run tests after lint/typecheck pass
- Build last (most expensive)
- Docker builds can run in parallel with other jobs

---

*Last updated: January 30, 2026*
