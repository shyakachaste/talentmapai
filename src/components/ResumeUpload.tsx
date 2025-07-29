import React, { useState, useRef } from 'react';
import { FaUpload, FaFileAlt } from 'react-icons/fa';
import './ResumeUpload.css';

interface ResumeUploadProps {
  onResumesUploaded: (files: File[]) => void;
  isAnalyzing?: boolean;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onResumesUploaded, isAnalyzing = false }) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files).filter(file => {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];
      const validExtensions = ['.docx', '.doc', '.txt'];
      const fileName = file.name.toLowerCase();
      
      // Check both MIME type and file extension for better compatibility
      return validTypes.includes(file.type) || 
             validExtensions.some(ext => fileName.endsWith(ext));
    });
    
    // Show warning for rejected files
    const rejectedFiles = Array.from(files).filter(file => {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];
      const validExtensions = ['.docx', '.doc', '.txt'];
      const fileName = file.name.toLowerCase();
      
      return !validTypes.includes(file.type) && 
             !validExtensions.some(ext => fileName.endsWith(ext));
    });
    
    if (rejectedFiles.length > 0) {
      alert(`⚠️ Unsupported file format(s): ${rejectedFiles.map(f => f.name).join(', ')}

✅ SUPPORTED FORMATS:
• TXT files (.txt) - RECOMMENDED for best results
• DOCX files (.docx)
• DOC files (.doc)

💡 TIP: Save your resume as a TXT file for guaranteed compatibility!`);
    }
    
    setUploadedFiles(prev => [...prev, ...fileArray]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeResumes = () => {
    if (uploadedFiles.length > 0) {
      onResumesUploaded(uploadedFiles);
    }
  };

  return (
    <section className="resume-upload section">
      <div className="container">
        <div className="section-header text-center">
          <h2>Upload Resumes</h2>
          <p>Upload candidate resumes to analyze against your job requirements</p>
        </div>

        <div className="upload-container">
          <div 
            className={`upload-area ${isDragOver ? 'dragover' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <div className="upload-icon">
              <FaUpload size={48} />
            </div>
            <h3>Drag & Drop Resumes Here</h3>
            <p>or click to browse files</p>
            <div className="supported-formats">
              Supports TXT (recommended), DOCX, and DOC files
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain"
              onChange={(e) => handleFileSelect(e.target.files)}
              style={{ display: 'none' }}
            />
          </div>

          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              <h4>Uploaded Files ({uploadedFiles.length})</h4>
              <div className="file-list">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="file-item">
                    <div className="file-info">
                      <FaFileAlt size={16} style={{ marginRight: '8px', color: 'var(--primary-blue)' }} />
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="upload-actions">
                <button 
                  className="btn btn-primary btn-large"
                  onClick={analyzeResumes}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <span style={{ marginRight: '8px' }}>🔄</span>
                      Analyzing {uploadedFiles.length} Resume{uploadedFiles.length > 1 ? 's' : ''}...
                    </>
                  ) : (
                    <>Analyze {uploadedFiles.length} Resume{uploadedFiles.length > 1 ? 's' : ''}</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResumeUpload;