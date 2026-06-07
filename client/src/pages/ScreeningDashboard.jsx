import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, ArrowLeft, Check, AlertTriangle, AlertOctagon, TrendingUp, Info } from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const ScreeningDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reportId = location.state?.reportId;

  useEffect(() => {
    if (!reportId) {
      setError('No screening report identifier found. Please upload a resume first.');
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/ats/screenings/${reportId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to retrieve screening details.');
        }
        
        setReport(data);
      } catch (err) {
        setError(err.message || 'An error occurred fetching the report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, token]);

  const getScoreStatus = (score) => {
    if (score >= 85) return { label: 'Excellent', color: 'var(--success)' };
    if (score >= 70) return { label: 'Good', color: 'var(--primary)' };
    if (score >= 50) return { label: 'Needs Improvement', color: 'var(--warning)' };
    return { label: 'Critical Risks', color: 'var(--danger)' };
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'var(--danger)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--text-muted)';
      default: return 'var(--text-muted)';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{
          width: '24px',
          height: '24px',
          border: '2px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="main-content" style={{ animation: 'pageGlide 0.4s ease-out' }}>
        <button onClick={() => navigate('/upload')} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
          <ArrowLeft size={14} /> Back to Upload
        </button>
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <AlertOctagon size={40} color="var(--danger)" style={{ margin: '0 auto 1.5rem' }} />
          <h3>Error Loading Screening Report</h3>
          <p>{error || 'Report could not be retrieved.'}</p>
        </div>
      </div>
    );
  }

  const qualityStatus = getScoreStatus(report.qualityScore);
  const readinessStatus = getScoreStatus(report.atsReadinessScore);

  // Radar chart options
  const radarData = {
    labels: ['Formatting', 'Skills', 'Projects', 'Experience', 'Achievements', 'Education'],
    datasets: [
      {
        label: 'Health Matrix',
        data: [
          report.healthBreakdown.formatting || 0,
          report.healthBreakdown.skills || 0,
          report.healthBreakdown.projects || 0,
          report.healthBreakdown.experience || 0,
          report.healthBreakdown.achievements || 0,
          report.healthBreakdown.education || 0
        ],
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        borderColor: '#8B5CF6',
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        borderWidth: 2,
        pointHoverRadius: 6
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.05)' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        pointLabels: { color: 'var(--text-muted)', font: { size: 10, family: 'Inter' } },
        ticks: { display: false },
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="main-content" style={{ animation: 'pageGlide 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Back CTA */}
      <button onClick={() => navigate('/upload')} className="btn btn-secondary" style={{ marginBottom: '2rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
        <ArrowLeft size={14} /> Back to Upload
      </button>

      {/* Title */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ marginBottom: '0.25rem', borderBottom: 'none', padding: 0, fontSize: '1.75rem' }}>Resume Audit Dashboard</h1>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>Independent quality screening details for: <strong style={{ color: 'var(--text-main)' }}>{report.resumeId?.filename || 'Resume'}</strong></p>
      </div>

      {/* Row 1: Premium Score Cards */}
      <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
        {/* Quality Score Card */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Resume Quality Score</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0.5rem 0', color: 'var(--text-main)' }}>
              {report.qualityScore}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '400' }}>/100</span>
            </h2>
            <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)' }}>
              Evaluates section layout, experiences clarity, and quantitative accomplishments.
            </p>
          </div>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: '600',
            padding: '0.3rem 0.6rem',
            borderRadius: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${qualityStatus.color}`,
            color: qualityStatus.color
          }}>
            {qualityStatus.label}
          </span>
        </div>

        {/* ATS Readiness Card */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>ATS Readiness Score</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0.5rem 0', color: 'var(--text-main)' }}>
              {report.atsReadinessScore}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '400' }}>/100</span>
            </h2>
            <p style={{ fontSize: '0.8rem', margin: 0, color: 'var(--text-muted)' }}>
              Indicates document parseability, heading formats, and layout formatting risks.
            </p>
          </div>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: '600',
            padding: '0.3rem 0.6rem',
            borderRadius: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${readinessStatus.color}`,
            color: readinessStatus.color
          }}>
            {readinessStatus.label}
          </span>
        </div>
      </div>

      {/* Row 2: Radar Chart + Risk Indicators */}
      <div className="grid grid-2" style={{ alignItems: 'stretch', marginBottom: '2rem' }}>
        {/* Radar Health Graph */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>Resume Health Radar</h3>
          <div style={{ flex: 1, minHeight: '260px', position: 'relative' }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* ATS Risk Detection */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>ATS Risk Detection</h3>
          <p style={{ fontSize: '0.825rem', marginBottom: '1.25rem' }}>Layout variables that might hinder automated text extractions.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {(report.atsRisks || []).map((risk, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border)',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={15} color={getSeverityColor(risk.severity)} />
                  {risk.title}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  color: getSeverityColor(risk.severity)
                }}>
                  {risk.severity} Risk
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Strengths and Weaknesses */}
      <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
        {/* Strengths card */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', color: 'var(--success)' }}>Strengths</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(report.strengths || []).map((str, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Check size={16} color="var(--success)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses card */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', color: 'var(--warning)' }}>Weaknesses</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(report.weaknesses || []).map((weak, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '0.5rem', fontSize: '0.875rem' }}>
                <AlertTriangle size={16} color="var(--warning)" style={{ marginTop: '0.15rem', flexShrink: 0 }} />
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Row 4: Priority list + Forecast */}
      <div className="grid grid-2" style={{ alignItems: 'start', marginBottom: '3rem' }}>
        {/* Priority list */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Improvement Priority</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(report.improvementSuggestions || []).map((sugg, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${sugg.priority === 'High' ? 'var(--danger)' : sugg.priority === 'Medium' ? 'var(--warning)' : 'var(--primary)'}`, paddingLeft: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: sugg.priority === 'High' ? 'var(--danger)' : sugg.priority === 'Medium' ? 'var(--warning)' : 'var(--primary)' }}>
                    {sugg.priority} Impact
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-main)' }}>{sugg.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Forecast cards */}
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={16} color="var(--primary)" />
            Improvement Forecast
          </h3>
          <p style={{ fontSize: '0.825rem', marginBottom: '1.5rem' }}>Expected scoring statistics once recommendations are applied to the document.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Forecast 1 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Resume Quality Index</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                  {report.improvementForecast.currentQuality} → <span style={{ color: 'var(--success)' }}>{report.improvementForecast.expectedQuality}</span>
                </span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', position: 'relative' }}>
                {/* Current progress */}
                <div style={{ height: '100%', width: `${report.improvementForecast.currentQuality}%`, backgroundColor: 'var(--primary)', borderRadius: '3px', position: 'absolute', left: 0, top: 0 }}></div>
                {/* Expected progress */}
                <div style={{ height: '100%', width: `${report.improvementForecast.expectedQuality - report.improvementForecast.currentQuality}%`, backgroundColor: 'rgba(34, 197, 94, 0.3)', borderRadius: '0 3px 3px 0', position: 'absolute', left: `${report.improvementForecast.currentQuality}%`, top: 0 }}></div>
              </div>
            </div>

            {/* Forecast 2 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>ATS Readiness Score</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                  {report.improvementForecast.currentAtsReadiness} → <span style={{ color: 'var(--success)' }}>{report.improvementForecast.expectedAtsReadiness}</span>
                </span>
              </div>
              <div style={{ height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', position: 'relative' }}>
                {/* Current progress */}
                <div style={{ height: '100%', width: `${report.improvementForecast.currentAtsReadiness}%`, backgroundColor: 'var(--accent)', borderRadius: '3px', position: 'absolute', left: 0, top: 0 }}></div>
                {/* Expected progress */}
                <div style={{ height: '100%', width: `${report.improvementForecast.expectedAtsReadiness - report.improvementForecast.currentAtsReadiness}%`, backgroundColor: 'rgba(34, 197, 94, 0.3)', borderRadius: '0 3px 3px 0', position: 'absolute', left: `${report.improvementForecast.currentAtsReadiness}%`, top: 0 }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreeningDashboard;
