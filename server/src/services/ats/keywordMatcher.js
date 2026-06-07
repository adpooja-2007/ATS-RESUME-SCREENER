/**
 * Calculates keyword match score (0-100)
 * Checks for standard technical/process keywords in raw resume text
 * @param {string} resumeText - Raw resume text
 * @param {string} jobDescription - Raw job description text
 * @returns {number} - Keyword match score (0-100)
 */
export const calculateKeywordMatch = (resumeText = '', jobDescription = '') => {
  const defaultKeywords = [
    'rest api', 'git', 'docker', 'ci/cd', 'agile', 'scrum', 'kubernetes', 'aws',
    'microservices', 'graphql', 'unit testing', 'databases', 'sql', 'nosql', 'cloud', 'security'
  ];

  // Try to extract keywords from job description as well (words of interest)
  const jdLower = jobDescription.toLowerCase();
  const resumeLower = resumeText.toLowerCase();

  const additionalKeywords = [
    'design patterns', 'solid principles', 'mvc', 'testing', 'devops', 'pipelines',
    'authentication', 'authorization', 'jwt', 'restful', 'deploy', 'version control'
  ];

  const allKeywords = [...new Set([...defaultKeywords, ...additionalKeywords])];
  
  // Find keywords present in the Job Description first
  const activeKeywords = allKeywords.filter(kw => jdLower.includes(kw));

  // If JD is empty or has no standard keywords, fallback to default keywords
  const keywordsToTest = activeKeywords.length > 0 ? activeKeywords : defaultKeywords;

  let matches = 0;
  keywordsToTest.forEach(kw => {
    if (resumeLower.includes(kw)) {
      matches++;
    }
  });

  return Math.round((matches / keywordsToTest.length) * 100);
};
