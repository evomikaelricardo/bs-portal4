import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { FormQualificationData } from "@/lib/formAnalyticsUtils";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface FormQualificationChartProps {
  data: FormQualificationData[];
  totalSubmissions: number;
}

export default function FormQualificationChart({ data, totalSubmissions }: FormQualificationChartProps) {
  return (
    <Card data-testid="card-form-qualification-chart">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Qualification Profile
        </CardTitle>
        <CardDescription>
          Analysis of applicant qualifications and requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((qual, index) => {
            const qualifiedPercentage = totalSubmissions > 0 
              ? (qual.qualified / totalSubmissions) * 100 
              : 0;
            const notQualifiedPercentage = totalSubmissions > 0 
              ? (qual.notQualified / totalSubmissions) * 100 
              : 0;
            const missingPercentage = totalSubmissions > 0 
              ? (qual.missing / totalSubmissions) * 100 
              : 0;

            return (
              <div key={index} className="space-y-2" data-testid={`qualification-${index}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{qual.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {qual.qualified}/{totalSubmissions}
                  </span>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="bg-green-500"
                    style={{ width: `${qualifiedPercentage}%` }}
                    title={`Qualified: ${qual.qualified}`}
                  />
                  <div
                    className="bg-red-500"
                    style={{ width: `${notQualifiedPercentage}%` }}
                    title={`Not Qualified: ${qual.notQualified}`}
                  />
                  <div
                    className="bg-gray-400"
                    style={{ width: `${missingPercentage}%` }}
                    title={`Missing: ${qual.missing}`}
                  />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>{qualifiedPercentage.toFixed(1)}% Qualified</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>{notQualifiedPercentage.toFixed(1)}% Not Qualified</span>
                  </div>
                  {qual.missing > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-gray-400" />
                      <span>{missingPercentage.toFixed(1)}% Missing</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
