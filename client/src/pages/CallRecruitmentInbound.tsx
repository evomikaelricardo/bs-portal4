import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CandidateEvaluation } from "@shared/schema";
import { generatePDF } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { useCandidates } from "@/context/CandidateContext";
import StatCard from "@/components/StatCard";
import CandidateTable from "@/components/CandidateTable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Users, CheckCircle, XCircle, Download, RefreshCw, FileText, BarChart3, Cloud, Upload, X } from "lucide-react";
import { useRef, useEffect } from "react";

export default function CallRecruitmentInbound() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { 
    candidates: activeCandidates, 
    dataSource, 
    setDataSource, 
    setApiCandidates, 
    setUploadedCandidates, 
    clearUploadedCandidates,
    claimDataset,
    activateOwner
  } = useCandidates();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: apiCandidates = [], isLoading, isFetching, error, isError, refetch } = useQuery<CandidateEvaluation[]>({
    queryKey: ['/api/external/call-recruitment-inbound'],
  });

  useEffect(() => {
    if (apiCandidates) {
      setApiCandidates(apiCandidates);
      claimDataset("callRecruitmentInbound", {
        candidates: apiCandidates,
        sessionId: null,
        dataSource: "api"
      });
      // Activate this owner if we're in "api" mode
      if (dataSource === "api") {
        activateOwner("callRecruitmentInbound");
      }
    }
  }, [apiCandidates, setApiCandidates, claimDataset, dataSource, activateOwner]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/external/call-recruitment-inbound/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = 'Failed to upload Excel file';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } catch {
          errorMessage = `Upload failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      return response.json() as Promise<CandidateEvaluation[]>;
    },
    onSuccess: (data) => {
      setUploadedCandidates(data);
      setDataSource("upload");
      claimDataset("callRecruitmentInbound", {
        candidates: data,
        sessionId: null,
        dataSource: "upload"
      });
      activateOwner("callRecruitmentInbound");
      toast({
        title: "Upload Successful",
        description: `Successfully loaded ${data.length} candidate(s) from Excel file`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefreshData = async () => {
    const result = await refetch();
    setDataSource("api");
    
    if (result.error) {
      toast({
        title: "Error",
        description: result.error instanceof Error ? result.error.message : "Failed to fetch data from API",
        variant: "destructive",
      });
    } else if (result.data) {
      claimDataset("callRecruitmentInbound", {
        candidates: result.data,
        sessionId: null,
        dataSource: "api"
      });
      activateOwner("callRecruitmentInbound");
      if (result.data.length > 0) {
        toast({
          title: "Success",
          description: `Successfully loaded ${result.data.length} candidate(s) from API`,
        });
      } else {
        toast({
          title: "No Data",
          description: "No candidates found in the database",
        });
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      uploadMutation.mutate(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleClearUpload = () => {
    clearUploadedCandidates();
    toast({
      title: "Cleared",
      description: "Uploaded data cleared, switched back to live database",
    });
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
      activeCandidates.forEach((candidate) => {
        generatePDF(candidate);
      });
      toast({
        title: "PDFs Generated",
        description: `${activeCandidates.length} reports have been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDFs",
        variant: "destructive",
      });
    }
  };

  const passedCount = activeCandidates.filter((c) => c.result === "PASS").length;
  const failedCount = activeCandidates.filter((c) => c.result === "FAIL").length;
  const passRate = activeCandidates.length > 0 
    ? ((passedCount / activeCandidates.length) * 100).toFixed(1) 
    : "0";

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Inbound Staff Recruitment Via Phone Call
                </h2>
                <p className="text-muted-foreground">
                  Viewing candidate interview evaluations
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefreshData}
                  disabled={isFetching}
                  title="Refresh from Database"
                  data-testid="button-refresh-data"
                >
                  <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                  title="Upload Excel File"
                  data-testid="button-upload-excel"
                >
                  <Upload className={`w-4 h-4 ${uploadMutation.isPending ? 'animate-pulse' : ''}`} />
                </Button>

                <div className="flex items-center gap-2 ml-2 px-2 py-1 rounded-md bg-muted/50">
                  {dataSource === "api" ? (
                    <Cloud className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {dataSource === "api" ? "Live Database" : "Uploaded Excel"}
                  </span>
                </div>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-file"
            />

            {dataSource === "upload" && (
              <div className="mb-4">
                <ToggleGroup 
                  type="single" 
                  value={dataSource} 
                  onValueChange={(value) => value && setDataSource(value as "api" | "upload")}
                  className="justify-start gap-2"
                  data-testid="toggle-data-source"
                >
                  <ToggleGroupItem value="api" className="gap-2" data-testid="toggle-api">
                    <Cloud className="w-4 h-4" />
                    Live Database
                  </ToggleGroupItem>
                  <ToggleGroupItem value="upload" className="gap-2" data-testid="toggle-upload">
                    <Upload className="w-4 h-4" />
                    Uploaded Excel
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            )}

            {dataSource === "upload" && (
              <Button
                variant="outline"
                onClick={handleClearUpload}
                className="w-full mt-2"
                data-testid="button-clear-upload"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Uploaded Data
              </Button>
            )}
            
            {isError && error && (
              <Card className="mt-4 p-4 bg-destructive/5 border-destructive/20">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Error:</span>{" "}
                    {error instanceof Error ? error.message : "Failed to load data from API"}
                  </p>
                </div>
              </Card>
            )}
          </div>

          {activeCandidates.length > 0 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Evaluation Summary
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/staffs/call/recruitment/inbound/analytics")}
                    data-testid="button-view-analytics"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    title="Total Candidates"
                    value={activeCandidates.length}
                    icon={Users}
                    subtitle={dataSource === "api" ? "From Database" : "From Excel Upload"}
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Candidate Details
                  </h2>
                  <Button
                    onClick={handleGenerateAllPDFs}
                    data-testid="button-generate-all"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generate All PDF Interview Forms
                  </Button>
                </div>
                <CandidateTable
                  candidates={activeCandidates}
                  onGeneratePDF={handleGeneratePDF}
                  defaultSortColumn="date"
                  defaultSortDirection="desc"
                />
              </div>
            </>
          )}

          {activeCandidates.length === 0 && !isLoading && !uploadMutation.isPending && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Data Available
              </h3>
              <p className="text-muted-foreground">
                Click "Refresh from Database" or upload an Excel file to load candidate evaluations
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
