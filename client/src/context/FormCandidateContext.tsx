import { createContext, useContext, useState, ReactNode } from "react";
import { FormStaffSubmission } from "@shared/schema";

interface FormCandidateContextType {
  formSubmissions: FormStaffSubmission[];
  setFormSubmissions: (submissions: FormStaffSubmission[]) => void;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
}

const FormCandidateContext = createContext<FormCandidateContextType | undefined>(undefined);

export function FormCandidateProvider({ children }: { children: ReactNode }) {
  const [formSubmissions, setFormSubmissions] = useState<FormStaffSubmission[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  return (
    <FormCandidateContext.Provider value={{ formSubmissions, setFormSubmissions, sessionId, setSessionId }}>
      {children}
    </FormCandidateContext.Provider>
  );
}

export function useFormCandidates() {
  const context = useContext(FormCandidateContext);
  if (context === undefined) {
    throw new Error("useFormCandidates must be used within a FormCandidateProvider");
  }
  return context;
}
