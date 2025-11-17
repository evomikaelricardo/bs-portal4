import { CustomerService, customerServiceSchema } from "@shared/schema";

function toStringOrUndefined(value: any): string | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  return String(value);
}

/**
 * Transform a customer record from Excel/database format (snake_case or mixed case)
 * to camelCase format expected by the customerServiceSchema
 */
export function transformCustomerRecord(record: any): CustomerService | null {
  try {
    const transformed = {
      guid: toStringOrUndefined(record.GUID || record.guid),
      dateTime: String(record.date_time || record.dateTime || record.DateTime || ''),
      phoneNumber: String(record.phone_number || record.phoneNumber || record.PhoneNumber || ''),
      contactName: String(record.contact_name || record.contactName || record.ContactName || ''),
      referral: toStringOrUndefined(record.referral || record.Referral),
      serviceExperience: toStringOrUndefined(record.service_experience || record.serviceExperience || record.ServiceExperience),
      zipCode: toStringOrUndefined(record.zipcode || record.zip_code || record.zipCode || record.ZipCode),
      patientIdentity: toStringOrUndefined(record.patient_identity || record.patientIdentity || record.PatientIdentity),
      patientProblem: toStringOrUndefined(record.patient_problem || record.patientProblem || record.PatientProblem),
      serviceHours: toStringOrUndefined(record.service_hours || record.serviceHours || record.ServiceHours),
      serviceTime: toStringOrUndefined(record.service_time || record.serviceTime || record.ServiceTime),
      clientAddress: toStringOrUndefined(record.client_address || record.clientAddress || record.ClientAddress),
      clientEmail: toStringOrUndefined(record.client_email || record.clientEmail || record.ClientEmail),
      callbackDate: toStringOrUndefined(record.callback_date || record.callbackDate || record.CallbackDate),
      nurseVisit: toStringOrUndefined(record.nurse_visit || record.nurseVisit || record.NurseVisit),
    };

    const validated = customerServiceSchema.safeParse(transformed);
    
    if (!validated.success) {
      console.warn('Customer record validation failed:', validated.error.errors);
      return null;
    }

    return validated.data;
  } catch (error) {
    console.error('Error transforming customer record:', error);
    return null;
  }
}

/**
 * Transform an array of customer records
 */
export function transformCustomerRecords(records: any[]): CustomerService[] {
  return records
    .map(transformCustomerRecord)
    .filter((record): record is CustomerService => record !== null);
}
