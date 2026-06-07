/**
 * Calculates skill match score (0-100)
 * @param {string[]} resumeSkills - Candidate skills
 * @param {string[]} requiredSkills - Required job skills
 * @param {string[]} preferredSkills - Preferred job skills
 * @returns {number} - Skill match score (0-100)
 */
export const calculateSkillMatch = (resumeSkills = [], requiredSkills = [], preferredSkills = []) => {
  if (requiredSkills.length === 0) return 100;

  const candidateLower = resumeSkills.map(s => s.toLowerCase().trim());
  const reqLower = requiredSkills.map(s => s.toLowerCase().trim());
  const prefLower = preferredSkills.map(s => s.toLowerCase().trim());

  let matchedReq = 0;
  reqLower.forEach(skill => {
    // Check direct matching or if the skill is included as a substring
    if (candidateLower.some(c => c === skill || c.includes(skill) || skill.includes(c))) {
      matchedReq++;
    }
  });

  let matchedPref = 0;
  prefLower.forEach(skill => {
    if (candidateLower.some(c => c === skill || c.includes(skill) || skill.includes(c))) {
      matchedPref++;
    }
  });

  // Required skills weight: 80%, Preferred skills weight: 20%
  const reqScore = (matchedReq / requiredSkills.length) * 80;
  const prefScore = preferredSkills.length > 0 ? (matchedPref / preferredSkills.length) * 20 : 20;

  return Math.round(reqScore + prefScore);
};
