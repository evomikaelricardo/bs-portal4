import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ReferralSentimentData } from "@/lib/customerAnalyticsUtils";
import { Activity } from "lucide-react";

interface Props {
  data: ReferralSentimentData[];
}

export default function ReferralSentimentHeatmap({ data }: Props) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Referral Source vs Sentiment</h3>
          <p className="text-sm text-muted-foreground">Cross-analysis of referral channels and customer satisfaction</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="referral" 
            angle={-45}
            textAnchor="end"
            height={120}
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend />
          <Bar dataKey="positive" stackId="a" fill="hsl(142, 71%, 45%)" name="Positive" />
          <Bar dataKey="neutral" stackId="a" fill="hsl(var(--muted-foreground))" name="Neutral" />
          <Bar dataKey="negative" stackId="a" fill="hsl(0, 84%, 60%)" name="Negative" />
          <Bar dataKey="noExperience" stackId="a" fill="hsl(var(--chart-5))" name="No Experience" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
