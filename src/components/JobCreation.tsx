import React, { useState } from 'react';
import './JobCreation.css';

interface JobData {
  title: string;
  description: string;
  skills: string;
  experience: string;
  location: string;
}

interface JobCreationProps {
  onJobCreated: (job: JobData) => void;
}

const JobCreation: React.FC<JobCreationProps> = ({ onJobCreated }) => {
  const [jobData, setJobData] = useState<JobData>({
    title: '',
    description: '',
    skills: '',
    experience: '',
    location: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobData.title && jobData.description && jobData.skills) {
      onJobCreated(jobData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section className="job-creation section" id="get-started">
      <div className="container">
        <div className="section-header text-center">
          <h2>Create Job Listing</h2>
          <p>Define your job requirements to start matching candidates</p>
        </div>
        
        <div className="job-form-container">
          <form className="job-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Job Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  placeholder="e.g. Senior Full-Stack Developer"
                  value={jobData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-input"
                  placeholder="e.g. Remote, New York, London"
                  value={jobData.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Job Description *</label>
              <textarea
                id="description"
                name="description"
                className="form-input form-textarea"
                placeholder="Describe the role, responsibilities, and requirements..."
                value={jobData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="skills">Required Skills *</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  className="form-input"
                  placeholder="e.g. Python, React, Node.js, AWS"
                  value={jobData.skills}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="experience">Experience Level</label>
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  className="form-input"
                  placeholder="e.g. 3-5 years, Senior level"
                  value={jobData.experience}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-large">
                Create Job & Start Analysis
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default JobCreation;