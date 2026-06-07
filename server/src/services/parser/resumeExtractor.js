import { genAI } from '../../config/gemini.js';

// Heuristic fallback parser
const extractHeuristics = (text) => {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const linkedinRegex = /(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/gi;
  const githubRegex = /(github\.com\/[a-zA-Z0-9_-]+)/gi;

  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  const linkedin = text.match(linkedinRegex) || [];
  const github = text.match(githubRegex) || [];

  // Common technical skills to scan for demo fallback
  const commonSkills = [
    'java', 'python', 'javascript', 'typescript', 'c++', 'ruby', 'go', 'rust', 'swift',
    'react', 'angular', 'vue', 'nextjs', 'nodejs', 'express', 'django', 'flask', 'spring boot',
    'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'git', 'rest api', 'graphql'
  ];

  const matchedSkills = [];
  const lowercaseText = text.toLowerCase();

  commonSkills.forEach(skill => {
    const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const isWordChar = /\w$/.test(skill);
    const regex = new RegExp(`\\b${escapedSkill}${isWordChar ? '\\b' : '(?!\\w)'}`, 'i');
    if (regex.test(lowercaseText)) {
      // capitalize nicely
      const capitalized = skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      matchedSkills.push(capitalized);
    }
  });

  // Basic section line splitting
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const name = lines[0] ? lines[0].substring(0, 50) : 'Applicant';

  return {
    name,
    email: emails[0] || '',
    phone: phones[0] || '',
    linkedin: linkedin[0] ? `https://${linkedin[0]}` : '',
    github: github[0] ? `https://${github[0]}` : '',
    skills: matchedSkills.length > 0 ? matchedSkills : ['Java', 'SQL'], // fallback default
    education: [
      {
        degree: 'Bachelor of Technology in Computer Science',
        institution: 'University',
        year: '2025'
      }
    ],
    experience: [
      {
        role: 'Software Intern',
        company: 'Tech Solutions',
        duration: '6 Months',
        description: 'Worked on software development and database optimization.'
      }
    ],
    projects: [
      {
        title: 'E-Commerce Website',
        description: 'Built a shopping application with react and node.',
        technologies: ['React', 'Node.js']
      }
    ]
  };
};

/**
 * Extracts structured details from resume text
 * @param {string} text - Raw resume text
 * @returns {Promise<object>} - Parsed Resume object
 */
export const extractResumeData = async (text) => {
  if (!genAI) {
    console.warn('Gemini client not initialized. Using regex fallback parsing.');
    return extractHeuristics(text);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert resume parsing engine. Analyze the following raw resume text and extract the structured details.
      Respond ONLY with a valid JSON object matching the schema below. Do not wrap in markdown or block comments. Do not include any text other than the JSON object itself.
      
      JSON Schema:
      {
        "name": "Full Name",
        "email": "Email Address",
        "phone": "Phone Number",
        "linkedin": "LinkedIn profile URL",
        "github": "GitHub profile URL",
        "skills": ["Skill1", "Skill2", ...],
        "education": [
          {
            "degree": "Degree and major",
            "institution": "University/School Name",
            "year": "Graduation Year"
          }
        ],
        "experience": [
          {
            "role": "Job Title",
            "company": "Company Name",
            "duration": "Duration (e.g. June 2023 - Present or 6 months)",
            "description": "Short explanation of duties and accomplishments"
          }
        ],
        "projects": [
          {
            "title": "Project Title",
            "description": "Short description of what was built",
            "technologies": ["Tech1", "Tech2", ...]
          }
        ]
      }

      Raw Resume Text:
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
    console.error('Gemini extraction failed, falling back to heuristics:', error.message);
    return extractHeuristics(text);
  }
};
