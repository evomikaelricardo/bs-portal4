import { Card } from "@/components/ui/card";
import { TrendingUp, Database, Percent, MapPin } from "lucide-react";

interface Props {
  averageHours: { mean: number; median: number; min: number; max: number };
  conversionData: { totalInquiries: number; withFullContact: number; conversionRate: number };
  dementiaData: { total: number; withDementia: number; percentage: number };
  topZipCodes: Array<{ zipCode: string; count: number }>;
}

export default function StatisticsCards({
  averageHours,
  conversionData,
  dementiaData,
  topZipCodes
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Average Service Hours</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{averageHours.mean}</span>
            <span className="text-sm text-muted-foreground">hrs/week (mean)</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Median: {averageHours.median} hrs | Range: {averageHours.min}-{averageHours.max} hrs
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Referral Conversion</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{conversionData.conversionRate.toFixed(1)}%</span>
            <span className="text-sm text-muted-foreground">full contact info</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {conversionData.withFullContact} of {conversionData.totalInquiries} inquiries
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Percent className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Dementia/Memory Issues</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{dementiaData.percentage.toFixed(1)}%</span>
            <span className="text-sm text-muted-foreground">of inquiries</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {dementiaData.withDementia} of {dementiaData.total} customers
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Top ZIP Code</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{topZipCodes[0]?.zipCode || "N/A"}</span>
            <span className="text-sm text-muted-foreground">({topZipCodes[0]?.count || 0} inquiries)</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Top 5: {topZipCodes.slice(0, 5).map(z => z.zipCode).join(", ")}
          </div>
        </div>
      </Card>
    </div>
  );
}
