import { useCandidates } from "@/context/CandidateContext";
import Analytics from "./Analytics";
import { Card } from "@/components/ui/card";

export default function AnalyticsPage() {
  const { getCandidateDataset } = useCandidates();
  
  const staffDataset = getCandidateDataset("callRecruitmentInbound");
  const candidates = staffDataset?.candidates || [];

  if (candidates.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">
            Please load candidate data from the Staff Call Recruitment Inbound page.
          </p>
        </Card>
      </div>
    );
  }

  return <Analytics candidates={candidates} />;
}
