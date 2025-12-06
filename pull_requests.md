# Pull Request Guide

Follow this checklist each time you submit work to `nosql-databases-labs`. Well-structured PRs keep reviews fast and traceable.

---

## 1. Before You Start

* Make sure you read `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `group-work/README.md`.
* Confirm your local repository is synced:
  ```bash
  git fetch upstream
  git checkout main
  git pull upstream main
  ```
* Create a new branch from `main`. Recommended formats:
  * Student labs: `group_<nn>-lab<nn>` (e.g. `group_07-lab03`)
  * Instructor updates: `chore/update-lab04-scripts`, `fix/lab02-data-import`

---

## 2. Preparing the Content

1. Place all lab deliverables inside `group-work/group_<nn>/<lab>/`.
2. Include a short `README.md` in each lab folder that lists:
   * Lab or project milestone
   * Team members
   * Special instructions or deviations
3. Run tests and linters:
   ```bash
   npm run lint
   npm run test:data
   ```
4. Remove temporary files (`.env`, local dumps, `node_modules`, `.DS_Store`, etc.).

---

## 3. Commit Standards

* Commit early and often, but squash or rebase to keep history tidy before opening a PR.
* Use descriptive messages:
  ```
  group_07: add aggregation answers for lab 03
  docs: clarify lab02 import instructions
  ```
* Reference GitHub issues when applicable (`Fixes #42`, `Related to #105`).

---

## 4. Opening the Pull Request

When you are ready to submit:

1. Push your branch: `git push origin <branch-name>`.
2. Open a PR from your fork into `diogoribeiro7/nosql-databases-labs:main`.
3. Use the template in `.github/PULL_REQUEST_TEMPLATE.md` or copy the following structure:

```
## Summary
- What work does this PR cover?

## Group / Author
- Group number or instructor name
- Member list (if a group submission)

## Testing
- Tests or scripts executed (npm run lint, test:data, manual steps)

## Notes
- Known issues, blockers, or questions for reviewers
```

4. Request a review from the teaching staff or tag them directly in the description.

---

## 5. Review Expectations

* Respond to feedback within 48 hours while the course is in session.
* Push additional commits to the same branch; avoid force-pushing unless requested.
* Resolve conversations in GitHub only after addressing the comments.
* Keep PRs under ~300 lines of diff when possible. Large submissions should be split by lab or feature.

---

## 6. After Approval

* Instructors typically handle merging; students should wait for confirmation before deleting their branch.
* If changes are requested, update your branch and re-run the validation commands.
* Once merged, pull `upstream main` locally to stay up to date for the next lab.

---

## 7. Common Pitfalls to Avoid

* Missing `group_<nn>` folder or incorrect naming.
* Including output datasets or binaries >10 MB without approval.
* Skipping validation scripts, leading to failing CI.
* Opening PRs from outdated branches that cause merge conflicts.

By following this guide, you ensure reviews stay quick and your contributions are merged without delay. Happy coding!
