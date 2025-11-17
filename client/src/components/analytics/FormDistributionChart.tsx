import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { FormDistribution } from "@/lib/formAnalyticsUtils";

interface FormDistributionChartProps {
  title: string;
  description: string;
  data: FormDistribution[];
  icon?: React.ReactNode;
}

export default function FormDistributionChart({ title, description, data, icon }: FormDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card data-testid="card-form-distribution-chart">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2" data-testid={`distribution-${index}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{item.category}</span>
                <span className="text-sm text-muted-foreground">
                  {item.count} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
