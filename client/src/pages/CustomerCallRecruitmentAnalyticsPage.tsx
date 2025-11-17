import { useCandidates } from "@/context/CandidateContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { ArrowLeft, TrendingUp, MapPin, Phone, Users, Calendar, FileDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CustomerService } from "@shared/schema";
import { useEffect } from "react";
import InquiryTrendChart from "@/components/analytics/customer/InquiryTrendChart";
import ReferralSourceChart from "@/components/analytics/customer/ReferralSourceChart";
import SentimentChart from "@/components/analytics/customer/SentimentChart";
import PatientProblemChart from "@/components/analytics/customer/PatientProblemChart";
import ServiceHoursChart from "@/components/analytics/customer/ServiceHoursChart";
import ServiceTimeChart from "@/components/analytics/customer/ServiceTimeChart";
import ZipCodeChart from "@/components/analytics/customer/ZipCodeChart";
import CallbackChart from "@/components/analytics/customer/CallbackChart";
import NursePreferenceChart from "@/components/analytics/customer/NursePreferenceChart";
import ContactMethodChart from "@/components/analytics/customer/ContactMethodChart";
import ReferralSentimentHeatmap from "@/components/analytics/customer/ReferralSentimentHeatmap";
import StatisticsCards from "@/components/analytics/customer/StatisticsCards";
import {
  calculateInquiryTrends,
  calculateReferralSources,
  calculateServiceSentiment,
  calculatePatientProblems,
  calculateServiceHours,
  calculateServiceTime,
  calculateZipCodeDistribution,
  calculateCallbackScheduling,
  calculateNursePreference,
  calculateContactMethods,
  calculateReferralSentimentCrossAnalysis,
  calculateAverageServiceHours,
  calculateReferralConversion,
  calculateDementiaPercentage,
  calculateTop5ZipCodes
} from "@/lib/customerAnalyticsUtils";

export default function CustomerCallRecruitmentAnalyticsPage() {
  const { getCustomerDataset, claimDataset, activateOwner } = useCandidates();
  const [, setLocation] = useLocation();
  
  // Try to get the dataset from context first
  const customerDataset = getCustomerDataset("customerCallRecruitmentInbound");
  
  // Fetch data from API if not in context
  const { data: apiCustomers = [], isLoading } = useQuery<CustomerService[]>({
    queryKey: ['/api/external/customer-call-recruitment-inbound'],
    queryFn: async () => {
      const response = await fetch('/api/external/customer-call-recruitment-inbound', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch customer data: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !customerDataset, // Only fetch if we don't have data in context
  });
  
  // Store API data in context when fetched
  useEffect(() => {
    if (apiCustomers.length > 0 && !customerDataset) {
      claimDataset("customerCallRecruitmentInbound", {
        type: "customer",
        customers: apiCustomers,
        sessionId: null,
        dataSource: "api"
      });
      activateOwner("customerCallRecruitmentInbound");
    }
  }, [apiCustomers, customerDataset, claimDataset, activateOwner]);
  
  // Use context data if available, otherwise use API data
  const customers = customerDataset?.customers || apiCustomers;

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Customer Data...</h2>
          <p className="text-muted-foreground">
            Please wait while we fetch customer inquiry data.
          </p>
        </Card>
      </div>
    );
  }
  
  // Show empty state only after loading is complete
  if (!isLoading && customers.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">No Customer Data Available</h2>
          <p className="text-muted-foreground mb-4">
            No customer inquiries found in the database.
          </p>
          <Button onClick={() => setLocation("/customers/call/recruitment/inbound")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Customer Inquiries
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate all analytics data
  const inquiryTrends = calculateInquiryTrends(customers);
  const referralSources = calculateReferralSources(customers);
  const sentiment = calculateServiceSentiment(customers);
  const patientProblems = calculatePatientProblems(customers);
  const serviceHours = calculateServiceHours(customers);
  const serviceTime = calculateServiceTime(customers);
  const zipCodes = calculateZipCodeDistribution(customers);
  const callbacks = calculateCallbackScheduling(customers);
  const nursePreference = calculateNursePreference(customers);
  const contactMethods = calculateContactMethods(customers);
  const referralSentiment = calculateReferralSentimentCrossAnalysis(customers);
  const avgServiceHours = calculateAverageServiceHours(customers);
  const referralConversion = calculateReferralConversion(customers);
  const dementiaStats = calculateDementiaPercentage(customers);
  const top5Zips = calculateTop5ZipCodes(customers);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation("/customers/call/recruitment/inbound")}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-3xl font-bold text-foreground">
                  Customer Inquiry Analytics
                </h1>
              </div>
              <p className="text-muted-foreground">
                Analyzing {customers.length} customer service inquiry(ies) for in-home healthcare services
              </p>
            </div>
          </div>

          {/* Statistics Summary Cards */}
          <StatisticsCards 
            averageHours={avgServiceHours}
            conversionData={referralConversion}
            dementiaData={dementiaStats}
            topZipCodes={top5Zips}
          />

          {/* Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="referrals" className="gap-2">
                <Users className="w-4 h-4" />
                Referrals
              </TabsTrigger>
              <TabsTrigger value="services" className="gap-2">
                <Calendar className="w-4 h-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="geography" className="gap-2">
                <MapPin className="w-4 h-4" />
                Geography
              </TabsTrigger>
              <TabsTrigger value="contact" className="gap-2">
                <Phone className="w-4 h-4" />
                Contact
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <InquiryTrendChart data={inquiryTrends} />
                <SentimentChart data={sentiment} />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <CallbackChart data={callbacks} />
                <NursePreferenceChart data={nursePreference} />
              </div>
              <PatientProblemChart data={patientProblems} />
            </TabsContent>

            {/* Referrals Tab */}
            <TabsContent value="referrals" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ReferralSourceChart data={referralSources} />
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Referral Insights</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Inquiries</p>
                      <p className="text-2xl font-bold">{referralConversion.totalInquiries}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">With Complete Contact Info</p>
                      <p className="text-2xl font-bold">{referralConversion.withFullContact}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <p className="text-2xl font-bold">{referralConversion.conversionRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </Card>
              </div>
              <ReferralSentimentHeatmap data={referralSentiment} />
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ServiceHoursChart data={serviceHours} />
                <ServiceTimeChart data={serviceTime} />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Service Hours Statistics</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Hours/Week</p>
                      <p className="text-2xl font-bold">{avgServiceHours.mean}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Median Hours/Week</p>
                      <p className="text-2xl font-bold">{avgServiceHours.median}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Min Hours</p>
                        <p className="text-xl font-bold">{avgServiceHours.min}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Max Hours</p>
                        <p className="text-xl font-bold">{avgServiceHours.max}</p>
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Patient Care Needs</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Memory/Dementia Related</p>
                      <p className="text-2xl font-bold">{dementiaStats.withDementia}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {dementiaStats.percentage.toFixed(1)}% of total inquiries
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nurse Visit Requested</p>
                      <p className="text-2xl font-bold">
                        {nursePreference.find(n => n.preference.toLowerCase() === 'yes')?.count || 0}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Geography Tab */}
            <TabsContent value="geography" className="space-y-6">
              <ZipCodeChart data={zipCodes} />
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top 5 Service Areas by ZIP Code</h3>
                <div className="space-y-3">
                  {top5Zips.map((zip, index) => (
                    <div key={zip.zipCode} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">ZIP Code {zip.zipCode}</p>
                          <p className="text-sm text-muted-foreground">{zip.count} inquiries</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {((zip.count / customers.length) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ContactMethodChart data={contactMethods} />
                <CallbackChart data={callbacks} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
