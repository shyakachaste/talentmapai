import React from 'react';
import { FaFileAlt, FaUpload, FaBrain, FaChartBar } from 'react-icons/fa';
import './HowItWorks.css';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Create Job Listing',
      description: 'Define your job requirements including title, description, and required skills.',
      icon: FaFileAlt
    },
    {
      number: 2,
      title: 'Upload Resumes',
      description: 'Upload candidate resumes in PDF or DOCX format using our drag-and-drop interface.',
      icon: FaUpload
    },
    {
      number: 3,
      title: 'AI Analysis',
      description: 'Our AI engine processes and analyzes resumes using semantic matching algorithms.',
      icon: FaBrain
    },
    {
      number: 4,
      title: 'Get Results',
      description: 'Receive detailed match scores, skill analysis, and actionable feedback for each candidate.',
      icon: FaChartBar
    }
  ];

  return (
    <section className="how-it-works section" id="how-it-works">
      <div className="container">
        <div className="section-header text-center">
          <h2>How TalentMap AI Works</h2>
          <p>Simple, fast, and intelligent resume analysis in four easy steps</p>
        </div>
        
        <div className="steps-container">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="step-item">
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <div className="step-icon">
                    <IconComponent size={32} />
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
                {index < steps.length - 1 && <div className="step-connector" />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;