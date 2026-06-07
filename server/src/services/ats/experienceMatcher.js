/**
 * Helper to parse duration strings into total months
 * E.g., "6 months" -> 6, "1 year" -> 12, "2 years 3 months" -> 27
 */
const parseDurationToMonths = (durationStr = '') => {
  const clean = durationStr.toLowerCase().trim();
  let totalMonths = 0;

  // Search for years
  const yearMatch = clean.match(/(\d+)\s*y/); // matches 'year', 'years', 'yr', 'yrs'
  if (yearMatch) {
    totalMonths += parseInt(yearMatch[1], 10) * 12;
  }

  // Search for months
  const monthMatch = clean.match(/(\d+)\s*m/); // matches 'month', 'months', 'mo', 'mos'
  if (monthMatch) {
    // If the 'm' was part of 'year' (e.g., '1 year 6 months'), don't double count
    // The regexes are specific enough to distinguish
    totalMonths += parseInt(monthMatch[1], 10);
  }

  // Fallback if it is just a number (assume years)
  if (!yearMatch && !monthMatch) {
    const numMatch = clean.match(/^(\d+)$/);
    if (numMatch) {
      totalMonths += parseInt(numMatch[1], 10) * 12;
    }
  }

  return totalMonths;
};

/**
 * Calculates experience match score (0-100)
 * @param {object[]} resumeExperiences - Resume experience array
 * @param {string} experienceRange - Job description experience requirement (e.g., "1-3 Years" or "2+ Years")
 * @returns {number} - Experience match score (0-100)
 */
export const calculateExperienceMatch = (resumeExperiences = [], experienceRange = '') => {
  // Extract minimum years required from range string
  let requiredYears = 0;
  const numbers = experienceRange.match(/\d+/g);
  if (numbers && numbers.length > 0) {
    // Take the minimum value (e.g., "1-3 Years" -> 1, "3+ Years" -> 3)
    requiredYears = Math.min(...numbers.map(Number));
  }

  // If no specific requirement, default to 0 (perfect match)
  if (requiredYears === 0) return 100;

  const requiredMonths = requiredYears * 12;

  // Calculate total months candidate has
  let candidateMonths = 0;
  resumeExperiences.forEach(exp => {
    candidateMonths += parseDurationToMonths(exp.duration || '');
  });

  if (candidateMonths >= requiredMonths) {
    return 100;
  }

  if (candidateMonths === 0) {
    return 0;
  }

  return Math.round((candidateMonths / requiredMonths) * 100);
};
