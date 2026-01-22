# Standard Questions for Group Submissions

## Structure & Logistics
1. Have you created the `group_<group_number>` folder plus per-lab subdirectories, and kept only the lab deliverables requested in the instructions? (see folder structure guidance in `group-work/README.md` sections 1-2)
2. Does your README inside the lab folder explain the current lab, list team members, and state which deliverables are included so reviewers can quickly orient themselves? (see `group-work/README.md` section 2 and the README requirements in `practical_work_instructions.tex`)
3. Is the pull request up to date with `main`, contains a clear message, and its description enumerates group number, members, labs covered, a summary, and any blockers? (`group-work/README.md` section 4)

## Documentation & Learning
4. Does the README, NOTES, or overview document describe your problem statement, solution goals, and key design decisions (data model, indexes, validation) with enough context for someone who cannot inspect the full code? (`practical_work_instructions.tex` documentation guideline list)
5. What trade-offs did you weigh when choosing embedding versus referencing, index strategy, and aggregate workloads? (This helps confirm the README/NOTES covers design decisions and best practices from the provided templates.)
6. Have you captured challenges, lessons learned, and learning outcomes so reviewers can see what you practiced and what you would improve next time? (`practical_work_instructions.tex` documentation guidelines)
7. Are performance metrics such as execution times, documents examined, and index usage recorded for your core queries? (`practical_work_instructions.tex` documentation guideline on performance metrics and best practices tip box)

## Implementation & Quality
8. Is the code organized with consistent naming, comments for complex logic, error handling, and no hard-coded secrets so the submission matches the code standards from `practical_work_instructions.tex`?
9. Which indexes, projections, pagination, and batching tactics did you apply to optimize query performance? (Refer to the performance optimization tips in `practical_work_instructions.tex`.)

## Testing & Validation
10. Which automated tests did you run (lab-specific tests, `npm run lint`, `npm run test:coverage`, `node group-work/scripts/group_submission_validator.js`, etc.), and what were the outcomes? (`practical_work_instructions.tex` testing infrastructure)
11. Did you attach validator results or logs, and did you document any remaining blockers noted after those checks? (`group-work/README.md` PR checklist and validation section)

## Data, Scripts & Naming
12. Are datasets, fixtures, and screenshots stored where the guide expects (small fixtures inside the lab folder, large datasets in `data/`, docs/screenshots under `docs/` or `images/`)? (`group-work/instructions/submission_guide.md` artifact requirements)
13. Do your mongosh/Node scripts follow the helper naming conventions, rely on environment variables for credentials, and avoid hard-coded secrets? (`group-work/instructions/submission_guide.md` artifact table + section 1 pre-submission)
14. Does the folder and filename casing align with the lowercase/underscore/kebab guidance so reviewers can find artifacts predictably? (`group-work/instructions/submission_guide.md` section 3)

## Pull Request & Verification
15. Does the PR summary describe the change, mention the affected lab area, list authors/members, and include testing evidence as the PR template requests? (`.github/PULL_REQUEST_TEMPLATE.md`)
16. Was final verification performed (clean `git status`, secrets removed, large files avoided or explained, README links validated)? (`group-work/instructions/submission_guide.md` final verification list)

## Troubleshooting & Support
17. If CI tests failed (replica sets, dataset mismatches, Mongo URI issues), have you recorded the troubleshooting steps (replica bootstrap commands, manifest updates, environment checks) so the team can see how you debugged? (`group-work/instructions/submission_guide.md` troubleshooting section)
18. Did you capture any async help requests (GitHub discussions, issue tracker notes, office-hour follow-ups) to document open questions or instructor communications? (`group-work/instructions/submission_guide.md` support section)

## Project Folder Contents
19. Does each group\'s `project/` folder contain only the `queries/` and `data/` directories plus the `README.md` and architecture overview file, matching the minimal deliverables you described? (Use this rule to keep project folders slim.)
