# Changelog

All notable changes to this project will be documented in this file.

## [v1.1.1] - 2026-01-07


### Changes in this release:

Initial release


### Contributors:

---

## [v1.1.0] - 2026-01-07


### Changes in this release:

Initial release


### Contributors:

---

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Automated version control system with GitHub Actions
- Version preview on pull requests
- Automatic CHANGELOG generation
- Semantic versioning based on conventional commits

## [1.0.0] - 2025-12-29

### Initial Release
- NoSQL Databases Labs repository
- Lab exercises and solutions
- Testing infrastructure
- CI/CD pipeline with GitHub Actions
- Docker setup for MongoDB environments
- Comprehensive documentation

---

## Version Bump Guidelines

### Conventional Commits
This project uses conventional commits to automatically determine version bumps:

- `fix:` - Patch release (bug fixes)
- `feat:` - Minor release (new features)
- `BREAKING CHANGE:` or `!:` - Major release (breaking changes)
- `chore:`, `docs:`, `style:`, `refactor:`, `test:`, `perf:`, `deps:` - Patch release

### Manual Version Bumping
Run `npm run version:bump -- [major|minor|patch]` to manually bump the version.

[Unreleased]: https://github.com/DiogoRibeiro7/nosql-databases-labs/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/DiogoRibeiro7/nosql-databases-labs/releases/tag/v1.0.0