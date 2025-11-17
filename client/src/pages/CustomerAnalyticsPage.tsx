import { useCustomers } from "@/context/CustomerContext";
import CustomerAnalytics from "./CustomerAnalytics";

export default function CustomerAnalyticsPage() {
  const { customers } = useCustomers();
  return <CustomerAnalytics customers={customers} />;
}
