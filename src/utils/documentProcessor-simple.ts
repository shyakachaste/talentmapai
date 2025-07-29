// TalentMap AI Document Processor - Simple Working Version
import * as mammoth from 'mammoth';

export interface ProcessedDocument {
  text: string;
  extractedSkills: string[];
  experienceLevel: string;
  yearsOfExperience: number;
  contactInfo: {
    email?: string;
    phone?: string;
    linkedin?: string;
    location?: string;
  };
  education: EducationInfo[];
  workExperience: WorkExperience[];
  certifications: string[];
  languages: string[];
  achievements: string[];
  industries: string[];
  jobTitles: string[];
  matchScore?: number;
}

export interface EducationInfo {
  degree: string;
  institution: string;
  year?: string;
  field?: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  responsibilities: string[];
  yearsCalculated?: number;
}

export async function processDocument(file: File): Promise<ProcessedDocument> {
  let text = '';
  
  console.log('📄 Processing document:', file.name);
  
  try {
    if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      text = await file.text();
    } else if (file.name.toLowerCase().endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value;
    } else {
      throw new Error('Unsupported file format. Please use TXT or DOCX files.');
    }
    
    if (!text || text.trim().length < 10) {
      throw new Error('No readable text found in the document.');
    }
    
    const extractedSkills = extractSkills(text);
    
    return {
      text,
      extractedSkills,
      experienceLevel: 'mid',
      yearsOfExperience: 3,
      contactInfo: {},
      education: [],
      workExperience: [],
      certifications: [],
      languages: [],
      achievements: [],
      industries: [],
      jobTitles: []
    };
    
  } catch (error) {
    console.error('❌ Document processing failed:', error);
    throw error;
  }
}

function extractSkills(text: string): string[] {
  const skills = [
    'javascript', 'typescript', 'python', 'java', 'react', 'vue', 'angular',
    'node.js', 'express', 'html', 'css', 'sql', 'mongodb', 'postgresql',
    'aws', 'azure', 'docker', 'kubernetes'
  ];
  
  const normalizedText = text.toLowerCase();
  const foundSkills: string[] = [];
  
  skills.forEach(skill => {
    if (normalizedText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  return foundSkills;
}

export function calculateMatchScore(
  jobSkills: string[],
  candidateSkills: string[],
  jobExperience: string,
  candidateExperience: string,
  jobDescription: string,
  candidateText: string
): {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  feedback: string;
  detailedAnalysis: any;
} {
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  
  for (const jobSkill of jobSkills) {
    const found = candidateSkills.some(candidateSkill => 
      candidateSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
      jobSkill.toLowerCase().includes(candidateSkill.toLowerCase())
    );
    
    if (found) {
      matchedSkills.push(jobSkill);
    } else {
      missingSkills.push(jobSkill);
    }
  }
  
  const score = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 85;
  
  let feedback = '';
  if (score >= 80) {
    feedback = `🌟 EXCELLENT MATCH (${score}%): Great candidate with strong skill alignment!`;
  } else if (score >= 60) {
    feedback = `✅ GOOD MATCH (${score}%): Solid candidate with relevant skills.`;
  } else {
    feedback = `⚠️ PARTIAL MATCH (${score}%): Some relevant skills, needs development.`;
  }
  
  return {
    score,
    matchedSkills,
    missingSkills,
    feedback,
    detailedAnalysis: {
      skillsAnalysis: { matched: matchedSkills, missing: missingSkills },
      experienceAnalysis: { required: jobExperience, candidate: candidateExperience },
      languageAnalysis: {},
      educationAnalysis: {}
    }
  };
}
