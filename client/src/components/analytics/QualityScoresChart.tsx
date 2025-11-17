import { Card } from "@/components/ui/card";
import { ScoreDistribution } from "@/lib/analyticsUtils";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { Award, TrendingUp } from "lucide-react";

interface QualityScoresChartProps {
  scoreDistribution: {
    experience: ScoreDistribution[];
    compassion: ScoreDistribution[];
    safety: ScoreDistribution[];
    professionalism: ScoreDistribution[];
    overall: ScoreDistribution[];
    missing: { experience: number; compassion: number; safety: number; professionalism: number };
  };
  averageScores: {
    experience: number;
    compassion: number;
    safety: number;
    professionalism: number;
    overall: number;
  };
  totalCandidates: number;
}

const SCORE_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

export default function QualityScoresChart({ scoreDistribution, averageScores, totalCandidates }: QualityScoresChartProps) {
  const radarData = [
    { category: "Experience", score: averageScores.experience },
    { category: "Compassion", score: averageScores.compassion },
    { category: "Safety", score: averageScores.safety },
    { category: "Professionalism", score: averageScores.professionalism },
  ];

  const getScoreRating = (score: number): { rating: string; color: string } => {
    if (score >= 4.5) return { rating: "Exceptional", color: "text-green-600" };
    if (score >= 3.5) return { rating: "Good", color: "text-blue-600" };
    if (score >= 2.5) return { rating: "Average", color: "text-yellow-600" };
    if (score >= 1.5) return { rating: "Below Average", color: "text-orange-600" };
    return { rating: "Poor", color: "text-red-600" };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Candidate Quality Scores
        </h2>
        <p className="text-muted-foreground">
          Evaluate soft skills and interview performance across key dimensions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Average Scores by Dimension
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 5]} />
              <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Performance Summary
          </h3>
          <div className="space-y-4">
            {radarData.map((item, index) => {
              const { rating, color } = getScoreRating(item.score);
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.category}</span>
                    <div className="text-right">
                      <span className="text-lg font-bold">{item.score.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground"> / 5.0</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(item.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${color}`}>{rating}</span>
                  </div>
                </div>
              );
            })}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Overall Average</span>
                <div>
                  <span className="text-2xl font-bold text-primary">
                    {averageScores.overall.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground"> / 5.0</span>
                </div>
              </div>
              <p className={`text-sm mt-1 ${getScoreRating(averageScores.overall).color}`}>
                {getScoreRating(averageScores.overall).rating}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Overall Score Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={scoreDistribution.overall} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="scoreRange" label={{ value: "Score Range", position: "insideBottom", offset: -5 }} />
            <YAxis label={{ value: "Candidates", angle: -90, position: "insideLeft" }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ScoreDistribution;
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold">Score Range: {data.scoreRange}</p>
                      <p className="text-sm">Count: {data.count}</p>
                      <p className="text-sm">Percentage: {data.percentage.toFixed(1)}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="count" name="Candidates" radius={[8, 8, 0, 0]}>
              {scoreDistribution.overall.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={SCORE_COLORS[index % SCORE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(scoreDistribution.missing).map(([key, value]) => (
          <Card key={key} className="p-4">
            <p className="text-sm text-muted-foreground capitalize">{key}</p>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">
              Missing scores ({((value / totalCandidates) * 100).toFixed(1)}%)
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
