/**
 * Analyzes skill gaps and categorizes missing skills by priority
 * @param {string[]} resumeSkills - Candidate's skills
 * @param {string[]} requiredSkills - Required job skills
 * @param {string[]} preferredSkills - Preferred job skills
 * @param {string} jobDescription - Raw job description text for frequency check
 * @returns {object} - Categorized gaps { highPriority, mediumPriority, lowPriority, missingSkills }
 */
export const analyzeGaps = (resumeSkills = [], requiredSkills = [], preferredSkills = [], jobDescription = '') => {
  const candidateLower = resumeSkills.map(s => s.toLowerCase().trim());
  const jdLower = jobDescription.toLowerCase();

  const missingSkills = [];
  const highPriority = [];
  const mediumPriority = [];
  const lowPriority = [];

  // Check required skills
  requiredSkills.forEach(skill => {
    const skillClean = skill.trim();
    const skillLower = skillClean.toLowerCase();
    
    // If not matched in candidate resume
    if (!candidateLower.some(c => c === skillLower || c.includes(skillLower) || skillLower.includes(c))) {
      missingSkills.push(skillClean);

      // Count occurrences in job description to prioritize
      const escapedSkill = skillLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const occurrences = (jdLower.match(new RegExp(`\\b${escapedSkill}\\b`, 'g')) || []).length;

      if (occurrences >= 3) {
        highPriority.push(skillClean);
      } else {
        mediumPriority.push(skillClean);
      }
    }
  });

  // Check preferred skills
  preferredSkills.forEach(skill => {
    const skillClean = skill.trim();
    const skillLower = skillClean.toLowerCase();

    if (!candidateLower.some(c => c === skillLower || c.includes(skillLower) || skillLower.includes(c))) {
      if (!missingSkills.includes(skillClean)) {
        missingSkills.push(skillClean);
      }
      
      // Preferred missing skills are medium/low priority
      const escapedSkill = skillLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const occurrences = (jdLower.match(new RegExp(`\\b${escapedSkill}\\b`, 'g')) || []).length;

      if (occurrences >= 2) {
        mediumPriority.push(skillClean);
      } else {
        lowPriority.push(skillClean);
      }
    }
  });

  return {
    missingSkills,
    highPriority,
    mediumPriority,
    lowPriority
  };
};
