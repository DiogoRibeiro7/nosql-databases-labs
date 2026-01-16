# Submission Guide

Use this checklist every time you submit a lab or project deliverable. Completing the steps below keeps grading consistent and prevents last-minute surprises.

## 1. Pre-Submission Checklist

1. **Pull latest changes** from `main` (or the branch specified by your instructor).
2. **Install dependencies** (`npm install`, `pip install -r requirements.txt`, etc.).
3. **Set MongoDB connection**: Ensure `MONGODB_URI` points to a reachable instance. Replica-set labs require ports 27017–27019.
4. **Lint & format**:
   ```bash
   npm run lint
   npm run format:check   # or prettier --check
   ```
5. **Run tests** relevant to your work:
   ```bash
   npm run test:labs -- --lab=lab03    # targeted
   npm run test                        # linters + data smoke tests
   ```
6. **Update docs**: Screenshots, NOTES.md, and README snippets should reflect the latest output.

## 2. Artifact Requirements

| Deliverable      | Expectations                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| Lab README/NOTES | Mention datasets imported, commands executed, and any blockers.                                     |
| Scripts          | Provide both mongosh (`*_mongosh.js`) and Node.js (`*.js`) variants when requested.                 |
| Data             | Store small fixtures in the lab folder. Large datasets belong under `data/`.                        |
| Tests            | Keep `test_*.js` deterministic. Use environment variables for credentials, never hard-code secrets. |
| Screenshots      | Place inside `docs/` or the lab folder’s `images/` subdirectory. Reference them from READMEs.       |

## 3. File/Folder Naming

- Lowercase with underscores for lab folders (`lab03_queries`).
- Use kebab-case for helper scripts (`validate_groups.js` already follows this pattern).
- Keep submission assets under `group-work/<group_id>/` when working in teams.

## 4. Pull Request Template

When opening a PR, fill out `.github/PULL_REQUEST_TEMPLATE.md`:

- Summary of changes (one paragraph).
- Testing evidence (command output, screenshots, logs).
- Checklist confirmation (lint/tests/docs).
- Mention reviewers (TA/instructor) using `@username`.

## 5. Final Verification

Before hitting “Create Pull Request”:

- ✅ `git status` shows only intentional changes.
- ✅ Secrets removed (use `.env.template` files).
- ✅ Large files (>50 MB) avoided or replaced with download instructions.
- ✅ `README.md` links resolve (use `npm run lint` to catch broken markdown links if configured).

## 6. Troubleshooting

- **Tests fail on CI but pass locally:** Check MongoDB URI (CI uses `mongodb://127.0.0.1:27017`). Ensure scripts don’t rely on OS-specific paths.
- **Dataset mismatch:** Update `scripts/data-manifest.json` and rerun `npm run test:data`.
- **Replica set tests skipped:** Run `node labs/lab05_replication/setup_replica_set.js` before `npm run test:labs -- --lab=lab05`.

## 7. Support

- GitHub Discussions (`help-wanted`, `labXX`) for async questions.
- Office hours for live debugging.
- `docs/testing_framework.md` for extra testing guidance.

Following this guide keeps submissions reviewable and reproducible. Happy hacking!
