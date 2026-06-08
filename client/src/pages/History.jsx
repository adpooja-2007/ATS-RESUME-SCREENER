import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Download, ChevronRight, FileText } from 'lucide-react';
import { API_ROUTES } from '../services/apiConfig';

const History = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(API_ROUTES.ats.reports, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setReports(data);
        }
      } catch (err) {
        console.error('History fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  const downloadReport = (reportId, format) => {
    const url = format === 'pdf' ? API_ROUTES.reports.pdf(reportId) : API_ROUTES.reports.docx(reportId);
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
      link.download = `ATS_Report_${reportId}.${format}`;
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

  return (
    <div className="main-content" style={{ animation: 'pageGlide 0.4s ease-out' }}>
      <h1 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: 'none', fontSize: '1.75rem' }}>
        Evaluation Logs
      </h1>
      <p style={{ marginBottom: '2.5rem', fontSize: '0.875rem' }}>Review past match iterations and download editable report formats.</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{
            display: 'inline-block',
            width: '24px',
            height: '24px',
            border: '2px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', borderStyle: 'dashed' }}>
          <FileText size={40} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem' }} />
          <h3>No Match Records</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 2rem', fontSize: '0.875rem' }}>You haven't run any ATS matches yet. Start by comparing your resume with a job description.</p>
          <button className="btn btn-primary" onClick={() => navigate('/analyze')}>Run Initial Match</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="custom-table" style={{ margin: 0, fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Target Job</th>
                <th style={{ padding: '0.75rem 1rem' }}>Resume Source</th>
                <th style={{ padding: '0.75rem 1rem' }}>Match Score</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Downloads</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Explore</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id}>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{new Date(report.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: '500', color: 'var(--text-main)' }}>{report.jobId?.title || 'Target Job'}</td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>{report.resumeId?.filename || 'Resume'}</td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: '600', color: getScoreColor(report.atsScore) }}>{report.atsScore}%</td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button 
                        onClick={() => downloadReport(report._id, 'pdf')} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        PDF
                      </button>
                      <button 
                        onClick={() => downloadReport(report._id, 'docx')} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        DOCX
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => navigate('/analyze', { state: { resumeId: report.resumeId?._id } })} 
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default History;
