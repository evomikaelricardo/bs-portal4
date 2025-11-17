import { Card } from "./ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  subtitle?: string;
  variant?: "default" | "success" | "destructive";
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  variant = "default",
}: StatCardProps) {
  const colorClasses = {
    default: "text-primary bg-primary/10",
    success: "text-green-600 bg-green-600/10",
    destructive: "text-destructive bg-destructive/10",
  };

  return (
    <Card className="p-6" data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground mb-1" data-testid="text-value">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
