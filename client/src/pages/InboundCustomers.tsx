import { useState } from "react";
import { useLocation } from "wouter";
import { CustomerService } from "@shared/schema";
import { parseCustomerCSV } from "@/lib/customerCsvParser";
import { generateCustomerPDF } from "@/lib/customerPdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/context/CustomerContext";
import FileUploadZone from "@/components/FileUploadZone";
import StatCard from "@/components/StatCard";
import CustomerTable from "@/components/CustomerTable";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Calendar, Download, Trash2, FileText, BarChart3 } from "lucide-react";

export default function InboundCustomers() {
  const [, setLocation] = useLocation();
  const { customers, setCustomers } = useCustomers();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      const result = await parseCustomerCSV(file);
      
      if (result.errors.length > 0) {
        toast({
          title: "Parsing Warnings",
          description: result.errors.join(", "),
          variant: "destructive",
        });
      }

      if (result.data.length > 0) {
        setCustomers(result.data);
        toast({
          title: "Success",
          description: `Successfully loaded ${result.data.length} customer record(s)`,
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

  const handleGeneratePDF = (customer: CustomerService) => {
    try {
      generateCustomerPDF(customer);
      toast({
        title: "PDF Generated",
        description: `Report for ${customer.contactName} has been downloaded`,
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
      customers.forEach((customer) => {
        generateCustomerPDF(customer);
      });
      toast({
        title: "PDFs Generated",
        description: `${customers.length} reports have been downloaded`,
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
    setCustomers([]);
    toast({
      title: "Data Cleared",
      description: "All customer data has been removed",
    });
  };

  const nurseVisitCount = customers.filter((c) => c.nurseVisit?.toLowerCase() === "yes").length;
  const withCallbackCount = customers.filter((c) => c.callbackDate).length;

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Upload Customer Data
            </h2>
            <p className="text-muted-foreground mb-4">
              Upload your CSV file containing customer service records
            </p>
            
            <FileUploadZone onFileSelect={handleFileSelect} />
          </div>

          {customers.length > 0 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Customer Summary
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/customer-analytics")}
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
                      data-testid="button-generate-all"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Generate All PDFs
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    title="Total Customers"
                    value={customers.length}
                    icon={Users}
                    subtitle="Processed"
                    variant="default"
                  />
                  <StatCard
                    title="Nurse Visits"
                    value={nurseVisitCount}
                    icon={UserCheck}
                    subtitle={`${((nurseVisitCount / customers.length) * 100).toFixed(1)}% of total`}
                    variant="success"
                  />
                  <StatCard
                    title="With Callback"
                    value={withCallbackCount}
                    icon={Calendar}
                    subtitle={`${((withCallbackCount / customers.length) * 100).toFixed(1)}% of total`}
                    variant="default"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Customer Details
                </h2>
                <CustomerTable
                  customers={customers}
                  onGeneratePDF={handleGeneratePDF}
                />
              </div>
            </>
          )}

          {customers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Data Available
              </h3>
              <p className="text-muted-foreground">
                Upload a CSV file to view customer service records
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
