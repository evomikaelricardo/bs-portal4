import CandidateTable from '../CandidateTable';
import { CandidateEvaluation } from '@shared/schema';

export default function CandidateTableExample() {
  const mockCandidates: CandidateEvaluation[] = [
    {
      result: "PASS",
      dateTime: "10/31/2025, 1:47:12 AM",
      phoneNumber: "6311301801",
      contactName: "Frederick Alfredo",
      previousLocation: "Jakarta",
      employmentPeriod: "2005, for 8 months",
      workPerWeek: "Yes",
      canTravel: "Yes",
      oneYearExperience: "Yes",
      validDriverLicense: "No",
      reliableTransport: "Yes",
      emailAddress: "fred@gmail.com",
      experience: "Mostly worked in nursing homes",
      clientType: "Mostly people with disabilities",
      caregiverQuality: "Strong, nice, and polite",
    },
    {
      result: "FAIL",
      dateTime: "10/30/2025, 11:51:54 PM",
      phoneNumber: "1234567890",
      contactName: "John Smith",
      previousLocation: "BrightStar Jakarta",
      employmentPeriod: "2000",
      workPerWeek: "Yes",
      canTravel: "Yes",
      oneYearExperience: "Yes",
      validDriverLicense: "Yes",
      reliableTransport: "Yes",
    },
  ];

  const handleGeneratePDF = (candidate: CandidateEvaluation) => {
    console.log('Generate PDF for:', candidate.contactName);
  };

  return (
    <CandidateTable 
      candidates={mockCandidates} 
      onGeneratePDF={handleGeneratePDF}
    />
  );
}
