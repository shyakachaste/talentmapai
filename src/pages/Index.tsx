import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import JobCreation from '@/components/JobCreation';
import ResumeUpload from '@/components/ResumeUpload';
import Results from '@/components/Results';

interface JobData {
  title: string;
  description: string;
  skills: string;
  experience: string;
  location: string;
}

interface MatchResult {
  fileName: string;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  feedback: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'job' | 'upload' | 'results'>('job');
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [results, setResults] = useState<MatchResult[]>([]);

  // Enhanced AI analysis function
  const analyzeResumes = (files: File[]): MatchResult[] => {
    const skillsArray = jobData?.skills.split(',').map(s => s.trim().toLowerCase()) || [];
    const jobDescription = jobData?.description.toLowerCase() || '';
    const experienceRequired = jobData?.experience.toLowerCase() || '';
    
    return files.map(file => {
      // Simulate more sophisticated analysis
      const fileName = file.name.toLowerCase();
      
      // Base score calculation
      let score = 50;
      
      // Skill matching simulation (more realistic)
      const commonTechSkills = ['javascript', 'python', 'react', 'node', 'sql', 'aws', 'docker', 'git'];
      const advancedSkills = ['machine learning', 'ai', 'blockchain', 'microservices', 'kubernetes'];
      
      let matchedSkills: string[] = [];
      let missingSkills: string[] = [];
      
      skillsArray.forEach(skill => {
        // Simulate skill detection with some randomness for realism
        const hasSkill = Math.random() > 0.3; // 70% chance of having each skill
        
        if (hasSkill) {
          matchedSkills.push(skill);
          score += 8; // Each matched skill adds points
        } else {
          missingSkills.push(skill);
        }
      });
      
      // Experience level matching
      if (experienceRequired.includes('senior') || experienceRequired.includes('lead')) {
        score += Math.random() > 0.6 ? 15 : -10; // Senior roles are harder to match
      } else if (experienceRequired.includes('junior') || experienceRequired.includes('entry')) {
        score += Math.random() > 0.4 ? 10 : 0;
      }
      
      // File name hints (simulate resume parsing)
      if (fileName.includes('senior') || fileName.includes('lead')) score += 5;
      if (fileName.includes('developer') || fileName.includes('engineer')) score += 3;
      
      // Ensure realistic score range
      score = Math.min(95, Math.max(35, score + (Math.random() * 20 - 10)));
      score = Math.round(score);
      
      // Generate contextual feedback
      let feedback = '';
      if (score >= 85) {
        feedback = `Outstanding candidate profile. Demonstrates exceptional alignment with ${jobData?.title} requirements. Strong technical competencies in ${matchedSkills.slice(0, 3).join(', ')} with proven experience. ${missingSkills.length > 0 ? `Consider evaluating ${missingSkills[0]} during interview.` : 'Complete skill set match.'} Highly recommended for immediate interview.`;
      } else if (score >= 75) {
        feedback = `Excellent match with solid foundation in required technologies. Strong candidate showing ${matchedSkills.length} key skill matches including ${matchedSkills.slice(0, 2).join(' and ')}. ${missingSkills.length > 0 ? `Some development needed in ${missingSkills.slice(0, 2).join(' and ')}.` : ''} Recommended for technical interview to validate expertise.`;
      } else if (score >= 60) {
        feedback = `Good potential candidate with relevant background. Shows competency in ${matchedSkills.length} core areas. ${missingSkills.length > 0 ? `Skill gaps identified in ${missingSkills.slice(0, 2).join(' and ')} may require training or mentorship.` : ''} Consider for interview if willing to learn and grow.`;
      } else {
        feedback = `Candidate shows limited alignment with current requirements. While ${matchedSkills.length > 0 ? `some relevant skills (${matchedSkills[0]}) are present` : 'basic qualifications may exist'}, significant skill development needed in ${missingSkills.slice(0, 3).join(', ')}. May be suitable for junior role with extensive training program.`;
      }

      return {
        fileName: file.name,
        score,
        matchedSkills,
        missingSkills,
        feedback
      };
    });
  };

  const handleJobCreated = (job: JobData) => {
    setJobData(job);
    setCurrentStep('upload');
  };

  const handleResumesUploaded = (files: File[]) => {
    const analysisResults = analyzeResumes(files);
    setResults(analysisResults);
    setCurrentStep('results');
  };

  const resetAnalysis = () => {
    setCurrentStep('job');
    setJobData(null);
    setResults([]);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      {currentStep === 'job' && (
        <>
          <Hero />
          <Features />
          <HowItWorks />
          <JobCreation onJobCreated={handleJobCreated} />
        </>
      )}
      
      {currentStep === 'upload' && jobData && (
        <>
          <div style={{ padding: 'var(--spacing-8) 0', background: 'var(--gray-50)' }}>
            <div className="container">
              <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
                <h2>Job Created: {jobData.title}</h2>
                <button 
                  className="btn btn-secondary"
                  onClick={resetAnalysis}
                  style={{ marginTop: 'var(--spacing-4)' }}
                >
                  Create New Job
                </button>
              </div>
            </div>
          </div>
          <ResumeUpload onResumesUploaded={handleResumesUploaded} />
        </>
      )}
      
      {currentStep === 'results' && jobData && (
        <>
          <div style={{ padding: 'var(--spacing-8) 0', background: 'var(--white)' }}>
            <div className="container" style={{ textAlign: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={resetAnalysis}
              >
                Start New Analysis
              </button>
            </div>
          </div>
          <Results results={results} jobTitle={jobData.title} />
        </>
      )}
      
      <Footer />
    </div>
  );
};

export default Index;
