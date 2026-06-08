import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle, FileText, Briefcase, ChevronRight, RefreshCw } from 'lucide-react';
import { API_ROUTES } from '../services/apiConfig';

const ResumeUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(''); // 'uploading', 'parsing', 'success', 'screening'
  const [uploadedResumeId, setUploadedResumeId] = useState('');
  
  const { token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const validateFile = (selectedFile) => {
    setError('');
    
    if (!selectedFile) return false;

    // Check size (< 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size allowed is 5MB.');
      return false;
    }

    // Check type
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.docx')) {
      setError('Invalid file type. Only PDF and DOCX documents are accepted.');
      return false;
    }

    setFile(selectedFile);
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleUploadSubmit = async () => {
    if (!file) {
      setError('Please select or drag a resume file first.');
      return;
    }

    setError('');
    setStatus('uploading');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setStatus('parsing');
      const response = await fetch(API_ROUTES.resumes.upload, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload and parse resume.');
      }

      setUploadedResumeId(data._id);
      setStatus('success');
    } catch (err) {
      setError(err.message || 'An error occurred during parsing.');
      setStatus('');
    }
  };

  const handleScreenResume = async () => {
    if (!uploadedResumeId) return;

    setError('');
    setStatus('screening');

    try {
      const response = await fetch(API_ROUTES.ats.screen, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeId: uploadedResumeId })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate resume screening report.');
      }

      // Route to new Screening Dashboard
      navigate('/screening-dashboard', { state: { reportId: data._id } });
    } catch (err) {
      setError(err.message || 'An error occurred during screening.');
      setStatus('success'); // revert status to successful upload to show choices again
    }
  };

  const handleJobMatch = () => {
    if (!uploadedResumeId) return;
    navigate('/analyze', { state: { resumeId: uploadedResumeId } });
  };

  return (
    <div className="main-content" style={{ animation: 'pageGlide 0.4s ease-out' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>Upload Resume</h1>
        <p style={{ marginBottom: '2.5rem', fontSize: '0.875rem' }}>Extract layout structure and technical skill profiles from PDF or DOCX documents.</p>

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Upload Form (Visible before successful parse) */}
        {status !== 'success' && status !== 'screening' && (
          <div>
            <div 
              className={`upload-zone ${dragActive ? 'dragging' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={onButtonClick}
              style={{ marginBottom: '2rem', minHeight: '260px' }}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="form-control"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".pdf,.docx"
              />
              
              <Upload size={40} color="var(--primary)" style={{ marginBottom: '1.25rem' }} />
              
              {file ? (
                <div>
                  <p style={{ fontWeight: '500', color: 'var(--text-main)', marginBottom: '0.25rem', fontSize: '0.925rem' }}>{file.name}</p>
                  <p style={{ fontSize: '0.8rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: '500', color: 'var(--text-main)', marginBottom: '0.25rem', fontSize: '0.925rem' }}>Drag and drop your file here</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supports PDF or DOCX formats (Max 5MB)</p>
                </div>
              )}
            </div>

            {file && status === '' && (
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.75rem', fontWeight: '600' }}
                onClick={handleUploadSubmit}
              >
                Upload and Parse Resume
              </button>
            )}

            {status !== '' && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{
                  display: 'inline-block',
                  width: '24px',
                  height: '24px',
                  border: '2px solid var(--border)',
                  borderTopColor: 'var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '1rem'
                }}></div>
                <p style={{ fontWeight: '500', fontSize: '0.875rem' }}>
                  {status === 'uploading' ? 'Uploading resume file...' : 'Structuring profile nodes using Gemini AI...'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Screening Loading State */}
        {status === 'screening' && (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{
              display: 'inline-block',
              width: '32px',
              height: '32px',
              border: '3px solid var(--border)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1.5rem'
            }}></div>
            <h3>Generating Screen Reports</h3>
            <p style={{ fontSize: '0.875rem' }}>Gemini is auditing achievements, checking layout formatting, and evaluating readiness indicators...</p>
          </div>
        )}

        {/* Option Selector Step (Visible after successful parse) */}
        {status === 'success' && (
          <div style={{ animation: 'pageGlide 0.4s ease-out' }}>
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.85rem' }}>
              <CheckCircle size={18} />
              Document successfully compiled into profile details! Select analysis track:
            </div>

            <div className="grid grid-2" style={{ gap: '1.5rem' }}>
              {/* Option 1: Standalone Screening */}
              <div className="card card-interactive" onClick={handleScreenResume} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
                <div>
                  <div style={{ display: 'inline-flex', padding: '0.5rem', backgroundColor: 'var(--accent-glow)', borderRadius: '6px', color: 'var(--accent)', marginBottom: '1.25rem' }}>
                    <FileText size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Screen Resume Independently</h3>
                  <p style={{ fontSize: '0.825rem', margin: 0 }}>
                    Evaluate layout simplicity, formatting, section clarity, and detect syntax risks without comparing to a job description.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent)', fontWeight: '500', fontSize: '0.85rem', marginTop: '1.5rem' }}>
                  Audit Profile <ChevronRight size={14} />
                </div>
              </div>

              {/* Option 2: Match to Job description */}
              <div className="card card-interactive" onClick={handleJobMatch} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
                <div>
                  <div style={{ display: 'inline-flex', padding: '0.5rem', backgroundColor: 'var(--primary-glow)', borderRadius: '6px', color: 'var(--primary)', marginBottom: '1.25rem' }}>
                    <Briefcase size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Job Match Analysis</h3>
                  <p style={{ fontSize: '0.825rem', margin: 0 }}>
                    Match technical skills and project relevance against specific company requirements to calculate ATS score compatibilities.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', fontWeight: '500', fontSize: '0.85rem', marginTop: '1.5rem' }}>
                  Match Target Job <ChevronRight size={14} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ResumeUpload;
