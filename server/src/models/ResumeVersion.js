import mongoose from 'mongoose';

const resumeVersionSchema = new mongoose.Schema(
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
    versionNumber: {
      type: Number,
      required: true
    },
    atsScore: {
      type: Number,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const ResumeVersion = mongoose.model('ResumeVersion', resumeVersionSchema);
export default ResumeVersion;
