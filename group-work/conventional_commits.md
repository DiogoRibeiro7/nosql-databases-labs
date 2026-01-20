# Git Commits and Conventional Commits

This document explains:

1. How to create a commit using Git (for GitHub).
2. What `feat`, `fix`, `chore`, and other Conventional Commit types mean.

---

## 1. How to Make a Commit (Git + GitHub)

A **commit** is a snapshot of your code with a message that explains what changed and why.

### 1.1. Basic Workflow (Command Line)

Assume you already cloned a repo from GitHub:

```bash
git clone https://github.com/user/repo.git
cd repo
```

After you edit some files, you can commit your changes.

#### Step 1 — Check what changed

```bash
git status
```

This shows:

- Modified files
- Untracked files (new files not yet in Git)

#### Step 2 — Stage the changes

Staging selects which changes will go into the next commit.

- Stage a single file:

  ```bash
  git add path/to/file.py
  ```

- Stage all changed files:

  ```bash
  git add .
  ```

#### Step 3 — Create the commit with a message

```bash
git commit -m "feat: add user login endpoint"
```

#### Step 4 — Push to GitHub

If your branch is already tracking `origin/main`:

```bash
git push
```

If it’s a new branch:

```bash
git push -u origin my-branch-name
```

That’s the basic loop:

1. Edit files
2. `git status`
3. `git add ...`
4. `git commit -m "..."`
5. `git push`

---

## 2. Conventional Commit Messages

Conventional Commits define a standard format for commit messages, so both humans and tools can understand the type of change.

The general pattern is:

```text
<type>[optional scope]: <short description>

[optional body]

[optional footer]
```

Example:

```text
feat(auth): add refresh token endpoint
```

- `type` → what kind of change (feature, fix, docs, etc.)
- `scope` (optional) → what part of the code is affected (`auth`, `api`, `ui`, etc.)
- `description` → short, clear summary

---

## 3. Common Commit Types

### 3.1 Core Types

| Type    | Meaning                            | Example                             |
| ------- | ---------------------------------- | ----------------------------------- |
| `feat`  | New feature / functionality        | `feat: add password reset flow`     |
| `fix`   | Bug fix                            | `fix: handle null user id in login` |
| `chore` | Maintenance, no user-facing change | `chore: update eslint config`       |

**`feat`**  
Use when you add new behaviour or functionality that users can see or use.

**`fix`**  
Use when you correct wrong behaviour (bugs, exceptions, incorrect outputs).

**`chore`**  
Use for tasks that do not change the app’s behaviour from the user’s point of view, e.g.:

- Updating dependencies
- Renaming folders
- Cleaning config files
- Minor project maintenance

---

### 3.2 Other Very Common Types

| Type       | Meaning                                              | Example                                          |
| ---------- | ---------------------------------------------------- | ------------------------------------------------ |
| `docs`     | Documentation only                                   | `docs: add setup instructions to readme`         |
| `refactor` | Restructure code without changing external behaviour | `refactor: extract user service from controller` |
| `test`     | Add or update tests                                  | `test: add integration tests for login`          |
| `perf`     | Performance improvements                             | `perf: cache user profile lookups`               |
| `style`    | Formatting / style only, no logic change             | `style: run black on project`                    |
| `build`    | Build system or dependencies                         | `build: bump numpy to 2.0`                       |
| `ci`       | Continuous Integration / pipelines                   | `ci: add python 3.12 to test matrix`             |
| `revert`   | Revert a previous commit                             | `revert: "feat: add experimental dashboard"`     |

Notes:

- Use **`docs`** when the change is documentation-only.
- Use **`refactor`** when you restructure code but keep behaviour the same.
- Use **`test`** for test files and test changes.
- Use **`perf`** when the primary goal is performance.
- Use **`style`** for formatting (spaces, indentation, line breaks, etc.).
- Use **`build`** for changes in build tools, packaging, Docker, etc.
- Use **`ci`** for changes in GitHub Actions, Jenkins, GitLab CI, etc.

---

## 4. Scopes and Breaking Changes

### 4.1 Scopes

You can indicate which part of the project is affected:

```text
feat(auth): add JWT authentication
fix(cart): prevent negative quantity
docs(api): document error responses
```

Typical scopes: `auth`, `api`, `ui`, `db`, `cli`, `core`, `docs`, etc.  
Choose something that helps future you (and teammates) understand what changed.

### 4.2 Breaking Changes

A **breaking change** is a change that requires users to modify their code or usage.

There are two common ways to mark them:

1. Add `!` after the type:

   ```text
   feat!: remove legacy authentication
   ```

2. Add a `BREAKING CHANGE` section in the footer:

   ```text
   feat(auth): add new token format

   BREAKING CHANGE: old login endpoints /v1/login are removed
   ```

Tools like **semantic-release** can use this to automatically bump the **major** version.

---

## 5. Why Use Conventional Commits?

Using these types consistently helps to:

- Auto-generate a **CHANGELOG.md**
- Decide the **version bump** automatically:
  - `fix` → patch version (x.y.**z+1**)
  - `feat` → minor version (x.**y+1**.0)
  - breaking change → major version (**x+1**.0.0)
- Make the commit history easier to read and search
- Improve team communication

---

## 6. Practical Examples

Imagine you:

1. Implement a new analytics dashboard
2. Fix a bug in an API endpoint
3. Add tests for that bug

You can do:

```bash
# 1. Add dashboard feature
git add dashboard/*
git commit -m "feat(ui): add analytics dashboard"

# 2. Fix API bug
git add api/routes.py
git commit -m "fix(api): return 400 when user id is missing"

# 3. Improve tests
git add tests/
git commit -m "test: add regression tests for api user id"

# Push everything
git push
```

Now your history is clean, structured, and easy to understand.

---

## 7. Quick Reference

**Basic Git commands:**

```bash
git status           # See what changed
git add <file>       # Stage a specific file
git add .            # Stage all changes
git commit -m "..."  # Create a commit
git push             # Push to GitHub
```

**Common commit types:**

- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance / housekeeping
- `docs`: Documentation
- `refactor`: Internal refactoring
- `test`: Tests
- `perf`: Performance improvements
- `style`: Formatting, no logic changes
- `build`: Build system / dependencies
- `ci`: CI pipeline changes
- `revert`: Revert previous commit

Use them consistently and your future self will thank you.
