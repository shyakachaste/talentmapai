import * as pdfjsLib from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import * as mammoth from 'mammoth';
import { validateFileUpload, sanitizeText, handleSecureError } from '../config/security';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ProcessedDocument {
  text: string;
  extractedSkills: string[];
  experienceLevel: string;
  contactInfo: {
    email?: string;
    phone?: string;
  };
}

// Comprehensive skill database
const SKILL_DATABASE = {
  programming: [
    'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'php', 'ruby',
    'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'lua'
  ],
  frontend: [
    'react', 'vue', 'angular', 'svelte', 'html', 'css', 'sass', 'less',
    'bootstrap', 'tailwind', 'jquery', 'webpack', 'vite', 'parcel'
  ],
  backend: [
    'node.js', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel',
    'rails', 'fastapi', 'nestjs', 'koa', 'hapi'
  ],
  database: [
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'oracle', 'sqlite', 'cassandra', 'dynamodb', 'firebase'
  ],
  cloud: [
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins',
    'gitlab ci', 'github actions', 'circleci', 'travis ci'
  ],
  tools: [
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack',
    'figma', 'adobe', 'postman', 'insomnia', 'vscode', 'intellij'
  ],
  frameworks: [
    'spring boot', 'django rest', 'express.js', 'next.js', 'nuxt.js',
    'gatsby', 'redux', 'mobx', 'vuex', 'pinia'
  ],
  methodologies: [
    'agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd', 'bdd',
    'microservices', 'rest api', 'graphql', 'soap'
  ]
};

// Experience level indicators
const EXPERIENCE_INDICATORS = {
  senior: ['senior', 'lead', 'principal', 'architect', 'head of', 'director', 'manager', '8+ years', '10+ years'],
  mid: ['mid-level', 'intermediate', '3-5 years', '4-6 years', '5-7 years', 'experienced'],
  junior: ['junior', 'entry-level', 'graduate', 'intern', '0-2 years', '1-3 years', 'fresher', 'new grad']
};

export async function processDocument(file: File): Promise<ProcessedDocument> {
  // Security validation
  const validation = validateFileUpload(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  let text = '';
  
  try {
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Security: Limit number of pages to prevent DoS
      const maxPages = Math.min(pdf.numPages, 50);
      
      // Extract text from all pages
      const textPromises = [];
      for (let i = 1; i <= maxPages; i++) {
        textPromises.push(
          pdf.getPage(i).then(page => page.getTextContent()).then(textContent => 
            textContent.items
              .filter((item): item is TextItem => 'str' in item)
              .map(item => item.str)
              .join(' ')
          )
        );
      }
      
      const pageTexts = await Promise.all(textPromises);
      text = pageTexts.join('\n');
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value;
    } else {
      throw new Error('Unsupported file type');
    }

    // Security: Sanitize extracted text
    text = sanitizeText(text);
    
  } catch (error) {
    handleSecureError(error, 'document processing');
    // Secure fallback - don't expose file content in error case
    text = '';
  }

  return {
    text,
    extractedSkills: extractSkills(text),
    experienceLevel: extractExperienceLevel(text),
    contactInfo: extractContactInfo(text)
  };
}

function extractSkills(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const foundSkills: string[] = [];
  
  // Check all skill categories
  Object.values(SKILL_DATABASE).flat().forEach(skill => {
    const skillVariations = generateSkillVariations(skill);
    
    if (skillVariations.some(variation => normalizedText.includes(variation))) {
      foundSkills.push(skill);
    }
  });
  
  // Remove duplicates and return
  return [...new Set(foundSkills)];
}

function generateSkillVariations(skill: string): string[] {
  const variations = [skill];
  
  // Add common variations
  if (skill.includes('.')) {
    variations.push(skill.replace(/\./g, ''));
  }
  if (skill.includes(' ')) {
    variations.push(skill.replace(/ /g, ''));
    variations.push(skill.replace(/ /g, '-'));
  }
  if (skill.includes('-')) {
    variations.push(skill.replace(/-/g, ' '));
    variations.push(skill.replace(/-/g, ''));
  }
  
  // Add specific common variations
  const skillMap: { [key: string]: string[] } = {
    'javascript': ['js', 'ecmascript'],
    'typescript': ['ts'],
    'node.js': ['nodejs', 'node'],
    'react': ['reactjs', 'react.js'],
    'vue': ['vuejs', 'vue.js'],
    'angular': ['angularjs'],
    'mongodb': ['mongo'],
    'postgresql': ['postgres'],
    'aws': ['amazon web services'],
    'gcp': ['google cloud platform', 'google cloud'],
    'azure': ['microsoft azure']
  };
  
  if (skillMap[skill]) {
    variations.push(...skillMap[skill]);
  }
  
  return variations;
}

function extractExperienceLevel(text: string): string {
  const normalizedText = text.toLowerCase();
  
  // Check for senior indicators
  if (EXPERIENCE_INDICATORS.senior.some(indicator => normalizedText.includes(indicator))) {
    return 'senior';
  }
  
  // Check for junior indicators
  if (EXPERIENCE_INDICATORS.junior.some(indicator => normalizedText.includes(indicator))) {
    return 'junior';
  }
  
  // Check for mid-level indicators
  if (EXPERIENCE_INDICATORS.mid.some(indicator => normalizedText.includes(indicator))) {
    return 'mid';
  }
  
  // Check for years of experience patterns
  const yearsMatch = normalizedText.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1]);
    if (years >= 7) return 'senior';
    if (years >= 3) return 'mid';
    return 'junior';
  }
  
  return 'mid'; // Default to mid-level if unclear
}

function extractContactInfo(text: string): { email?: string; phone?: string } {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  
  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);
  
  return {
    email: emailMatch?.[0],
    phone: phoneMatch?.[0]
  };
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
} {
  const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase().trim());
  const normalizedCandidateSkills = candidateSkills.map(skill => skill.toLowerCase());
  
  // Find matched and missing skills
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  
  normalizedJobSkills.forEach(jobSkill => {
    const isMatched = normalizedCandidateSkills.some(candidateSkill => 
      candidateSkill.includes(jobSkill) || jobSkill.includes(candidateSkill) ||
      areSkillsSimilar(jobSkill, candidateSkill)
    );
    
    if (isMatched) {
      matchedSkills.push(jobSkill);
    } else {
      missingSkills.push(jobSkill);
    }
  });
  
  // Calculate base score from skill matching
  const skillMatchRatio = normalizedJobSkills.length > 0 ? matchedSkills.length / normalizedJobSkills.length : 0;
  let score = skillMatchRatio * 70; // Base 70 points for skills
  
  // Experience level matching
  const experienceScore = calculateExperienceScore(jobExperience, candidateExperience);
  score += experienceScore;
  
  // Context matching from job description
  const contextScore = calculateContextScore(jobDescription, candidateText);
  score += contextScore;
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Generate feedback
  const feedback = generateFeedback(score, matchedSkills, missingSkills, jobExperience, candidateExperience);
  
  return {
    score,
    matchedSkills,
    missingSkills,
    feedback
  };
}

function areSkillsSimilar(skill1: string, skill2: string): boolean {
  // Check for common skill synonyms and variations
  const synonymMap: { [key: string]: string[] } = {
    'javascript': ['js', 'ecmascript'],
    'typescript': ['ts'],
    'python': ['py'],
    'react': ['reactjs'],
    'vue': ['vuejs'],
    'angular': ['angularjs'],
    'node': ['nodejs'],
    'mongodb': ['mongo'],
    'postgresql': ['postgres'],
    'aws': ['amazon web services'],
    'gcp': ['google cloud'],
    'css': ['stylesheets'],
    'html': ['markup']
  };
  
  for (const [key, synonyms] of Object.entries(synonymMap)) {
    if ((skill1.includes(key) || synonyms.some(s => skill1.includes(s))) &&
        (skill2.includes(key) || synonyms.some(s => skill2.includes(s)))) {
      return true;
    }
  }
  
  return false;
}

function calculateExperienceScore(jobExperience: string, candidateExperience: string): number {
  const jobExp = jobExperience.toLowerCase();
  const candidateExp = candidateExperience.toLowerCase();
  
  if (jobExp.includes('senior') || jobExp.includes('lead')) {
    if (candidateExp === 'senior') return 20;
    if (candidateExp === 'mid') return 10;
    return 0;
  }
  
  if (jobExp.includes('mid') || jobExp.includes('intermediate')) {
    if (candidateExp === 'mid') return 20;
    if (candidateExp === 'senior') return 15; // Overqualified but good
    if (candidateExp === 'junior') return 5;
    return 10;
  }
  
  if (jobExp.includes('junior') || jobExp.includes('entry')) {
    if (candidateExp === 'junior') return 20;
    if (candidateExp === 'mid') return 15;
    if (candidateExp === 'senior') return 10; // Overqualified
    return 15;
  }
  
  return 10; // Default score if experience levels are unclear
}

function calculateContextScore(jobDescription: string, candidateText: string): number {
  const jobWords = jobDescription.toLowerCase().split(/\s+/);
  const candidateWords = candidateText.toLowerCase().split(/\s+/);
  
  // Find common meaningful words (excluding common words)
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'around'];
  
  const meaningfulJobWords = jobWords.filter(word => 
    word.length > 3 && !commonWords.includes(word)
  );
  
  let matches = 0;
  meaningfulJobWords.forEach(word => {
    if (candidateWords.includes(word)) {
      matches++;
    }
  });
  
  // Return up to 10 points for context matching
  return Math.min(10, (matches / Math.max(1, meaningfulJobWords.length)) * 10);
}

function generateFeedback(
  score: number,
  matchedSkills: string[],
  missingSkills: string[],
  jobExperience: string,
  candidateExperience: string
): string {
  const skillCount = matchedSkills.length;
  const missingCount = missingSkills.length;
  
  if (score >= 85) {
    return `Outstanding candidate with ${skillCount} key skill matches including ${matchedSkills.slice(0, 3).join(', ')}. ${candidateExperience === 'senior' ? 'Senior-level experience aligns perfectly with requirements.' : 'Strong technical foundation demonstrated.'} ${missingCount > 0 ? `Minor gaps in ${missingSkills.slice(0, 2).join(' and ')} can be addressed through brief training.` : 'Complete skill alignment achieved.'} Highly recommended for immediate interview.`;
  } else if (score >= 70) {
    return `Strong candidate showing ${skillCount} relevant skill matches in ${matchedSkills.slice(0, 2).join(' and ')}. ${candidateExperience === jobExperience.toLowerCase() ? 'Experience level matches requirements.' : 'Experience level shows potential for growth.'} ${missingCount > 0 ? `Development opportunities identified in ${missingSkills.slice(0, 2).join(' and ')}.` : 'Good technical coverage.'} Recommended for technical interview.`;
  } else if (score >= 50) {
    return `Promising candidate with foundational skills in ${skillCount > 0 ? matchedSkills.slice(0, 2).join(' and ') : 'core technologies'}. ${missingCount > 0 ? `Key skill gaps in ${missingSkills.slice(0, 3).join(', ')} would require training and mentorship.` : 'Basic requirements met.'} Consider for interview if growth mindset and learning ability can be demonstrated.`;
  } else {
    return `Limited alignment with current requirements. ${skillCount > 0 ? `Some relevant background in ${matchedSkills[0]}.` : 'Significant skill development needed.'} ${missingCount > 0 ? `Critical gaps in ${missingSkills.slice(0, 3).join(', ')} make this role challenging.` : ''} May be better suited for junior position with comprehensive training program.`;
  }
}
