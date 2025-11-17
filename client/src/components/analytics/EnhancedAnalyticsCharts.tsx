import { Card } from "@/components/ui/card";
import {
  ResultDistribution,
  TravelAbilityData,
  StatisticalSummary,
  ComplianceCredentials,
} from "@/lib/analyticsUtils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  FileCheck,
  Car,
  BarChart3,
  Shield,
} from "lucide-react";

const RESULT_COLORS: Record<string, string> = {
  PASS: "#10b981",
  FAIL: "#ef4444",
  HANGUP: "#f59e0b",
  UNKNOWN: "#6b7280",
};

const TRAVEL_COLORS = ["#3b82f6", "#ef4444", "#94a3b8"];
const CLIENT_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

interface InterviewResultsChartProps {
  data: ResultDistribution[];
}

export function InterviewResultsChart({ data }: InterviewResultsChartProps) {
  const totalInterviews = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileCheck className="w-5 h-5 text-primary" />
        Interview Result Distribution
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="result"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ result, percentage }) => `${result}: ${percentage.toFixed(1)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={RESULT_COLORS[entry.result] || "#6b7280"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: RESULT_COLORS[item.result] || "#6b7280" }}
                />
                <span className="font-medium">{item.result}</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{item.count}</p>
                <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

interface TravelAbilityChartProps {
  data: TravelAbilityData[];
}

export function TravelAbilityChart({ data }: TravelAbilityChartProps) {
  const canTravelData = data.find(d => d.category === "Can Travel");
  const totalCandidates = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Car className="w-5 h-5 text-primary" />
        Travel Ability Distribution
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ category, percentage }) => `${percentage.toFixed(1)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={TRAVEL_COLORS[index % TRAVEL_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-muted-foreground">Can Travel</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {canTravelData ? canTravelData.percentage.toFixed(1) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">
              {canTravelData ? canTravelData.count : 0} of {totalCandidates} candidates
            </p>
          </div>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: TRAVEL_COLORS[index % TRAVEL_COLORS.length] }}
                  />
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <span className="text-sm font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface StatisticalSummaryTableProps {
  data: StatisticalSummary[];
}

export function StatisticalSummaryTable({ data }: StatisticalSummaryTableProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-primary" />
        Statistical Summary of Quality Scores
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Comprehensive statistical analysis including mean, standard deviation, and quartiles
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-testid="stats-table">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 font-semibold">Metric</th>
              <th className="text-right p-2 font-semibold">Count</th>
              <th className="text-right p-2 font-semibold">Mean</th>
              <th className="text-right p-2 font-semibold">Std Dev</th>
              <th className="text-right p-2 font-semibold">Min</th>
              <th className="text-right p-2 font-semibold">Q25</th>
              <th className="text-right p-2 font-semibold">Median</th>
              <th className="text-right p-2 font-semibold">Q75</th>
              <th className="text-right p-2 font-semibold">Max</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b hover-elevate" data-testid={`stats-row-${index}`}>
                <td className="p-2 font-medium">{item.metric}</td>
                <td className="p-2 text-right">{item.count}</td>
                <td className="p-2 text-right">{item.mean.toFixed(2)}</td>
                <td className="p-2 text-right">{item.std.toFixed(2)}</td>
                <td className="p-2 text-right">{item.min.toFixed(2)}</td>
                <td className="p-2 text-right">{item.q25.toFixed(2)}</td>
                <td className="p-2 text-right">{item.median.toFixed(2)}</td>
                <td className="p-2 text-right">{item.q75.toFixed(2)}</td>
                <td className="p-2 text-right">{item.max.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface ComplianceCredentialsChartProps {
  data: ComplianceCredentials[];
}

export function ComplianceCredentialsChart({ data }: ComplianceCredentialsChartProps) {
  const chartData = data.map(item => ({
    name: item.credential,
    "Has Credential": item.hasCredential,
    Missing: item.missingCredential,
    Failed: item.failedCheck,
  }));

  const totalCandidates = data[0]?.total || 0;
  const totalWithAllCredentials = data.every(d => d.hasCredential === totalCandidates)
    ? totalCandidates
    : 0;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        Compliance Credentials Overview
      </h3>
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-muted-foreground">Fully Compliant Candidates</p>
        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {totalWithAllCredentials}
        </p>
        <p className="text-xs text-muted-foreground">
          {totalCandidates > 0 ? ((totalWithAllCredentials / totalCandidates) * 100).toFixed(1) : 0}%
          of total candidates
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-15} textAnchor="end" height={100} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Has Credential" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Missing" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Failed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.map((item, index) => {
          const compliance =
            totalCandidates > 0 ? ((item.hasCredential / totalCandidates) * 100).toFixed(1) : 0;
          return (
            <div key={index} className="p-3 bg-muted rounded-md" data-testid={`credential-${index}`}>
              <p className="text-xs text-muted-foreground truncate">{item.credential}</p>
              <p className="text-lg font-bold">{compliance}%</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {item.hasCredential} compliant
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
