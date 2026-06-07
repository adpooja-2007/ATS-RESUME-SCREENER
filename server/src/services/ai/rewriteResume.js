import { genAI } from '../../config/gemini.js';

// Static fallback mappings for demo/no-API mode
const fallbackRewrites = [
  {
    original: 'built a website.',
    rewritten: 'Developed a responsive web application using React and Node.js that improved user interaction and reduced manual effort.'
  },
  {
    original: 'worked on database.',
    rewritten: 'Designed and optimized MongoDB schemas to improve query performance and data consistency.'
  },
  {
    original: 'helped fix bugs.',
    rewritten: 'Identified and resolved 40+ critical application bugs, reducing crash rates by 15% and enhancing system reliability.'
  },
  {
    original: 'wrote some scripts.',
    rewritten: 'Automated routine data migration tasks by writing robust bash and python scripts, saving 5+ hours of manual work weekly.'
  }
];

export const rewriteBulletPoint = async (bulletPoint) => {
  const cleanBullet = bulletPoint.toLowerCase().trim().replace(/[.\s]+$/, '');
  
  if (!genAI) {
    // Find closest static match
    const match = fallbackRewrites.find(f => cleanBullet.includes(f.original) || f.original.includes(cleanBullet));
    if (match) {
      return match.rewritten;
    }
    // General procedural rewrite fallback
    return `Spearheaded execution of technical initiatives, leveraging standard architectural patterns to optimize system workflow and enhance user experience.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert resume writer. Rewrite the following weak resume bullet point into a high-impact, professional, and result-oriented bullet point.
      Use action verbs, specify technical stacks where appropriate, and introduce hypothetical metrics/outcomes (e.g., performance increases, times saved) to make it stand out.
      Do not use emojis. Return ONLY the rewritten bullet point text and nothing else.

      Weak Bullet Point:
      "${bulletPoint}"
    `;

    const response = await model.generateContent(prompt);
    return response.response.text().trim().replace(/^"/, '').replace(/"$/, '');
  } catch (error) {
    console.error('AI Bullet Rewrite failed, using fallback:', error.message);
    const match = fallbackRewrites.find(f => cleanBullet.includes(f.original) || f.original.includes(cleanBullet));
    return match ? match.rewritten : `Engineered custom workflows and solutions, improving processing efficiency by 20% and reducing support overhead.`;
  }
};
