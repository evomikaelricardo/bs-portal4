import { Card } from "@/components/ui/card";
import { QualificationData } from "@/lib/analyticsUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface QualificationProfileChartProps {
  data: QualificationData[];
  totalCandidates: number;
}

export default function QualificationProfileChart({ data, totalCandidates }: QualificationProfileChartProps) {
  const chartData = data.map(d => ({
    name: d.name,
    Qualified: d.qualified,
    "Not Qualified": d.notQualified,
    Missing: d.missing,
  }));

  const fullyCertified = data.every(d => d.qualified === totalCandidates) ? totalCandidates : 0;
  const avgQualificationRate = data.length > 0 
    ? data.reduce((sum, d) => sum + (d.qualified / totalCandidates) * 100, 0) / data.length 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Candidate Qualification Profile
        </h2>
        <p className="text-muted-foreground">
          Assessment of candidate readiness for in-home care roles across key requirements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Qualification Rate</p>
              <p className="text-2xl font-bold text-foreground">{avgQualificationRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fully Certified</p>
              <p className="text-2xl font-bold text-foreground">{fullyCertified}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <HelpCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Requirements Tracked</p>
              <p className="text-2xl font-bold text-foreground">{data.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Qualification Status by Requirement</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 150, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={140} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const total = payload.reduce((sum, p) => sum + (p.value as number || 0), 0);
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-2">{payload[0].payload.name}</p>
                      {payload.map((p, i) => (
                        <p key={i} className="text-sm" style={{ color: p.color }}>
                          {p.name}: {p.value} ({((p.value as number / total) * 100).toFixed(1)}%)
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="Qualified" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
            <Bar dataKey="Not Qualified" stackId="a" fill="#ef4444" />
            <Bar dataKey="Missing" stackId="a" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detailed Breakdown</h3>
        <div className="space-y-3">
          {data.map((qual, index) => {
            const qualRate = (qual.qualified / totalCandidates) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{qual.name}</span>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-3 h-3" /> {qual.qualified}
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle className="w-3 h-3" /> {qual.notQualified}
                    </span>
                    {qual.missing > 0 && (
                      <span className="flex items-center gap-1 text-orange-600">
                        <HelpCircle className="w-3 h-3" /> {qual.missing}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="bg-green-600"
                    style={{ width: `${(qual.qualified / totalCandidates) * 100}%` }}
                  />
                  <div
                    className="bg-red-600"
                    style={{ width: `${(qual.notQualified / totalCandidates) * 100}%` }}
                  />
                  <div
                    className="bg-orange-600"
                    style={{ width: `${(qual.missing / totalCandidates) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {qualRate.toFixed(1)}% qualified
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
