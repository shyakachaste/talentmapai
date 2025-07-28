// Security configuration for build process
export const securityConfig = {
  // Content Security Policy configuration
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },

  // Security headers for production
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), screen-wake-lock=()',
    'Cross-Origin-Embedder-Policy': 'credentialless',
    'Cross-Origin-Opener-Policy': 'same-origin',
  },

  // File upload security
  upload: {
    allowedTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    scanForMalware: false, // Client-side only, no server scanning needed
  },

  // Privacy settings
  privacy: {
    collectAnalytics: false,
    trackUsers: false,
    storeData: false,
    transmitData: false,
    gdprCompliant: true,
  },

  // Development security
  development: {
    sourceMapInProduction: false,
    consoleInProduction: false,
    debuggerInProduction: false,
    errorReportingDetailed: false,
  },
};

// Validate file upload security
export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  if (!securityConfig.upload.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed. Only PDF and DOCX files are supported.',
    };
  }

  if (file.size > securityConfig.upload.maxFileSize) {
    return {
      valid: false,
      error: 'File size exceeds maximum limit of 10MB.',
    };
  }

  return { valid: true };
};

// Sanitize text input to prevent XSS
export const sanitizeText = (text: string): string => {
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 50000); // Limit text length
};

// Secure error handling
export const handleSecureError = (error: unknown, context: string): void => {
  // Log error without exposing sensitive information
  console.error(`Error in ${context}:`, error instanceof Error ? error.message : 'Unknown error');
  
  // In production, don't expose stack traces
  if (process.env.NODE_ENV === 'production' && error instanceof Error) {
    delete error.stack;
  }
};

export default securityConfig;
