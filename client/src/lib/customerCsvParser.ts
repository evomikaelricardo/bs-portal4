import Papa from 'papaparse';
import { CustomerService } from '@shared/schema';

export interface ParseResult {
  data: CustomerService[];
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

export function parseCustomerCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data: CustomerService[] = [];
        const errors: string[] = [];

        results.data.forEach((row: any, index: number) => {
          try {
            const customer: CustomerService = {
              guid: row.GUID || "",
              dateTime: row.DateTime || "",
              phoneNumber: row.PhoneNumber || "",
              contactName: row.ContactName || "",
              referral: row.Referral || "",
              serviceExperience: row.ServiceExperience || "",
              zipCode: row.ZipCode || "",
              patientIdentity: row.PatientIdentity || "",
              patientProblem: row.PatientProblem || "",
              serviceHours: row.ServiceHours || "",
              serviceTime: row.ServiceTime || "",
              clientAddress: row.ClientAddress || "",
              clientEmail: row.ClientEmail || "",
              callbackDate: row.CallbackDate || "",
              nurseVisit: row.NurseVisit || "",
            };
            data.push(customer);
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
