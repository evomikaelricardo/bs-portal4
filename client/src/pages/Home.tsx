import { useState } from "react";
import { useLocation } from "wouter";
import { CandidateEvaluation } from "@shared/schema";
import { parseCSV } from "@/lib/csvParser";
import { generatePDF } from "@/lib/pdfGenerator";
import { uploadCSVToAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useCandidates } from "@/context/CandidateContext";
import FileUploadZone from "@/components/FileUploadZone";
import StatCard from "@/components/StatCard";
import CandidateTable from "@/components/CandidateTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, CheckCircle, XCircle, Download, Trash2, FileText, Cloud, HardDrive, BarChart3 } from "lucide-react";

export default function Home() {
  const { candidates, setCandidates, sessionId, setSessionId, setDataSource, claimDataset, activateOwner } = useCandidates();
  const [isLoading, setIsLoading] = useState(false);
  const [useAPI, setUseAPI] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      if (useAPI) {
        // API-based processing
        const response = await uploadCSVToAPI(file);
        
        if (response.errors.length > 0) {
          toast({
            title: "Parsing Warnings",
            description: response.errors.join(", "),
            variant: "destructive",
          });
        }

        if (response.candidates.length > 0) {
          setCandidates(response.candidates);
          setDataSource("api");
          setSessionId(response.sessionId);
          claimDataset("home", {
            candidates: response.candidates,
            sessionId: response.sessionId,
            dataSource: "api"
          });
          activateOwner("home");
          toast({
            title: "Success",
            description: `Successfully loaded ${response.candidates.length} candidate(s) via API`,
          });
        } else {
          toast({
            title: "Error",
            description: "No valid data found in the CSV file",
            variant: "destructive",
          });
        }
      } else {
        // Client-side processing
        const result = await parseCSV(file);
        
        if (result.errors.length > 0) {
          toast({
            title: "Parsing Warnings",
            description: result.errors.join(", "),
            variant: "destructive",
          });
        }

        if (result.data.length > 0) {
          setCandidates(result.data);
          setDataSource("api");
          setSessionId(null);
          claimDataset("home", {
            candidates: result.data,
            sessionId: null,
            dataSource: "api"
          });
          activateOwner("home");
          toast({
            title: "Success",
            description: `Successfully loaded ${result.data.length} candidate(s) locally`,
          });
        } else {
          toast({
            title: "Error",
            description: "No valid data found in the CSV file",
            variant: "destructive",
          });
        }
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

  const handleGeneratePDF = (candidate: CandidateEvaluation) => {
    try {
      generatePDF(candidate);
      toast({
        title: "PDF Generated",
        description: `Report for ${candidate.contactName} has been downloaded`,
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
      candidates.forEach((candidate) => {
        generatePDF(candidate);
      });
      toast({
        title: "PDFs Generated",
        description: `${candidates.length} reports have been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDFs",
        variant: "destructive",
      });
    }
  };

  const handleClearData = () => {
    setCandidates([]);
    setSessionId(null);
    setDataSource("api"); // Reset legacy dataSource to prevent stale upload data
    claimDataset("home", {
      candidates: [],
      sessionId: null,
      dataSource: "api"
    });
    activateOwner("home");
    toast({
      title: "Data Cleared",
      description: "All candidate data has been removed",
    });
  };

  const passedCount = candidates.filter((c) => c.result === "PASS").length;
  const failedCount = candidates.filter((c) => c.result === "FAIL").length;
  const passRate = candidates.length > 0 
    ? ((passedCount / candidates.length) * 100).toFixed(1) 
    : "0";

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Upload Interview Data
                </h2>
                <p className="text-muted-foreground">
                  Upload your CSV file containing candidate interview evaluations to generate professional reports
                </p>
              </div>
              
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                    <Label htmlFor="processing-mode" className="text-sm font-medium cursor-pointer">
                      {useAPI ? "API Processing" : "Local Processing"}
                    </Label>
                  </div>
                  <Switch
                    id="processing-mode"
                    checked={useAPI}
                    onCheckedChange={setUseAPI}
                    data-testid="switch-processing-mode"
                  />
                  <Cloud className={`w-4 h-4 ${useAPI ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {useAPI 
                    ? "CSV will be processed on the server" 
                    : "CSV will be processed in your browser"}
                </p>
              </Card>
            </div>
            
            <FileUploadZone onFileSelect={handleFileSelect} />
            
            {sessionId && (
              <Card className="mt-4 p-4 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-primary" />
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Session ID:</span>{" "}
                    <code className="text-xs bg-background px-2 py-1 rounded" data-testid="text-session-id">
                      {sessionId}
                    </code>
                  </p>
                </div>
              </Card>
            )}
          </div>

          {candidates.length > 0 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Evaluation Summary
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/analytics")}
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
                      data-testid="button-generate-all"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Generate All PDFs
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    title="Total Candidates"
                    value={candidates.length}
                    icon={Users}
                    subtitle="Processed"
                    variant="default"
                  />
                  <StatCard
                    title="Passed"
                    value={passedCount}
                    icon={CheckCircle}
                    subtitle={`${passRate}% pass rate`}
                    variant="success"
                  />
                  <StatCard
                    title="Failed"
                    value={failedCount}
                    icon={XCircle}
                    subtitle={`${(100 - parseFloat(passRate)).toFixed(1)}% fail rate`}
                    variant="destructive"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Candidate Details
                </h2>
                <CandidateTable
                  candidates={candidates}
                  onGeneratePDF={handleGeneratePDF}
                />
              </div>
            </>
          )}

          {candidates.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Data Available
              </h3>
              <p className="text-muted-foreground">
                Upload a CSV file to view candidate evaluations and generate reports
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              BrightStart Interview Evaluation System v1.0
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
