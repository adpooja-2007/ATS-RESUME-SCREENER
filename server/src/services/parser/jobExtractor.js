import { genAI } from '../../config/gemini.js';

// Basic job description heuristic fallback parser
const extractJobHeuristics = (text) => {
  const commonSkills = [
    'java', 'python', 'javascript', 'typescript', 'c++', 'ruby', 'go', 'rust', 'swift',
    'react', 'angular', 'vue', 'next.js', 'nextjs', 'node.js', 'nodejs', 'express', 'django', 'flask',
    'spring boot', 'springboot', 'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'git', 'rest api', 'graphql', 'sql', 'microservices'
  ];

  const matchedSkills = [];
  const lowercaseText = text.toLowerCase();
  
  commonSkills.forEach(skill => {
    const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const isWordChar = /\w$/.test(skill);
    const regex = new RegExp(`\\b${escapedSkill}${isWordChar ? '\\b' : '(?!\\w)'}`, 'i');
    if (regex.test(lowercaseText)) {
      const capitalized = skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      matchedSkills.push(capitalized);
    }
  });

  // Extract experience requirements (e.g. "0-2 years", "1+ years", "3 years")
  const expRegex = /(\d+[-+]\d*\s*years?|\d+\s*\+\s*years?|\d+\s*to\s*\d+\s*years?|\d+\s*years?)/gi;
  const matches = text.match(expRegex) || [];
  const experienceRange = matches[0] || '0-2 Years';

  // Separate required vs preferred skills
  // (In heuristic mode, we place matches in required, and some common cloud/devops in preferred)
  const preferredWords = ['aws', 'kubernetes', 'docker', 'microservices', 'gcp', 'azure'];
  const required = [];
  const preferred = [];

  matchedSkills.forEach(skill => {
    if (preferredWords.includes(skill.toLowerCase())) {
      preferred.push(skill);
    } else {
      required.push(skill);
    }
  });

  return {
    requiredSkills: required.length > 0 ? required : ['Java', 'SQL'],
    preferredSkills: preferred.length > 0 ? preferred : ['Docker', 'AWS'],
    experienceRange
  };
};

/**
 * Parses a Job Description to extract requirements
 * @param {string} text - Raw Job Description text
 * @returns {Promise<object>} - Required skills, preferred skills, experience requirements
 */
export const extractJobData = async (text) => {
  if (!genAI) {
    console.warn('Gemini client not initialized. Using regex fallback for job description analysis.');
    return extractJobHeuristics(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert job description analysis engine. Analyze the following job description and extract:
      1. Required Skills (Skills crucial for the job)
      2. Preferred/Nice-to-have Skills (Bonus skills)
      3. Experience requirements (e.g. "0-2 Years", "3+ Years", etc.)
      
      Respond ONLY with a valid JSON object matching the schema below. Do not wrap in markdown or block comments. Do not include any text other than the JSON object itself.
      
      JSON Schema:
      {
        "requiredSkills": ["Skill1", "Skill2", ...],
        "preferredSkills": ["Skill1", "Skill2", ...],
        "experienceRange": "Experience Range"
      }

      Job Description:
      ${text}
    `;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const parsedJson = JSON.parse(response.response.text().trim());
    return parsedJson;
  } catch (error) {
    console.error('Gemini job extraction failed, falling back to heuristics:', error.message);
    return extractJobHeuristics(text);
  }
};
