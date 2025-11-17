import { Card } from "@/components/ui/card";
import { GeographicData } from "@/lib/analyticsUtils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MapPin, Globe } from "lucide-react";

interface GeographicDistributionChartProps {
  data: GeographicData[];
  totalCandidates: number;
}

const GEO_COLORS = [
  "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
  "#06b6d4", "#6366f1", "#f43f5e", "#84cc16", "#eab308"
];

export default function GeographicDistributionChart({ data, totalCandidates }: GeographicDistributionChartProps) {
  const topLocations = data.slice(0, 5);
  const otherCount = data.slice(5).reduce((sum, d) => sum + d.count, 0);
  
  const pieData = [
    ...topLocations.map(d => ({ name: d.location, value: d.count })),
    ...(otherCount > 0 ? [{ name: "Others", value: otherCount }] : [])
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Geographic Insights
        </h2>
        <p className="text-muted-foreground">
          Analyze candidate distribution and previous employment locations across the USA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Locations Covered</p>
              <p className="text-2xl font-bold text-foreground">{data.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Location</p>
              <p className="text-lg font-bold text-foreground">{data[0]?.location || "N/A"}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Top Location Share</p>
              <p className="text-2xl font-bold text-foreground">
                {data[0] ? data[0].percentage.toFixed(1) : "0"}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribution by State/Location</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: "Candidates", angle: -90, position: "insideLeft" }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as GeographicData;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold">{data.location}</p>
                        <p className="text-sm">Count: {data.count}</p>
                        <p className="text-sm">Share: {data.percentage.toFixed(1)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="count" name="Candidates" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GEO_COLORS[index % GEO_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Locations Share</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={130}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GEO_COLORS[index % GEO_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Location Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((loc, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full" style={{ backgroundColor: GEO_COLORS[index % GEO_COLORS.length] + "20" }}>
                  <MapPin className="w-4 h-4" style={{ color: GEO_COLORS[index % GEO_COLORS.length] }} />
                </div>
                <span className="font-medium">{loc.location}</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{loc.count}</p>
                <p className="text-xs text-muted-foreground">{loc.percentage.toFixed(1)}%</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
