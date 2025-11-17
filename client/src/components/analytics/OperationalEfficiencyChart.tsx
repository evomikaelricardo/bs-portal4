import { Card } from "@/components/ui/card";
import { TimeSeriesData } from "@/lib/analyticsUtils";
import { CandidateEvaluation } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Clock, TrendingUp, Calendar, BarChart3 } from "lucide-react";

interface OperationalEfficiencyChartProps {
  data: TimeSeriesData[];
  candidates: CandidateEvaluation[];
}

export default function OperationalEfficiencyChart({ data, candidates }: OperationalEfficiencyChartProps) {
  const totalInterviews = candidates.length;
  const averagePassRate = data.length > 0
    ? data.reduce((sum, d) => sum + d.passRate, 0) / data.length
    : 0;
  
  const interviewsByResult = {
    pass: candidates.filter(c => c.result === "PASS").length,
    fail: candidates.filter(c => c.result === "FAIL").length,
    hangup: candidates.filter(c => c.result === "HANGUP").length,
  };

  const resultData = [
    { name: "Passed", value: interviewsByResult.pass, color: "#10b981" },
    { name: "Failed", value: interviewsByResult.fail, color: "#ef4444" },
    { name: "Hung Up", value: interviewsByResult.hangup, color: "#f59e0b" },
  ];

  const peakDay = data.reduce((max, d) => d.interviews > max.interviews ? d : max, data[0] || { date: "N/A", interviews: 0, passRate: 0 });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Operational Efficiency
        </h2>
        <p className="text-muted-foreground">
          Evaluate interview outreach and scheduling performance over time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Interviews</p>
              <p className="text-2xl font-bold text-foreground">{totalInterviews}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Pass Rate</p>
              <p className="text-2xl font-bold text-foreground">{averagePassRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Peak Day</p>
              <p className="text-lg font-bold text-foreground">{peakDay.date.split("-").slice(1).join("/")}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Peak Volume</p>
              <p className="text-2xl font-bold text-foreground">{peakDay.interviews}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Interview Volume & Pass Rate Over Time</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={80}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis yAxisId="left" label={{ value: "Interviews", angle: -90, position: "insideLeft" }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: "Pass Rate (%)", angle: 90, position: "insideRight" }} />
            <Tooltip
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
              }}
              formatter={(value: number, name: string) => {
                if (name === "Pass Rate") return [`${value.toFixed(1)}%`, name];
                return [value, name];
              }}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="interviews" stroke="#3b82f6" name="Interviews" strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="passRate" stroke="#10b981" name="Pass Rate" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Interview Outcomes Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resultData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>
                {resultData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Pass Rate</span>
                <span className="text-sm font-bold text-green-600">
                  {((interviewsByResult.pass / totalInterviews) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600"
                  style={{ width: `${(interviewsByResult.pass / totalInterviews) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Fail Rate</span>
                <span className="text-sm font-bold text-red-600">
                  {((interviewsByResult.fail / totalInterviews) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600"
                  style={{ width: `${(interviewsByResult.fail / totalInterviews) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Hang-up Rate</span>
                <span className="text-sm font-bold text-orange-600">
                  {((interviewsByResult.hangup / totalInterviews) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-600"
                  style={{ width: `${(interviewsByResult.hangup / totalInterviews) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                <span className="font-semibold">Completion Rate:</span>{" "}
                {(((totalInterviews - interviewsByResult.hangup) / totalInterviews) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                Percentage of interviews completed (not hung up)
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
