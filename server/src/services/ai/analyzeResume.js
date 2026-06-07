import { genAI } from '../../config/gemini.js';

export const analyzeResumeFeedback = async (resumeText) => {
  if (!genAI) {
    return [
      "Improve the impact of experience statements by starting with strong action verbs.",
      "Incorporate more metrics or measurable outcomes (e.g. percentages, time saved, revenue generated) to quantify achievements.",
      "Ensure structural consistency in subheadings and date formatting across all entries."
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are a senior recruiter. Analyze the following resume text and provide 3 specific, professional, and actionable improvement recommendations.
      Do not use emojis. Focus on impact, action verbs, formatting, or section detail.
      Return the output as a clean JSON array of strings: ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
      Do not include markdown tags.
      
      Resume text:
      ${resumeText}
    `;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.response.text().trim());
  } catch (error) {
    console.error('AI Analyze Resume failed, using fallback suggestions:', error.message);
    return [
      "Ensure your skills section highlights technologies requested in the job descriptions.",
      "Optimize section spacing to fit content cleanly on a single page if under 5 years of experience.",
      "Rephrase bullet points to emphasize problem-solving capabilities."
    ];
  }
};
