import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileCheck, Sparkles, TrendingUp, HelpCircle, Layers, ArrowRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="main-content" style={{ animation: 'pageGlide 0.5s ease-out' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', padding: '4rem 0 6rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          backgroundColor: 'var(--accent-glow)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '500',
          color: '#c084fc',
          marginBottom: '2rem'
        }}>
          <Sparkles size={12} /> Powered by Gemini LLM Intelligence
        </div>
        
        <h1 style={{ fontSize: '3.5rem', lineHeight: '1.15', fontWeight: '800', maxWidth: '850px', margin: '0 auto 1.5rem', letterSpacing: '-0.04em' }}>
          Optimize your resume for modern software roles
        </h1>
        
        <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', maxWidth: '640px', margin: '0 auto 2.5rem' }}>
          An intelligent career co-pilot that matches your experiences against job requirements, analyzes technical skill gaps, and suggests optimal bullet point rewrites.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={handleStart} className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
            Get Started <ArrowRight size={16} />
          </button>
          <a href="#features" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
            View Architecture
          </a>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" style={{ padding: '4rem 0', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '1.75rem' }}>Architected for modern developers</h2>
        
        <div className="grid grid-3">
          <div className="card">
            <div style={{ display: 'inline-flex', padding: '0.5rem', backgroundColor: 'var(--primary-glow)', borderRadius: '6px', marginBottom: '1.25rem' }}>
              <FileCheck size={20} color="var(--primary)" />
            </div>
            <h3>ATS Match Analysis</h3>
            <p>Runs a 5-component weighted scoring system analyzing required skills, experience lengths, project similarity, and document structure density.</p>
          </div>

          <div className="card">
            <div style={{ display: 'inline-flex', padding: '0.5rem', backgroundColor: 'var(--accent-glow)', borderRadius: '6px', marginBottom: '1.25rem' }}>
              <Layers size={20} color="var(--accent)" />
            </div>
            <h3>Prioritized Skill Gaps</h3>
            <p>Auto-categorizes qualifications absent from your profile into High, Medium, and Low priorities based on job description context.</p>
          </div>

          <div className="card">
            <div style={{ display: 'inline-flex', padding: '0.5rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px', marginBottom: '1.25rem' }}>
              <Sparkles size={20} color="var(--success)" />
            </div>
            <h3>Bullet Point Optimizer</h3>
            <p>Analyzes and rephrases weak experience bullet points using high-impact action verbs, quantitative metrics, and clean typography.</p>
          </div>
        </div>
      </section>

      {/* Interactive Visual Block Section */}
      <section style={{ padding: '4rem 0', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        <div className="grid grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', letterSpacing: '-0.03em' }}>Interactive Experience Rewriter</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Transform passive descriptors into professional achievement metrics. Our AI rewriter aligns your statements directly with targeted tech stacks.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>
                <span>Highlights weak action verbs</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></div>
                <span>Injects numerical outcome estimations</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent)' }}>Comparison Preview</span>
            <div className="bullet-diff-container" style={{ marginTop: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Before</span>
                <div className="diff-box diff-removed" style={{ marginTop: '0.25rem' }}>
                  worked on database.
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>After AI Optimization</span>
                <div className="diff-box diff-added" style={{ marginTop: '0.25rem' }}>
                  Designed and optimized MongoDB schemas to improve query performance and data consistency.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
          <div className="card" style={{ order: 2, padding: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)' }}>Prep Module Preview</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ padding: '1rem', borderLeft: '3px solid var(--accent)', backgroundColor: 'rgba(255, 255, 255, 0.01)', borderRadius: '0 8px 8px 0' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resume: React | Job: Virtual DOM</span>
                <p style={{ margin: '0.25rem 0 0', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  Since your project uses React, explain the differences between the shadow DOM and the Virtual DOM.
                </p>
              </div>
            </div>
          </div>

          <div style={{ order: 1 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', letterSpacing: '-0.03em' }}>Personalized Interview Copilot</h2>
            <p>
              Prepare for the role using customized interview prep questions. The system analyzes your resume projects and compiles custom technical questions designed by senior engineering managers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
