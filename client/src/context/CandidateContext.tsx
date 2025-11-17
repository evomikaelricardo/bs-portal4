import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from "react";
import { CandidateEvaluation, CustomerService } from "@shared/schema";

export type DatasetOwner = "home" | "textRecruitmentInbound" | "callRecruitmentInbound" | "formRecruitmentInbound" | "customerCallRecruitmentInbound";
type DataSource = "api" | "upload";

export interface CandidateDatasetPayload {
  type: "candidate";
  candidates: CandidateEvaluation[];
  sessionId?: string | null;
  dataSource?: DataSource;
}

export interface CustomerDatasetPayload {
  type: "customer";
  customers: CustomerService[];
  sessionId?: string | null;
  dataSource?: DataSource;
}

export type DatasetPayload = CandidateDatasetPayload | CustomerDatasetPayload;

// Legacy interface for backward compatibility
export interface LegacyDatasetPayload {
  candidates: CandidateEvaluation[];
  sessionId?: string | null;
  dataSource?: DataSource;
}

interface CandidateContextType {
  // Legacy API for backward compatibility
  candidates: CandidateEvaluation[];
  setCandidates: (candidates: CandidateEvaluation[]) => void;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  dataSource: DataSource;
  setDataSource: (source: DataSource) => void;
  setApiCandidates: (candidates: CandidateEvaluation[]) => void;
  setUploadedCandidates: (candidates: CandidateEvaluation[]) => void;
  clearUploadedCandidates: () => void;
  
  // New owner-scoped API
  claimDataset: (ownerId: DatasetOwner, payload: DatasetPayload | LegacyDatasetPayload) => void;
  activateOwner: (ownerId: DatasetOwner) => void;
  activeOwner: DatasetOwner | null;
  activeDataset: DatasetPayload | null;
  getDatasetByOwner: (ownerId: DatasetOwner) => DatasetPayload | null;
  getCandidateDataset: (ownerId: DatasetOwner) => CandidateDatasetPayload | null;
  getCustomerDataset: (ownerId: DatasetOwner) => CustomerDatasetPayload | null;
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

export function CandidateProvider({ children }: { children: ReactNode }) {
  const [apiCandidates, setApiCandidates] = useState<CandidateEvaluation[]>([]);
  const [uploadedCandidates, setUploadedCandidates] = useState<CandidateEvaluation[]>([]);
  const [dataSource, setDataSource] = useState<DataSource>("api");
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // New owner-scoped state
  const [datasets, setDatasets] = useState<Map<DatasetOwner, DatasetPayload>>(new Map());
  const [activeOwner, setActiveOwner] = useState<DatasetOwner | null>(null);

  // Legacy candidates derived from dataSource for backward compatibility
  const candidates = useMemo(() => {
    return dataSource === "api" ? apiCandidates : uploadedCandidates;
  }, [dataSource, apiCandidates, uploadedCandidates]);

  // Active dataset derived from activeOwner
  const activeDataset = useMemo<DatasetPayload | null>(() => {
    if (!activeOwner) return null;
    return datasets.get(activeOwner) || null;
  }, [activeOwner, datasets]);

  // Legacy setCandidates for backward compatibility
  const setCandidates = useCallback((newCandidates: CandidateEvaluation[]) => {
    setApiCandidates(newCandidates);
  }, []);

  // Legacy clearUploadedCandidates for backward compatibility
  const clearUploadedCandidates = useCallback(() => {
    setUploadedCandidates([]);
    setDataSource("api");
    // Reclaim the latest API dataset for the current activeOwner
    if (activeOwner) {
      setDatasets(prev => {
        const newMap = new Map(prev);
        // Use current API candidates, not stale upload data
        newMap.set(activeOwner, {
          type: "candidate",
          candidates: apiCandidates,
          sessionId: null,
          dataSource: "api"
        });
        return newMap;
      });
      // Keep the same activeOwner so the current page's dataset remains active
    }
  }, [apiCandidates, activeOwner]);

  // New owner-scoped API
  const claimDataset = useCallback((ownerId: DatasetOwner, payload: DatasetPayload | LegacyDatasetPayload) => {
    // Convert legacy payload to new format if needed
    let normalizedPayload: DatasetPayload;
    if ('candidates' in payload && !('type' in payload)) {
      // Legacy format - convert to candidate dataset
      normalizedPayload = {
        type: "candidate",
        candidates: payload.candidates,
        sessionId: payload.sessionId,
        dataSource: payload.dataSource
      };
    } else {
      normalizedPayload = payload as DatasetPayload;
    }
    setDatasets(prev => new Map(prev).set(ownerId, normalizedPayload));
  }, []);

  const activateOwner = useCallback((ownerId: DatasetOwner) => {
    setActiveOwner(ownerId);
  }, []);

  const getDatasetByOwner = useCallback((ownerId: DatasetOwner): DatasetPayload | null => {
    return datasets.get(ownerId) || null;
  }, [datasets]);

  const getCandidateDataset = useCallback((ownerId: DatasetOwner): CandidateDatasetPayload | null => {
    const dataset = datasets.get(ownerId);
    if (dataset && dataset.type === "candidate") {
      return dataset;
    }
    return null;
  }, [datasets]);

  const getCustomerDataset = useCallback((ownerId: DatasetOwner): CustomerDatasetPayload | null => {
    const dataset = datasets.get(ownerId);
    if (dataset && dataset.type === "customer") {
      return dataset;
    }
    return null;
  }, [datasets]);

  return (
    <CandidateContext.Provider 
      value={{ 
        // Legacy API
        candidates, 
        setCandidates, 
        sessionId, 
        setSessionId,
        dataSource,
        setDataSource,
        setApiCandidates,
        setUploadedCandidates,
        clearUploadedCandidates,
        // New owner-scoped API
        claimDataset,
        activateOwner,
        activeOwner,
        activeDataset,
        getDatasetByOwner,
        getCandidateDataset,
        getCustomerDataset,
      }}
    >
      {children}
    </CandidateContext.Provider>
  );
}

export function useCandidates() {
  const context = useContext(CandidateContext);
  if (context === undefined) {
    throw new Error("useCandidates must be used within a CandidateProvider");
  }
  return context;
}
