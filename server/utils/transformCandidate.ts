import { candidateEvaluationSchema, CandidateEvaluation } from "@shared/schema";

/**
 * Parse a value that might be a JSON string array into an actual string array
 */
function parseJsonArray(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Helper function to convert any value to string, handling booleans and null/undefined
 */
function toStringOrUndefined(value: any): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

/**
 * Transform a candidate record from snake_case to camelCase format
 * expected by the candidateEvaluationSchema
 */
export function transformCandidateRecord(record: any): CandidateEvaluation | null {
  try {
    const transformed = {
      guid: toStringOrUndefined(record.guid),
      result: toStringOrUndefined(record.result),
      dateTime: String(record.date_time || ''),
      phoneNumber: String(record.phone_number || ''),
      contactName: String(record.contact_name || ''),
      previousLocation: toStringOrUndefined(record.previous_location),
      employmentPeriod: toStringOrUndefined(record.employment_period),
      workPerWeek: toStringOrUndefined(record.work_per_week),
      canTravel: toStringOrUndefined(record.can_travel),
      oneYearExperience: toStringOrUndefined(record.one_year_experience),
      validDriverLicense: toStringOrUndefined(record.valid_driver_license),
      reliableTransport: toStringOrUndefined(record.reliable_transport),
      payRate: toStringOrUndefined(record.pay_rate),
      dementiaClient: toStringOrUndefined(record.dementia_client),
      backgroundCheck: toStringOrUndefined(record.background_check),
      tbTestNegative: toStringOrUndefined(record.tb_test_negative),
      cprCertificate: toStringOrUndefined(record.cpr_certificate),
      experience: toStringOrUndefined(record.experience),
      clientType: toStringOrUndefined(record.client_type),
      caregiverQuality: toStringOrUndefined(record.caregiver_quality),
      clientRefusal: toStringOrUndefined(record.client_refusal),
      firstAction: toStringOrUndefined(record.first_action),
      phone2: toStringOrUndefined(record.phone2),
      emailAddress: toStringOrUndefined(record.email_address || record.email),
      experienceScore: toStringOrUndefined(record.experience_score),
      compassionScore: toStringOrUndefined(record.compassion_score),
      safetyScore: toStringOrUndefined(record.safety_score),
      professionalismScore: toStringOrUndefined(record.professionalism_score),
      performanceSummary: toStringOrUndefined(record.performance_summary),
      redFlags: parseJsonArray(record.red_flags),
      followUpQuestions: parseJsonArray(record.follow_up_questions),
      questionsAsked: parseJsonArray(record.questions_asked),
      callbackDate: toStringOrUndefined(record.callback_date),
    };

    const validated = candidateEvaluationSchema.safeParse(transformed);
    
    if (!validated.success) {
      console.warn('Candidate record validation failed:', validated.error.errors);
      return null;
    }

    return validated.data;
  } catch (error) {
    console.error('Error transforming candidate record:', error);
    return null;
  }
}

/**
 * Transform an array of candidate records, filtering out any invalid records
 */
export function transformCandidateRecords(records: any[]): CandidateEvaluation[] {
  if (!Array.isArray(records)) {
    console.warn('transformCandidateRecords received non-array input');
    return [];
  }

  const transformed = records
    .map(transformCandidateRecord)
    .filter((record): record is CandidateEvaluation => record !== null);

  if (transformed.length < records.length) {
    console.warn(
      `Filtered out ${records.length - transformed.length} invalid candidate record(s) out of ${records.length} total`
    );
  }

  return transformed;
}
