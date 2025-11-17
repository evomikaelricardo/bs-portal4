import Papa from 'papaparse';
import { FormStaffSubmission } from '@shared/schema';

export interface FormParseResult {
  data: FormStaffSubmission[];
  errors: string[];
}

export function parseFormCSV(file: File): Promise<FormParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data: FormStaffSubmission[] = [];
        const errors: string[] = [];

        results.data.forEach((row: any, index: number) => {
          try {
            // Map both FormStaffSubmission format and Excel/API format (snake_case)
            const submission: FormStaffSubmission = {
              guid: row.GUID || row.guid || "",
              result: row.result || row.Result || "",
              dateTime: row.date_time || row.DateTime || row.dateTime || "",
              phoneNumber: String(row.phone_number || row.PhoneNumber || row.phoneNumber || ""),
              contactName: row.contact_name || row.ContactName || row.contactName || "",
              email: row.email_address || row.email || row.EmailAddress || "",
              
              // Map Excel/API field names to FormStaffSubmission field names
              hasExperience: row.one_year_experience || row.oneYearExperience || row.hasExperience || "",
              hasAvailability: row.work_per_week || row.workPerWeek || row.hasAvailability || "",
              hasVehicle: row.valid_driver_license || row.validDriverLicense || row.hasVehicle || "",
              willingToTravel: row.can_travel || row.canTravel || row.willingToTravel || "",
              payRateAcceptance: row.pay_rate || row.payRate || row.payRateAcceptance || "",
              workedBefore: row.employment_period || row.employmentPeriod || row.workedBefore || "",
              hasCPRCertification: row.cpr_certificate || row.cprCertificate || row.hasCPRCertification || "",
              canProvideTBTest: row.tb_test_negative || row.tbTestNegative || row.canProvideTBTest || "",
              hasBackgroundCheckIssues: row.background_check_issues || row.backgroundCheckIssues || row.hasBackgroundCheckIssues || "",
              backgroundCheckFeeAcceptance: row.background_check || row.backgroundCheck || row.backgroundCheckFeeAcceptance || "",
              
              caregivingBackground: row.care_experience || row.careExperience || row.caregivingBackground || "",
              hasDementiaExperience: row.dementia_client || row.dementiaClient || row.hasDementiaExperience || "",
              backgroundCheckIssuesDescription: row.BackgroundCheckIssuesDescription || row.backgroundCheckIssuesDescription || "",
              goodCaregiverQualities: row.goodCaregiverQualities || "",
              consentToMessages: row.consent_to_messages !== undefined 
                ? String(row.consent_to_messages) 
                : (row.consentToMessages || ""),
            };
            data.push(submission);
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
