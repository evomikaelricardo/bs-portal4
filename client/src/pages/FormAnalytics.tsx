import { useState } from "react";
import { FormStaffSubmission } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Award,
  AlertTriangle,
  Table,
  Sparkles,
  Users,
  CheckCircle,
} from "lucide-react";
import {
  calculateFormQualificationStatus,
  calculateFormQualifications,
  calculateExperienceDistribution,
  calculateBackgroundCheckIssues,
  calculateComplianceMetrics,
  calculateAvailabilityMetrics,
  calculateDementiaExperience,
  calculateStatisticalSummary,
} from "@/lib/formAnalyticsUtils";
import FormQualificationChart from "@/components/analytics/FormQualificationChart";
import FormDistributionChart from "@/components/analytics/FormDistributionChart";
import FormStatisticsTable from "@/components/analytics/FormStatisticsTable";
import StatCard from "@/components/StatCard";

interface FormAnalyticsProps {
  submissions: FormStaffSubmission[];
}

export default function FormAnalytics({ submissions }: FormAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (submissions.length === 0) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Form Submission Analytics</h1>
            <Card className="p-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Data Available
              </h3>
              <p className="text-muted-foreground">
                Upload form submission data to view comprehensive analytics and insights
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const qualificationStatus = calculateFormQualificationStatus(submissions);
  const qualifications = calculateFormQualifications(submissions);
  const experienceDistribution = calculateExperienceDistribution(submissions);
  const backgroundCheckIssues = calculateBackgroundCheckIssues(submissions);
  const complianceMetrics = calculateComplianceMetrics(submissions);
  const availabilityMetrics = calculateAvailabilityMetrics(submissions);
  const dementiaExperience = calculateDementiaExperience(submissions);
  const statisticalSummary = calculateStatisticalSummary(submissions);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Form Submission Analytics Dashboard
              </h1>
              <p className="text-muted-foreground">
                Analyzing {submissions.length} form submission(s) for staff recruitment
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Submissions"
              value={submissions.length}
              icon={Users}
              subtitle="Received"
              variant="default"
            />
            <StatCard
              title="Qualified Applicants"
              value={qualificationStatus.qualified}
              icon={CheckCircle}
              subtitle={`${qualificationStatus.qualifiedPercentage.toFixed(1)}% qualified`}
              variant="success"
            />
            <StatCard
              title="Background Issues"
              value={qualificationStatus.missingCriteria.backgroundIssues}
              icon={AlertTriangle}
              subtitle={`${((qualificationStatus.missingCriteria.backgroundIssues / submissions.length) * 100).toFixed(1)}% with issues`}
              variant="destructive"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2">
              <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="qualifications" className="flex items-center gap-2" data-testid="tab-qualifications">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Qualifications</span>
              </TabsTrigger>
              <TabsTrigger value="compliance" className="flex items-center gap-2" data-testid="tab-compliance">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Compliance</span>
              </TabsTrigger>
              <TabsTrigger value="experience" className="flex items-center gap-2" data-testid="tab-experience">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Experience</span>
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-2" data-testid="tab-statistics">
                <Table className="w-4 h-4" />
                <span className="hidden sm:inline">Statistics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormDistributionChart
                  title="Experience Distribution"
                  description="Distribution of applicants by experience level"
                  data={experienceDistribution}
                  icon={<Users className="w-5 h-5 text-primary" />}
                />
                <FormDistributionChart
                  title="Background Check Status"
                  description="Distribution of background check issues"
                  data={backgroundCheckIssues}
                  icon={<AlertTriangle className="w-5 h-5 text-primary" />}
                />
              </div>
            </TabsContent>

            <TabsContent value="qualifications" className="space-y-4">
              <FormQualificationChart 
                data={qualifications} 
                totalSubmissions={submissions.length} 
              />
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <FormDistributionChart
                title="Compliance Metrics"
                description="Analysis of compliance requirements and certifications"
                data={complianceMetrics}
                icon={<CheckCircle className="w-5 h-5 text-primary" />}
              />
            </TabsContent>

            <TabsContent value="experience" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormDistributionChart
                  title="Availability & Transportation"
                  description="Availability and transportation capabilities"
                  data={availabilityMetrics}
                  icon={<Users className="w-5 h-5 text-primary" />}
                />
                <FormDistributionChart
                  title="Dementia Care Experience"
                  description="Specialized dementia care experience distribution"
                  data={dementiaExperience}
                  icon={<Sparkles className="w-5 h-5 text-primary" />}
                />
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Statistical Analysis</h2>
                  <p className="text-muted-foreground">
                    Comprehensive statistical summary of all form submissions
                  </p>
                </div>
                <FormStatisticsTable data={statisticalSummary} />
              </div>
            </TabsContent>
          </Tabs>
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
