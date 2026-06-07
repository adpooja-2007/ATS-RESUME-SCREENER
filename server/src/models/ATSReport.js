import mongoose from 'mongoose';

const scoreBreakdownSchema = new mongoose.Schema({
  skillMatch: { type: Number, required: true },
  keywordMatch: { type: Number, required: true },
  projectRelevance: { type: Number, required: true },
  experienceMatch: { type: Number, required: true },
  resumeQuality: { type: Number, required: true }
}, { _id: false });

const gapAnalysisSchema = new mongoose.Schema({
  highPriority: [{ type: String }],
  mediumPriority: [{ type: String }],
  lowPriority: [{ type: String }]
}, { _id: false });

const bulletRewriteSchema = new mongoose.Schema({
  original: { type: String, required: true },
  rewritten: { type: String, required: true }
}, { _id: false });

const recommendedProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const careerPathSchema = new mongoose.Schema({
  learningPath: [{ type: String }],
  recommendedProjects: [recommendedProjectSchema]
}, { _id: false });

const atsReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    atsScore: {
      type: Number,
      required: true
    },
    scoreBreakdown: {
      type: scoreBreakdownSchema,
      required: true
    },
    missingSkills: [{ type: String }],
    gapAnalysis: {
      type: gapAnalysisSchema,
      required: true
    },
    suggestions: [{ type: String }],
    interviewQuestions: [{ type: String }],
    careerPath: {
      type: careerPathSchema,
      required: true
    },
    bulletRewrites: [bulletRewriteSchema]
  },
  {
    timestamps: true
  }
);

const ATSReport = mongoose.model('ATSReport', atsReportSchema);
export default ATSReport;
