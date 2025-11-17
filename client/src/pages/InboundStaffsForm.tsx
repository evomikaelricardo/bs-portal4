import { useState } from "react";
import { useLocation } from "wouter";
import { FormStaffSubmission } from "@shared/schema";
import { parseFormCSV } from "@/lib/formCsvParser";
import { generateFormPDF } from "@/lib/formPdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { useFormCandidates } from "@/context/FormCandidateContext";
import FileUploadZone from "@/components/FileUploadZone";
import StatCard from "@/components/StatCard";
import FormCandidateTable from "@/components/FormCandidateTable";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, AlertCircle, Trash2, FileText, UserCheck, Download, BarChart3 } from "lucide-react";

export default function InboundStaffsForm() {
  const { formSubmissions, setFormSubmissions } = useFormCandidates();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      const result = await parseFormCSV(file);
      
      if (result.errors.length > 0) {
        toast({
          title: "Parsing Warnings",
          description: result.errors.join(", "),
          variant: "destructive",
        });
      }

      if (result.data.length > 0) {
        setFormSubmissions(result.data);
        toast({
          title: "Success",
          description: `Successfully loaded ${result.data.length} form submission(s)`,
        });
      } else {
        toast({
          title: "Error",
          description: "No valid data found in the CSV file",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process CSV file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = () => {
    setFormSubmissions([]);
    toast({
      title: "Data Cleared",
      description: "All form submission data has been removed",
    });
  };

  const handleGeneratePDF = (submission: FormStaffSubmission) => {
    try {
      generateFormPDF(submission);
      toast({
        title: "PDF Generated",
        description: `Report for ${submission.contactName} has been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const handleGenerateAllPDFs = () => {
    try {
      formSubmissions.forEach((submission) => {
        generateFormPDF(submission);
      });
      toast({
        title: "PDFs Generated",
        description: `${formSubmissions.length} reports have been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDFs",
        variant: "destructive",
      });
    }
  };

  const qualifiedCount = formSubmissions.filter((s) => {
    const hasExperience = s.hasExperience?.toLowerCase() === "yes";
    const hasAvailability = s.hasAvailability?.toLowerCase() === "yes";
    const hasVehicle = s.hasVehicle?.toLowerCase() === "yes";
    const noBackgroundIssues = s.hasBackgroundCheckIssues?.toLowerCase() !== "yes";
    return hasExperience && hasAvailability && hasVehicle && noBackgroundIssues;
  }).length;

  const backgroundIssuesCount = formSubmissions.filter(
    (s) => s.hasBackgroundCheckIssues?.toLowerCase() === "yes"
  ).length;

  const qualificationRate = formSubmissions.length > 0 
    ? ((qualifiedCount / formSubmissions.length) * 100).toFixed(1) 
    : "0";

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Upload Web Form Data
                </h2>
                <p className="text-muted-foreground">
                  Upload your CSV file containing staff web form submissions to view applicant information
                </p>
              </div>
            </div>
            
            <FileUploadZone onFileSelect={handleFileSelect} />
          </div>

          {formSubmissions.length > 0 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Submission Summary
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/form-analytics")}
                      data-testid="button-view-analytics"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClearData}
                      data-testid="button-clear-data"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear Data
                    </Button>
                    <Button
                      onClick={handleGenerateAllPDFs}
                      data-testid="button-generate-all-pdfs"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Generate All PDFs
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    title="Total Submissions"
                    value={formSubmissions.length}
                    icon={Users}
                    subtitle="Received"
                    variant="default"
                  />
                  <StatCard
                    title="Qualified Applicants"
                    value={qualifiedCount}
                    icon={UserCheck}
                    subtitle={`${qualificationRate}% qualified`}
                    variant="success"
                  />
                  <StatCard
                    title="Background Issues"
                    value={backgroundIssuesCount}
                    icon={AlertCircle}
                    subtitle={`${((backgroundIssuesCount / formSubmissions.length) * 100).toFixed(1)}% with issues`}
                    variant="destructive"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Applicant Details
                </h2>
                <FormCandidateTable 
                  submissions={formSubmissions}
                  onGeneratePDF={handleGeneratePDF}
                />
              </div>
            </>
          )}

          {formSubmissions.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Data Available
              </h3>
              <p className="text-muted-foreground">
                Upload a CSV file to view staff web form submissions
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              BrightStart Staff Form Submission System v1.0
            </p>
            <p className="text-sm text-muted-foreground">
              For support, contact: support@brightstart.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
