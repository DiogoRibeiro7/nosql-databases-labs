# Lab Submission Checklist

Use this checklist before opening a Pull Request for any lab. It complements `group-work/README.md`, `CONTRIBUTING.md`, and `pull_requests.md`.

## 1. Repository Hygiene

- [ ] Local clone is up to date with `upstream/main`.
- [ ] Working branch follows the convention `group_<nn>-lab<nn>` or similar.
- [ ] No temporary files (`node_modules`, `.env`, `.DS_Store`, logs) are staged.

## 2. Deliverable Structure

- [ ] Folder lives under `group-work/group_<nn>/<lab>/`.
- [ ] A short `README.md` in the lab folder lists members, objectives, and testing steps.
- [ ] File names are descriptive and camelCase or kebab-case (avoid spaces).
- [ ] Large datasets (>10 MB) are compressed or referenced externally if allowed.

## 3. Content Quality

- [ ] Lab requirements are addressed (queries, reports, scripts, etc.).
- [ ] Comments explain non-trivial logic or assumptions.
- [ ] Documentation cites any references or design trade-offs.

## 4. Validation

- [ ] `npm run lint`
- [ ] `npm run test:data`
- [ ] Lab-specific scripts/tests (link or describe in `README.md`)

Document any failing checks in the PR description with justification or follow-up plan.

## 5. Pull Request Prep

- [ ] Commit messages mention the group number and lab (e.g., `group_05: finalize lab02`).
- [ ] PR description follows `.github/PULL_REQUEST_TEMPLATE.md`.
- [ ] Screenshots or logs are attached for UI or CLI output when useful.

Following this checklist keeps reviews fast and ensures your work is graded promptly. Good luck!
