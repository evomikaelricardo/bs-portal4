import { useFormCandidates } from "@/context/FormCandidateContext";
import FormAnalytics from "./FormAnalytics";

export default function FormAnalyticsPage() {
  const { formSubmissions } = useFormCandidates();
  return <FormAnalytics submissions={formSubmissions} />;
}
