# Group Work Submissions

This directory is the central place for students to submit collaborative assignments. Every group owns exactly one subfolder named after its official group number and uploads all deliverables for the course there.

---

## 1\. Naming & Structure

- Folder name: `group_<group_number>` (always two digits, e.g. `group_02`, `group_15`).
- One folder per group. If you switch groups, archive the previous folder instead of deleting it.
- Inside each folder, create subdirectories per lab or milestone, such as `lab01/`, `lab02/`, `final-project/`.
- Commit only the files requested in the lab (source code, datasets you created, reports). Avoid binaries or MongoDB data dumps unless explicitly required.

Example:

```
group-work/
  group_05/
    lab01/
      README.md
      queries.js
    lab02/
      modeling.pdf
    final-project/
      schema/
      scripts/
```

---

## 2\. Create or Update Your Folder

1. `cd nosql-databases-labs/group-work`
2. Check if your folder already exists with `ls`.
3. If not, create one: `mkdir group_<group_number>` (example: `mkdir group_05`).
4. Add a short `README.md` inside your folder describing the current lab, members, and deliverables.
5. Copy or create all lab files inside the appropriate subfolder.

Tips:

- Keep filenames short and descriptive (`report.md`, `queries.js`, `answers.pdf`).
- If a lab gives you starter files elsewhere in the repo, copy only what you modified; never move the original lab instructions out of the `labs/` directory.
- Use `.gitkeep` to keep empty directories if a lab specifies folder structure without files yet.

---

## 3\. Git & Pull Request Workflow

1. **Fork** the repository on GitHub (once per group).
2. **Clone** your fork locally: `git clone https://github.com/<your-user>/nosql-databases-labs.git`.
3. **Create a branch** for the current deliverable: `git checkout -b group_05-lab01`.
4. **Add your work** inside `group-work/group_05/<lab>/`.
5. **Stage & commit** with a clear message:

```bash
git add group-work/group_05
git commit -m "group_05: add lab 01 queries"
```

6. **Push** the branch: `git push origin group_05-lab01`.
7. **Open a Pull Request** from `group_05-lab01` on your fork into the upstream `main`.

---

## 4\. Pull Request Checklist

Before requesting a review, make sure:

- Your branch is up to date with `main`: `git fetch upstream && git rebase upstream/main`.
- The folder structure follows the naming convention and includes a short `README.md` per lab describing group members and the status of the submission.
- All code and documentation lint or build successfully if the lab provides tooling.
- Large assets (over 10 MB) are either compressed or linked if permitted by the instructions.
- The PR description includes:
  - Group number and member names
  - Lab or project milestone covered
  - Summary of what changed
  - Any blockers or open questions for the teaching staff

- Screenshots or logs are attached when the lab requires them.

---

## 5\. After Submitting

- Monitor the PR for comments from instructors or TAs.
- Push additional commits to the same branch to address feedback.
- Once approved, follow the instructions from the teaching staff for merging (usually done by the maintainers).
- Keep working in new branches for future labs (`group_05-lab02`, `group_05-final`, etc.) to keep history clean.

---

Need help? Tag an instructor on the PR or use the course communication channels with a link to your branch. Consistent structure and clear documentation make it easier for staff to review and grade your work. Good luck!

---

## 6. Validation Tools

Run the automated validator before opening a pull request:

```bash
node group-work/scripts/group_submission_validator.js
```

The script checks required files, documentation sections, code quality, and optional artefacts (presentations, diagrams, etc.). Fix any reported issues and attach the generated summary to your PR if instructors request it.
