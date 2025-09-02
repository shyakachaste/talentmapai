// TalentMap AI Document Processor - Clean Working Version
import * as mammoth from 'mammoth';
// PDF.js static imports for Vite
import { getDocument as pdfjsGetDocument, GlobalWorkerOptions as pdfjsGlobalWorkerOptions } from 'pdfjs-dist';
// Initialize pdf.js worker using Vite-friendly URL
// @ts-ignore - Worker typing not strict here
const __pdfWorkerInstance = new Worker(new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url), { type: 'module' });
// @ts-ignore - pdfjs types
pdfjsGlobalWorkerOptions.workerPort = __pdfWorkerInstance;

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

// Comprehensive Multi-Industry Skill Database
const SKILL_DATABASE = {
  // Technology & Software
  programming: [
    'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'php', 'ruby',
    'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'c', 'dart', 'matlab'
  ],
  frontend: [
    'react', 'vue', 'angular', 'svelte', 'html', 'css', 'sass', 'less',
    'bootstrap', 'tailwind', 'jquery', 'webpack', 'vite'
  ],
  backend: [
    'node.js', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel',
    'rails', 'fastapi', 'nestjs'
  ],
  database: [
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'oracle', 'sqlite', 'firebase'
  ],
  cloud: [
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins'
  ],
  
  // Healthcare & Medical
  healthcare: [
    'medical coding', 'icd-10', 'cpt', 'hipaa', 'electronic health records', 'ehr',
    'patient care', 'medical terminology', 'clinical research', 'pharmaceutical',
    'nursing', 'surgery', 'radiology', 'laboratory', 'pathology', 'cardiology',
    'oncology', 'pediatrics', 'emergency medicine', 'anesthesia', 'pharmacy'
  ],
  
  // Finance & Banking
  finance: [
    'financial analysis', 'accounting', 'bookkeeping', 'budgeting', 'forecasting',
    'risk management', 'compliance', 'audit', 'taxation', 'investment banking',
    'portfolio management', 'trading', 'derivatives', 'forex', 'cryptocurrency',
    'blockchain', 'quickbooks', 'sap', 'excel', 'financial modeling'
  ],
  
  // Marketing & Sales
  marketing: [
    'digital marketing', 'seo', 'sem', 'social media marketing', 'content marketing',
    'email marketing', 'ppc', 'google ads', 'facebook ads', 'linkedin ads',
    'analytics', 'google analytics', 'crm', 'salesforce', 'hubspot',
    'lead generation', 'conversion optimization', 'brand management'
  ],
  
  // Engineering & Manufacturing
  engineering: [
    'mechanical engineering', 'electrical engineering', 'civil engineering',
    'chemical engineering', 'industrial engineering', 'aerospace engineering',
    'autocad', 'solidworks', 'catia', 'ansys', 'matlab', 'plc programming',
    'quality control', 'lean manufacturing', 'six sigma', 'project management'
  ],
  
  // Education & Training
  education: [
    'curriculum development', 'lesson planning', 'classroom management',
    'educational technology', 'online learning', 'e-learning', 'lms',
    'student assessment', 'special education', 'tutoring', 'training design',
    'instructional design', 'adult learning', 'educational research'
  ],
  
  // Legal
  legal: [
    'contract law', 'corporate law', 'litigation', 'legal research',
    'legal writing', 'compliance', 'intellectual property', 'patent law',
    'employment law', 'real estate law', 'criminal law', 'family law',
    'immigration law', 'tax law', 'regulatory affairs'
  ],
  
  // Human Resources
  hr: [
    'recruitment', 'talent acquisition', 'employee relations', 'performance management',
    'compensation', 'benefits administration', 'training and development',
    'hr information systems', 'hris', 'payroll', 'labor relations',
    'diversity and inclusion', 'organizational development'
  ],
  
  // Operations & Logistics
  operations: [
    'supply chain management', 'logistics', 'inventory management',
    'procurement', 'vendor management', 'quality assurance',
    'process improvement', 'operational excellence', 'warehouse management',
    'transportation', 'distribution', 'erp', 'sap'
  ],
  
  // Design & Creative
  design: [
    'graphic design', 'ui/ux design', 'web design', 'product design',
    'photoshop', 'illustrator', 'figma', 'sketch', 'indesign',
    'branding', 'typography', 'color theory', 'user experience',
    'prototyping', 'wireframing', 'animation', 'video editing'
  ],
  
  // Customer Service
  customer_service: [
    'customer support', 'call center', 'help desk', 'technical support',
    'customer relationship management', 'complaint resolution',
    'customer satisfaction', 'communication skills', 'problem solving',
    'zendesk', 'freshdesk', 'intercom'
  ],
  
  // Retail & E-commerce
  retail: [
    'retail management', 'merchandising', 'inventory control',
    'point of sale', 'pos systems', 'e-commerce', 'shopify',
    'amazon marketplace', 'product management', 'pricing strategy',
    'visual merchandising', 'customer experience'
  ],
  
  // Data & Analytics
  data_analytics: [
    'data analysis', 'data science', 'business intelligence', 'statistics',
    'machine learning', 'artificial intelligence', 'tableau', 'power bi',
    'excel', 'sql', 'python', 'r', 'data visualization', 'big data',
    'hadoop', 'spark', 'predictive analytics'
  ]
};

export async function processDocument(file: File): Promise<ProcessedDocument> {
  let text = '';
  
  console.log('📄 Processing document:', file.name, 'Type:', file.type);
  
  if (!file || file.size === 0) {
    throw new Error('File is empty or invalid');
  }
  
  try {
    if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
      console.log('✅ Processing TXT file');
      text = await file.text();
      
      if (text.length === 0) {
        throw new Error('TXT file appears to be empty');
      }
    } 
    else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.toLowerCase().endsWith('.docx')
    ) {
      console.log('✅ Processing DOCX file');
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
        
        if (text.length < 20) {
          throw new Error('DOCX file contains very little text');
        }
      } catch (docError) {
        console.error('❌ DOCX processing failed:', docError);
        throw new Error('Failed to process DOCX file. Try saving as TXT for best results.');
      }
    } 
    else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      console.log('✅ Processing PDF file');
      try {
        text = await extractTextFromPDF(file);
        if (text.length < 20) {
          throw new Error('PDF file contains very little text');
        }
      } catch (pdfError) {
        console.error('❌ PDF processing failed:', pdfError);
        throw new Error('Failed to process PDF file. Please ensure it is a text-based PDF.');
      }
    }
    else {
      throw new Error('Unsupported file format. Please use TXT, DOCX or PDF files.');
    }
    
    if (!text || text.trim().length < 10) {
      throw new Error('No readable text found in the document.');
    }
    
    console.log('✅ Text extraction successful! Length:', text.length);
    
  } catch (error) {
    console.error('❌ Document processing failed:', error);
    throw error;
  }
  
  const result: ProcessedDocument = {
    text,
    extractedSkills: extractSkills(text),
    experienceLevel: extractExperienceLevel(text),
    yearsOfExperience: extractYearsOfExperience(text),
    contactInfo: extractContactInfo(text),
    education: extractEducation(text),
    workExperience: [],
    certifications: [],
    languages: extractLanguages(text),
    achievements: [],
    industries: extractIndustries(text),
    jobTitles: []
  };
  
  console.log('🎯 Processing complete. Skills found:', result.extractedSkills);
  
  return result;
}

// Extract text using pdf.js
async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsGetDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const strings = (textContent.items as any[])
      .map((item: any) => (item && typeof item.str === 'string' ? item.str : ''))
      .filter(Boolean);
    fullText += strings.join(' ') + '\n';
  }
  return fullText;
}

function extractSkills(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const foundSkills: string[] = [];
  
  console.log('🔍 Starting skill extraction...');
  
  if (!text || text.length === 0) {
    console.error('❌ ERROR: Text is empty!');
    return [];
  }
  
  const allSkills = Object.values(SKILL_DATABASE).flat();
  
  allSkills.forEach(skill => {
    const skillVariations = generateSkillVariations(skill);
    
    const found = skillVariations.some(variation => {
      const lowerVariation = variation.toLowerCase().trim();
      
      if (lowerVariation.length <= 1) {
        return false;
      }
      
      return normalizedText.includes(lowerVariation);
    });
    
    if (found) {
      foundSkills.push(skill);
      console.log(`✅ Found skill: ${skill}`);
    }
  });
  
  const uniqueSkills = [...new Set(foundSkills)].sort();
  console.log('🎯 Skills extraction complete. Found:', uniqueSkills.length, 'skills');
  
  return uniqueSkills;
}

function generateSkillVariations(skill: string): string[] {
  const variations = new Set([skill, skill.toLowerCase(), skill.toUpperCase()]);
  
  if (skill.includes('.')) {
    variations.add(skill.replace(/\./g, ''));
  }
  if (skill.includes(' ')) {
    variations.add(skill.replace(/ /g, ''));
    variations.add(skill.replace(/ /g, '-'));
  }
  
  // Comprehensive skill variations for all industries
  const skillMap: { [key: string]: string[] } = {
    // Technology
    'javascript': ['js', 'JS', 'Javascript', 'JavaScript'],
    'typescript': ['ts', 'TS', 'TypeScript'],
    'react': ['reactjs', 'React', 'ReactJS'],
    'node.js': ['nodejs', 'node', 'Node', 'NodeJS'],
    'vue': ['vuejs', 'Vue', 'VueJS'],
    'angular': ['angularjs', 'Angular'],
    'css': ['CSS', 'css3'],
    'html': ['HTML', 'html5'],
    'python': ['Python', 'py'],
    'java': ['Java'],
    'mongodb': ['mongo', 'MongoDB'],
    'postgresql': ['postgres', 'PostgreSQL'],
    'aws': ['AWS', 'Amazon Web Services'],
    'azure': ['Azure', 'Microsoft Azure'],
    'redux': ['Redux'],
    
    // Healthcare
    'electronic health records': ['ehr', 'EHR', 'electronic medical records', 'emr', 'EMR'],
    'medical coding': ['ICD-10', 'CPT', 'medical billing'],
    'patient care': ['bedside manner', 'patient interaction'],
    
    // Finance
    'financial analysis': ['financial modeling', 'financial planning'],
    'quickbooks': ['QuickBooks', 'QB'],
    'excel': ['Microsoft Excel', 'MS Excel', 'spreadsheet'],
    'sap': ['SAP ERP', 'SAP FI'],
    
    // Marketing
    'google analytics': ['GA', 'Google Analytics 4', 'GA4'],
    'facebook ads': ['Meta ads', 'FB ads'],
    'salesforce': ['SFDC', 'CRM'],
    
    // Design
    'photoshop': ['Adobe Photoshop', 'PS'],
    'illustrator': ['Adobe Illustrator', 'AI'],
    'ui/ux design': ['user experience', 'user interface', 'UX/UI'],
    
    // General
    'project management': ['PMP', 'Agile', 'Scrum', 'Kanban'],
    'microsoft office': ['MS Office', 'Office 365'],
    'customer service': ['customer support', 'client relations']
  };
  
  const lowerSkill = skill.toLowerCase();
  if (skillMap[lowerSkill]) {
    skillMap[lowerSkill].forEach(variation => variations.add(variation));
  }
  
  return Array.from(variations);
}

function extractExperienceLevel(text: string): string {
  const normalizedText = text.toLowerCase();
  
  const seniorIndicators = [
    'senior', 'lead', 'principal', 'director', 'manager',
    '8+ years', '10+ years', '7+ years', 'expert'
  ];
  
  if (seniorIndicators.some(indicator => normalizedText.includes(indicator))) {
    return 'senior';
  }
  
  const juniorIndicators = [
    'junior', 'entry-level', 'graduate', 'intern', '0-2 years', '1-3 years',
    'fresher', 'beginner'
  ];
  
  if (juniorIndicators.some(indicator => normalizedText.includes(indicator))) {
    return 'junior';
  }
  
  const yearsMatch = normalizedText.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/);
  if (yearsMatch) {
    const years = parseInt(yearsMatch[1]);
    if (years >= 7) return 'senior';
    if (years >= 3) return 'mid';
    return 'junior';
  }
  
  return 'mid';
}

function extractYearsOfExperience(text: string): number {
  const normalizedText = text.toLowerCase();
  
  const yearPatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/g,
    /experience[:\s]*(\d+)\+?\s*years?/g
  ];
  
  let maxYears = 0;
  
  for (const pattern of yearPatterns) {
    let match;
    while ((match = pattern.exec(normalizedText)) !== null) {
      const years = parseInt(match[1]);
      if (years > maxYears) {
        maxYears = years;
      }
    }
  }
  
  if (maxYears === 0) {
    const experienceLevel = extractExperienceLevel(text);
    switch (experienceLevel) {
      case 'junior': return 1;
      case 'mid': return 4;
      case 'senior': return 8;
      default: return 0;
    }
  }
  
  return maxYears;
}

function extractContactInfo(text: string): { email?: string; phone?: string; linkedin?: string; location?: string } {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const linkedinRegex = /linkedin\.com\/in\/[\w-]+/i;
  
  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);
  const linkedinMatch = text.match(linkedinRegex);
  
  return {
    email: emailMatch?.[0],
    phone: phoneMatch?.[0],
    linkedin: linkedinMatch?.[0],
    location: undefined
  };
}

function extractEducation(text: string): EducationInfo[] {
  const education: EducationInfo[] = [];
  const lines = text.split('\n');
  
  const degreePatterns = [
    /(?:bachelor|ba|bs|b\.s|b\.a)[\s\.]*(?:of\s*)?([^,]+)/gi,
    /(?:master|ma|ms|m\.s|m\.a|mba)[\s\.]*(?:of\s*)?([^,]+)/gi,
    /(?:phd|ph\.d|doctorate)[\s\.]*(?:in\s*)?([^,]+)/gi
  ];
  
  for (const line of lines) {
    for (const pattern of degreePatterns) {
      const match = pattern.exec(line);
      if (match) {
        education.push({
          degree: match[0].trim(),
          field: match[1] ? match[1].trim() : '',
          institution: '',
          year: undefined
        });
      }
    }
  }
  
  return education;
}

function extractLanguages(text: string): string[] {
  const languages: string[] = [];
  const commonLanguages = ['english', 'spanish', 'french', 'german', 'italian'];
  const normalizedText = text.toLowerCase();
  
  for (const language of commonLanguages) {
    if (normalizedText.includes(language)) {
      languages.push(language.charAt(0).toUpperCase() + language.slice(1));
    }
  }
  
  return languages;
}

function extractIndustries(text: string): string[] {
  const industries: string[] = [];
  const industryKeywords = {
    'Technology': ['software', 'tech', 'it', 'startup', 'programming', 'development', 'coding', 'algorithm'],
    'Healthcare': ['healthcare', 'medical', 'hospital', 'clinic', 'pharmaceutical', 'nursing', 'doctor', 'patient', 'surgery', 'radiology'],
    'Finance': ['finance', 'banking', 'investment', 'accounting', 'financial', 'insurance', 'trading', 'portfolio', 'audit'],
    'Education': ['education', 'university', 'school', 'teaching', 'academic', 'research', 'curriculum', 'learning', 'training'],
    'Engineering': ['engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'manufacturing', 'construction', 'design', 'CAD'],
    'Marketing': ['marketing', 'advertising', 'branding', 'social media', 'digital marketing', 'seo', 'campaigns', 'promotion'],
    'Legal': ['legal', 'law', 'attorney', 'lawyer', 'litigation', 'contracts', 'compliance', 'regulatory', 'intellectual property'],
    'Human Resources': ['human resources', 'hr', 'recruitment', 'talent', 'employee', 'hiring', 'benefits', 'payroll', 'training'],
    'Operations': ['operations', 'logistics', 'supply chain', 'procurement', 'inventory', 'quality', 'process improvement'],
    'Sales': ['sales', 'business development', 'account management', 'client relations', 'revenue', 'targets', 'negotiation'],
    'Design': ['design', 'creative', 'graphic design', 'ui/ux', 'visual', 'branding', 'photoshop', 'illustrator'],
    'Customer Service': ['customer service', 'support', 'help desk', 'call center', 'client support', 'customer relations'],
    'Retail': ['retail', 'merchandising', 'e-commerce', 'sales associate', 'store management', 'inventory'],
    'Consulting': ['consulting', 'advisory', 'strategy', 'business analyst', 'management consulting', 'implementation'],
    'Non-Profit': ['non-profit', 'ngo', 'charity', 'social work', 'community', 'volunteer', 'fundraising'],
    'Real Estate': ['real estate', 'property', 'commercial', 'residential', 'leasing', 'property management'],
    'Transportation': ['transportation', 'logistics', 'shipping', 'aviation', 'automotive', 'delivery', 'fleet'],
    'Energy': ['energy', 'oil', 'gas', 'renewable', 'solar', 'wind', 'utilities', 'power generation'],
    'Agriculture': ['agriculture', 'farming', 'crop', 'livestock', 'agricultural', 'food production', 'agribusiness'],
    'Entertainment': ['entertainment', 'media', 'film', 'television', 'music', 'gaming', 'production', 'broadcasting']
  };
  
  const normalizedText = text.toLowerCase();
  
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword)) {
        industries.push(industry);
        break;
      }
    }
  }
  
  return [...new Set(industries)];
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
  console.log('🎯 Calculating match score...');
  
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  
  for (const jobSkill of jobSkills) {
    const found = candidateSkills.some(candidateSkill => 
      candidateSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
      jobSkill.toLowerCase().includes(candidateSkill.toLowerCase()) ||
      areSkillsSimilar(jobSkill.toLowerCase(), candidateSkill.toLowerCase())
    );
    
    if (found) {
      matchedSkills.push(jobSkill);
    } else {
      missingSkills.push(jobSkill);
    }
  }
  
  const skillScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 60 : 60;

  // Years of experience evaluation (up to 25)
  const requiredYears = extractRequiredYears(jobExperience, jobDescription);
  const candidateYears = extractYearsOfExperience(candidateText);
  let experienceScore = 25;
  if (requiredYears > 0) {
    if (candidateYears >= requiredYears) experienceScore = 25;
    else if (candidateYears >= requiredYears - 1) experienceScore = 18;
    else if (candidateYears >= Math.max(0, requiredYears - 3)) experienceScore = 12;
    else experienceScore = 5;
  } else if (jobExperience && candidateExperience) {
    const jobExp = jobExperience.toLowerCase();
    const candExp = candidateExperience.toLowerCase();
    if (jobExp === candExp) experienceScore = 25;
    else if ((jobExp.includes('senior') && candExp === 'mid') || (jobExp.includes('mid') && candExp === 'junior')) experienceScore = 15;
    else experienceScore = 10;
  }

  // Contextual alignment from job description (up to 15)
  const contextScore = calculateContextScore(jobDescription, candidateText, 15);
  const totalScore = Math.max(0, Math.min(100, Math.round(skillScore + experienceScore + contextScore)));
  
  const feedback = generateFeedback(totalScore, matchedSkills, missingSkills, jobExperience, candidateExperience);
  
  console.log('🏁 Match calculation complete. Score:', totalScore);
  
  return {
    score: totalScore,
    matchedSkills,
    missingSkills,
    feedback,
    detailedAnalysis: {
      skillsAnalysis: { matched: matchedSkills, missing: missingSkills },
      experienceAnalysis: { required: requiredYears > 0 ? `${requiredYears}+ years` : jobExperience, candidate: `${candidateYears} years (${candidateExperience})` },
      languageAnalysis: {},
      educationAnalysis: {}
    }
  };
}

function areSkillsSimilar(skill1: string, skill2: string): boolean {
  const synonymMap: { [key: string]: string[] } = {
    // Technology
    'javascript': ['js', 'ecmascript'],
    'typescript': ['ts'],
    'react': ['reactjs'],
    'vue': ['vuejs'],
    'angular': ['angularjs'],
    'node.js': ['nodejs', 'node'],
    'mongodb': ['mongo'],
    'postgresql': ['postgres'],
    'aws': ['amazon web services'],
    
    // Healthcare
    'electronic health records': ['ehr', 'emr', 'electronic medical records'],
    'medical coding': ['icd-10', 'cpt'],
    
    // Finance
    'financial analysis': ['financial modeling'],
    'excel': ['microsoft excel', 'spreadsheet'],
    
    // Marketing
    'digital marketing': ['online marketing', 'internet marketing'],
    'seo': ['search engine optimization'],
    'sem': ['search engine marketing'],
    
    // Design
    'ui/ux': ['user experience', 'user interface'],
    'photoshop': ['adobe photoshop'],
    
    // General
    'project management': ['pmp', 'agile', 'scrum'],
    'customer service': ['customer support', 'client relations']
  };
  
  for (const [key, synonyms] of Object.entries(synonymMap)) {
    if ((skill1.includes(key) || synonyms.some(s => skill1.includes(s))) &&
        (skill2.includes(key) || synonyms.some(s => skill2.includes(s)))) {
      return true;
    }
  }
  
  return false;
}

function extractRequiredYears(jobExperience: string, jobDescription: string): number {
  const text = `${jobExperience || ''} ${jobDescription || ''}`.toLowerCase();
  let maxYears = 0;
  const rangeMatch = text.match(/(\d+)\s*[–-]\s*(\d+)\s*years?/);
  if (rangeMatch) {
    const hi = parseInt(rangeMatch[2]);
    if (!isNaN(hi)) maxYears = Math.max(maxYears, hi);
  }
  const singleRegex = /(at least\s*)?(\d+)\+?\s*years?/g;
  let m: RegExpExecArray | null;
  while ((m = singleRegex.exec(text)) !== null) {
    const yrs = parseInt(m[2]);
    if (!isNaN(yrs) && yrs > maxYears) maxYears = yrs;
  }
  return maxYears;
}

function calculateContextScore(jobDescription: string, candidateText: string, maxPoints: number): number {
  const jd = (jobDescription || '').toLowerCase();
  const ct = (candidateText || '').toLowerCase();
  if (!jd || !ct) return 0;
  const stop = new Set(['and','or','the','a','an','with','to','for','of','in','on','at','by','from','as','is','are','be','this','that','it','you','your','we','our']);
  const words = Array.from(new Set(jd.split(/[^a-z0-9+#.]/i).filter(w => w && w.length > 2 && !stop.has(w))));
  if (words.length === 0) return 0;
  const hits = words.reduce((acc, w) => acc + (ct.includes(w) ? 1 : 0), 0);
  const ratio = hits / Math.min(words.length, 50); // cap influence
  return Math.min(maxPoints, Math.round(maxPoints * ratio));
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
    return `🌟 EXCELLENT MATCH (${score}%): Outstanding candidate with ${skillCount} key skill matches including ${matchedSkills.slice(0, 3).join(', ')}. Experience level aligns well. Highly recommended for immediate interview.`;
  } else if (score >= 70) {
    return `✅ STRONG CANDIDATE (${score}%): Good candidate with ${skillCount} relevant skills. ${missingCount > 0 ? `Development opportunities in ${missingSkills.slice(0, 2).join(' and ')}.` : 'Good technical coverage.'} Recommended for technical interview.`;
  } else if (score >= 50) {
    return `⚠️ POTENTIAL CANDIDATE (${score}%): Basic alignment with ${skillCount > 0 ? matchedSkills.slice(0, 2).join(' and ') : 'core technologies'}. ${missingCount > 0 ? `Key skill gaps in ${missingSkills.slice(0, 3).join(', ')}.` : ''} Consider if learning ability can be demonstrated.`;
  } else {
    return `❌ LIMITED MATCH (${score}%): Significant skill alignment issues. ${skillCount > 0 ? `Some background in ${matchedSkills[0]}.` : 'Major skill development needed.'} Better suited for junior position with training.`;
  }
}
