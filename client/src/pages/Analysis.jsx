import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, Briefcase, Award, CheckCircle, AlertTriangle, 
  HelpCircle, BookOpen, PenTool, Download, RefreshCw, Layers, Sparkles
} from 'lucide-react';
import { API_ROUTES } from '../services/apiConfig';

const Analysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  // Selection states
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(location.state?.resumeId || '');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('inputs'); // 'inputs' or 'profile'

  // Execution states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  // Standalone Bullet Rewriter states
  const [bulletInput, setBulletInput] = useState('');
  const [rewrittenBullet, setRewrittenBullet] = useState('');
  const [rewriterLoading, setRewriterLoading] = useState(false);

  // Simulated Interview Card states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);

  // Fetch previous resumes on load
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await fetch(API_ROUTES.resumes.list, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setResumes(data);
          if (!selectedResumeId && data.length > 0) {
            setSelectedResumeId(data[0]._id);
          }
        }
      } catch (err) {
        console.error('Error fetching resumes:', err);
      }
    };

    fetchResumes();
  }, [token, selectedResumeId]);

  const handleMatch = async (e) => {
    e.preventDefault();
    if (!selectedResumeId || !jobTitle || !jobDescription) {
      setError('Please select a resume, enter a job title, and paste the job description.');
      return;
    }

    setError('');
    setLoading(true);
    setReport(null);

    try {
      const response = await fetch(API_ROUTES.ats.analyze, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobTitle,
          jobDescription
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Analysis match calculation failed.');
      }

      setReport(data);
      setCurrentQuestionIndex(0);
      setShowAnswerFeedback(false);
      // Automatically switch to tab inputs to see diagnostics
    } catch (err) {
      setError(err.message || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = async (e) => {
    e.preventDefault();
    if (!bulletInput.trim()) return;

    setRewrittenBullet('');
    setRewriterLoading(true);

    try {
      const response = await fetch(API_ROUTES.ai.rewrite, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bulletPoint: bulletInput })
      });

      const data = await response.json();
      if (response.ok) {
        setRewrittenBullet(data.rewritten);
      } else {
        setRewrittenBullet('Rewrite failed. Try a different sentence.');
      }
    } catch (err) {
      setRewrittenBullet('Network error occurred.');
    } finally {
      setRewriterLoading(false);
    }
  };

  const downloadReport = (format) => {
    if (!report) return;
    const url = format === 'pdf' ? API_ROUTES.reports.pdf(report._id) : API_ROUTES.reports.docx(report._id);
    
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      if (!response.ok) throw new Error('Download failed');
      return response.blob();
    })
    .then(blob => {
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `ATS_Report_${report._id}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    })
    .catch(err => {
      console.error(err);
      alert('Failed to download report.');
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 55) return 'var(--warning)';
    return 'var(--danger)';
  };

  // Find currently selected resume details to display in "Profile Editor" tab
  const activeResumeDetails = resumes.find(r => r._id === selectedResumeId);

  return (
    <div className="main-content" style={{ animation: 'pageGlide 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem', borderBottom: 'none', padding: '0', fontSize: '1.75rem' }}>Matcher Workspace</h1>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Configure targets and analyze resume relevance statistics side-by-side.</p>
        </div>
        {report && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => downloadReport('pdf')} className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
              <Download size={14} /> Export PDF
            </button>
            <button onClick={() => downloadReport('docx')} className="btn btn-secondary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
              <Download size={14} /> Export DOCX
            </button>
          </div>
        )}
      </div>

      <div className="workspace-container" style={{ marginBottom: '2.5rem' }}>
        {/* Left Workspace Panel */}
        <div className="workspace-left">
          <div className="card" style={{ height: '100%', minHeight: '520px' }}>
            <div className="tab-container">
              <button 
                className={`tab-btn ${activeWorkspaceTab === 'inputs' ? 'active' : ''}`}
                onClick={() => setActiveWorkspaceTab('inputs')}
              >
                Match Criteria
              </button>
              <button 
                className={`tab-btn ${activeWorkspaceTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveWorkspaceTab('profile')}
                disabled={!selectedResumeId}
              >
                Extracted Profile
              </button>
            </div>

            {activeWorkspaceTab === 'inputs' && (
              <div style={{ animation: 'pageGlide 0.3s ease-out' }}>
                {error && <div className="alert alert-error" style={{ fontSize: '0.85rem' }}>{error}</div>}

                <form onSubmit={handleMatch}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="workspace-resume-select">Resume Document</label>
                    <select 
                      id="workspace-resume-select"
                      className="form-control"
                      value={selectedResumeId}
                      onChange={(e) => {
                        setSelectedResumeId(e.target.value);
                        setError('');
                      }}
                      required
                    >
                      <option value="">Select parsed document...</option>
                      {resumes.map(r => (
                        <option key={r._id} value={r._id}>{r.filename}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="workspace-job-title">Job Title</label>
                    <input
                      id="workspace-job-title"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Frontend Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                    <label className="form-label" htmlFor="workspace-job-description">Job Description</label>
                    <textarea
                      id="workspace-job-description"
                      className="form-control"
                      rows={10}
                      placeholder="Paste job details or required technical criteria..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-accent" 
                    style={{ width: '100%', padding: '0.75rem', fontWeight: '600' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={15} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                        Analyzing Match Compatibility...
                      </>
                    ) : 'Analyze Match Compatibility'}
                  </button>
                </form>
              </div>
            )}

            {activeWorkspaceTab === 'profile' && activeResumeDetails && (
              <div style={{ animation: 'pageGlide 0.3s ease-out', maxHeight: '480px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-main)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Parsed Profile Data</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Name & Contact</span>
                    <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-main)' }}>{activeResumeDetails.parsedData?.name || 'Applicant'}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>{activeResumeDetails.parsedData?.email || 'No Email'} | {activeResumeDetails.parsedData?.phone || 'No Phone'}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Extracted Skills</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                      {(activeResumeDetails.parsedData?.skills || []).map((s, i) => (
                        <span key={i} style={{ padding: '0.2rem 0.5rem', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--text-main)' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projects</span>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                      {(activeResumeDetails.parsedData?.projects || []).map((p, i) => (
                        <li key={i} style={{ borderLeft: '2px solid var(--border)', paddingLeft: '0.75rem' }}>
                          <h5 style={{ margin: '0 0 0.15rem', fontSize: '0.875rem' }}>{p.title}</h5>
                          <p style={{ margin: 0, fontSize: '0.825rem' }}>{p.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Match Diagnostics Panel */}
        <div className="workspace-right">
          {!report && !loading && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '520px', borderStyle: 'dashed', textAlign: 'center' }}>
              <FileText size={40} color="var(--text-muted)" style={{ marginBottom: '1.25rem' }} />
              <h3>Awaiting Input</h3>
              <p style={{ maxWidth: '300px', fontSize: '0.875rem' }}>Fill in the matching criteria and click analyze to output scores.</p>
            </div>
          )}

          {loading && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '520px', textAlign: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--border)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1.2s linear infinite',
                marginBottom: '1.25rem'
              }}></div>
              <h3>Calculating Gaps</h3>
              <p style={{ maxWidth: '320px', fontSize: '0.875rem' }}>Gemini is extracting skill nodes and computing experience compatibility...</p>
              <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
              `}</style>
            </div>
          )}

          {report && (
            <div className="card" style={{ height: '100%', minHeight: '520px', display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              
              {/* SVG Radial segment score gauge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <svg width="100" height="100" viewBox="0 0 120 120" className="score-circle-svg" style={{ width: '100%', height: '100%' }}>
                    <circle cx="60" cy="60" r="50" className="score-circle-bg" />
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="50" 
                      className="score-circle-fill" 
                      stroke={getScoreColor(report.atsScore)}
                      strokeDasharray="314.16" 
                      strokeDashoffset={314.16 - (314.16 * report.atsScore) / 100} 
                    />
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--text-main)'
                  }}>
                    {report.atsScore}%
                  </div>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>ATS Compatibility</h3>
                  <p style={{ margin: 0, fontSize: '0.825rem' }}>Weighted alignment mapping based on keywords, experience, and format quality.</p>
                </div>
              </div>

              {/* Progress bars list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Skills Alignment (40%)', val: report.scoreBreakdown.skillMatch },
                  { label: 'Keyword Density (30%)', val: report.scoreBreakdown.keywordMatch },
                  { label: 'Project Relevancy (15%)', val: report.scoreBreakdown.projectRelevance },
                  { label: 'Experience Met (10%)', val: report.scoreBreakdown.experienceMatch },
                  { label: 'Layout Quality (5%)', val: report.scoreBreakdown.resumeQuality }
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{item.val}%</span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.val}%`, backgroundColor: 'var(--primary)', borderRadius: '2px' }}></div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>

      {report && (
        <>
          {/* Kanban Gap Board Section */}
          <div className="card" style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <Layers size={18} color="var(--primary)" />
              Prioritized Skill Gaps
            </h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Required and preferred qualifications detected in the job listing but missing from your profile.</p>

            <div className="kanban-cols">
              {/* Column 1: High Priority */}
              <div className="kanban-col" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <div className="kanban-title" style={{ color: '#fca5a5' }}>High (Crucial Gaps)</div>
                <ul className="tag-list-vertical">
                  {report.gapAnalysis.highPriority.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>No high priority gaps.</p>
                  ) : report.gapAnalysis.highPriority.map((s, i) => (
                    <li key={i} className="tag-card">{s}</li>
                  ))}
                </ul>
              </div>

              {/* Column 2: Medium Priority */}
              <div className="kanban-col" style={{ borderColor: 'rgba(245, 158, 11, 0.2)' }}>
                <div className="kanban-title" style={{ color: '#fde047' }}>Medium Priority</div>
                <ul className="tag-list-vertical">
                  {report.gapAnalysis.mediumPriority.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>No medium priority gaps.</p>
                  ) : report.gapAnalysis.mediumPriority.map((s, i) => (
                    <li key={i} className="tag-card">{s}</li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Low Priority / Preferred */}
              <div className="kanban-col" style={{ borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                <div className="kanban-title" style={{ color: '#a5f3fc' }}>Preferred Gaps</div>
                <ul className="tag-list-vertical">
                  {report.gapAnalysis.lowPriority.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>No preferred gaps.</p>
                  ) : report.gapAnalysis.lowPriority.map((s, i) => (
                    <li key={i} className="tag-card">{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* AI Advice & Interactive Interview decks */}
          <div className="grid grid-2" style={{ alignItems: 'start', marginBottom: '2.5rem' }}>
            {/* Advice panel */}
            <div className="card" style={{ minHeight: '340px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                <BookOpen size={18} color="var(--primary)" />
                AI Recommendations & Path
              </h3>
              
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent)' }}>Recommended Study Order</span>
                <ol style={{ paddingLeft: '1rem', marginTop: '0.4rem', fontSize: '0.875rem' }}>
                  {(report.careerPath.learningPath || []).map((skill, index) => (
                    <li key={index} style={{ marginBottom: '0.3rem' }}>{skill}</li>
                  ))}
                </ol>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)' }}>Targeted Projects</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {(report.careerPath.recommendedProjects || []).slice(0, 2).map((proj, idx) => (
                    <div key={idx} style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem' }}>
                      <h5 style={{ margin: '0 0 0.15rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>{proj.title}</h5>
                      <p style={{ margin: 0, fontSize: '0.8rem' }}>{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Flashcard Deck */}
            <div className="card" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                <HelpCircle size={18} color="var(--accent)" />
                Interview Copilot Prep
              </h3>
              <p style={{ fontSize: '0.825rem', marginBottom: '1.5rem' }}>Flashcards matching your tech stack with targeted requirements.</p>

              {report.interviewQuestions.length > 0 && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ 
                    backgroundColor: 'var(--bg-main)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '8px', 
                    padding: '1.25rem',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    animation: 'pageGlide 0.2s ease-out'
                  }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: '600' }}>Question {currentQuestionIndex + 1} of {report.interviewQuestions.length}</span>
                    <p style={{ margin: '0.5rem 0 0', fontWeight: '500', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                      {report.interviewQuestions[currentQuestionIndex]}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <button 
                      onClick={() => setShowAnswerFeedback(!showAnswerFeedback)} 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      {showAnswerFeedback ? 'Hide AI Guidance' : 'Reveal AI Guidance'}
                    </button>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        disabled={currentQuestionIndex === 0}
                        onClick={() => {
                          setCurrentQuestionIndex(currentQuestionIndex - 1);
                          setShowAnswerFeedback(false);
                        }}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Prev
                      </button>
                      <button 
                        disabled={currentQuestionIndex === report.interviewQuestions.length - 1}
                        onClick={() => {
                          setCurrentQuestionIndex(currentQuestionIndex + 1);
                          setShowAnswerFeedback(false);
                        }}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        Next
                      </button>
                    </div>
                  </div>

                  {showAnswerFeedback && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px dashed var(--border)', fontSize: '0.8rem' }}>
                      <strong>Guidance:</strong> Focus your explanation on practical accomplishments. Describe how you leveraged this specific technology in your projects, highlighting scalability, performance constraints, and structural optimizations.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Standalone AI Bullet Optimizer with Side-by-Side Diff layout */}
      <div className="card" style={{ marginBottom: '3rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          <PenTool size={18} color="var(--accent)" />
          AI Bullet Optimizer
        </h3>
        <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Paste any weak resume bullet point to rephrase it into an achievement containing metrics and action verbs.</p>

        <form onSubmit={handleRewrite} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Worked on database."
            value={bulletInput}
            onChange={(e) => setBulletInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={rewriterLoading} style={{ padding: '0.65rem 1.25rem' }}>
            {rewriterLoading ? 'Optimizing...' : 'Optimize Bullet'}
          </button>
        </form>

        {rewrittenBullet && (
          <div className="bullet-diff-container" style={{ animation: 'pageGlide 0.3s ease-out' }}>
            <div className="diff-row">
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Original</span>
                <div className="diff-box diff-removed" style={{ marginTop: '0.25rem' }}>
                  {bulletInput}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--success)' }}>AI Rephrased</span>
                <div className="diff-box diff-added" style={{ marginTop: '0.25rem' }}>
                  {rewrittenBullet}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
