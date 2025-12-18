#!/usr/bin/env python3
"""
Enhanced lab validation script with comprehensive error handling.
This script validates lab structure with robust error handling for edge cases.
"""

import sys
import os
import logging
import traceback
from pathlib import Path
import json
import re
from typing import List, Dict, Tuple, Optional
import argparse
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ValidationError(Exception):
    """Custom exception for validation errors."""
    pass


class LabValidator:
    """Enhanced lab validator with comprehensive error handling."""

    def __init__(self, base_path: Path, strict_mode: bool = False):
        """
        Initialize the validator.

        Args:
            base_path: Base directory path
            strict_mode: If True, fail on warnings
        """
        self.base_path = base_path
        self.strict_mode = strict_mode
        self.issues = []
        self.warnings = []
        self.stats = {
            'labs_checked': 0,
            'groups_checked': 0,
            'files_validated': 0,
            'errors': 0,
            'warnings': 0
        }

    def safe_read_file(self, file_path: Path, encoding: str = 'utf-8') -> Optional[str]:
        """
        Safely read a file with multiple encoding fallbacks.

        Args:
            file_path: Path to the file
            encoding: Primary encoding to try

        Returns:
            File content or None if error
        """
        encodings = [encoding, 'utf-8', 'latin-1', 'cp1252']

        for enc in encodings:
            try:
                with open(file_path, 'r', encoding=enc) as f:
                    return f.read()
            except UnicodeDecodeError:
                continue
            except FileNotFoundError:
                logger.warning(f"File not found: {file_path}")
                return None
            except PermissionError:
                logger.error(f"Permission denied: {file_path}")
                self.issues.append(f"Permission denied reading: {file_path}")
                return None
            except Exception as e:
                logger.error(f"Unexpected error reading {file_path}: {e}")
                continue

        self.issues.append(f"Could not read file with any encoding: {file_path}")
        return None

    def safe_json_load(self, file_path: Path) -> Tuple[Optional[dict], Optional[str]]:
        """
        Safely load and validate JSON file.

        Args:
            file_path: Path to JSON file

        Returns:
            Tuple of (json_data, error_message)
        """
        try:
            content = self.safe_read_file(file_path)
            if content is None:
                return None, f"Could not read file: {file_path}"

            # Try to parse JSON
            data = json.loads(content)

            # Validate JSON structure
            if not isinstance(data, (dict, list)):
                return None, f"JSON root must be object or array: {file_path}"

            # Check for common JSON issues
            if isinstance(data, dict):
                # Check for duplicate keys (json.loads handles this but we can warn)
                if len(data) == 0:
                    self.warnings.append(f"Empty JSON object: {file_path}")

            return data, None

        except json.JSONDecodeError as e:
            return None, f"Invalid JSON in {file_path}: Line {e.lineno}, Column {e.colno}: {e.msg}"
        except MemoryError:
            return None, f"JSON file too large to parse: {file_path}"
        except Exception as e:
            return None, f"Unexpected error parsing JSON {file_path}: {str(e)}"

    def check_lab_structure(self, lab_path: Path) -> List[str]:
        """
        Check if a lab follows the standard structure with error handling.

        Args:
            lab_path: Path to the lab directory

        Returns:
            List of issues found
        """
        issues = []
        lab_name = lab_path.name

        try:
            self.stats['labs_checked'] += 1

            # Check if directory is accessible
            if not os.access(lab_path, os.R_OK):
                issues.append(f"{lab_name}: Directory not readable")
                return issues

            # Required files for each lab
            required_files = {
                'README.md': {'min_size': 100, 'required': True},
                'exercises': {'extensions': ['.js', '.py'], 'required': True},
                'test': {'extensions': ['.js', '.py'], 'required': False}
            }

            # Check for required files
            for file_base, config in required_files.items():
                if 'extensions' in config:
                    # Check for files with multiple possible extensions
                    found = False
                    for ext in config['extensions']:
                        file_path = lab_path / f"{file_base}{ext}"
                        if file_path.exists():
                            found = True
                            self.stats['files_validated'] += 1

                            # Check file size
                            try:
                                size = file_path.stat().st_size
                                if size == 0:
                                    issues.append(f"{lab_name}: Empty file {file_path.name}")
                                elif size < config.get('min_size', 10):
                                    self.warnings.append(f"{lab_name}: Suspiciously small file {file_path.name} ({size} bytes)")
                            except OSError as e:
                                issues.append(f"{lab_name}: Cannot stat file {file_path.name}: {e}")
                            break

                    if not found and config.get('required', False):
                        issues.append(f"{lab_name}: Missing {file_base} file (.js or .py)")
                else:
                    # Single file check
                    file_path = lab_path / file_base
                    if config.get('required', False) and not file_path.exists():
                        issues.append(f"{lab_name}: Missing required file {file_base}")
                    elif file_path.exists():
                        self.stats['files_validated'] += 1

                        # Validate file content
                        content = self.safe_read_file(file_path)
                        if content is not None:
                            if len(content.strip()) < config.get('min_size', 100):
                                issues.append(f"{lab_name}: {file_base} has insufficient content")

            # Check README structure
            readme_path = lab_path / 'README.md'
            if readme_path.exists():
                content = self.safe_read_file(readme_path)
                if content:
                    issues.extend(self.validate_readme_content(lab_name, content))

            # Check for solution files (should not be committed)
            try:
                solution_patterns = ['*solution*', '*answer*', '*key*']
                for pattern in solution_patterns:
                    solution_files = list(lab_path.glob(pattern))
                    for sol_file in solution_files:
                        if not sol_file.name.startswith('.'):  # Skip hidden files
                            self.warnings.append(f"{lab_name}: Possible solution file: {sol_file.name}")
            except Exception as e:
                logger.warning(f"Error checking for solution files in {lab_name}: {e}")

            # Check for very large files
            try:
                for file_path in lab_path.rglob('*'):
                    if file_path.is_file():
                        size = file_path.stat().st_size
                        if size > 10 * 1024 * 1024:  # 10MB
                            self.warnings.append(f"{lab_name}: Large file detected ({size // 1024 // 1024}MB): {file_path.name}")
            except Exception as e:
                logger.warning(f"Error checking file sizes in {lab_name}: {e}")

        except PermissionError:
            issues.append(f"{lab_name}: Permission denied accessing directory")
        except Exception as e:
            issues.append(f"{lab_name}: Unexpected error: {str(e)}")
            logger.error(f"Error processing lab {lab_name}: {traceback.format_exc()}")

        return issues

    def validate_readme_content(self, lab_name: str, content: str) -> List[str]:
        """
        Validate README content structure.

        Args:
            lab_name: Name of the lab
            content: README content

        Returns:
            List of issues found
        """
        issues = []

        # Check for required sections
        required_sections = [
            ('## Objectives', 'learning objectives'),
            ('## Prerequisites', 'prerequisites or requirements'),
            ('## Setup', 'setup instructions'),
            ('## Exercises', 'exercise descriptions')
        ]

        for section, description in required_sections:
            if section not in content:
                # Try case-insensitive match
                if section.lower() not in content.lower():
                    issues.append(f"{lab_name}: README missing section '{section}' ({description})")

        # Check for proper lab naming
        if not re.search(r'#\s+Lab\s+\d+', content, re.IGNORECASE):
            self.warnings.append(f"{lab_name}: README should start with '# Lab X: Title' format")

        # Check for broken markdown links
        markdown_links = re.findall(r'\[([^\]]+)\]\(([^\)]+)\)', content)
        for link_text, link_url in markdown_links:
            if link_url.startswith(('http://', 'https://')):
                continue  # Skip external URLs
            if link_url.startswith('#'):
                continue  # Skip anchor links

            # Check if local file exists
            link_path = Path(self.base_path) / 'labs' / lab_name / link_url
            if not link_path.exists():
                self.warnings.append(f"{lab_name}: Broken link in README: {link_url}")

        return issues

    def validate_mongodb_scripts(self, script_path: Path) -> List[str]:
        """
        Validate MongoDB scripts for common issues.

        Args:
            script_path: Path to the script file

        Returns:
            List of issues found
        """
        issues = []

        try:
            content = self.safe_read_file(script_path)
            if not content:
                return issues

            # Check for common MongoDB script issues
            patterns = {
                r'db\.\w+\.drop\(\)': 'Dangerous: drop() operation found',
                r'db\.dropDatabase\(\)': 'Dangerous: dropDatabase() found',
                r'while\s*\(true\)': 'Potential infinite loop detected',
                r'eval\(': 'Security risk: eval() usage detected',
                r'\$where': 'Performance issue: $where operator is slow'
            }

            for pattern, message in patterns.items():
                if re.search(pattern, content, re.IGNORECASE):
                    self.warnings.append(f"{script_path.name}: {message}")

            # Check for proper error handling
            if 'try' not in content and 'catch' not in content:
                if len(content) > 500:  # Only for substantial scripts
                    self.warnings.append(f"{script_path.name}: No error handling (try/catch) detected")

        except Exception as e:
            logger.warning(f"Error validating MongoDB script {script_path}: {e}")

        return issues

    def validate_all(self) -> Tuple[List[str], List[str]]:
        """
        Run all validations.

        Returns:
            Tuple of (issues, warnings)
        """
        labs_path = self.base_path / 'labs'
        groups_path = self.base_path / 'groups'

        # Check labs
        if labs_path.exists():
            try:
                for lab_dir in labs_path.iterdir():
                    if lab_dir.is_dir() and not lab_dir.name.startswith('.'):
                        lab_issues = self.check_lab_structure(lab_dir)
                        self.issues.extend(lab_issues)
            except PermissionError:
                self.issues.append("Permission denied accessing labs directory")
            except Exception as e:
                self.issues.append(f"Error scanning labs directory: {str(e)}")

        # Validate JSON files
        try:
            for json_file in self.base_path.rglob('*.json'):
                # Skip node_modules and other irrelevant directories
                skip_dirs = ['node_modules', '.git', 'venv', '__pycache__']
                if any(skip_dir in str(json_file) for skip_dir in skip_dirs):
                    continue

                self.stats['files_validated'] += 1
                _, error = self.safe_json_load(json_file)
                if error:
                    self.issues.append(error)
        except Exception as e:
            logger.warning(f"Error during JSON validation: {e}")

        # Validate MongoDB scripts
        try:
            for js_file in self.base_path.rglob('*.js'):
                if 'node_modules' in str(js_file):
                    continue

                # Check if it's likely a MongoDB script
                if any(keyword in js_file.name.lower() for keyword in ['query', 'import', 'test']):
                    self.validate_mongodb_scripts(js_file)
        except Exception as e:
            logger.warning(f"Error validating MongoDB scripts: {e}")

        self.stats['errors'] = len(self.issues)
        self.stats['warnings'] = len(self.warnings)

        return self.issues, self.warnings

    def print_report(self):
        """Print validation report."""
        print("\n" + "=" * 60)
        print("LAB VALIDATION REPORT")
        print("=" * 60)

        print(f"\nStatistics:")
        print(f"  Labs checked: {self.stats['labs_checked']}")
        print(f"  Files validated: {self.stats['files_validated']}")
        print(f"  Errors found: {self.stats['errors']}")
        print(f"  Warnings: {self.stats['warnings']}")

        if self.issues:
            print("\n❌ Errors (must fix):")
            for issue in self.issues:
                print(f"  • {issue}")

        if self.warnings:
            print("\n⚠️  Warnings (should review):")
            for warning in self.warnings:
                print(f"  • {warning}")

        if not self.issues and not self.warnings:
            print("\n✅ All validations passed!")

        # Save report to file
        report_path = self.base_path / 'validation_report.txt'
        try:
            with open(report_path, 'w') as f:
                f.write(f"Validation Report - {datetime.now()}\n")
                f.write("=" * 60 + "\n\n")
                f.write(f"Statistics:\n")
                for key, value in self.stats.items():
                    f.write(f"  {key}: {value}\n")
                f.write("\n")

                if self.issues:
                    f.write("Errors:\n")
                    for issue in self.issues:
                        f.write(f"  - {issue}\n")
                    f.write("\n")

                if self.warnings:
                    f.write("Warnings:\n")
                    for warning in self.warnings:
                        f.write(f"  - {warning}\n")

            print(f"\n📄 Report saved to: {report_path}")
        except Exception as e:
            logger.error(f"Could not save report: {e}")


def main():
    """Main entry point with argument parsing."""
    parser = argparse.ArgumentParser(description='Validate lab structure and files')
    parser.add_argument('--path', type=str, default='.', help='Base path to validate')
    parser.add_argument('--strict', action='store_true', help='Fail on warnings')
    parser.add_argument('--verbose', action='store_true', help='Verbose output')
    parser.add_argument('--fix', action='store_true', help='Attempt to fix issues (experimental)')

    args = parser.parse_args()

    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    base_path = Path(args.path).resolve()

    if not base_path.exists():
        print(f"Error: Path does not exist: {base_path}")
        return 1

    try:
        validator = LabValidator(base_path, strict_mode=args.strict)
        issues, warnings = validator.validate_all()
        validator.print_report()

        # Determine exit code
        if issues:
            return 1
        if args.strict and warnings:
            return 1

        return 0

    except KeyboardInterrupt:
        print("\n\nValidation interrupted by user")
        return 130
    except Exception as e:
        print(f"\n❌ Fatal error: {str(e)}")
        logger.error(f"Fatal error: {traceback.format_exc()}")
        return 1


if __name__ == '__main__':
    sys.exit(main())