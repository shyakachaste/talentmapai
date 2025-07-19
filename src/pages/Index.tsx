import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import JobCreation from '@/components/JobCreation';
import ResumeUpload from '@/components/ResumeUpload';
import Results from '@/components/Results';
import { processDocument, calculateMatchScore } from '@/utils/documentProcessor';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Real AI analysis function using document processing
  const analyzeResumes = async (files: File[]): Promise<MatchResult[]> => {
    const skillsArray = jobData?.skills.split(',').map(s => s.trim()) || [];
    const jobDescription = jobData?.description || '';
    const experienceRequired = jobData?.experience || '';
    
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          // Process the actual document content
          const processedDoc = await processDocument(file);
          
          // Calculate real match score based on document analysis
          const matchResult = calculateMatchScore(
            skillsArray,
            processedDoc.extractedSkills,
            experienceRequired,
            processedDoc.experienceLevel,
            jobDescription,
            processedDoc.text
          );
          
          return {
            fileName: file.name,
            score: matchResult.score,
            matchedSkills: matchResult.matchedSkills,
            missingSkills: matchResult.missingSkills,
            feedback: matchResult.feedback
          };
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          
          // Fallback analysis if document processing fails
          return {
            fileName: file.name,
            score: 0,
            matchedSkills: [],
            missingSkills: skillsArray,
            feedback: 'Unable to process document. Please ensure the file is a valid PDF or DOCX document with readable text.'
          };
        }
      })
    );
    
    return results;
  };

  const handleJobCreated = (job: JobData) => {
    setJobData(job);
    setCurrentStep('upload');
  };

  const handleResumesUploaded = async (files: File[]) => {
    setIsAnalyzing(true);
    try {
      const analysisResults = await analyzeResumes(files);
      setResults(analysisResults);
      setCurrentStep('results');
    } catch (error) {
      console.error('Analysis failed:', error);
      // You could add error handling UI here
    } finally {
      setIsAnalyzing(false);
    }
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
          <ResumeUpload onResumesUploaded={handleResumesUploaded} isAnalyzing={isAnalyzing} />
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
