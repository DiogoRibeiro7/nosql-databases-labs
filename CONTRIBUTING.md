# Contributing to `nosql-databases-labs`

Thanks for helping improve the NoSQL Databases labs! This guide explains how students and instructors should collaborate on the repository. By participating you agree to follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## 1. Who Can Contribute?

- **Students**: add their lab deliverables under `group-work/group_<group_number>/`.
- **Teaching staff**: update lab instructions, starter code, or supporting scripts.
- **External contributors**: open an issue first and wait for confirmation before sending a PR.

---

## 2. Prerequisites

1. **Node.js** >= 20 (see `package.json` engines).
2. **MongoDB Community Edition** and the MongoDB Database Tools.
3. Git configured with your university email.
4. Optional: `mongosh`, Docker, or other tooling mentioned in individual labs.

Install project dependencies:

```bash
npm install
```

Run quality checks locally before pushing:

```bash
npm run lint
npm run test:data
```

---

## 3. Workflow Overview

1. **Fork** the repository on GitHub (students should share a single fork per group).
2. **Clone** your fork and add the upstream remote:
   ```bash
   git clone https://github.com/<your-user>/nosql-databases-labs.git
   cd nosql-databases-labs
   git remote add upstream https://github.com/diogoribeiro7/nosql-databases-labs.git
   ```
3. **Create a branch** for each task:
   - Labs: `group_<number>-lab<nn>` (e.g. `group_05-lab01`)
   - Repository maintenance: `chore/update-lab03-instructions`
4. **Do the work**:
   - Students place deliverables in `group-work/group_<number>/<lab>/`.
   - Instructors edit files inside `labs/`, `scripts/`, etc.
5. **Commit** with descriptive messages:
   ```
   git add <files>
   git commit -m "group_05: add aggregation queries for lab 02"
   ```
6. **Push** to your fork and open a Pull Request using the template in `.github/PULL_REQUEST_TEMPLATE.md`.

---

## 4. Coding & Documentation Standards

- **JavaScript/TypeScript**: follow ESLint + Prettier settings provided in `eslint.config.js` and `.prettierrc.json`.
- **MongoDB Scripts**: keep them idempotent and include comments on dataset expectations.
- **Data Files**: verify large JSON/NDJSON/BSON files with `npm run test:data`.
- **Markdown**: wrap lines at ~100 characters; use fenced code blocks with language hints.
- **Commits**: prefer the imperative tone and include the group number or lab identifier when relevant.

When editing labs:

- Update `instructions.md` or per-lab README if workflows change.
- Add tests or validation scripts in `scripts/` to cover new datasets.
- Mention breaking changes in the PR description and notify students via the course platform.

---

## 5. Adding Group Deliverables

1. Review `group-work/README.md` for folder structure expectations.
2. Create (or update) your group's folder using the `group_XX` naming convention (two digits).
3. Include a mini `README.md` inside each lab folder describing:
   - Lab number and goals
   - Group members
   - Extra setup steps, if any
4. Keep raw datasets under 10 MB. If unavoidable, compress them or provide download instructions.

---

## 6. Opening Issues

Before filing a new issue, choose the template that matches your request from `.github/ISSUE_TEMPLATE/` (bug report or lab improvement) and gather:

1. Relevant lab number, dataset, or script name.
2. Reproduction steps and environment details (OS, MongoDB version, Node.js version).
3. Logs or screenshots formatted with fenced code blocks.

Issues without enough context may be closed until more details are provided.

---

## 7. Questions & Support

- Use official course communication channels for teaching-related questions.
- Mention `@diogoribeiro7` or the assigned TA in GitHub issues if feedback is time sensitive.
- For privacy, avoid sharing grades or personal data in commits, issues, or PRs.

Thank you for contributing and helping your peers learn NoSQL databases!

---

## 8. Code of Conduct

All contributors must follow `CODE_OF_CONDUCT.md`. Report violations confidentially to **diogo.ribeiro@ua.pt**.
