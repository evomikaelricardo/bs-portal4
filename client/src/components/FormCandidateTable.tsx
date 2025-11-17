import { FormStaffSubmission } from "@shared/schema";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Check, X, AlertCircle, FileDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";

interface FormCandidateTableProps {
  submissions: FormStaffSubmission[];
  onGeneratePDF?: (submission: FormStaffSubmission) => void;
}

function getBooleanBadge(value: string | undefined) {
  const normalized = value?.toLowerCase();
  if (normalized === "yes" || normalized === "true") {
    return (
      <Badge variant="default" className="font-medium">
        <Check className="w-3 h-3 mr-1" />
        Yes
      </Badge>
    );
  } else if (normalized === "no" || normalized === "false") {
    return (
      <Badge variant="secondary" className="font-medium">
        <X className="w-3 h-3 mr-1" />
        No
      </Badge>
    );
  }
  return <span className="text-muted-foreground text-sm">N/A</span>;
}

export default function FormCandidateTable({
  submissions,
  onGeneratePDF,
}: FormCandidateTableProps) {
  if (submissions.length === 0) {
    return (
      <Card className="p-12">
        <p className="text-center text-muted-foreground">
          No form submission data available. Upload a CSV file to get started.
        </p>
      </Card>
    );
  }

  return (
    <Card data-testid="card-form-candidate-table">
      <ScrollArea className="w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] text-left align-middle">Name</TableHead>
                <TableHead className="min-w-[130px] text-left align-middle">Phone</TableHead>
                <TableHead className="min-w-[180px] text-left align-middle">Email</TableHead>
                <TableHead className="min-w-[120px] text-left align-middle">Experience</TableHead>
                <TableHead className="min-w-[120px] text-left align-middle">Availability</TableHead>
                <TableHead className="min-w-[120px] text-left align-middle">Vehicle</TableHead>
                <TableHead className="min-w-[130px] text-left align-middle">CPR Cert</TableHead>
                <TableHead className="min-w-[150px] text-left align-middle">BG Issues</TableHead>
                <TableHead className="min-w-[160px] text-left align-middle">Submission Date</TableHead>
                {onGeneratePDF && (
                  <TableHead className="w-[100px] text-center align-middle">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission, index) => (
                <TableRow key={index} data-testid={`row-form-submission-${index}`}>
                  <TableCell className="w-[150px] font-medium text-left align-middle" data-testid="text-name">
                    {submission.contactName}
                  </TableCell>
                  <TableCell className="text-sm text-left align-middle" data-testid="text-phone">
                    {submission.phoneNumber}
                  </TableCell>
                  <TableCell className="text-sm text-left align-middle" data-testid="text-email">
                    {submission.email || "N/A"}
                  </TableCell>
                  <TableCell className="text-left align-middle">
                    {getBooleanBadge(submission.hasExperience)}
                  </TableCell>
                  <TableCell className="text-left align-middle">
                    {getBooleanBadge(submission.hasAvailability)}
                  </TableCell>
                  <TableCell className="text-left align-middle">
                    {getBooleanBadge(submission.hasVehicle)}
                  </TableCell>
                  <TableCell className="text-left align-middle">
                    {getBooleanBadge(submission.hasCPRCertification)}
                  </TableCell>
                  <TableCell className="text-left align-middle">
                    {submission.hasBackgroundCheckIssues?.toLowerCase() === "yes" ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="font-medium">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Yes
                        </Badge>
                      </div>
                    ) : (
                      getBooleanBadge(submission.hasBackgroundCheckIssues)
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-left align-middle">
                    {submission.dateTime}
                  </TableCell>
                  {onGeneratePDF && (
                    <TableCell className="text-center align-middle">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onGeneratePDF(submission)}
                        data-testid={`button-generate-pdf-${index}`}
                      >
                        <FileDown className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </Card>
  );
}
