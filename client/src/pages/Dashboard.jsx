import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Briefcase, TrendingUp, ChevronRight, FileUp, Award } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [chartData, setChartData] = useState(null);
  
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/ats/reports', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setReports(data);
          
          // If reports exist, default to the latest job for version tracking
          if (data.length > 0) {
            setSelectedJobId(data[0].jobId?._id || '');
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [token]);

  // Fetch match version history for selected job to populate progression chart
  useEffect(() => {
    if (!selectedJobId) {
      setChartData(null);
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/ats/history/${selectedJobId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setChartData({
              labels: data.map(item => item.label),
              datasets: [
                {
                  label: 'ATS Match Score (%)',
                  data: data.map(item => item.atsScore),
                  borderColor: '#3B82F6', // Electric Blue
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  tension: 0.2,
                  fill: true,
                  pointBackgroundColor: '#8B5CF6', // Violet Accent
                  pointBorderColor: '#ffffff',
                  pointHoverRadius: 6,
                  borderWidth: 2
                }
              ]
            });
          } else {
            setChartData(null);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistory();
  }, [selectedJobId, token]);

  const uniqueJobs = Array.from(
    new Map(
      reports.filter(r => r.jobId).map(r => [r.jobId._id, r.jobId])
    ).values()
  );

  const averageScore = reports.length > 0 
    ? Math.round(reports.reduce((acc, r) => acc + r.atsScore, 0) / reports.length)
    : 0;

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success)';
    if (score >= 55) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="main-content" style={{ animation: 'pageGlide 0.4s ease-out' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.25rem', borderBottom: 'none', padding: '0', fontSize: '1.75rem' }}>Welcome Back, {user.name}</h1>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Track and improve your resume performance against targeted roles.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/upload')}>
          <FileUp size={15} /> Upload Resume
        </button>
      </div>

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
      ) : (
        <div>
          {/* Statistics widgets */}
          <div className="grid grid-3" style={{ marginBottom: '2.5rem' }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem' }}>
              <div style={{ padding: '0.6rem', backgroundColor: 'var(--primary-glow)', borderRadius: '6px', color: 'var(--primary)' }}>
                <FileText size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resumes Matched</p>
                <h3 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '700' }}>{reports.length}</h3>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem' }}>
              <div style={{ padding: '0.6rem', backgroundColor: 'rgba(34, 197, 94, 0.05)', borderRadius: '6px', color: 'var(--success)' }}>
                <Award size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Fit Index</p>
                <h3 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '700', color: getScoreColor(averageScore) }}>{averageScore}%</h3>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem' }}>
              <div style={{ padding: '0.6rem', backgroundColor: 'var(--accent-glow)', borderRadius: '6px', color: 'var(--accent)' }}>
                <Briefcase size={20} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configured Jobs</p>
                <h3 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '700' }}>{uniqueJobs.length}</h3>
              </div>
            </div>
          </div>

          {/* Historical progression charts */}
          {reports.length > 0 && (
            <div className="grid grid-2" style={{ alignItems: 'start', marginBottom: '2.5rem' }}>
              {/* Score Progression Line Chart */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progression Tracker</h3>
                  {uniqueJobs.length > 0 && (
                    <select 
                      className="form-control" 
                      style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem', height: 'auto' }}
                      value={selectedJobId}
                      onChange={(e) => setSelectedJobId(e.target.value)}
                    >
                      {uniqueJobs.map(job => (
                        <option key={job._id} value={job._id}>{job.title}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="chart-container" style={{ height: '220px' }}>
                  {chartData ? (
                    <Line 
                      data={chartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false }
                        },
                        scales: {
                          y: { 
                            min: 0, 
                            max: 100, 
                            grid: { color: 'rgba(255, 255, 255, 0.03)' }, 
                            ticks: { color: 'var(--text-muted)', font: { size: 10 } } 
                          },
                          x: { 
                            grid: { display: false }, 
                            ticks: { color: 'var(--text-muted)', font: { size: 10 } } 
                          }
                        }
                      }} 
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                      Select a job from the filter dropdown.
                    </div>
                  )}
                </div>
              </div>

              {/* Match History Table */}
              <div className="card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Recent Evaluations</h3>
                {reports.length === 0 ? (
                  <p style={{ fontSize: '0.85rem' }}>No evaluations recorded.</p>
                ) : (
                  <table className="custom-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Target Job</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Resume Version</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Match</th>
                        <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.slice(0, 4).map(report => (
                        <tr key={report._id}>
                          <td style={{ fontWeight: '500', padding: '0.75rem' }}>{report.jobId?.title || 'Target Job'}</td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{report.resumeId?.filename || 'Resume'}</td>
                          <td style={{ fontWeight: '600', color: getScoreColor(report.atsScore), padding: '0.75rem' }}>
                            {report.atsScore}%
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <button 
                              onClick={() => navigate('/analyze', { state: { resumeId: report.resumeId?._id } })} 
                              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.1rem' }}
                            >
                              Explore <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {reports.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '6rem 2rem', borderStyle: 'dashed' }}>
              <FileText size={40} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem' }} />
              <h3>Your Dashboard is Empty</h3>
              <p style={{ maxWidth: '400px', margin: '0 auto 2rem', fontSize: '0.875rem' }}>
                Upload your resume, paste a job requirements list, and configure compatibility statistics.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/upload')}>
                Upload Resume
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
