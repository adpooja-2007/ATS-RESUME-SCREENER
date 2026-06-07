import mongoose from 'mongoose';

const parsedDataSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  skills: [{ type: String }],
  education: [
    {
      degree: { type: String, default: '' },
      institution: { type: String, default: '' },
      year: { type: String, default: '' }
    }
  ],
  experience: [
    {
      role: { type: String, default: '' },
      company: { type: String, default: '' },
      duration: { type: String, default: '' },
      description: { type: String, default: '' }
    }
  ],
  projects: [
    {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      technologies: [{ type: String }]
    }
  ]
}, { _id: false });

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    extractedText: {
      type: String,
      required: true
    },
    parsedData: {
      type: parsedDataSchema,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
