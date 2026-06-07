import { genAI } from '../../config/gemini.js';

// Local procedural heuristic fallback for demo/no-API mode
const calculateLocalScreening = (resume) => {
  const data = resume.parsedData || {};
  const text = (resume.extractedText || '').toLowerCase();

  // Heuristic categories
  let formattingScore = 85;
  let skillsScore = 70;
  let projectsScore = 60;
  let experienceScore = 65;
  let achievementsScore = 55;
  let educationScore = 90;

  const strengths = [];
  const weaknesses = [];
  const suggestions = [];
  const risks = [];

  // Evaluate Contact Info
  const hasLinkedin = !!data.linkedin;
  const hasGithub = !!data.github;

  if (hasLinkedin && hasGithub) {
    strengths.push('Excellent professional and code platform social linkage (LinkedIn & GitHub).');
  } else {
    if (!hasGithub) {
      weaknesses.push('Missing direct GitHub profile linkage.');
      suggestions.push({ text: 'Add a link to your GitHub profile to highlight codebase contributions.', priority: 'Medium' });
      risks.push({ title: 'Missing Code Repositories Link', severity: 'Low' });
    }
    if (!hasLinkedin) {
      weaknesses.push('Missing LinkedIn professional profile.');
      suggestions.push({ text: 'Include your LinkedIn profile link to ease background checks.', priority: 'Low' });
    }
  }

  // Evaluate Skills
  if (data.skills && data.skills.length > 0) {
    skillsScore = Math.min(100, 50 + (data.skills.length * 4));
    strengths.push('Structured skills section highlighting core tech stacks.');
    if (data.skills.length < 6) {
      weaknesses.push('Limited tech stack list.');
      suggestions.push({ text: 'Expand skills list with secondary tools and concepts (e.g. testing, cloud).', priority: 'Medium' });
    }
  } else {
    skillsScore = 30;
    weaknesses.push('Empty technical skills section.');
    suggestions.push({ text: 'Define a dedicated technical skills section listing core libraries.', priority: 'High' });
  }

  // Evaluate Projects
  if (data.projects && data.projects.length > 0) {
    projectsScore = Math.min(100, 60 + (data.projects.length * 10));
    strengths.push('Detailed project list highlighting personal technical builds.');
    
    // Check project descriptions
    const shortDesc = data.projects.some(p => (p.description || '').split(' ').length < 10);
    if (shortDesc) {
      weaknesses.push('Vague project descriptions.');
      suggestions.push({ text: 'Expand project descriptions to explain what was built, what tools were used, and the final results.', priority: 'Medium' });
    }
  } else {
    projectsScore = 20;
    weaknesses.push('No project list detected.');
    suggestions.push({ text: 'Include at least 2 relevant software projects containing technical descriptions.', priority: 'High' });
  }

  // Evaluate Experience & Achievements
  if (data.experience && data.experience.length > 0) {
    experienceScore = Math.min(100, 60 + (data.experience.length * 10));
    strengths.push('Chronological work history records present.');
    
    // Check for metrics in experiences (quantifiable achievements)
    const hasMetrics = /\d+%\b|\d+\s*hours?\b|\d+\s*users?\b|\$\d+/i.test(text);
    if (hasMetrics) {
      achievementsScore = 85;
      strengths.push('achievement statements contain quantifiable metrics.');
    } else {
      achievementsScore = 50;
      weaknesses.push('Lack of quantifiable achievements in experience bullet points.');
      suggestions.push({ text: 'Add measurable metrics (e.g., improved load speed by 20%, resolved 30+ bugs) to quantify achievements.', priority: 'High' });
    }
  } else {
    experienceScore = 40;
    achievementsScore = 30;
    weaknesses.push('No professional industry work experience listed.');
    suggestions.push({ text: 'Highlight academic lab experiences, freelance gigs, or open-source contributions as experiences.', priority: 'High' });
  }

  // Evaluate Education
  if (data.education && data.education.length > 0) {
    educationScore = 95;
    strengths.push('Clear educational degree and institution records.');
  } else {
    educationScore = 30;
    weaknesses.push('Missing education details.');
    suggestions.push({ text: 'Provide your college degree details, major, and graduation year.', priority: 'Medium' });
  }

  // ATS formatting risks checks (simulated checks in text)
  if (text.includes('table') || text.includes('column')) {
    risks.push({ title: 'Multi-column or Table layout detected', severity: 'High' });
    formattingScore -= 15;
  }
  
  const lineCount = resume.extractedText.split('\n').length;
  if (lineCount > 180) {
    risks.push({ title: 'Excessive document length (might clip pages)', severity: 'Medium' });
    formattingScore -= 10;
  }

  if (risks.length === 0) {
    strengths.push('ATS-friendly clean, single-column document layout.');
  }

  // Overall calculations
  const qualityScore = Math.round(
    (formattingScore * 0.15) +
    (skillsScore * 0.20) +
    (projectsScore * 0.20) +
    (experienceScore * 0.20) +
    (achievementsScore * 0.15) +
    (educationScore * 0.10)
  );

  const activeRisksCount = risks.length;
  const atsReadinessScore = Math.round(Math.max(30, 95 - (activeRisksCount * 12) - (100 - formattingScore) * 0.3));

  return {
    qualityScore,
    atsReadinessScore,
    healthBreakdown: {
      formatting: formattingScore,
      skills: skillsScore,
      projects: projectsScore,
      experience: experienceScore,
      achievements: achievementsScore,
      education: educationScore
    },
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    improvementSuggestions: suggestions.slice(0, 3),
    atsRisks: risks.length > 0 ? risks : [{ title: 'Standard Formatting Verification', severity: 'Low' }],
    improvementForecast: {
      currentQuality: qualityScore,
      expectedQuality: Math.min(98, qualityScore + 10),
      currentAtsReadiness: atsReadinessScore,
      expectedAtsReadiness: Math.min(99, atsReadinessScore + 12)
    }
  };
};

/**
 * Screens resume independently using Gemini AI or fallbacks
 * @param {object} resume - Resume model document
 * @returns {Promise<object>} - Structured independent evaluation
 */
export const calculateIndependentScreening = async (resume) => {
  if (!genAI) {
    console.warn('Gemini client not initialized. Using procedural local screening heuristics.');
    return calculateLocalScreening(resume);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an expert resume screening auditor. Analyze the following candidate resume text and perform a complete quality and ATS compatibility assessment.
      
      Respond ONLY with a valid JSON object matching the schema below. Do not wrap in markdown or block comments. Do not include any text other than the JSON object itself.
      
      JSON Schema:
      {
        "qualityScore": 85, // 0-100 overall resume quality rating
        "atsReadinessScore": 78, // 0-100 score indicating parseability and compatibility with standard ATS
        "healthBreakdown": {
          "formatting": 90, // rating for styling simplicity and layout
          "skills": 85, // rating for listing completeness and categorizations
          "projects": 80, // rating for technologies and details
          "experience": 75, // rating for description depth
          "achievements": 65, // rating for metric-driven statements
          "education": 95 // rating for degree listings
        },
        "strengths": [
          "Strength descriptor 1 (max 10 words)",
          "Strength descriptor 2 (max 10 words)",
          "Strength descriptor 3 (max 10 words)"
        ],
        "weaknesses": [
          "Weakness descriptor 1 (max 10 words)",
          "Weakness descriptor 2 (max 10 words)",
          "Weakness descriptor 3 (max 10 words)"
        ],
        "improvementSuggestions": [
          { "text": "Specific, actionable suggestion text.", "priority": "High" }, // priority is High, Medium, or Low
          { "text": "Specific, actionable suggestion text.", "priority": "Medium" },
          { "text": "Specific, actionable suggestion text.", "priority": "Low" }
        ],
        "atsRisks": [
          { "title": "Risk description (e.g. Tables Detected or Missing headings)", "priority": "High" }, // priority is High, Medium, or Low (maps to severity)
          { "title": "Risk description", "priority": "Medium" }
        ],
        "improvementForecast": {
          "currentQuality": 85, // same as qualityScore
          "expectedQuality": 95, // expected score if suggestions are applied
          "currentAtsReadiness": 78, // same as atsReadinessScore
          "expectedAtsReadiness": 90 // expected readiness if suggestions are applied
        }
      }

      Notes:
      - Assess strictly.
      - Look for layout risks like multiple columns, tables, headers, boxes.
      - Look for achievements lacking percentage improvements or scale indicators.

      Resume Text:
      ${resume.extractedText}
    `;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const parsedJson = JSON.parse(response.response.text().trim());

    // Map Gemini field 'priority' to model field 'severity' in risks to comply with Schema
    const formattedRisks = (parsedJson.atsRisks || []).map(r => ({
      title: r.title,
      severity: r.priority || r.severity || 'Low'
    }));

    return {
      qualityScore: parsedJson.qualityScore || 75,
      atsReadinessScore: parsedJson.atsReadinessScore || 70,
      healthBreakdown: parsedJson.healthBreakdown || {
        formatting: 70, skills: 70, projects: 70, experience: 70, achievements: 70, education: 70
      },
      strengths: parsedJson.strengths || [],
      weaknesses: parsedJson.weaknesses || [],
      improvementSuggestions: parsedJson.improvementSuggestions || [],
      atsRisks: formattedRisks.length > 0 ? formattedRisks : [{ title: 'Standard layout', severity: 'Low' }],
      improvementForecast: parsedJson.improvementForecast || {
        currentQuality: parsedJson.qualityScore || 75,
        expectedQuality: Math.min(99, (parsedJson.qualityScore || 75) + 10),
        currentAtsReadiness: parsedJson.atsReadinessScore || 70,
        expectedAtsReadiness: Math.min(99, (parsedJson.atsReadinessScore || 70) + 12)
      }
    };
  } catch (error) {
    console.error('Gemini independent screening calculation failed, falling back to heuristics:', error.message);
    return calculateLocalScreening(resume);
  }
};
