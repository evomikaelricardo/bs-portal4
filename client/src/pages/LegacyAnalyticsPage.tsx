import { useCandidates } from "@/context/CandidateContext";
import Analytics from "./Analytics";
import { Card } from "@/components/ui/card";

export default function LegacyAnalyticsPage() {
  const { activeDataset, candidates: legacyCandidates } = useCandidates();
  
  // Extract candidates from active dataset if it's a candidate dataset
  const activeCandidates = activeDataset?.type === "candidate" ? activeDataset.candidates : [];
  const candidates = activeCandidates.length > 0 ? activeCandidates : legacyCandidates;

  if (candidates.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">
            Please load candidate data from one of the following sources:
          </p>
          <ul className="mt-4 text-muted-foreground text-sm space-y-1">
            <li>• Upload a CSV file on the Home page</li>
            <li>• Load data in Text Recruitment Inbound</li>
          </ul>
        </Card>
      </div>
    );
  }

  return <Analytics candidates={candidates} />;
}
