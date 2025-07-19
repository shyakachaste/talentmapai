import React from 'react';
import { FaBrain, FaRocket, FaShieldAlt, FaChartLine, FaUsers, FaCog } from 'react-icons/fa';
import './Features.css';

const Features: React.FC = () => {
  const features = [
    {
      icon: FaBrain,
      title: 'AI-Powered Analysis',
      description: 'Advanced natural language processing and semantic matching for accurate resume evaluation.'
    },
    {
      icon: FaRocket,
      title: 'Instant Results',
      description: 'Get comprehensive match scores and feedback within seconds of uploading resumes.'
    },
    {
      icon: FaChartLine,
      title: 'Smart Matching',
      description: 'Goes beyond keyword matching to understand context, synonyms, and related skills.'
    },
    {
      icon: FaUsers,
      title: 'Detailed Reports',
      description: 'Comprehensive breakdown of matched skills, missing requirements, and improvement suggestions.'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Private',
      description: 'All analysis happens locally. Your data never leaves your browser for maximum security.'
    },
    {
      icon: FaCog,
      title: 'Responsive Design',
      description: 'Works seamlessly across all devices - desktop, tablet, and mobile platforms.'
    }
  ];

  return (
    <section className="features section" id="features">
      <div className="container">
        <div className="section-header text-center">
          <h2>Why Choose TalentMap AI?</h2>
          <p>Powerful features designed to streamline your recruitment process</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="feature-card card animate-fade-in">
                <div className="feature-icon">
                  <IconComponent size={32} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;