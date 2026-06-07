import { genAI } from '../../config/gemini.js';

export const generateInterviewQuestions = async (resumeText, jobDescription) => {
  if (!genAI) {
    return [
      "Can you describe your experience implementing REST APIs, and how you design schemas for relational or NoSQL databases?",
      "In your projects, you worked with React. Explain the React component lifecycle or how state management is handled in complex systems.",
      "How do you handle team collaboration and version control conflicts using Git during release cycles?"
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an engineering interviewer. Based on the candidate's resume and the job description, generate 3 customized technical interview questions.
      The questions must reference the candidate's actual projects or skills (e.g., "Since your banking project uses React, how do you handle state update cycles?").
      Do not use emojis.
      Return the output as a clean JSON array of strings: ["Question 1", "Question 2", "Question 3"]
      Do not include markdown tags.

      Resume:
      ${resumeText}

      Job Description:
      ${jobDescription}
    `;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.response.text().trim());
  } catch (error) {
    console.error('AI Interview Questions failed, using fallback:', error.message);
    return [
      "What was the most challenging technical obstacle in your recent project, and how did you resolve it?",
      "How do you approach learning a new programming language or framework when starting a new project?",
      "Explain the differences between SQL and NoSQL databases, and when you would select one over the other."
    ];
  }
};
