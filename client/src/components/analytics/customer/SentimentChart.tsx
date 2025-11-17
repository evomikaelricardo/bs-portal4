import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { SentimentData } from "@/lib/customerAnalyticsUtils";
import { Smile } from "lucide-react";

interface Props {
  data: SentimentData[];
}

const SENTIMENT_COLORS: Record<string, string> = {
  "Positive": "hsl(142, 71%, 45%)",
  "Neutral": "hsl(var(--muted-foreground))",
  "Negative": "hsl(0, 84%, 60%)",
  "No Experience": "hsl(var(--chart-5))",
};

export default function SentimentChart({ data }: Props) {
  const chartData = data.map(item => ({
    ...item,
    fill: SENTIMENT_COLORS[item.sentiment] || "hsl(var(--muted-foreground))"
  }));

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
          <Smile className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Service Experience Sentiment</h3>
          <p className="text-sm text-muted-foreground">Customer satisfaction analysis</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ sentiment, percentage }) => `${sentiment}: ${percentage.toFixed(1)}%`}
            outerRadius={80}
            dataKey="count"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
