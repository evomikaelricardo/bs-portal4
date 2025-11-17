import { CandidateEvaluation } from "@shared/schema";

interface UploadResponse {
  sessionId: string;
  candidateCount: number;
  candidates: CandidateEvaluation[];
  errors: string[];
}

interface CandidatesResponse {
  candidates: CandidateEvaluation[];
}

export async function uploadCSVToAPI(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload-csv', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload CSV');
  }

  return response.json();
}

export async function getCandidatesBySession(sessionId: string): Promise<CandidatesResponse> {
  const response = await fetch(`/api/candidates/${sessionId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to retrieve candidates');
  }

  return response.json();
}

export async function clearCandidatesBySession(sessionId: string): Promise<void> {
  const response = await fetch(`/api/candidates/${sessionId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to clear candidates');
  }
}

export async function checkAPIHealth(): Promise<{ status: string; message: string }> {
  const response = await fetch('/api/health');
  return response.json();
}
