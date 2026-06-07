import mongoose from 'mongoose';

const healthBreakdownSchema = new mongoose.Schema({
  formatting: { type: Number, required: true },
  skills: { type: Number, required: true },
  projects: { type: Number, required: true },
  experience: { type: Number, required: true },
  achievements: { type: Number, required: true },
  education: { type: Number, required: true }
}, { _id: false });

const improvementSuggestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], required: true }
}, { _id: false });

const atsRiskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  severity: { type: String, enum: ['High', 'Medium', 'Low'], required: true }
}, { _id: false });

const improvementForecastSchema = new mongoose.Schema({
  currentQuality: { type: Number, required: true },
  expectedQuality: { type: Number, required: true },
  currentAtsReadiness: { type: Number, required: true },
  expectedAtsReadiness: { type: Number, required: true }
}, { _id: false });

const screeningReportSchema = new mongoose.Schema(
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
    qualityScore: {
      type: Number,
      required: true
    },
    atsReadinessScore: {
      type: Number,
      required: true
    },
    healthBreakdown: {
      type: healthBreakdownSchema,
      required: true
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    improvementSuggestions: [improvementSuggestionSchema],
    atsRisks: [atsRiskSchema],
    improvementForecast: {
      type: improvementForecastSchema,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const ScreeningReport = mongoose.model('ScreeningReport', screeningReportSchema);
export default ScreeningReport;
