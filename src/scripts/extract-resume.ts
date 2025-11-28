import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

async function extractPDFText(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

async function extractDOCXText(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  experience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string[];
    achievements?: string[];
  }>;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    date: string;
    details?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

function parseResumeText(text: string): ResumeData {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Initialize resume data structure
  const resume: ResumeData = {
    personalInfo: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
    },
    experience: [],
    skills: [],
    education: [],
    projects: [],
  };

  let currentSection = '';
  let currentExperience: any = null;
  let currentEducation: any = null;
  let currentProject: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Detect sections
    if (line.includes('experience') || line.includes('work experience') || line.includes('employment')) {
      currentSection = 'experience';
      continue;
    }
    if (line.includes('education') || line.includes('academic')) {
      currentSection = 'education';
      continue;
    }
    if (line.includes('skill') || line.includes('technical skill') || line.includes('technologies')) {
      currentSection = 'skills';
      continue;
    }
    if (line.includes('project') || line.includes('portfolio')) {
      currentSection = 'projects';
      continue;
    }

    // Extract personal info (usually at the top)
    if (i < 10) {
      // Email
      const emailMatch = lines[i].match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch && !resume.personalInfo.email) {
        resume.personalInfo.email = emailMatch[0];
      }
      
      // Phone
      const phoneMatch = lines[i].match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      if (phoneMatch && !resume.personalInfo.phone) {
        resume.personalInfo.phone = phoneMatch[0];
      }
      
      // LinkedIn
      if (lines[i].includes('linkedin.com') || lines[i].includes('linkedin')) {
        const linkedinMatch = lines[i].match(/linkedin\.com\/in\/[\w-]+/i) || lines[i].match(/linkedin[:\s]+([^\s]+)/i);
        if (linkedinMatch) {
          resume.personalInfo.linkedin = linkedinMatch[0].replace(/linkedin[:\s]+/i, '');
        }
      }
      
      // GitHub
      if (lines[i].includes('github.com') || lines[i].includes('github')) {
        const githubMatch = lines[i].match(/github\.com\/[\w-]+/i) || lines[i].match(/github[:\s]+([^\s]+)/i);
        if (githubMatch) {
          resume.personalInfo.github = githubMatch[0].replace(/github[:\s]+/i, '');
        }
      }
      
      // Name (usually first line if it's capitalized and not email/phone)
      if (i === 0 && !emailMatch && !phoneMatch && lines[i].length > 2 && lines[i].length < 50) {
        resume.personalInfo.name = lines[i];
      }
      
      // Title (usually second line if it's not contact info)
      if (i === 1 && !emailMatch && !phoneMatch && !lines[i].includes('@') && !lines[i].includes('linkedin') && !lines[i].includes('github')) {
        resume.personalInfo.title = lines[i];
      }
    }

    // Parse experience
    if (currentSection === 'experience') {
      // Check if this line starts a new experience entry (has dates or company name pattern)
      const datePattern = /(\d{4}|\w+\s+\d{4}|\w+\s+\d{4}\s*[-–—]\s*(\w+\s+\d{4}|present|current))/i;
      if (datePattern.test(lines[i]) && lines[i].length < 100) {
        if (currentExperience) {
          resume.experience.push(currentExperience);
        }
        currentExperience = {
          company: '',
          role: '',
          startDate: '',
          endDate: '',
          description: [],
          achievements: [],
        };
        
        const dates = lines[i].match(datePattern);
        if (dates) {
          const dateRange = dates[0].split(/[-–—]/).map(d => d.trim());
          currentExperience.startDate = dateRange[0] || '';
          currentExperience.endDate = dateRange[1] || 'Present';
        }
        
        // Previous line might be role/company
        if (i > 0 && lines[i-1].length < 100) {
          if (!currentExperience.role) {
            currentExperience.role = lines[i-1];
          } else if (!currentExperience.company) {
            currentExperience.company = lines[i-1];
          }
        }
      } else if (currentExperience && lines[i].length > 10) {
        if (lines[i].startsWith('•') || lines[i].startsWith('-') || lines[i].match(/^\d+\./)) {
          currentExperience.description.push(lines[i].replace(/^[•\-\d.\s]+/, ''));
        } else if (!currentExperience.role && lines[i].length < 100) {
          currentExperience.role = lines[i];
        } else if (!currentExperience.company && lines[i].length < 100) {
          currentExperience.company = lines[i];
        }
      }
    }

    // Parse skills
    if (currentSection === 'skills') {
      const skillLine = lines[i].replace(/[•\-\d.\s]+/, '').trim();
      if (skillLine.length > 0 && skillLine.length < 100) {
        // Split by common delimiters
        const skills = skillLine.split(/[,;|]/).map(s => s.trim()).filter(s => s.length > 0);
        resume.skills.push(...skills);
      }
    }

    // Parse education
    if (currentSection === 'education') {
      const datePattern = /(\d{4}|\w+\s+\d{4})/i;
      if (datePattern.test(lines[i])) {
        if (currentEducation) {
          resume.education.push(currentEducation);
        }
        currentEducation = {
          degree: '',
          institution: '',
          date: '',
        };
        const dateMatch = lines[i].match(datePattern);
        if (dateMatch) {
          currentEducation.date = dateMatch[0];
        }
        if (i > 0) {
          currentEducation.degree = lines[i-1];
        }
      } else if (currentEducation && lines[i].length < 100) {
        if (!currentEducation.institution) {
          currentEducation.institution = lines[i];
        } else if (!currentEducation.degree) {
          currentEducation.degree = lines[i];
        }
      }
    }

    // Parse projects
    if (currentSection === 'projects') {
      if (lines[i].length < 100 && !lines[i].includes('•') && !lines[i].includes('-')) {
        if (currentProject) {
          resume.projects!.push(currentProject);
        }
        currentProject = {
          name: lines[i],
          description: '',
          technologies: [],
        };
      } else if (currentProject) {
        if (lines[i].startsWith('•') || lines[i].startsWith('-')) {
          currentProject.description = lines[i].replace(/^[•\-\s]+/, '');
        } else if (lines[i].includes('http') || lines[i].includes('github')) {
          currentProject.link = lines[i];
        } else if (lines[i].length < 50) {
          currentProject.technologies.push(lines[i]);
        }
      }
    }
  }

  // Push last items
  if (currentExperience) {
    resume.experience.push(currentExperience);
  }
  if (currentEducation) {
    resume.education.push(currentEducation);
  }
  if (currentProject) {
    resume.projects!.push(currentProject);
  }

  // Clean up and set defaults
  if (!resume.personalInfo.name) {
    resume.personalInfo.name = 'Your Name';
  }
  if (!resume.personalInfo.title) {
    resume.personalInfo.title = 'Software Developer';
  }
  if (!resume.personalInfo.location) {
    resume.personalInfo.location = '';
  }

  return resume;
}

async function main() {
  const pdfPath = path.join(rootDir, 'public', 'resume.pdf');
  const docxPath = path.join(rootDir, 'public', 'resume.docx');
  const outputPath = path.join(rootDir, 'src', 'data', 'resume.ts');

  let resumeText = '';
  let resumeData: ResumeData;

  // Try to parse DOCX first (usually more structured), fallback to PDF
  try {
    if (fs.existsSync(docxPath)) {
      console.log('Parsing DOCX resume...');
      resumeText = await extractDOCXText(docxPath);
    } else if (fs.existsSync(pdfPath)) {
      console.log('Parsing PDF resume...');
      resumeText = await extractPDFText(pdfPath);
    } else {
      throw new Error('No resume file found');
    }
  } catch (error) {
    console.error('Error parsing resume:', error);
    // Create default structure
    resumeData = {
      personalInfo: {
        name: 'Your Name',
        title: 'Software Developer',
        email: 'your.email@example.com',
        phone: '',
        location: '',
      },
      experience: [],
      skills: [],
      education: [],
      projects: [],
    };
  }

  if (resumeText) {
    console.log('Extracting structured data from resume...');
    resumeData = parseResumeText(resumeText);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate TypeScript file
  const tsContent = `// Auto-generated from resume files
// Run "npm run extract-resume" to regenerate

export interface ResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  experience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string[];
    achievements?: string[];
  }>;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    date: string;
    details?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

export const resumeData: ResumeData = ${JSON.stringify(resumeData, null, 2)};
`;

  fs.writeFileSync(outputPath, tsContent);
  console.log(`Resume data extracted to ${outputPath}`);
  console.log(`Found: ${resumeData.personalInfo.name} - ${resumeData.personalInfo.title}`);
  console.log(`Experience entries: ${resumeData.experience.length}`);
  console.log(`Skills: ${resumeData.skills.length}`);
  console.log(`Education entries: ${resumeData.education.length}`);
}

main().catch(console.error);

