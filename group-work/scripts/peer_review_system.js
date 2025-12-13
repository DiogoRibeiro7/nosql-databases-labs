#!/usr/bin/env node

/**
 * Peer Review System for Group Submissions
 *
 * This module manages the peer review process, assigns reviewers,
 * collects feedback, and calculates peer scores.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class PeerReviewSystem {
  constructor() {
    this.reviewsPath = path.join('group-work', 'peer_reviews.json');
    this.assignmentsPath = path.join('group-work', 'review_assignments.json');
    this.templatesPath = path.join('group-work', 'templates', 'peer_review_template.md');

    this.reviews = this.loadReviews();
    this.assignments = this.loadAssignments();
    this.criteria = this.getReviewCriteria();
  }

  /**
   * Load existing reviews
   */
  loadReviews() {
    if (fs.existsSync(this.reviewsPath)) {
      return JSON.parse(fs.readFileSync(this.reviewsPath, 'utf8'));
    }
    return {
      reviews: [],
      statistics: {}
    };
  }

  /**
   * Load review assignments
   */
  loadAssignments() {
    if (fs.existsSync(this.assignmentsPath)) {
      return JSON.parse(fs.readFileSync(this.assignmentsPath, 'utf8'));
    }
    return {
      assignments: [],
      rounds: []
    };
  }

  /**
   * Save reviews
   */
  saveReviews() {
    fs.writeFileSync(this.reviewsPath, JSON.stringify(this.reviews, null, 2));
  }

  /**
   * Save assignments
   */
  saveAssignments() {
    fs.writeFileSync(this.assignmentsPath, JSON.stringify(this.assignments, null, 2));
  }

  /**
   * Get review criteria
   */
  getReviewCriteria() {
    return {
      technical_quality: {
        weight: 0.3,
        description: "Code quality, correctness, and technical implementation",
        scale: {
          1: "Poor - Major issues, doesn't work",
          2: "Below Average - Works partially, significant issues",
          3: "Average - Works but has some issues",
          4: "Good - Works well with minor issues",
          5: "Excellent - Works perfectly, well-optimized"
        }
      },
      documentation: {
        weight: 0.2,
        description: "Quality and completeness of documentation",
        scale: {
          1: "Missing or very poor",
          2: "Minimal documentation",
          3: "Adequate documentation",
          4: "Good documentation",
          5: "Excellent, comprehensive documentation"
        }
      },
      problem_solving: {
        weight: 0.2,
        description: "Approach to solving the problem",
        scale: {
          1: "Poor approach, doesn't solve the problem",
          2: "Basic approach with significant gaps",
          3: "Adequate approach, solves basic requirements",
          4: "Good approach, handles most cases",
          5: "Excellent approach, innovative solutions"
        }
      },
      code_organization: {
        weight: 0.15,
        description: "Code structure and organization",
        scale: {
          1: "Very poor organization",
          2: "Poor organization",
          3: "Adequate organization",
          4: "Good organization",
          5: "Excellent organization"
        }
      },
      testing: {
        weight: 0.15,
        description: "Testing completeness and quality",
        scale: {
          1: "No tests",
          2: "Minimal testing",
          3: "Basic testing",
          4: "Good test coverage",
          5: "Comprehensive testing"
        }
      }
    };
  }

  /**
   * Assign peer reviewers using round-robin
   */
  assignReviewers(groups, reviewsPerGroup = 3) {
    const assignments = [];
    const numGroups = groups.length;

    // Ensure we have enough groups for peer review
    if (numGroups < reviewsPerGroup + 1) {
      throw new Error(`Need at least ${reviewsPerGroup + 1} groups for peer review`);
    }

    // Round-robin assignment
    groups.forEach((group, index) => {
      const reviewers = [];

      // Assign next N groups as reviewers (wrapping around)
      for (let i = 1; i <= reviewsPerGroup; i++) {
        const reviewerIndex = (index + i) % numGroups;
        reviewers.push(groups[reviewerIndex]);
      }

      assignments.push({
        group: group,
        reviewers: reviewers,
        assigned_date: new Date().toISOString(),
        status: 'pending'
      });
    });

    // Store assignments
    const round = {
      id: crypto.randomBytes(4).toString('hex'),
      created: new Date().toISOString(),
      groups: groups,
      reviews_per_group: reviewsPerGroup,
      assignments: assignments
    };

    this.assignments.rounds.push(round);
    this.assignments.assignments.push(...assignments);
    this.saveAssignments();

    return round;
  }

  /**
   * Submit a peer review
   */
  submitReview(reviewerGroup, targetGroup, assignmentId, scores, feedback) {
    // Validate scores
    const validatedScores = {};
    let totalWeightedScore = 0;

    Object.entries(this.criteria).forEach(([criterion, config]) => {
      if (!scores[criterion] || scores[criterion] < 1 || scores[criterion] > 5) {
        throw new Error(`Invalid score for ${criterion}. Must be between 1 and 5.`);
      }
      validatedScores[criterion] = scores[criterion];
      totalWeightedScore += scores[criterion] * config.weight;
    });

    const review = {
      id: crypto.randomBytes(8).toString('hex'),
      reviewer_group: reviewerGroup,
      target_group: targetGroup,
      assignment_id: assignmentId,
      timestamp: new Date().toISOString(),
      scores: validatedScores,
      weighted_score: totalWeightedScore,
      feedback: {
        strengths: feedback.strengths || [],
        weaknesses: feedback.weaknesses || [],
        suggestions: feedback.suggestions || [],
        general_comments: feedback.general_comments || ''
      },
      status: 'submitted'
    };

    // Check for duplicate review
    const existingIndex = this.reviews.reviews.findIndex(
      r => r.reviewer_group === reviewerGroup &&
           r.target_group === targetGroup &&
           r.assignment_id === assignmentId
    );

    if (existingIndex >= 0) {
      // Update existing review
      this.reviews.reviews[existingIndex] = review;
    } else {
      this.reviews.reviews.push(review);
    }

    this.saveReviews();
    this.updateStatistics();

    return review;
  }

  /**
   * Get reviews for a specific group
   */
  getGroupReviews(groupId, assignmentId = null) {
    let reviews = this.reviews.reviews.filter(r => r.target_group === groupId);

    if (assignmentId) {
      reviews = reviews.filter(r => r.assignment_id === assignmentId);
    }

    // Calculate aggregate scores
    if (reviews.length > 0) {
      const aggregateScores = {};
      const criteriaScores = {};

      Object.keys(this.criteria).forEach(criterion => {
        criteriaScores[criterion] = [];
      });

      reviews.forEach(review => {
        Object.entries(review.scores).forEach(([criterion, score]) => {
          criteriaScores[criterion].push(score);
        });
      });

      Object.entries(criteriaScores).forEach(([criterion, scores]) => {
        if (scores.length > 0) {
          aggregateScores[criterion] = {
            average: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2),
            min: Math.min(...scores),
            max: Math.max(...scores),
            count: scores.length
          };
        }
      });

      return {
        group_id: groupId,
        assignment_id: assignmentId,
        review_count: reviews.length,
        reviews: reviews,
        aggregate_scores: aggregateScores,
        overall_score: this.calculateOverallScore(aggregateScores)
      };
    }

    return {
      group_id: groupId,
      assignment_id: assignmentId,
      review_count: 0,
      reviews: [],
      aggregate_scores: {},
      overall_score: 0
    };
  }

  /**
   * Calculate overall score from aggregate scores
   */
  calculateOverallScore(aggregateScores) {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    Object.entries(aggregateScores).forEach(([criterion, scores]) => {
      const weight = this.criteria[criterion].weight;
      totalWeightedScore += parseFloat(scores.average) * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(2) : 0;
  }

  /**
   * Generate peer review form
   */
  generateReviewForm(reviewerGroup, targetGroup, assignmentId) {
    const form = `# Peer Review Form

## Review Information
- **Reviewer Group:** ${reviewerGroup}
- **Target Group:** ${targetGroup}
- **Assignment:** ${assignmentId}
- **Date:** ${new Date().toLocaleDateString()}

## Evaluation Criteria

Please rate each criterion on a scale of 1-5:

${Object.entries(this.criteria).map(([criterion, config]) => `
### ${criterion.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (Weight: ${config.weight * 100}%)
*${config.description}*

Rating: [ ] 1  [ ] 2  [ ] 3  [ ] 4  [ ] 5

**Scale:**
${Object.entries(config.scale).map(([score, desc]) => `- ${score}: ${desc}`).join('\n')}

**Comments:**
_________________________________
_________________________________
`).join('\n')}

## Qualitative Feedback

### Strengths
List 3-5 key strengths of the submission:
1.
2.
3.
4.
5.

### Areas for Improvement
List 3-5 areas that need improvement:
1.
2.
3.
4.
5.

### Suggestions
Provide specific suggestions for improvement:
1.
2.
3.

### General Comments
_________________________________
_________________________________
_________________________________

## Summary

**Overall Impression:** [ ] Poor  [ ] Below Average  [ ] Average  [ ] Good  [ ] Excellent

**Would you recommend this solution?** [ ] Yes  [ ] No  [ ] With improvements

## Reviewer Declaration

I/We have reviewed this submission fairly and provided constructive feedback.

**Reviewer Signatures:**
- Member 1: ________________
- Member 2: ________________
- Member 3: ________________
- Member 4: ________________

---
*Submitted on: ${new Date().toISOString()}*
`;

    // Save form
    const formPath = path.join('group-work', 'reviews', `review_${reviewerGroup}_to_${targetGroup}_${assignmentId}.md`);

    // Ensure directory exists
    const reviewsDir = path.join('group-work', 'reviews');
    if (!fs.existsSync(reviewsDir)) {
      fs.mkdirSync(reviewsDir, { recursive: true });
    }

    fs.writeFileSync(formPath, form);
    return formPath;
  }

  /**
   * Update review statistics
   */
  updateStatistics() {
    const stats = {
      total_reviews: this.reviews.reviews.length,
      by_assignment: {},
      by_group: {},
      reviewer_activity: {},
      quality_distribution: {
        excellent: 0,
        good: 0,
        average: 0,
        below_average: 0,
        poor: 0
      }
    };

    this.reviews.reviews.forEach(review => {
      // By assignment
      if (!stats.by_assignment[review.assignment_id]) {
        stats.by_assignment[review.assignment_id] = 0;
      }
      stats.by_assignment[review.assignment_id]++;

      // By group (as target)
      if (!stats.by_group[review.target_group]) {
        stats.by_group[review.target_group] = {
          received: 0,
          average_score: 0,
          scores: []
        };
      }
      stats.by_group[review.target_group].received++;
      stats.by_group[review.target_group].scores.push(review.weighted_score);

      // Reviewer activity
      if (!stats.reviewer_activity[review.reviewer_group]) {
        stats.reviewer_activity[review.reviewer_group] = 0;
      }
      stats.reviewer_activity[review.reviewer_group]++;

      // Quality distribution
      const score = review.weighted_score;
      if (score >= 4.5) stats.quality_distribution.excellent++;
      else if (score >= 3.5) stats.quality_distribution.good++;
      else if (score >= 2.5) stats.quality_distribution.average++;
      else if (score >= 1.5) stats.quality_distribution.below_average++;
      else stats.quality_distribution.poor++;
    });

    // Calculate average scores
    Object.entries(stats.by_group).forEach(([group, data]) => {
      if (data.scores.length > 0) {
        data.average_score = (
          data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        ).toFixed(2);
      }
    });

    this.reviews.statistics = stats;
    this.saveReviews();
  }

  /**
   * Generate peer review report
   */
  generateReport() {
    this.updateStatistics();
    const stats = this.reviews.statistics;

    let report = `# Peer Review Report

Generated: ${new Date().toISOString()}

## Overview

- **Total Reviews:** ${stats.total_reviews}
- **Active Groups:** ${Object.keys(stats.by_group).length}
- **Active Reviewers:** ${Object.keys(stats.reviewer_activity).length}

## Quality Distribution

| Rating | Count | Percentage |
|--------|-------|------------|
| Excellent (4.5-5.0) | ${stats.quality_distribution.excellent} | ${(stats.quality_distribution.excellent / stats.total_reviews * 100).toFixed(1)}% |
| Good (3.5-4.4) | ${stats.quality_distribution.good} | ${(stats.quality_distribution.good / stats.total_reviews * 100).toFixed(1)}% |
| Average (2.5-3.4) | ${stats.quality_distribution.average} | ${(stats.quality_distribution.average / stats.total_reviews * 100).toFixed(1)}% |
| Below Average (1.5-2.4) | ${stats.quality_distribution.below_average} | ${(stats.quality_distribution.below_average / stats.total_reviews * 100).toFixed(1)}% |
| Poor (1.0-1.4) | ${stats.quality_distribution.poor} | ${(stats.quality_distribution.poor / stats.total_reviews * 100).toFixed(1)}% |

## Group Scores

| Group | Reviews Received | Average Score | Status |
|-------|-----------------|---------------|--------|
`;

    Object.entries(stats.by_group)
      .sort((a, b) => parseFloat(b[1].average_score) - parseFloat(a[1].average_score))
      .forEach(([group, data]) => {
        const score = parseFloat(data.average_score);
        const status = score >= 3.5 ? '✅ Good' : score >= 2.5 ? '⚠️ Needs Improvement' : '❌ Poor';
        report += `| ${group} | ${data.received} | ${data.average_score} | ${status} |\n`;
      });

    report += `\n## Reviewer Activity

| Reviewer Group | Reviews Submitted |
|----------------|-------------------|
`;

    Object.entries(stats.reviewer_activity)
      .sort((a, b) => b[1] - a[1])
      .forEach(([group, count]) => {
        report += `| ${group} | ${count} |\n`;
      });

    // Detailed reviews section
    report += `\n## Detailed Reviews

`;

    // Group by target group
    const groupedReviews = {};
    this.reviews.reviews.forEach(review => {
      if (!groupedReviews[review.target_group]) {
        groupedReviews[review.target_group] = [];
      }
      groupedReviews[review.target_group].push(review);
    });

    Object.entries(groupedReviews).forEach(([group, reviews]) => {
      report += `\n### ${group}\n\n`;

      reviews.forEach(review => {
        report += `**Review from ${review.reviewer_group}**\n`;
        report += `- Weighted Score: ${review.weighted_score.toFixed(2)}\n`;
        report += `- Scores: ${Object.entries(review.scores).map(([c, s]) => `${c}: ${s}`).join(', ')}\n`;

        if (review.feedback.strengths && review.feedback.strengths.length > 0) {
          report += `- Strengths: ${review.feedback.strengths.join('; ')}\n`;
        }
        if (review.feedback.weaknesses && review.feedback.weaknesses.length > 0) {
          report += `- Weaknesses: ${review.feedback.weaknesses.join('; ')}\n`;
        }

        report += '\n';
      });
    });

    return report;
  }

  /**
   * Calculate final peer scores
   */
  calculateFinalScores() {
    const finalScores = {};

    // Get all unique groups
    const groups = new Set();
    this.reviews.reviews.forEach(review => {
      groups.add(review.target_group);
    });

    groups.forEach(group => {
      const groupReviews = this.getGroupReviews(group);

      if (groupReviews.review_count > 0) {
        // Calculate weighted average, potentially dropping outliers
        const scores = groupReviews.reviews.map(r => r.weighted_score);

        // Remove outliers if we have enough reviews
        let finalScore;
        if (scores.length >= 3) {
          // Remove highest and lowest
          scores.sort((a, b) => a - b);
          const trimmedScores = scores.slice(1, -1);
          finalScore = trimmedScores.reduce((a, b) => a + b, 0) / trimmedScores.length;
        } else {
          finalScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        }

        finalScores[group] = {
          peer_score: finalScore.toFixed(2),
          review_count: groupReviews.review_count,
          confidence: this.calculateConfidence(groupReviews.reviews)
        };
      } else {
        finalScores[group] = {
          peer_score: 0,
          review_count: 0,
          confidence: 'none'
        };
      }
    });

    return finalScores;
  }

  /**
   * Calculate confidence in peer scores
   */
  calculateConfidence(reviews) {
    if (reviews.length === 0) return 'none';
    if (reviews.length === 1) return 'low';

    // Calculate standard deviation
    const scores = reviews.map(r => r.weighted_score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Confidence based on number of reviews and consistency
    if (reviews.length >= 3 && stdDev < 0.5) return 'high';
    if (reviews.length >= 2 && stdDev < 1.0) return 'medium';
    return 'low';
  }
}

// CLI interface
function main() {
  const peerReview = new PeerReviewSystem();
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log(`
Peer Review System

Usage:
  node peer_review_system.js [command] [options]

Commands:
  assign <groups...>           Assign peer reviewers
  submit <reviewer> <target>   Submit a review
  status <group>               Get review status for a group
  report                       Generate peer review report
  scores                       Calculate final peer scores

Examples:
  node peer_review_system.js assign group_01 group_02 group_03
  node peer_review_system.js submit group_01 group_02 lab01 --scores technical:4 documentation:3
  node peer_review_system.js status group_01
  node peer_review_system.js report
    `);
    return;
  }

  const command = args[0];

  switch (command) {
    case 'assign': {
      const groups = args.slice(1);
      if (groups.length < 4) {
        console.error('Need at least 4 groups for peer review');
        return;
      }
      const round = peerReview.assignReviewers(groups);
      console.log('Review assignments created:', round);
      break;
    }

    case 'status': {
      if (args.length < 2) {
        console.error('Usage: status <group>');
        return;
      }
      const status = peerReview.getGroupReviews(args[1]);
      console.log(JSON.stringify(status, null, 2));
      break;
    }

    case 'report': {
      const report = peerReview.generateReport();
      const reportPath = path.join('group-work', 'PEER_REVIEW_REPORT.md');
      fs.writeFileSync(reportPath, report);
      console.log(report);
      console.log(`\nReport saved to: ${reportPath}`);
      break;
    }

    case 'scores': {
      const scores = peerReview.calculateFinalScores();
      console.log('\nFinal Peer Scores:');
      console.log('='.repeat(60));
      Object.entries(scores)
        .sort((a, b) => parseFloat(b[1].peer_score) - parseFloat(a[1].peer_score))
        .forEach(([group, data]) => {
          console.log(`${group}: ${data.peer_score} (${data.review_count} reviews, ${data.confidence} confidence)`);
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

module.exports = PeerReviewSystem;