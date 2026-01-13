#!/usr/bin/env python3
"""
Validate lab structure and ensure consistency across all labs.
This pre-commit hook checks that all labs follow the standard structure.
"""

import sys
import os
from pathlib import Path
import json
import re


def check_lab_structure(lab_path):
    """Check if a lab follows the standard structure."""
    issues = []
    lab_name = lab_path.name

    # Required files for each lab
    required_files = [
        'README.md',
        'exercises.js',  # or exercises.py
    ]

    # Check for required files
    for req_file in required_files:
        if req_file == 'exercises.js':
            # Check for either .js or .py
            js_exists = (lab_path / 'exercises.js').exists()
            py_exists = (lab_path / 'exercises.py').exists()
            if not js_exists and not py_exists:
                issues.append(f"{lab_name}: Missing exercises file (exercises.js or exercises.py)")
        else:
            file_path = lab_path / req_file
            if not file_path.exists():
                issues.append(f"{lab_name}: Missing required file {req_file}")

    # Check README structure
    readme_path = lab_path / 'README.md'
    if readme_path.exists():
        with open(readme_path, 'r', encoding='utf-8') as f:
            readme_content = f.read()

        # Check for required sections
        required_sections = [
            '## Overview',
            '## Prerequisites',
            '## Setup',
            '## Exercises',
        ]

        for section in required_sections:
            if section not in readme_content:
                issues.append(f"{lab_name}: README missing section '{section}'")

        # Check for proper lab naming
        if not re.search(r'# Lab \d+', readme_content):
            issues.append(f"{lab_name}: README should start with '# Lab X: Title' format")

    # Check for test files
    test_file_js = lab_path / 'test.js'
    test_file_py = lab_path / 'test_exercises.py'
    if not test_file_js.exists() and not test_file_py.exists():
        issues.append(f"{lab_name}: Missing test file (test.js or test_exercises.py)")

    # Check for solution files (should not be committed)
    solution_files = list(lab_path.glob('*solution*')) + list(lab_path.glob('*answer*'))
    for sol_file in solution_files:
        if not sol_file.name.startswith('.'):  # Skip hidden files
            issues.append(f"{lab_name}: Solution file should not be committed: {sol_file.name}")

    return issues


def check_group_structure(group_path):
    """Check if a group deliverable follows the standard structure."""
    issues = []
    group_name = group_path.name

    # Required files for each group
    required_files = [
        'README.md',
        'deliverable.js',  # or deliverable.py
    ]

    for req_file in required_files:
        if req_file == 'deliverable.js':
            # Check for either .js or .py
            js_exists = (group_path / 'deliverable.js').exists()
            py_exists = (group_path / 'deliverable.py').exists()
            if not js_exists and not py_exists:
                issues.append(f"{group_name}: Missing deliverable file")
        else:
            file_path = group_path / req_file
            if not file_path.exists():
                issues.append(f"{group_name}: Missing required file {req_file}")

    return issues


def validate_json_files(base_path):
    """Validate all JSON files are properly formatted."""
    issues = []

    for json_file in base_path.rglob('*.json'):
        # Skip data directory and node_modules
        if 'data' in json_file.parts or 'node_modules' in json_file.parts:
            continue

        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                json.load(f)
        except json.JSONDecodeError as e:
            issues.append(f"Invalid JSON in {json_file.relative_to(base_path)}: {e}")
        except Exception as e:
            issues.append(f"Error reading {json_file.relative_to(base_path)}: {e}")

    return issues


def check_file_naming():
    """Check for consistent file naming conventions."""
    issues = []
    base_path = Path.cwd()

    # Check for spaces in filenames (except in data directory)
    for filepath in base_path.rglob('*'):
        if filepath.is_file():
            # Skip data and hidden directories
            if 'data' in filepath.parts or any(part.startswith('.') for part in filepath.parts):
                continue

            if ' ' in filepath.name:
                issues.append(f"File contains spaces: {filepath.relative_to(base_path)}")

    return issues


def main():
    """Main validation function."""
    base_path = Path.cwd()
    labs_path = base_path / 'labs'
    groups_path = base_path / 'group_deliverables'

    all_issues = []

    # Check each lab
    if labs_path.exists():
        for lab_dir in labs_path.iterdir():
            if lab_dir.is_dir() and not lab_dir.name.startswith('.'):
                issues = check_lab_structure(lab_dir)
                all_issues.extend(issues)

    # Check each group deliverable
    if groups_path.exists():
        for group_dir in groups_path.iterdir():
            if group_dir.is_dir() and group_dir.name.startswith('GROUP_'):
                issues = check_group_structure(group_dir)
                all_issues.extend(issues)

    # Validate JSON files
    json_issues = validate_json_files(base_path)
    all_issues.extend(json_issues)

    # Check file naming
    naming_issues = check_file_naming()
    all_issues.extend(naming_issues)

    # Report issues
    if all_issues:
        print("\n⚠️  Lab structure validation failed:\n")
        for issue in all_issues:
            print(f"  ❌ {issue}")

        print("\n💡 Tips:")
        print("  - Each lab should have README.md and exercises file")
        print("  - README should include Overview, Prerequisites, Setup, and Exercises sections")
        print("  - Test files should be named test.js or test_exercises.py")
        print("  - Don't commit solution files")
        print("  - Use underscores or hyphens instead of spaces in filenames")
        print()
        print("To skip this check: git commit --no-verify")

        return 1
    else:
        print("✅ All labs follow the standard structure!")

    return 0


if __name__ == '__main__':
    sys.exit(main())