import React from 'react';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Intelligent Resume Analysis 
              <span className="hero-highlight"> Powered by AI</span>
            </h1>
            <p className="hero-description">
              TalentMap AI streamlines recruitment by intelligently evaluating candidate resumes 
              against job requirements using advanced natural language processing and semantic matching.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => document.getElementById('get-started')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Analysis
              </button>
              <button 
                className="btn btn-secondary btn-large"
                onClick={() => alert('Demo: This showcases TalentMap AI analyzing a sample resume with 92% match score, highlighting matched skills (Python, React, Node.js, 5+ years experience) and missing requirements (AWS certification).')}
              >
                View Demo
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="card-header">
                <div className="card-title">Resume Match Score</div>
                <div className="score-badge">92%</div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <div className="match-details">
                <div className="match-item">
                  <span className="match-icon">✓</span>
                  <span>Python, React, Node.js</span>
                </div>
                <div className="match-item">
                  <span className="match-icon">✓</span>
                  <span>5+ years experience</span>
                </div>
                <div className="match-item missing">
                  <span className="match-icon">!</span>
                  <span>AWS certification needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;