import { Card } from "@/components/ui/card";
import { RiskData } from "@/lib/analyticsUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { AlertTriangle, ShieldAlert, AlertCircle, Info } from "lucide-react";

interface RiskComplianceChartProps {
  data: RiskData[];
  totalCandidates: number;
}

const getSeverityColor = (severity: "high" | "medium" | "low"): string => {
  switch (severity) {
    case "high": return "#ef4444";
    case "medium": return "#f59e0b";
    case "low": return "#eab308";
  }
};

const getSeverityIcon = (severity: "high" | "medium" | "low") => {
  switch (severity) {
    case "high": return <ShieldAlert className="w-5 h-5 text-red-600" />;
    case "medium": return <AlertCircle className="w-5 h-5 text-orange-600" />;
    case "low": return <Info className="w-5 h-5 text-yellow-600" />;
  }
};

export default function RiskComplianceChart({ data, totalCandidates }: RiskComplianceChartProps) {
  const highSeverityCount = data.filter(d => d.severity === "high").reduce((sum, d) => sum + d.count, 0);
  const mediumSeverityCount = data.filter(d => d.severity === "medium").reduce((sum, d) => sum + d.count, 0);
  const lowSeverityCount = data.filter(d => d.severity === "low").reduce((sum, d) => sum + d.count, 0);

  const totalIssues = data.reduce((sum, d) => sum + d.count, 0);
  const avgIssuesPerCandidate = totalCandidates > 0 ? totalIssues / totalCandidates : 0;

  const criticalIssues = data.filter(d => d.severity === "high" && d.count > 0);
  const missingItems = data.filter(d => d.status === "missing");
  const failedItems = data.filter(d => d.status === "failed");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Risk & Compliance Analysis
        </h2>
        <p className="text-muted-foreground">
          Detect potential red flags and compliance gaps in candidate screening
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High Risk</p>
              <p className="text-2xl font-bold text-foreground">{highSeverityCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Medium Risk</p>
              <p className="text-2xl font-bold text-foreground">{mediumSeverityCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Info className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Risk</p>
              <p className="text-2xl font-bold text-foreground">{lowSeverityCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Issues/Candidate</p>
              <p className="text-2xl font-bold text-foreground">{avgIssuesPerCandidate.toFixed(1)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Distribution by Category</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 200, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="category" type="category" width={190} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as RiskData;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-1">{data.category}</p>
                      <p className="text-sm">Count: {data.count}</p>
                      <p className="text-sm">Percentage: {data.percentage.toFixed(1)}%</p>
                      <p className="text-sm capitalize">Severity: {data.severity}</p>
                      <p className="text-sm capitalize">Status: {data.status}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="count" name="Candidates Affected" radius={[0, 8, 8, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getSeverityColor(entry.severity)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            Critical Issues Requiring Immediate Attention
          </h3>
          {criticalIssues.length > 0 ? (
            <div className="space-y-3">
              {criticalIssues.map((issue, index) => (
                <div key={index} className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-sm text-red-900 dark:text-red-100">{issue.category}</p>
                    <span className="text-xs font-medium px-2 py-1 bg-red-600 text-white rounded">
                      {issue.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-lg font-bold text-red-600">{issue.count} candidates</p>
                    <p className="text-sm text-red-600">{issue.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ShieldAlert className="w-12 h-12 mx-auto mb-2 text-green-600" />
              <p className="font-medium">No Critical Issues Found</p>
              <p className="text-sm">All candidates passed high-severity checks</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Compliance Status Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Failed Checks</span>
                <span className="text-sm font-bold text-red-600">
                  {failedItems.reduce((sum, i) => sum + i.count, 0)}
                </span>
              </div>
              <div className="space-y-2">
                {failedItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-xs pl-4">
                    <span className="text-muted-foreground">{item.category}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Missing Documentation</span>
                <span className="text-sm font-bold text-orange-600">
                  {missingItems.reduce((sum, i) => sum + i.count, 0)}
                </span>
              </div>
              <div className="space-y-2">
                {missingItems.map((item, index) => (
                  <div key={index} className="flex justify-between text-xs pl-4">
                    <span className="text-muted-foreground">{item.category}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">All Risk Indicators</h3>
        <div className="space-y-3">
          {data.map((risk, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  {getSeverityIcon(risk.severity)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{risk.category}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {risk.severity} severity • {risk.status}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold" style={{ color: getSeverityColor(risk.severity) }}>
                  {risk.count}
                </p>
                <p className="text-xs text-muted-foreground">{risk.percentage.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
