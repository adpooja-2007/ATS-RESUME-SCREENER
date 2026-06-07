import { genAI } from '../../config/gemini.js';

export const generateJobSuggestions = async (resumeText, jobDescription, missingSkills = []) => {
  if (!genAI) {
    const list = [
      `Add experience demonstrating your capability with ${missingSkills.slice(0, 2).join(' or ') || 'the requested core backend technologies'}.`,
      "Highlight cloud deployment experience (e.g. AWS/Azure) explicitly in your project list.",
      "Mention REST API development and design patterns such as MVC in your work description."
    ];
    return list;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are a career consultant. Compare the candidate's resume with the job description and the list of missing skills.
      Generate 3 highly personalized, specific enhancement suggestions that the user can add to their resume to improve alignment.
      Ensure you reference their actual projects or experiences to make recommendations contextual (e.g., "Add Docker to your E-Commerce project description").
      Do not use emojis.
      Return the output as a clean JSON array of strings: ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
      Do not include markdown tags.

      Resume:
      ${resumeText}

      Job Description:
      ${jobDescription}

      Missing Skills:
      ${missingSkills.join(', ')}
    `;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.response.text().trim());
  } catch (error) {
    console.error('AI Suggestion generation failed, using fallback:', error.message);
    return [
      `Integrate missing tools like ${missingSkills.slice(0, 2).join(', ') || 'Docker'} in existing project details.`,
      "Mention specific backend libraries and databases used rather than general descriptors.",
      "Add a dedicated Certifications section to show continuous learning in cloud/DevOps."
    ];
  }
};
