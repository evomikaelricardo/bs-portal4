import { useState } from "react";
import { CandidateEvaluation } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import {
  BarChart3,
  Award,
  TrendingUp,
  MapPin,
  Clock,
  AlertTriangle,
  Sparkles,
  Table,
  FileDown,
  ArrowLeft,
} from "lucide-react";
import {
  calculateRecruitmentFunnel,
  calculateQualifications,
  calculateScoreDistribution,
  calculateGeographicDistribution,
  calculateTimeSeriesMetrics,
  calculateRiskMetrics,
  calculateAverageScores,
  calculateResultDistribution,
  calculateTravelAbility,
  calculateStatisticalSummary,
  calculateComplianceCredentials,
  calculateQualificationStatus,
} from "@/lib/analyticsUtils";
import { exportAnalyticsToPdf } from "@/lib/exportAnalyticsPdf";
import RecruitmentFunnelChart from "@/components/analytics/RecruitmentFunnelChart";
import QualificationProfileChart from "@/components/analytics/QualificationProfileChart";
import QualityScoresChart from "@/components/analytics/QualityScoresChart";
import GeographicDistributionChart from "@/components/analytics/GeographicDistributionChart";
import OperationalEfficiencyChart from "@/components/analytics/OperationalEfficiencyChart";
import RiskComplianceChart from "@/components/analytics/RiskComplianceChart";
import QualificationStatusCard from "@/components/analytics/QualificationStatusCard";
import {
  InterviewResultsChart,
  TravelAbilityChart,
  StatisticalSummaryTable,
  ComplianceCredentialsChart,
} from "@/components/analytics/EnhancedAnalyticsCharts";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsProps {
  candidates: CandidateEvaluation[];
}

export default function Analytics({ candidates }: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState("funnel");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleExportPdf = () => {
    try {
      exportAnalyticsToPdf(candidates);
      toast({
        title: "PDF Exported",
        description: "Analytics report has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred while generating the PDF report",
        variant: "destructive",
      });
    }
  };

  if (candidates.length === 0) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Recruitment Analytics</h1>
            <Card className="p-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Data Available
              </h3>
              <p className="text-muted-foreground">
                Upload candidate data to view comprehensive analytics and insights
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const funnelData = calculateRecruitmentFunnel(candidates);
  const qualifications = calculateQualifications(candidates);
  const scoreDistribution = calculateScoreDistribution(candidates);
  const averageScores = calculateAverageScores(candidates);
  const geoData = calculateGeographicDistribution(candidates);
  const timeSeriesData = calculateTimeSeriesMetrics(candidates);
  const riskData = calculateRiskMetrics(candidates);
  
  const resultDistribution = calculateResultDistribution(candidates);
  const travelAbility = calculateTravelAbility(candidates);
  const statisticalSummary = calculateStatisticalSummary(candidates);
  const complianceCredentials = calculateComplianceCredentials(candidates);
  const qualificationStatus = calculateQualificationStatus(candidates);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.history.back()}
                title="Go Back"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Recruitment Analytics Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Analyzing {candidates.length} candidate(s) for in-home healthcare recruitment
                </p>
              </div>
            </div>
            <Button
              onClick={handleExportPdf}
              className="gap-2"
              data-testid="button-export-analytics-pdf"
            >
              <FileDown className="w-4 h-4" />
              Export to PDF
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8 gap-2">
              <TabsTrigger value="funnel" className="flex items-center gap-2" data-testid="tab-funnel">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Funnel</span>
              </TabsTrigger>
              <TabsTrigger value="qualifications" className="flex items-center gap-2" data-testid="tab-qualifications">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Qualifications</span>
              </TabsTrigger>
              <TabsTrigger value="quality" className="flex items-center gap-2" data-testid="tab-quality">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Quality</span>
              </TabsTrigger>
              <TabsTrigger value="geography" className="flex items-center gap-2" data-testid="tab-geography">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Geography</span>
              </TabsTrigger>
              <TabsTrigger value="operational" className="flex items-center gap-2" data-testid="tab-operational">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Operations</span>
              </TabsTrigger>
              <TabsTrigger value="risk" className="flex items-center gap-2" data-testid="tab-risk">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Risk</span>
              </TabsTrigger>
              <TabsTrigger value="enhanced" className="flex items-center gap-2" data-testid="tab-enhanced">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Enhanced</span>
              </TabsTrigger>
              <TabsTrigger value="statistics" className="flex items-center gap-2" data-testid="tab-statistics">
                <Table className="w-4 h-4" />
                <span className="hidden sm:inline">Statistics</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="funnel" className="space-y-4">
              <QualificationStatusCard data={qualificationStatus} />
              <RecruitmentFunnelChart data={funnelData} />
            </TabsContent>

            <TabsContent value="qualifications" className="space-y-4">
              <QualificationStatusCard data={qualificationStatus} />
              <QualificationProfileChart data={qualifications} totalCandidates={candidates.length} />
            </TabsContent>

            <TabsContent value="quality" className="space-y-4">
              <QualityScoresChart
                scoreDistribution={scoreDistribution}
                averageScores={averageScores}
                totalCandidates={candidates.length}
              />
            </TabsContent>

            <TabsContent value="geography" className="space-y-4">
              <GeographicDistributionChart data={geoData} totalCandidates={candidates.length} />
            </TabsContent>

            <TabsContent value="operational" className="space-y-4">
              <OperationalEfficiencyChart data={timeSeriesData} candidates={candidates} />
            </TabsContent>

            <TabsContent value="risk" className="space-y-4">
              <RiskComplianceChart data={riskData} totalCandidates={candidates.length} />
            </TabsContent>

            <TabsContent value="enhanced" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Enhanced Analytics</h2>
                  <p className="text-muted-foreground">
                    Advanced insights including travel ability and compliance credentials
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InterviewResultsChart data={resultDistribution} />
                  <TravelAbilityChart data={travelAbility} />
                </div>
                <ComplianceCredentialsChart data={complianceCredentials} />
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Statistical Analysis</h2>
                  <p className="text-muted-foreground">
                    Comprehensive statistical summary with mean, standard deviation, and quartiles
                  </p>
                </div>
                <StatisticalSummaryTable data={statisticalSummary} />
              </div>
            </TabsContent>
          </Tabs>
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
