#!/usr/bin/env python3
"""
Check for hardcoded MongoDB connection strings and credentials in code.
This pre-commit hook helps prevent accidental credential commits.
"""

import sys
import re
from pathlib import Path


# Patterns to detect MongoDB connection strings and credentials
PATTERNS = [
    # MongoDB connection strings
    (r'mongodb://[^/\s]+:[^@\s]+@[^/\s]+', 'MongoDB connection string with credentials'),
    (r'mongodb\+srv://[^/\s]+:[^@\s]+@[^/\s]+', 'MongoDB Atlas connection string'),

    # Hardcoded passwords (but allow specific test/example passwords)
    (r'password\s*=\s*["\'][^"\']+["\']', 'Hardcoded password'),
    (r'pwd\s*=\s*["\'][^"\']+["\']', 'Hardcoded password'),

    # API keys and tokens
    (r'api_key\s*=\s*["\'][A-Za-z0-9]{32,}["\']', 'Potential API key'),
    (r'token\s*=\s*["\'][A-Za-z0-9]{32,}["\']', 'Potential token'),
]

# Allowed patterns (for local development and examples)
ALLOWED_PATTERNS = [
    'mongodb://localhost',
    'mongodb://127.0.0.1',
    'mongodb://admin:admin123@localhost',
    'mongodb://labuser:labpass123@localhost',
    'mongodb://admin:admin123@mongodb',
    'mongodb://labuser:labpass123@mongodb',
    'password123',
    'admin123',
    'labpass123',
    'test123',
    'example_password',
]


def check_file(filepath):
    """Check a single file for MongoDB credentials."""
    issues = []

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Skip binary files
        if '\0' in content:
            return issues

        lines = content.split('\n')

        for line_num, line in enumerate(lines, 1):
            # Skip comments
            if line.strip().startswith('#') or line.strip().startswith('//'):
                continue

            for pattern, description in PATTERNS:
                matches = re.finditer(pattern, line, re.IGNORECASE)
                for match in matches:
                    matched_text = match.group()

                    # Check if it's an allowed pattern
                    is_allowed = any(
                        allowed.lower() in matched_text.lower()
                        for allowed in ALLOWED_PATTERNS
                    )

                    if not is_allowed:
                        issues.append({
                            'file': filepath,
                            'line': line_num,
                            'description': description,
                            'text': matched_text[:50] + '...' if len(matched_text) > 50 else matched_text
                        })

    except Exception as e:
        print(f"Error reading {filepath}: {e}", file=sys.stderr)

    return issues


def main():
    """Main function to check all provided files."""
    if len(sys.argv) < 2:
        print("No files to check")
        return 0

    all_issues = []

    for filepath in sys.argv[1:]:
        # Skip certain files
        path = Path(filepath)

        # Skip example and template files
        if any(skip in path.name.lower() for skip in ['.example', '.template', '.sample']):
            continue

        # Skip test files (they often have test credentials)
        if 'test' in path.parts:
            continue

        issues = check_file(filepath)
        all_issues.extend(issues)

    if all_issues:
        print("\n⚠️  Potential security issues found:\n")
        for issue in all_issues:
            print(f"  {issue['file']}:{issue['line']} - {issue['description']}")
            print(f"    Found: {issue['text']}")
            print()

        print("💡 Tips:")
        print("  - Use environment variables for sensitive data")
        print("  - Create a .env file (don't commit it) for local development")
        print("  - Use mongodb://localhost for local examples")
        print("  - For Docker, use service names like mongodb://mongodb:27017")
        print()
        print("If these are intentional (e.g., for local development),")
        print("you can skip this check with: git commit --no-verify")

        return 1

    return 0


if __name__ == '__main__':
    sys.exit(main())