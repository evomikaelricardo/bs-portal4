import { Card } from "@/components/ui/card";
import { FunnelData } from "@/lib/analyticsUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { TrendingDown } from "lucide-react";

interface RecruitmentFunnelChartProps {
  data: FunnelData[];
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

export default function RecruitmentFunnelChart({ data }: RecruitmentFunnelChartProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Recruitment Funnel Overview
        </h2>
        <p className="text-muted-foreground">
          Track candidate progression and identify drop-off points in the recruitment process
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 col-span-full lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Conversion Rates by Stage</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" angle={-15} textAnchor="end" height={100} />
              <YAxis label={{ value: "Candidates", angle: -90, position: "insideLeft" }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as FunnelData;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold">{data.stage}</p>
                        <p className="text-sm">Count: {data.count}</p>
                        <p className="text-sm">Conversion: {data.percentage.toFixed(1)}%</p>
                        {data.dropOffRate !== undefined && (
                          <p className="text-sm text-destructive">
                            Drop-off: {data.dropOffRate.toFixed(1)}%
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="count" name="Candidates" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-destructive" />
            Drop-off Analysis
          </h3>
          <div className="space-y-4">
            {data.map((stage, index) => (
              stage.dropOffRate !== undefined && (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <span className={`text-sm font-bold ${
                      stage.dropOffRate > 30 ? "text-destructive" :
                      stage.dropOffRate > 15 ? "text-orange-500" :
                      "text-green-600"
                    }`}>
                      {stage.dropOffRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        stage.dropOffRate > 30 ? "bg-destructive" :
                        stage.dropOffRate > 15 ? "bg-orange-500" :
                        "bg-green-600"
                      }`}
                      style={{ width: `${Math.min(stage.dropOffRate, 100)}%` }}
                    />
                  </div>
                </div>
              )
            ))}
          </div>
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Tip:</span> High drop-off rates may indicate issues with interview scheduling, candidate engagement, or qualification screening.
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {data.map((stage, index) => (
          <Card key={index} className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{stage.stage}</p>
            <p className="text-2xl font-bold text-foreground">{stage.count}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stage.percentage.toFixed(1)}% of total
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
