import { genAI } from '../../config/gemini.js';

export const generateCareerAdvice = async (missingSkills = []) => {
  const defaultPath = missingSkills.length > 0 ? missingSkills : ['Spring Boot', 'Docker', 'AWS'];
  const defaultProjects = [
    {
      title: `${defaultPath[0] || 'Spring Boot'} E-Commerce API`,
      description: `Build a highly scalable backend microservice implementing REST endpoints, JWT authorization, and integrating database caching.`
    },
    {
      title: `Dockerized Task Manager`,
      description: `Develop a task scheduling application, containerize it using multi-stage Docker builds, and configure local service orchestration.`
    }
  ];

  if (!genAI) {
    return {
      learningPath: defaultPath,
      recommendedProjects: defaultProjects
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an experienced career coach. Given the candidate's missing skills, suggest:
      1. A recommended learning path (a sequence of skills/technologies they should study next, formatted as strings).
      2. Exactly 2 custom project recommendations that incorporate these missing skills, providing a title and detailed description for each.
      
      Do not use emojis.
      Return the output as a valid JSON object matching the schema:
      {
        "learningPath": ["Skill 1", "Skill 2", "Skill 3"],
        "recommendedProjects": [
          { "title": "Project Title 1", "description": "Project Description 1" },
          { "title": "Project Title 2", "description": "Project Description 2" }
        ]
      }
      Do not include markdown tags.

      Missing Skills:
      ${missingSkills.join(', ')}
    `;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.response.text().trim());
  } catch (error) {
    console.error('AI Career Advice failed, using fallback:', error.message);
    return {
      learningPath: defaultPath,
      recommendedProjects: defaultProjects
    };
  }
};
