#!/usr/bin/env node

/**
 * Deadline Tracking System for Group Submissions
 *
 * This module manages submission deadlines, tracks late submissions,
 * and provides notifications for upcoming due dates.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class DeadlineTracker {
  constructor() {
    this.configPath = path.join('group-work', 'deadlines.json');
    this.submissionsPath = path.join('group-work', 'submissions.json');
    this.config = this.loadConfig();
    this.submissions = this.loadSubmissions();
  }

  /**
   * Load deadline configuration
   */
  loadConfig() {
    if (fs.existsSync(this.configPath)) {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    }

    // Default configuration
    const defaultConfig = {
      academic_year: "2024-2025",
      semester: "Spring",
      assignments: [
        {
          id: "lab01",
          title: "Introduction to NoSQL",
          released: "2024-01-15T09:00:00Z",
          deadline: "2024-01-29T23:59:59Z",
          late_deadline: "2024-02-05T23:59:59Z",
          weight: 10,
          late_penalty: 10, // 10% per day
          max_late_days: 7
        },
        {
          id: "lab02",
          title: "Data Modeling",
          released: "2024-01-29T09:00:00Z",
          deadline: "2024-02-12T23:59:59Z",
          late_deadline: "2024-02-19T23:59:59Z",
          weight: 15,
          late_penalty: 10,
          max_late_days: 7
        },
        {
          id: "lab03",
          title: "Advanced Queries",
          released: "2024-02-12T09:00:00Z",
          deadline: "2024-02-26T23:59:59Z",
          late_deadline: "2024-03-04T23:59:59Z",
          weight: 15,
          late_penalty: 10,
          max_late_days: 7
        },
        {
          id: "lab04",
          title: "Aggregation Pipeline",
          released: "2024-02-26T09:00:00Z",
          deadline: "2024-03-11T23:59:59Z",
          late_deadline: "2024-03-18T23:59:59Z",
          weight: 20,
          late_penalty: 10,
          max_late_days: 7
        },
        {
          id: "lab05",
          title: "Replication & Sharding",
          released: "2024-03-11T09:00:00Z",
          deadline: "2024-03-25T23:59:59Z",
          late_deadline: "2024-04-01T23:59:59Z",
          weight: 20,
          late_penalty: 10,
          max_late_days: 7
        },
        {
          id: "final_project",
          title: "Final Project",
          released: "2024-03-25T09:00:00Z",
          deadline: "2024-05-01T23:59:59Z",
          late_deadline: "2024-05-08T23:59:59Z",
          weight: 20,
          late_penalty: 15, // Higher penalty for final project
          max_late_days: 7
        }
      ],
      groups: [
        "group_01", "group_02", "group_06", "group_07",
        "group-09", "group_14", "group_16", "group_17",
        "group_19", "group_22", "group_23"
      ],
      notification_settings: {
        reminder_days: [7, 3, 1], // Send reminders X days before deadline
        late_notification: true,
        weekly_summary: true
      }
    };

    this.saveConfig(defaultConfig);
    return defaultConfig;
  }

  /**
   * Save configuration
   */
  saveConfig(config = this.config) {
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
  }

  /**
   * Load submission records
   */
  loadSubmissions() {
    if (fs.existsSync(this.submissionsPath)) {
      return JSON.parse(fs.readFileSync(this.submissionsPath, 'utf8'));
    }
    return {
      submissions: [],
      history: []
    };
  }

  /**
   * Save submission records
   */
  saveSubmissions() {
    fs.writeFileSync(this.submissionsPath, JSON.stringify(this.submissions, null, 2));
  }

  /**
   * Record a submission
   */
  recordSubmission(groupId, assignmentId, metadata = {}) {
    const assignment = this.config.assignments.find(a => a.id === assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    const submissionTime = new Date();
    const deadline = new Date(assignment.deadline);
    const lateDeadline = new Date(assignment.late_deadline);

    let status = 'on-time';
    let lateDays = 0;
    let penalty = 0;

    if (submissionTime > deadline) {
      if (submissionTime <= lateDeadline) {
        status = 'late';
        lateDays = Math.ceil((submissionTime - deadline) / (1000 * 60 * 60 * 24));
        penalty = Math.min(lateDays * assignment.late_penalty, 100);
      } else {
        status = 'rejected';
        penalty = 100;
      }
    }

    const submission = {
      id: crypto.randomBytes(8).toString('hex'),
      group_id: groupId,
      assignment_id: assignmentId,
      submission_time: submissionTime.toISOString(),
      status,
      late_days: lateDays,
      penalty,
      metadata,
      files: metadata.files || [],
      hash: metadata.hash || this.generateHash(groupId, assignmentId, submissionTime)
    };

    // Check for duplicate submissions
    const existingIndex = this.submissions.submissions.findIndex(
      s => s.group_id === groupId && s.assignment_id === assignmentId
    );

    if (existingIndex >= 0) {
      // Move old submission to history
      this.submissions.history.push({
        ...this.submissions.submissions[existingIndex],
        archived_at: new Date().toISOString()
      });
      // Replace with new submission
      this.submissions.submissions[existingIndex] = submission;
    } else {
      this.submissions.submissions.push(submission);
    }

    this.saveSubmissions();
    return submission;
  }

  /**
   * Generate hash for submission
   */
  generateHash(groupId, assignmentId, timestamp) {
    const hash = crypto.createHash('sha256');
    hash.update(`${groupId}-${assignmentId}-${timestamp}`);
    return hash.digest('hex').substring(0, 16);
  }

  /**
   * Get submission status for a group
   */
  getGroupStatus(groupId) {
    const status = {
      group_id: groupId,
      assignments: []
    };

    this.config.assignments.forEach(assignment => {
      const submission = this.submissions.submissions.find(
        s => s.group_id === groupId && s.assignment_id === assignment.id
      );

      const now = new Date();
      const deadline = new Date(assignment.deadline);
      const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

      status.assignments.push({
        id: assignment.id,
        title: assignment.title,
        deadline: assignment.deadline,
        days_until_deadline: daysUntilDeadline,
        submitted: !!submission,
        submission_status: submission ? submission.status : 'not-submitted',
        submission_time: submission ? submission.submission_time : null,
        late_days: submission ? submission.late_days : 0,
        penalty: submission ? submission.penalty : 0
      });
    });

    return status;
  }

  /**
   * Get all upcoming deadlines
   */
  getUpcomingDeadlines(days = 14) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return this.config.assignments
      .filter(assignment => {
        const deadline = new Date(assignment.deadline);
        return deadline > now && deadline <= futureDate;
      })
      .map(assignment => ({
        ...assignment,
        days_remaining: Math.ceil((new Date(assignment.deadline) - now) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }

  /**
   * Check for groups needing reminders
   */
  getReminders() {
    const reminders = [];
    const now = new Date();

    this.config.notification_settings.reminder_days.forEach(daysBeforeDeadline => {
      this.config.assignments.forEach(assignment => {
        const deadline = new Date(assignment.deadline);
        const reminderDate = new Date(deadline.getTime() - daysBeforeDeadline * 24 * 60 * 60 * 1000);

        // Check if we should send a reminder today
        if (now.toDateString() === reminderDate.toDateString()) {
          // Find groups that haven't submitted
          const unsubmittedGroups = this.config.groups.filter(groupId => {
            const submission = this.submissions.submissions.find(
              s => s.group_id === groupId && s.assignment_id === assignment.id
            );
            return !submission;
          });

          if (unsubmittedGroups.length > 0) {
            reminders.push({
              assignment_id: assignment.id,
              assignment_title: assignment.title,
              deadline: assignment.deadline,
              days_remaining: daysBeforeDeadline,
              groups: unsubmittedGroups
            });
          }
        }
      });
    });

    return reminders;
  }

  /**
   * Generate deadline report
   */
  generateReport() {
    const report = {
      generated: new Date().toISOString(),
      academic_year: this.config.academic_year,
      semester: this.config.semester,
      summary: {
        total_assignments: this.config.assignments.length,
        total_groups: this.config.groups.length,
        total_submissions: this.submissions.submissions.length,
        on_time_submissions: 0,
        late_submissions: 0,
        missing_submissions: 0
      },
      assignments: [],
      groups: []
    };

    // Analyze each assignment
    this.config.assignments.forEach(assignment => {
      const submissions = this.submissions.submissions.filter(
        s => s.assignment_id === assignment.id
      );

      const assignmentReport = {
        id: assignment.id,
        title: assignment.title,
        deadline: assignment.deadline,
        weight: assignment.weight,
        submitted: submissions.length,
        submission_rate: (submissions.length / this.config.groups.length * 100).toFixed(1) + '%',
        on_time: submissions.filter(s => s.status === 'on-time').length,
        late: submissions.filter(s => s.status === 'late').length,
        rejected: submissions.filter(s => s.status === 'rejected').length,
        average_late_days: 0
      };

      const lateDays = submissions.filter(s => s.late_days > 0).map(s => s.late_days);
      if (lateDays.length > 0) {
        assignmentReport.average_late_days = (
          lateDays.reduce((a, b) => a + b, 0) / lateDays.length
        ).toFixed(1);
      }

      report.assignments.push(assignmentReport);
    });

    // Analyze each group
    this.config.groups.forEach(groupId => {
      const groupSubmissions = this.submissions.submissions.filter(
        s => s.group_id === groupId
      );

      const groupReport = {
        group_id: groupId,
        total_submitted: groupSubmissions.length,
        submission_rate: (groupSubmissions.length / this.config.assignments.length * 100).toFixed(1) + '%',
        on_time: groupSubmissions.filter(s => s.status === 'on-time').length,
        late: groupSubmissions.filter(s => s.status === 'late').length,
        total_penalty: groupSubmissions.reduce((sum, s) => sum + s.penalty, 0),
        missing: this.config.assignments.length - groupSubmissions.length
      };

      report.groups.push(groupReport);
    });

    // Update summary
    report.summary.on_time_submissions = this.submissions.submissions.filter(
      s => s.status === 'on-time'
    ).length;
    report.summary.late_submissions = this.submissions.submissions.filter(
      s => s.status === 'late'
    ).length;
    report.summary.missing_submissions =
      (this.config.groups.length * this.config.assignments.length) -
      this.submissions.submissions.length;

    return report;
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport() {
    const report = this.generateReport();

    let md = `# Deadline Tracking Report

Generated: ${report.generated}
Academic Year: ${report.academic_year}
Semester: ${report.semester}

## Summary

- **Total Assignments:** ${report.summary.total_assignments}
- **Total Groups:** ${report.summary.total_groups}
- **Total Submissions:** ${report.summary.total_submissions}
- **On-Time:** ${report.summary.on_time_submissions}
- **Late:** ${report.summary.late_submissions}
- **Missing:** ${report.summary.missing_submissions}

## Upcoming Deadlines

`;

    const upcoming = this.getUpcomingDeadlines();
    if (upcoming.length > 0) {
      md += '| Assignment | Deadline | Days Remaining |\n';
      md += '|------------|----------|----------------|\n';
      upcoming.forEach(a => {
        const deadline = new Date(a.deadline);
        md += `| ${a.title} | ${deadline.toLocaleDateString()} | ${a.days_remaining} |\n`;
      });
    } else {
      md += 'No upcoming deadlines in the next 14 days.\n';
    }

    md += `\n## Assignment Status

| Assignment | Weight | Submitted | On-Time | Late | Submission Rate |
|------------|--------|-----------|---------|------|-----------------|
`;

    report.assignments.forEach(a => {
      md += `| ${a.title} | ${a.weight}% | ${a.submitted}/${report.summary.total_groups} | ${a.on_time} | ${a.late} | ${a.submission_rate} |\n`;
    });

    md += `\n## Group Performance

| Group | Submitted | On-Time | Late | Missing | Total Penalty |
|-------|-----------|---------|------|---------|---------------|
`;

    report.groups.forEach(g => {
      md += `| ${g.group_id} | ${g.total_submitted}/${report.summary.total_assignments} | ${g.on_time} | ${g.late} | ${g.missing} | ${g.total_penalty}% |\n`;
    });

    // Groups needing attention
    const strugglingGroups = report.groups.filter(g => g.missing > 2 || g.total_penalty > 30);
    if (strugglingGroups.length > 0) {
      md += `\n## ⚠️ Groups Needing Attention

The following groups have either:
- More than 2 missing submissions
- Total penalty exceeding 30%

`;
      strugglingGroups.forEach(g => {
        md += `- **${g.group_id}**: ${g.missing} missing, ${g.total_penalty}% penalty\n`;
      });
    }

    return md;
  }

  /**
   * Send notifications (mock implementation)
   */
  sendNotifications() {
    const reminders = this.getReminders();
    const notifications = [];

    reminders.forEach(reminder => {
      reminder.groups.forEach(groupId => {
        notifications.push({
          to: groupId,
          subject: `Reminder: ${reminder.assignment_title} due in ${reminder.days_remaining} days`,
          message: `Your submission for ${reminder.assignment_title} is due on ${new Date(reminder.deadline).toLocaleDateString()}. Please submit before the deadline to avoid penalties.`,
          type: 'reminder',
          priority: reminder.days_remaining <= 1 ? 'high' : 'medium'
        });
      });
    });

    // Check for late submissions
    const now = new Date();
    this.config.assignments.forEach(assignment => {
      const deadline = new Date(assignment.deadline);
      if (now > deadline) {
        const unsubmittedGroups = this.config.groups.filter(groupId => {
          const submission = this.submissions.submissions.find(
            s => s.group_id === groupId && s.assignment_id === assignment.id
          );
          return !submission;
        });

        unsubmittedGroups.forEach(groupId => {
          notifications.push({
            to: groupId,
            subject: `⚠️ Overdue: ${assignment.title}`,
            message: `Your submission for ${assignment.title} is overdue. Late submissions incur a ${assignment.late_penalty}% penalty per day.`,
            type: 'overdue',
            priority: 'urgent'
          });
        });
      }
    });

    return notifications;
  }
}

// CLI interface
function main() {
  const tracker = new DeadlineTracker();
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Deadline Tracking System

Usage:
  node deadline_tracker.js [command] [options]

Commands:
  submit <group> <assignment>  Record a submission
  status <group>               Show group status
  upcoming                     Show upcoming deadlines
  report                       Generate full report
  notify                       Check and send notifications

Examples:
  node deadline_tracker.js submit group_01 lab01
  node deadline_tracker.js status group_01
  node deadline_tracker.js upcoming
  node deadline_tracker.js report
    `);
    return;
  }

  const command = args[0];

  switch (command) {
    case 'submit': {
      if (args.length < 3) {
        console.error('Usage: submit <group> <assignment>');
        return;
      }
      const submission = tracker.recordSubmission(args[1], args[2]);
      console.log('Submission recorded:', submission);
      break;
    }

    case 'status': {
      if (args.length < 2) {
        console.error('Usage: status <group>');
        return;
      }
      const status = tracker.getGroupStatus(args[1]);
      console.log(JSON.stringify(status, null, 2));
      break;
    }

    case 'upcoming': {
      const upcoming = tracker.getUpcomingDeadlines();
      console.log('\nUpcoming Deadlines:');
      console.log('='.repeat(60));
      upcoming.forEach(a => {
        console.log(`\n${a.title}`);
        console.log(`  Deadline: ${new Date(a.deadline).toLocaleDateString()}`);
        console.log(`  Days remaining: ${a.days_remaining}`);
        console.log(`  Weight: ${a.weight}%`);
      });
      break;
    }

    case 'report': {
      const report = tracker.generateMarkdownReport();
      const reportPath = path.join('group-work', 'DEADLINE_REPORT.md');
      fs.writeFileSync(reportPath, report);
      console.log(report);
      console.log(`\nReport saved to: ${reportPath}`);
      break;
    }

    case 'notify': {
      const notifications = tracker.sendNotifications();
      console.log('\nNotifications to send:');
      console.log('='.repeat(60));
      notifications.forEach(n => {
        console.log(`\n[${n.priority.toUpperCase()}] To: ${n.to}`);
        console.log(`Subject: ${n.subject}`);
        console.log(`Message: ${n.message}`);
      });
      break;
    }

    default:
      console.error(`Unknown command: ${command}`);
  }
}

if (require.main === module) {
  main();
}

module.exports = DeadlineTracker;