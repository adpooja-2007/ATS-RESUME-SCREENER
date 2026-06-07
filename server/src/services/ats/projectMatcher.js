/**
 * Calculates project relevance score (0-100)
 * @param {object[]} resumeProjects - Candidate projects
 * @param {string[]} requiredSkills - Required job skills
 * @param {string} jobDescription - Full job description text
 * @returns {number} - Project match score (0-100)
 */
export const calculateProjectRelevance = (resumeProjects = [], requiredSkills = [], jobDescription = '') => {
  if (resumeProjects.length === 0) return 0;
  if (requiredSkills.length === 0) return 100;

  const jdLower = jobDescription.toLowerCase();
  const reqLower = requiredSkills.map(s => s.toLowerCase());

  let totalRelevance = 0;

  resumeProjects.forEach(proj => {
    let projScore = 0;
    const title = (proj.title || '').toLowerCase();
    const desc = (proj.description || '').toLowerCase();
    const techs = (proj.technologies || []).map(t => t.toLowerCase());

    // 1. Check if project technologies overlap with job requirements (Up to 50 pts)
    let techMatches = 0;
    techs.forEach(t => {
      if (reqLower.includes(t)) {
        techMatches++;
      }
    });
    const techScore = techs.length > 0 ? (techMatches / Math.min(techs.length, reqLower.length)) * 50 : 0;
    projScore += Math.min(50, techScore);

    // 2. Check if title/description contains job required skills (Up to 30 pts)
    let keywordMatches = 0;
    reqLower.forEach(req => {
      if (title.includes(req) || desc.includes(req)) {
        keywordMatches++;
      }
    });
    const kwScore = (keywordMatches / reqLower.length) * 30;
    projScore += Math.min(30, kwScore);

    // 3. General domain similarity check (Up to 20 pts)
    // E.g., if job is "Backend" and project contains "API", "database", "server", "backend"
    const backendKeywords = ['api', 'database', 'server', 'backend', 'rest', 'crud', 'sql', 'nosql', 'microservices'];
    const frontendKeywords = ['frontend', 'ui', 'ux', 'react', 'css', 'design', 'responsive', 'dashboard', 'components'];

    const isBackendJob = jdLower.includes('backend') || jdLower.includes('server') || jdLower.includes('api');
    const isFrontendJob = jdLower.includes('frontend') || jdLower.includes('ui') || jdLower.includes('ux') || jdLower.includes('react');

    let domainMatches = 0;
    const textToCheck = `${title} ${desc}`;

    if (isBackendJob) {
      backendKeywords.forEach(kw => {
        if (textToCheck.includes(kw)) domainMatches++;
      });
    }
    if (isFrontendJob) {
      frontendKeywords.forEach(kw => {
        if (textToCheck.includes(kw)) domainMatches++;
      });
    }
    
    const domainScore = domainMatches > 0 ? Math.min(20, domainMatches * 5) : 0;
    projScore += domainScore;

    totalRelevance += Math.min(100, projScore);
  });

  return Math.round(totalRelevance / resumeProjects.length);
};
