import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { parseCSVContent } from "./csvParser";
import { generateCandidatesPDF, generateCustomersPDF, generateFormSubmissionsPDF } from "./pdfGenerator";
import { randomUUID } from "crypto";
import { candidateEvaluationSchema, customerServiceSchema, formStaffSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import passport from "passport";
import { transformCandidateRecords } from "./utils/transformCandidate";
import { transformCustomerRecords } from "./utils/transformCustomer";
import * as XLSX from "xlsx";
import { readFileSync } from "fs";
import { resolve } from "path";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

const uploadExcel = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    const allowedExtensions = ['.xlsx', '.xls'];
    const hasValidMime = allowedMimes.includes(file.mimetype);
    const hasValidExtension = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    
    if (hasValidMime || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  },
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized - Please login" });
}

interface AppConfig {
  apiBearerToken: string;
  n8nApiUrl: string;
}

function loadConfig(): AppConfig {
  const envToken = process.env.API_BEARER_TOKEN;
  const envN8nUrl = process.env.N8N_API_URL;
  
  if (envToken && envN8nUrl) {
    return {
      apiBearerToken: envToken,
      n8nApiUrl: envN8nUrl
    };
  }
  
  try {
    const configPath = resolve(process.cwd(), 'config.json');
    const configFile = readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configFile);
    
    if (!config.apiBearerToken) {
      throw new Error("apiBearerToken is not set in config.json or API_BEARER_TOKEN environment variable");
    }
    if (!config.n8nApiUrl) {
      throw new Error("n8nApiUrl is not set in config.json or N8N_API_URL environment variable");
    }
    
    return config;
  } catch (error) {
    console.error("Failed to load configuration from environment variables or config.json:", error);
    throw error;
  }
}

function requireBearerAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized - Bearer token required" });
  }
  
  const token = authHeader.substring(7);
  
  let expectedToken: string;
  try {
    const config = loadConfig();
    expectedToken = config.apiBearerToken;
  } catch (error) {
    console.error("Failed to read config.json:", error);
    return res.status(500).json({ error: "Server configuration error - config.json not found or invalid" });
  }
  
  if (token !== expectedToken) {
    return res.status(401).json({ error: "Unauthorized - Invalid bearer token" });
  }
  
  next();
}

type LocationType = "baltimore" | "pittsburgh";
type RecruitmentType = "call" | "text" | "form" | "customerCall";

function getRecruitmentTableName(location: LocationType, type: RecruitmentType): string {
  const locationCapitalized = location.charAt(0).toUpperCase() + location.slice(1);
  
  const tableMap: Record<RecruitmentType, string> = {
    call: `Dev-Bsc-${locationCapitalized}-Staff-Inbound-Call-Recruitment`,
    text: `Dev-Bsc-${locationCapitalized}-Staff-Inbound-Text-Recruitment`,
    form: `Dev-BSC-${locationCapitalized}-Staff-Inbound-Form-Recruitment`,
    customerCall: `Dev-Bsc-${locationCapitalized}-Customer-Inbound-Call-Recruitment`,
  };
  
  return tableMap[type];
}

const RECRUITMENT_TABLE_MAP: Record<string, string> = {
  call: "Dev-Bsc-Baltimore-Staff-Inbound-Call-Recruitment",
  text: "Dev-Bsc-Baltimore-Staff-Inbound-Text-Recruitment",
  form: "Dev-BSC-Baltimore-Staff-Inbound-Form-Recruitment",
  customerCall: "Dev-Bsc-Baltimore-Customer-Inbound-Call-Recruitment",
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed" });
        }
        return res.json({ user: { id: user.id, username: user.username } });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      return res.json({ 
        authenticated: true, 
        user: { id: req.user.id, username: req.user.username } 
      });
    }
    res.json({ authenticated: false });
  });

  // Get candidates by session ID
  app.get("/api/candidates/:sessionId", requireAuth, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const candidates = await storage.getCandidates(sessionId);

      if (candidates.length === 0) {
        return res.status(404).json({ error: "No candidates found for this session" });
      }

      res.json({ candidates });
    } catch (error) {
      console.error("Get candidates error:", error);
      res.status(500).json({ error: "Failed to retrieve candidates" });
    }
  });

  // Clear candidates by session ID
  app.delete("/api/candidates/:sessionId", requireAuth, async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.clearCandidates(sessionId);
      res.json({ message: "Candidates cleared successfully" });
    } catch (error) {
      console.error("Clear candidates error:", error);
      res.status(500).json({ error: "Failed to clear candidates" });
    }
  });

  // Proxy endpoint for text recruitment inbound
  app.get("/api/external/text-recruitment-inbound", requireAuth, async (req, res) => {
    try {
      const location = (req.query.location as LocationType) || "baltimore";
      
      if (location !== "baltimore" && location !== "pittsburgh") {
        return res.status(400).json({ error: "Invalid location. Must be 'baltimore' or 'pittsburgh'" });
      }
      
      const config = loadConfig();
      const API_URL = config.n8nApiUrl;
      const TABLE_NAME = getRecruitmentTableName(location, "text");
      
      const response = await fetch(`${API_URL}?table_name=${TABLE_NAME}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `External API request failed with status ${response.status}` 
        });
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        return res.status(500).json({ error: 'Invalid response format from external API' });
      }
      
      // Transform snake_case column names to camelCase and validate records
      const transformedCandidates = transformCandidateRecords(data);
      
      res.json(transformedCandidates);
    } catch (error) {
      console.error("External API proxy error:", error);
      res.status(500).json({ 
        error: "Failed to fetch data from external API",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Proxy endpoint for call recruitment inbound
  app.get("/api/external/call-recruitment-inbound", requireAuth, async (req, res) => {
    try {
      const location = (req.query.location as LocationType) || "baltimore";
      
      if (location !== "baltimore" && location !== "pittsburgh") {
        return res.status(400).json({ error: "Invalid location. Must be 'baltimore' or 'pittsburgh'" });
      }
      
      const config = loadConfig();
      const API_URL = config.n8nApiUrl;
      const TABLE_NAME = getRecruitmentTableName(location, "call");
      
      const response = await fetch(`${API_URL}?table_name=${TABLE_NAME}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `External API request failed with status ${response.status}` 
        });
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        return res.status(500).json({ error: 'Invalid response format from external API' });
      }
      
      // Transform snake_case column names to camelCase and validate records
      const transformedCandidates = transformCandidateRecords(data);
      
      res.json(transformedCandidates);
    } catch (error) {
      console.error("External API proxy error:", error);
      res.status(500).json({ 
        error: "Failed to fetch data from external API",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Upload Excel file for text recruitment inbound
  app.post("/api/external/text-recruitment-inbound/upload", requireAuth, (req, res) => {
    uploadExcel.single('file')(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: "File too large. Maximum size is 10MB" });
          }
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ error: err.message || "Invalid file type. Only Excel files (.xlsx, .xls) are allowed" });
      }

      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Parse Excel file
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          return res.status(400).json({ error: "Excel file has no sheets" });
        }

        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON - this will give us an array of objects with column headers as keys
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          return res.status(400).json({ error: "Excel file has no data" });
        }

        // Transform the data using the same function as the external API endpoint
        const transformedCandidates = transformCandidateRecords(jsonData);
        
        if (transformedCandidates.length === 0) {
          return res.status(400).json({ 
            error: "No valid candidate records found in Excel file",
            details: "Please ensure the Excel file has the correct column headers and data format"
          });
        }

        res.json(transformedCandidates);
      } catch (error) {
        console.error("Excel upload error:", error);
        res.status(500).json({ 
          error: "Failed to process Excel file",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
  });

  // Upload Excel file for call recruitment inbound
  app.post("/api/external/call-recruitment-inbound/upload", requireAuth, (req, res) => {
    uploadExcel.single('file')(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: "File too large. Maximum size is 10MB" });
          }
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ error: err.message || "Invalid file type. Only Excel files (.xlsx, .xls) are allowed" });
      }

      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Parse Excel file
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          return res.status(400).json({ error: "Excel file has no sheets" });
        }

        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON - this will give us an array of objects with column headers as keys
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          return res.status(400).json({ error: "Excel file has no data" });
        }

        // Transform the data using the same function as the external API endpoint
        const transformedCandidates = transformCandidateRecords(jsonData);
        
        if (transformedCandidates.length === 0) {
          return res.status(400).json({ 
            error: "No valid candidate records found in Excel file",
            details: "Please ensure the Excel file has the correct column headers and data format"
          });
        }

        res.json(transformedCandidates);
      } catch (error) {
        console.error("Excel upload error:", error);
        res.status(500).json({ 
          error: "Failed to process Excel file",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
  });

  // Proxy endpoint for form recruitment inbound
  app.get("/api/external/form-recruitment-inbound", requireAuth, async (req, res) => {
    try {
      const location = (req.query.location as LocationType) || "baltimore";
      
      if (location !== "baltimore" && location !== "pittsburgh") {
        return res.status(400).json({ error: "Invalid location. Must be 'baltimore' or 'pittsburgh'" });
      }
      
      const config = loadConfig();
      const API_URL = config.n8nApiUrl;
      const TABLE_NAME = getRecruitmentTableName(location, "form");
      
      const response = await fetch(`${API_URL}?table_name=${TABLE_NAME}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `External API request failed with status ${response.status}` 
        });
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        return res.status(500).json({ error: 'Invalid response format from external API' });
      }
      
      // Transform snake_case column names to camelCase and validate records
      const transformedCandidates = transformCandidateRecords(data);
      
      res.json(transformedCandidates);
    } catch (error) {
      console.error("External API proxy error:", error);
      res.status(500).json({ 
        error: "Failed to fetch data from external API",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Upload Excel file for form recruitment inbound
  app.post("/api/external/form-recruitment-inbound/upload", requireAuth, (req, res) => {
    uploadExcel.single('file')(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: "File too large. Maximum size is 10MB" });
          }
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ error: err.message || "Invalid file type. Only Excel files (.xlsx, .xls) are allowed" });
      }

      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Parse Excel file
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          return res.status(400).json({ error: "Excel file has no sheets" });
        }

        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON - this will give us an array of objects with column headers as keys
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          return res.status(400).json({ error: "Excel file has no data" });
        }

        // Transform the data using the same function as the external API endpoint
        const transformedCandidates = transformCandidateRecords(jsonData);
        
        if (transformedCandidates.length === 0) {
          return res.status(400).json({ 
            error: "No valid candidate records found in Excel file",
            details: "Please ensure the Excel file has the correct column headers and data format"
          });
        }

        res.json(transformedCandidates);
      } catch (error) {
        console.error("Excel upload error:", error);
        res.status(500).json({ 
          error: "Failed to process Excel file",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
  });

  // Proxy endpoint for customer call recruitment inbound
  app.get("/api/external/customer-call-recruitment-inbound", requireAuth, async (req, res) => {
    try {
      const location = (req.query.location as LocationType) || "baltimore";
      
      if (location !== "baltimore" && location !== "pittsburgh") {
        return res.status(400).json({ error: "Invalid location. Must be 'baltimore' or 'pittsburgh'" });
      }
      
      const config = loadConfig();
      const API_URL = config.n8nApiUrl;
      const TABLE_NAME = getRecruitmentTableName(location, "customerCall");
      
      const response = await fetch(`${API_URL}?table_name=${TABLE_NAME}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: `External API request failed with status ${response.status}` 
        });
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        return res.status(500).json({ error: 'Invalid response format from external API' });
      }
      
      // Transform snake_case column names to camelCase and validate customer records
      const transformedCustomers = transformCustomerRecords(data);
      
      res.json(transformedCustomers);
    } catch (error) {
      console.error("External API proxy error:", error);
      res.status(500).json({ 
        error: "Failed to fetch data from external API",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Upload Excel file for customer call recruitment inbound
  app.post("/api/external/customer-call-recruitment-inbound/upload", requireAuth, (req, res) => {
    uploadExcel.single('file')(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: "File too large. Maximum size is 10MB" });
          }
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ error: err.message || "Invalid file type. Only Excel files (.xlsx, .xls) are allowed" });
      }

      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Parse Excel file
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          return res.status(400).json({ error: "Excel file has no sheets" });
        }

        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON - this will give us an array of objects with column headers as keys
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          return res.status(400).json({ error: "Excel file has no data" });
        }

        // Transform the data using the customer transformation function
        const transformedCustomers = transformCustomerRecords(jsonData);
        
        if (transformedCustomers.length === 0) {
          return res.status(400).json({ 
            error: "No valid customer records found in Excel file",
            details: "Please ensure the Excel file has the correct column headers and data format"
          });
        }

        res.json(transformedCustomers);
      } catch (error) {
        console.error("Excel upload error:", error);
        res.status(500).json({ 
          error: "Failed to process Excel file",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
  });

  // Helper function to extract submissions array from various request formats
  function extractSubmissions(body: any): { submissions: any[] | null; error: string | null } {
    if (body.body && body.body.candidates && Array.isArray(body.body.candidates)) {
      return { submissions: body.body.candidates, error: null };
    } else if (Array.isArray(body)) {
      return { submissions: body, error: null };
    } else if (body.submissions && Array.isArray(body.submissions)) {
      return { submissions: body.submissions, error: null };
    } else if (body.candidates && Array.isArray(body.candidates)) {
      return { submissions: body.candidates, error: null };
    }
    return { submissions: null, error: "Invalid JSON data format. Expected { body: { candidates: [...] } } or array" };
  }

  // Helper function to transform form submissions
  function transformFormSubmissions(submissions: any[]): any[] {
    return submissions.map((submission: any) => {
      return {
        rowNumber: submission.row_number || submission.rowNumber,
        guid: submission.GUID || submission.guid,
        result: submission.result,
        locationId: submission.location_id || submission.locationId,
        dateTime: submission.date_time || submission.dateTime,
        phoneNumber: String(submission.phone_number || submission.phoneNumber || ''),
        contactName: submission.contact_name || submission.contactName,
        email: submission.email_address || submission.email || submission.emailAddress,
        
        hasExperience: submission.one_year_experience || submission.oneYearExperience || submission.hasExperience,
        hasAvailability: submission.work_per_week || submission.workPerWeek || submission.hasAvailability,
        hasVehicle: submission.valid_driver_license || submission.validDriverLicense || submission.hasVehicle,
        willingToTravel: submission.can_travel || submission.canTravel || submission.willingToTravel,
        payRateAcceptance: submission.pay_rate || submission.payRate || submission.payRateAcceptance,
        workedBefore: submission.employment_period || submission.employmentPeriod || submission.workedBefore,
        hasCPRCertification: submission.cpr_certificate || submission.cprCertificate || submission.hasCPRCertification,
        canProvideTBTest: submission.tb_test_negative || submission.tbTestNegative || submission.canProvideTBTest,
        hasBackgroundCheckIssues: submission.background_check_issues || submission.backgroundCheckIssues || submission.hasBackgroundCheckIssues,
        backgroundCheckFeeAcceptance: submission.background_check || submission.backgroundCheck || submission.backgroundCheckFeeAcceptance,
        
        previousLocation: submission.previous_location || submission.previousLocation,
        reliableTransport: submission.reliable_transport || submission.reliableTransport,
        careExperience: submission.care_experience || submission.careExperience,
        clientType: submission.client_type || submission.clientType,
        experienceScore: submission.experience_score || submission.experienceScore,
        compassionScore: submission.compassion_score || submission.compassionScore,
        safetyScore: submission.safety_score || submission.safetyScore,
        professionalismScore: submission.professionalism_score || submission.professionalismScore,
        performanceSummary: submission.performance_summary || submission.performanceSummary,
        redFlags: submission.red_flags || submission.redFlags,
        followUpQuestions: submission.follow_up_questions || submission.followUpQuestions,
        questionsAsked: submission.questions_asked || submission.questionsAsked,
        callbackDate: submission.callback_date || submission.callbackDate,
        consentToMessages: submission.consent_to_messages !== undefined 
          ? String(submission.consent_to_messages) 
          : (submission.consentToMessages || ''),
      };
    });
  }

  // Helper function to handle staff form recruitment PDF generation
  async function handleStaffFormRecruitmentPDF(req: Request, res: Response, locationPrefix: string = '') {
    try {
      const { submissions, error } = extractSubmissions(req.body);
      
      if (error || !submissions) {
        return res.status(400).json({ error: error || "Invalid request" });
      }

      if (submissions.length === 0) {
        return res.status(400).json({ error: "No submission data provided" });
      }

      const transformedSubmissions = transformFormSubmissions(submissions);
      const pdfBuffer = generateFormSubmissionsPDF(transformedSubmissions);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = locationPrefix 
        ? `${locationPrefix}_staff_form_submissions_${timestamp}.pdf`
        : `staff_form_submissions_${timestamp}.pdf`;
        
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Helper function to handle customer call recruitment PDF generation
  async function handleCustomerCallRecruitmentPDF(req: Request, res: Response, locationPrefix: string = '') {
    try {
      const requestSchema = z.object({
        customers: z.array(z.any())
      });

      const parsed = requestSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid JSON data",
          details: parsed.error.errors
        });
      }

      const { customers } = parsed.data;

      if (customers.length === 0) {
        return res.status(400).json({ error: "No customer data provided" });
      }

      const validatedCustomers = customers.map((customer: any) => {
        const result = customerServiceSchema.safeParse(customer);
        if (!result.success) {
          console.warn("Invalid customer data:", result.error);
        }
        return customer;
      });

      const pdfBuffer = generateCustomersPDF(validatedCustomers);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = locationPrefix
        ? `${locationPrefix}_customer_call_recruitment_${timestamp}.pdf`
        : `customer_call_recruitment_${timestamp}.pdf`;
        
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Helper function to handle staff call recruitment PDF generation
  async function handleStaffCallRecruitmentPDF(req: Request, res: Response, locationPrefix: string = '') {
    try {
      const requestSchema = z.object({
        candidates: z.array(z.any())
      });

      const parsed = requestSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid JSON data",
          details: parsed.error.errors
        });
      }

      const { candidates } = parsed.data;

      if (candidates.length === 0) {
        return res.status(400).json({ error: "No candidate data provided" });
      }

      const validatedCandidates = candidates.map((candidate: any) => {
        const result = candidateEvaluationSchema.safeParse(candidate);
        if (!result.success) {
          console.warn("Invalid candidate data:", result.error);
        }
        return candidate;
      });

      const pdfBuffer = generateCandidatesPDF(validatedCandidates);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = locationPrefix
        ? `${locationPrefix}_staff_call_recruitment_${timestamp}.pdf`
        : `staff_call_recruitment_${timestamp}.pdf`;
        
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Generate PDF from JSON data - Staff Form Recruitment
  app.post("/api/generate-pdf/staff-form-recruitment", requireBearerAuth, async (req, res) => {
    return handleStaffFormRecruitmentPDF(req, res);
  });

  // Generate PDF from JSON data - Customer Call Recruitment
  app.post("/api/generate-pdf/customer-call-recruitment", requireBearerAuth, async (req, res) => {
    return handleCustomerCallRecruitmentPDF(req, res);
  });

  // Generate PDF from JSON data - Staff Call Recruitment
  app.post("/api/generate-pdf/staff-call-recruitment", requireBearerAuth, async (req, res) => {
    return handleStaffCallRecruitmentPDF(req, res);
  });

  // Location-specific PDF generation endpoints - Baltimore
  app.post("/api/baltimore/generate-pdf/staff-form-recruitment", requireBearerAuth, async (req, res) => {
    return handleStaffFormRecruitmentPDF(req, res, 'baltimore');
  });

  app.post("/api/baltimore/generate-pdf/customer-call-recruitment", requireBearerAuth, async (req, res) => {
    return handleCustomerCallRecruitmentPDF(req, res, 'baltimore');
  });

  app.post("/api/baltimore/generate-pdf/staff-call-recruitment", requireBearerAuth, async (req, res) => {
    return handleStaffCallRecruitmentPDF(req, res, 'baltimore');
  });

  // Location-specific PDF generation endpoints - Pittsburgh
  app.post("/api/pittsburgh/generate-pdf/staff-form-recruitment", requireBearerAuth, async (req, res) => {
    return handleStaffFormRecruitmentPDF(req, res, 'pittsburgh');
  });

  app.post("/api/pittsburgh/generate-pdf/customer-call-recruitment", requireBearerAuth, async (req, res) => {
    return handleCustomerCallRecruitmentPDF(req, res, 'pittsburgh');
  });

  app.post("/api/pittsburgh/generate-pdf/staff-call-recruitment", requireBearerAuth, async (req, res) => {
    return handleStaffCallRecruitmentPDF(req, res, 'pittsburgh');
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Interview Evaluation API is running" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
