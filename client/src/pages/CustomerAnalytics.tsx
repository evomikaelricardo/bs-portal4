import { useState } from "react";
import { CustomerService } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Smile, HeartPulse, Clock, MapPin, Activity } from "lucide-react";
import {
  calculateInquiryTrends,
  calculateReferralSources,
  calculateServiceSentiment,
  calculatePatientProblems,
  calculateServiceHours,
  calculateServiceTime,
  calculateZipCodeDistribution,
  calculateContactMethods,
  calculateCallbackScheduling,
  calculateNursePreference,
  calculateAverageServiceHours,
  calculateReferralConversion,
  calculateDementiaPercentage,
  calculateTop5ZipCodes,
  calculateReferralSentimentCrossAnalysis,
} from "@/lib/customerAnalyticsUtils";
import InquiryTrendChart from "@/components/analytics/customer/InquiryTrendChart";
import ReferralSourceChart from "@/components/analytics/customer/ReferralSourceChart";
import SentimentChart from "@/components/analytics/customer/SentimentChart";
import PatientProblemChart from "@/components/analytics/customer/PatientProblemChart";
import ServiceHoursChart from "@/components/analytics/customer/ServiceHoursChart";
import ServiceTimeChart from "@/components/analytics/customer/ServiceTimeChart";
import ZipCodeChart from "@/components/analytics/customer/ZipCodeChart";
import ContactMethodChart from "@/components/analytics/customer/ContactMethodChart";
import CallbackChart from "@/components/analytics/customer/CallbackChart";
import NursePreferenceChart from "@/components/analytics/customer/NursePreferenceChart";
import ReferralSentimentHeatmap from "@/components/analytics/customer/ReferralSentimentHeatmap";
import StatisticsCards from "@/components/analytics/customer/StatisticsCards";

interface CustomerAnalyticsProps {
  customers: CustomerService[];
}

export default function CustomerAnalytics({ customers }: CustomerAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (customers.length === 0) {
    return (
      <div className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Customer Service Analytics</h1>
            <Card className="p-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Data Available
              </h3>
              <p className="text-muted-foreground">
                Upload customer data to view comprehensive analytics and insights
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const inquiryTrends = calculateInquiryTrends(customers);
  const referralSources = calculateReferralSources(customers);
  const sentimentData = calculateServiceSentiment(customers);
  const patientProblems = calculatePatientProblems(customers);
  const serviceHours = calculateServiceHours(customers);
  const serviceTime = calculateServiceTime(customers);
  const zipCodeData = calculateZipCodeDistribution(customers);
  const contactMethods = calculateContactMethods(customers);
  const callbackData = calculateCallbackScheduling(customers);
  const nursePreference = calculateNursePreference(customers);
  const averageHours = calculateAverageServiceHours(customers);
  const conversionData = calculateReferralConversion(customers);
  const dementiaData = calculateDementiaPercentage(customers);
  const topZipCodes = calculateTop5ZipCodes(customers);
  const referralSentiment = calculateReferralSentimentCrossAnalysis(customers);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Customer Service Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Analyzing {customers.length} customer service inquiry/inquiries
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 gap-2">
              <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2" data-testid="tab-trends">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Trends</span>
              </TabsTrigger>
              <TabsTrigger value="referrals" className="flex items-center gap-2" data-testid="tab-referrals">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Referrals</span>
              </TabsTrigger>
              <TabsTrigger value="sentiment" className="flex items-center gap-2" data-testid="tab-sentiment">
                <Smile className="w-4 h-4" />
                <span className="hidden sm:inline">Sentiment</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2" data-testid="tab-health">
                <HeartPulse className="w-4 h-4" />
                <span className="hidden sm:inline">Health</span>
              </TabsTrigger>
              <TabsTrigger value="scheduling" className="flex items-center gap-2" data-testid="tab-scheduling">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Scheduling</span>
              </TabsTrigger>
              <TabsTrigger value="geography" className="flex items-center gap-2" data-testid="tab-geography">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Geography</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Key Statistics</h2>
                <p className="text-muted-foreground mb-6">
                  Essential metrics at a glance
                </p>
              </div>
              <StatisticsCards
                averageHours={averageHours}
                conversionData={conversionData}
                dementiaData={dementiaData}
                topZipCodes={topZipCodes}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReferralSourceChart data={referralSources} />
                <SentimentChart data={sentimentData} />
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Inquiry Trends</h2>
                <p className="text-muted-foreground mb-6">
                  Volume and patterns over time
                </p>
              </div>
              <InquiryTrendChart data={inquiryTrends} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CallbackChart data={callbackData} />
                <ContactMethodChart data={contactMethods} />
              </div>
            </TabsContent>

            <TabsContent value="referrals" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Referral Analysis</h2>
                <p className="text-muted-foreground mb-6">
                  Lead sources and conversion metrics
                </p>
              </div>
              <ReferralSourceChart data={referralSources} />
              <ReferralSentimentHeatmap data={referralSentiment} />
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Service Experience</h2>
                <p className="text-muted-foreground mb-6">
                  Customer satisfaction and sentiment analysis
                </p>
              </div>
              <SentimentChart data={sentimentData} />
              <ReferralSentimentHeatmap data={referralSentiment} />
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Patient Health Concerns</h2>
                <p className="text-muted-foreground mb-6">
                  Most common problems and care needs
                </p>
              </div>
              <PatientProblemChart data={patientProblems} />
              <NursePreferenceChart data={nursePreference} />
            </TabsContent>

            <TabsContent value="scheduling" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Service Scheduling</h2>
                <p className="text-muted-foreground mb-6">
                  Care hours and timing preferences
                </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ServiceHoursChart data={serviceHours} />
                <ServiceTimeChart data={serviceTime} />
              </div>
              <CallbackChart data={callbackData} />
            </TabsContent>

            <TabsContent value="geography" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Geographic Distribution</h2>
                <p className="text-muted-foreground mb-6">
                  Service areas and regional insights
                </p>
              </div>
              <ZipCodeChart data={zipCodeData} />
              <ZipCodeChart 
                data={topZipCodes} 
                title="Top 5 ZIP Codes"
                subtitle="Highest inquiry volume areas"
              />
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
