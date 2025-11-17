import Papa from 'papaparse';
import { CandidateEvaluation } from '@shared/schema';

export interface ParseResult {
  data: CandidateEvaluation[];
  errors: string[];
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

export function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data: CandidateEvaluation[] = [];
        const errors: string[] = [];

        results.data.forEach((row: any, index: number) => {
          try {
            const candidate: CandidateEvaluation = {
              guid: row.GUID || "",
              result: row.Result as "PASS" | "FAIL" | "HANGUP",
              dateTime: row.DateTime || "",
              phoneNumber: row.PhoneNumber || "",
              contactName: row.ContactName || "",
              previousLocation: row.PreviousLocation || "",
              employmentPeriod: row.EmploymentPeriod || "",
              workPerWeek: row.WorkPerWeek || "",
              canTravel: row.CanTravel || "",
              oneYearExperience: row.OneYearExperience || "",
              validDriverLicense: row.ValidDriverLicense || "",
              reliableTransport: row.ReliableTransport || "",
              payRate: row.PayRate || "",
              dementiaClient: row.DementiaClient || "",
              backgroundCheck: row.BackgroundCheck || "",
              tbTestNegative: row.TBTestNegative || "",
              cprCertificate: row.CPRCertificate || "",
              experience: row.Experience || "",
              clientType: row.ClientType || "",
              caregiverQuality: row.CaregiverQuality || "",
              clientRefusal: row.ClientRefusal || "",
              firstAction: row.FirstAction || "",
              phone2: row.Phone2 || "",
              emailAddress: row.EmailAddress || "",
              experienceScore: row.ExperienceScore || "",
              compassionScore: row.CompassionScore || "",
              safetyScore: row.SafetyScore || "",
              professionalismScore: row.ProfessionalismScore || "",
              performanceSummary: row.PerformanceSummary || "",
              redFlags: parseArrayField(row.RedFlags),
              followUpQuestions: parseArrayField(row.FollowUpQuestions),
              questionsAsked: parseArrayField(row.QuestionsAsked),
              callbackDate: row.CallbackDate || "",
            };
            data.push(candidate);
          } catch (error) {
            errors.push(`Row ${index + 1}: Invalid data format`);
          }
        });

        resolve({ data, errors });
      },
      error: (error) => {
        resolve({ data: [], errors: [error.message] });
      },
    });
  });
}
