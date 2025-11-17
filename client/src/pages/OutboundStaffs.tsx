import { Card } from "@/components/ui/card";
import { UserCircle } from "lucide-react";

export default function OutboundStaffs() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <UserCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Outbound Staffs
            </h3>
            <p className="text-muted-foreground">
              Staff management features coming soon
            </p>
          </div>
        </div>
      </div>

      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              BrightStart Interview Evaluation System v1.0
            </p>
            <p className="text-sm text-muted-foreground">
              For support, contact: support@brightstart.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
