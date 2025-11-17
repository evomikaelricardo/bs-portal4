import StatCard from '../StatCard';
import { Users, CheckCircle, XCircle } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Candidates"
        value={48}
        icon={Users}
        subtitle="Processed this month"
        variant="default"
      />
      <StatCard
        title="Passed"
        value={32}
        icon={CheckCircle}
        subtitle="66.7% pass rate"
        variant="success"
      />
      <StatCard
        title="Failed"
        value={16}
        icon={XCircle}
        subtitle="33.3% fail rate"
        variant="destructive"
      />
    </div>
  );
}
