import Papa from 'papaparse';
import { CandidateEvaluation, candidateEvaluationSchema } from "@shared/schema";

export interface ParseResult {
  data: CandidateEvaluation[];
  errors: string[];
}

function stripBOM(str: string): string {
  if (str.charCodeAt(0) === 0xFEFF) {
    return str.slice(1);
  }
  return str;
}

function normalizeHeader(header: string): string {
  return stripBOM(header.trim().replace(/^"|"$/g, ''));
}

function parseArrayField(value: string | undefined): string[] {
  if (!value || value.trim() === '') return [];
  
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapRowToCandidate(row: any): CandidateEvaluation {
  return {
    guid: row.GUID || row.guid,
    result: (row.Result || row.result || "") as "PASS" | "FAIL" | "HANGUP",
    dateTime: row.DateTime || row.dateTime || "",
    phoneNumber: row.PhoneNumber || row.phoneNumber || "",
    contactName: row.ContactName || row.contactName || "",
    previousLocation: row.PreviousLocation || row.previousLocation,
    employmentPeriod: row.EmploymentPeriod || row.employmentPeriod,
    workPerWeek: row.WorkPerWeek || row.workPerWeek,
    canTravel: row.CanTravel || row.canTravel,
    oneYearExperience: row.OneYearExperience || row.oneYearExperience,
    validDriverLicense: row.ValidDriverLicense || row.validDriverLicense,
    reliableTransport: row.ReliableTransport || row.reliableTransport,
    payRate: row.PayRate || row.payRate,
    dementiaClient: row.DementiaClient || row.dementiaClient,
    backgroundCheck: row.BackgroundCheck || row.backgroundCheck,
    tbTestNegative: row.TBTestNegative || row.tbTestNegative,
    cprCertificate: row.CPRCertificate || row.cprCertificate,
    experience: row.Experience || row.experience,
    clientType: row.ClientType || row.clientType,
    caregiverQuality: row.CaregiverQuality || row.caregiverQuality,
    clientRefusal: row.ClientRefusal || row.clientRefusal,
    firstAction: row.FirstAction || row.firstAction,
    phone2: row.Phone2 || row.phone2,
    emailAddress: row.EmailAddress || row.emailAddress,
    experienceScore: row.ExperienceScore || row.experienceScore,
    compassionScore: row.CompassionScore || row.compassionScore,
    safetyScore: row.SafetyScore || row.safetyScore,
    professionalismScore: row.ProfessionalismScore || row.professionalismScore,
    performanceSummary: row.PerformanceSummary || row.performanceSummary,
    redFlags: parseArrayField(row.RedFlags || row.redFlags),
    followUpQuestions: parseArrayField(row.FollowUpQuestions || row.followUpQuestions),
    questionsAsked: parseArrayField(row.QuestionsAsked || row.questionsAsked),
    callbackDate: row.CallbackDate || row.callbackDate,
  };
}

export function parseCSVContent(content: string): ParseResult {
  const data: CandidateEvaluation[] = [];
  const errors: string[] = [];

  const normalizedContent = stripBOM(content);

  const parseResult = Papa.parse(normalizedContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });

  if (parseResult.errors && parseResult.errors.length > 0) {
    parseResult.errors.forEach((error) => {
      errors.push(`Parse error at row ${error.row}: ${error.message}`);
    });
  }

  if (!parseResult.data || parseResult.data.length === 0) {
    errors.push("No valid data rows found in CSV file");
    return { data, errors };
  }

  parseResult.data.forEach((row: any, index: number) => {
    try {
      const candidate = mapRowToCandidate(row);
      
      const validationResult = candidateEvaluationSchema.safeParse(candidate);
      
      if (!validationResult.success) {
        const fieldErrors = validationResult.error.errors
          .map(err => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        errors.push(`Row ${index + 2}: Validation failed - ${fieldErrors}`);
        return;
      }

      if (!candidate.result || (candidate.result !== "PASS" && candidate.result !== "FAIL" && candidate.result !== "HANGUP")) {
        errors.push(`Row ${index + 2}: Missing or invalid 'Result' field (must be PASS, FAIL, or HANGUP)`);
        return;
      }

      if (!candidate.contactName || !candidate.phoneNumber) {
        errors.push(`Row ${index + 2}: Missing required fields (contactName or phoneNumber)`);
        return;
      }

      data.push(validationResult.data);
    } catch (error) {
      errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Invalid data format'}`);
    }
  });

  return { data, errors };
}
