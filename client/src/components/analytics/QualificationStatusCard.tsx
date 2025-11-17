import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { QualificationStatus } from "@/lib/analyticsUtils";

interface QualificationStatusCardProps {
  data: QualificationStatus;
}

export default function QualificationStatusCard({ data }: QualificationStatusCardProps) {
  const criteriaData = [
    { name: "Work Per Week", count: data.missingCriteria.workPerWeek, field: "workPerWeek" },
    { name: "Can Travel", count: data.missingCriteria.canTravel, field: "canTravel" },
    { name: "1+ Year Experience", count: data.missingCriteria.oneYearExperience, field: "oneYearExperience" },
    { name: "Acceptable Pay Rate", count: data.missingCriteria.payRate, field: "payRate" },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-primary" />
        Qualification Status for Next Interview
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Candidates must answer "Yes" to all four criteria to qualify for the next interview session
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-muted-foreground">Qualified</p>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-qualified-count">
            {data.qualified}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {data.qualifiedPercentage.toFixed(1)}% of total
          </p>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <p className="text-sm text-muted-foreground">Not Qualified</p>
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-not-qualified-count">
            {data.notQualified}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {(100 - data.qualifiedPercentage).toFixed(1)}% of total
          </p>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-muted-foreground">Qualification Rate</p>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-qualification-rate">
            {data.qualifiedPercentage.toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Pass rate for next stage
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Required Criteria Breakdown</h4>
        <p className="text-xs text-muted-foreground mb-3">
          Number of candidates missing each required criterion
        </p>
        {criteriaData.map((criteria, index) => {
          const total = data.qualified + data.notQualified;
          const meetingCriteria = total - criteria.count;
          const percentage = total > 0 ? (meetingCriteria / total) * 100 : 0;

          return (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md" data-testid={`criteria-${criteria.field}`}>
              <div className="flex-1">
                <p className="font-medium text-sm">{criteria.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-background rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="ml-4 text-right">
                <p className="text-lg font-bold">{meetingCriteria}</p>
                <p className="text-xs text-muted-foreground">
                  {criteria.count} missing
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
