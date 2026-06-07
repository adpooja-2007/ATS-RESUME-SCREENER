import { calculateSkillMatch } from './skillMatcher.js';
import { calculateKeywordMatch } from './keywordMatcher.js';
import { calculateExperienceMatch } from './experienceMatcher.js';
import { calculateProjectRelevance } from './projectMatcher.js';
import { analyzeGaps } from './gapAnalyzer.js';

/**
 * Programmatic check of resume quality (0-100)
 * Checks for: contact details completeness, section organization, and optimal text length
 */
const calculateResumeQuality = (resume) => {
  let score = 0;
  const data = resume.parsedData || {};

  // 1. Contact completeness (Max 30 pts)
  if (data.email) score += 10;
  if (data.phone) score += 10;
  if (data.linkedin || data.github) score += 10;

  // 2. Section organization (Max 40 pts)
  if (data.skills && data.skills.length > 0) score += 10;
  if (data.education && data.education.length > 0) score += 10;
  if (data.experience && data.experience.length > 0) score += 10;
  if (data.projects && data.projects.length > 0) score += 10;

  // 3. Text length check (Max 30 pts)
  const length = (resume.extractedText || '').length;
  if (length >= 1000 && length <= 8000) {
    score += 30; // Optimal length (roughly 1-2 pages)
  } else if (length > 0) {
    score += 15; // Slightly too short or too long
  }

  return score;
};

/**
 * Calculates complete ATS report and score
 * @param {object} resume - Resume model instance
 * @param {object} job - Job model instance
 * @returns {object} - Final report object
 */
export const calculateATSScore = (resume, job) => {
  const resumeSkills = resume.parsedData.skills || [];
  const requiredSkills = job.requiredSkills || [];
  const preferredSkills = job.preferredSkills || [];

  // 1. Skill Match (40% Weight)
  const skillMatch = calculateSkillMatch(resumeSkills, requiredSkills, preferredSkills);

  // 2. Keyword Match (30% Weight)
  const keywordMatch = calculateKeywordMatch(resume.extractedText, job.description);

  // 3. Project Relevance (15% Weight)
  const projectRelevance = calculateProjectRelevance(
    resume.parsedData.projects || [],
    requiredSkills,
    job.description
  );

  // 4. Experience Match (10% Weight)
  const experienceMatch = calculateExperienceMatch(
    resume.parsedData.experience || [],
    job.experienceRange
  );

  // 5. Resume Quality (5% Weight)
  const resumeQuality = calculateResumeQuality(resume);

  // Weighted score calculation
  const atsScore = Math.round(
    skillMatch * 0.40 +
    keywordMatch * 0.30 +
    projectRelevance * 0.15 +
    experienceMatch * 0.10 +
    resumeQuality * 0.05
  );

  // Detailed gap analysis
  const gaps = analyzeGaps(resumeSkills, requiredSkills, preferredSkills, job.description);

  return {
    atsScore,
    scoreBreakdown: {
      skillMatch,
      keywordMatch,
      projectRelevance,
      experienceMatch,
      resumeQuality
    },
    missingSkills: gaps.missingSkills,
    gapAnalysis: {
      highPriority: gaps.highPriority,
      mediumPriority: gaps.mediumPriority,
      lowPriority: gaps.lowPriority
    }
  };
};
