import { type CandidateEvaluation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  saveCandidates(sessionId: string, candidates: CandidateEvaluation[]): Promise<void>;
  getCandidates(sessionId: string): Promise<CandidateEvaluation[]>;
  clearCandidates(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private candidateSessions: Map<string, CandidateEvaluation[]>;

  constructor() {
    this.candidateSessions = new Map();
  }

  async saveCandidates(sessionId: string, candidates: CandidateEvaluation[]): Promise<void> {
    this.candidateSessions.set(sessionId, candidates);
  }

  async getCandidates(sessionId: string): Promise<CandidateEvaluation[]> {
    return this.candidateSessions.get(sessionId) || [];
  }

  async clearCandidates(sessionId: string): Promise<void> {
    this.candidateSessions.delete(sessionId);
  }
}

export const storage = new MemStorage();
