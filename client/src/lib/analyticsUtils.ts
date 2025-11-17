import { CandidateEvaluation } from "@shared/schema";

export interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
  dropOffRate?: number;
}

export interface QualificationData {
  name: string;
  qualified: number;
  notQualified: number;
  missing: number;
  total: number;
}

export interface ScoreDistribution {
  scoreRange: string;
  count: number;
  percentage: number;
}

export interface GeographicData {
  location: string;
  state?: string;
  count: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string;
  interviews: number;
  passRate: number;
}

export interface RiskData {
  category: string;
  count: number;
  percentage: number;
  severity: "high" | "medium" | "low";
  status: "missing" | "failed" | "issue";
}

function normalizeYesNo(value: string | undefined): "yes" | "no" | "unknown" {
  if (!value) return "unknown";
  const normalized = value.toLowerCase().trim();
  if (["yes", "y", "pass", "passed", "completed", "true", "1"].includes(normalized)) {
    return "yes";
  }
  if (["no", "n", "fail", "failed", "false", "0"].includes(normalized)) {
    return "no";
  }
  return "unknown";
}

export function isQualifiedForNextInterview(candidate: CandidateEvaluation): boolean {
  const workPerWeek = normalizeYesNo(candidate.workPerWeek) === "yes";
  const canTravel = normalizeYesNo(candidate.canTravel) === "yes";
  const oneYearExperience = normalizeYesNo(candidate.oneYearExperience) === "yes";
  const payRate = normalizeYesNo(candidate.payRate) === "yes";
  
  return workPerWeek && canTravel && oneYearExperience && payRate;
}

function normalizeLocation(location: string | undefined): { city: string; state: string } {
  if (!location) return { city: "Unknown", state: "Unknown" };
  
  const parts = location.split(",").map(p => p.trim());
  if (parts.length >= 2) {
    return { city: parts[0], state: parts[parts.length - 1] };
  }
  
  return { city: location, state: "Unknown" };
}

export function calculateRecruitmentFunnel(candidates: CandidateEvaluation[]): FunnelData[] {
  const total = candidates.length;
  const attempted = candidates.filter(c => c.result).length;
  const completed = candidates.filter(c => c.result && c.result !== "HANGUP").length;
  const passed = candidates.filter(c => c.result === "PASS").length;
  const qualifiedForNextInterview = candidates.filter(c => c.result === "PASS" && isQualifiedForNextInterview(c)).length;

  const funnel: FunnelData[] = [
    {
      stage: "Total Applications",
      count: total,
      percentage: 100,
    },
    {
      stage: "Interview Attempted",
      count: attempted,
      percentage: total > 0 ? (attempted / total) * 100 : 0,
      dropOffRate: total > 0 ? ((total - attempted) / total) * 100 : 0,
    },
    {
      stage: "Completed Interview",
      count: completed,
      percentage: total > 0 ? (completed / total) * 100 : 0,
      dropOffRate: attempted > 0 ? ((attempted - completed) / attempted) * 100 : 0,
    },
    {
      stage: "Passed Interview",
      count: passed,
      percentage: total > 0 ? (passed / total) * 100 : 0,
      dropOffRate: completed > 0 ? ((completed - passed) / completed) * 100 : 0,
    },
    {
      stage: "Qualified for Next Interview",
      count: qualifiedForNextInterview,
      percentage: total > 0 ? (qualifiedForNextInterview / total) * 100 : 0,
      dropOffRate: passed > 0 ? ((passed - qualifiedForNextInterview) / passed) * 100 : 0,
    },
  ];

  return funnel;
}

export interface QualificationStatus {
  qualified: number;
  notQualified: number;
  qualifiedPercentage: number;
  missingCriteria: {
    workPerWeek: number;
    canTravel: number;
    oneYearExperience: number;
    payRate: number;
  };
}

export function calculateQualificationStatus(candidates: CandidateEvaluation[]): QualificationStatus {
  const passedCandidates = candidates.filter(c => c.result === "PASS");
  const total = passedCandidates.length;
  const qualified = passedCandidates.filter(c => isQualifiedForNextInterview(c)).length;
  const notQualified = total - qualified;

  const missingCriteria = {
    workPerWeek: passedCandidates.filter(c => normalizeYesNo(c.workPerWeek) !== "yes").length,
    canTravel: passedCandidates.filter(c => normalizeYesNo(c.canTravel) !== "yes").length,
    oneYearExperience: passedCandidates.filter(c => normalizeYesNo(c.oneYearExperience) !== "yes").length,
    payRate: passedCandidates.filter(c => normalizeYesNo(c.payRate) !== "yes").length,
  };

  return {
    qualified,
    notQualified,
    qualifiedPercentage: total > 0 ? (qualified / total) * 100 : 0,
    missingCriteria,
  };
}

export function calculateQualifications(candidates: CandidateEvaluation[]): QualificationData[] {
  const total = candidates.length;

  const qualifications = [
    {
      name: "Work Per Week (Required)",
      field: "workPerWeek",
    },
    {
      name: "Can Travel (Required)",
      field: "canTravel",
    },
    {
      name: "1+ Year Experience (Required)",
      field: "oneYearExperience",
    },
    {
      name: "Acceptable Pay Rate (Required)",
      field: "payRate",
    },
    {
      name: "Valid Driver's License",
      field: "validDriverLicense",
    },
    {
      name: "Reliable Transport",
      field: "reliableTransport",
    },
    {
      name: "Background Check",
      field: "backgroundCheck",
    },
    {
      name: "TB Test Negative",
      field: "tbTestNegative",
    },
    {
      name: "CPR Certificate",
      field: "cprCertificate",
    },
    {
      name: "Dementia Care Experience",
      field: "dementiaClient",
    },
  ];

  return qualifications.map(qual => {
    let qualified = 0;
    let notQualified = 0;
    let missing = 0;

    candidates.forEach(c => {
      const value = (c as any)[qual.field];
      const normalized = normalizeYesNo(value);
      
      if (normalized === "yes") {
        qualified++;
      } else if (normalized === "no") {
        notQualified++;
      } else {
        missing++;
      }
    });

    return {
      name: qual.name,
      qualified,
      notQualified,
      missing,
      total,
    };
  });
}

export function calculateScoreDistribution(candidates: CandidateEvaluation[]): {
  experience: ScoreDistribution[];
  compassion: ScoreDistribution[];
  safety: ScoreDistribution[];
  professionalism: ScoreDistribution[];
  overall: ScoreDistribution[];
  missing: { experience: number; compassion: number; safety: number; professionalism: number };
} {
  const scoreRanges = ["0-1", "1-2", "2-3", "3-4", "4-5"];

  const getDistribution = (scoreField: keyof CandidateEvaluation): ScoreDistribution[] => {
    const scores = candidates
      .map(c => {
        const value = c[scoreField] as string;
        if (!value || value.trim() === "") return NaN;
        return parseFloat(value);
      })
      .filter(s => !isNaN(s));

    return scoreRanges.map(range => {
      const [min, max] = range.split("-").map(Number);
      const count = scores.filter(s => s >= min && (range === "4-5" ? s <= max : s < max)).length;
      return {
        scoreRange: range,
        count,
        percentage: scores.length > 0 ? (count / scores.length) * 100 : 0,
      };
    });
  };

  const getMissingCount = (scoreField: keyof CandidateEvaluation): number => {
    return candidates.filter(c => {
      const value = c[scoreField] as string;
      if (!value || value.trim() === "") return true;
      const score = parseFloat(value);
      return isNaN(score);
    }).length;
  };

  const calculateOverallDistribution = (): ScoreDistribution[] => {
    const overallScores = candidates.map(c => {
      const scores = [
        c.experienceScore,
        c.compassionScore,
        c.safetyScore,
        c.professionalismScore,
      ]
        .map(v => {
          if (!v || v.trim() === "") return NaN;
          return parseFloat(v);
        })
        .filter(s => !isNaN(s));

      return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : NaN;
    }).filter(s => !isNaN(s));

    return scoreRanges.map(range => {
      const [min, max] = range.split("-").map(Number);
      const count = overallScores.filter(s => s >= min && (range === "4-5" ? s <= max : s < max)).length;
      return {
        scoreRange: range,
        count,
        percentage: overallScores.length > 0 ? (count / overallScores.length) * 100 : 0,
      };
    });
  };

  return {
    experience: getDistribution("experienceScore"),
    compassion: getDistribution("compassionScore"),
    safety: getDistribution("safetyScore"),
    professionalism: getDistribution("professionalismScore"),
    overall: calculateOverallDistribution(),
    missing: {
      experience: getMissingCount("experienceScore"),
      compassion: getMissingCount("compassionScore"),
      safety: getMissingCount("safetyScore"),
      professionalism: getMissingCount("professionalismScore"),
    },
  };
}

export function calculateGeographicDistribution(candidates: CandidateEvaluation[]): GeographicData[] {
  const stateMap = new Map<string, number>();

  candidates.forEach(c => {
    const { state } = normalizeLocation(c.previousLocation);
    stateMap.set(state, (stateMap.get(state) || 0) + 1);
  });

  const total = candidates.length;
  const geoData = Array.from(stateMap.entries())
    .map(([location, count]) => ({
      location,
      state: location,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return geoData;
}

export function calculateTimeSeriesMetrics(candidates: CandidateEvaluation[]): TimeSeriesData[] {
  const dateMap = new Map<string, { total: number; passed: number }>();

  candidates.forEach(c => {
    try {
      let dateStr = "Unknown";
      if (c.dateTime) {
        const datePart = c.dateTime.includes(" ") ? c.dateTime.split(" ")[0] : c.dateTime;
        const parsedDate = new Date(datePart);
        if (!isNaN(parsedDate.getTime())) {
          dateStr = parsedDate.toISOString().split("T")[0];
        }
      }
      
      const current = dateMap.get(dateStr) || { total: 0, passed: 0 };
      current.total += 1;
      if (c.result === "PASS") {
        current.passed += 1;
      }
      dateMap.set(dateStr, current);
    } catch {
      const current = dateMap.get("Unknown") || { total: 0, passed: 0 };
      current.total += 1;
      if (c.result === "PASS") {
        current.passed += 1;
      }
      dateMap.set("Unknown", current);
    }
  });

  return Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      interviews: data.total,
      passRate: data.total > 0 ? (data.passed / data.total) * 100 : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateRiskMetrics(candidates: CandidateEvaluation[]): RiskData[] {
  const total = candidates.length;

  const risks: RiskData[] = [
    {
      category: "Red Flags Present",
      count: candidates.filter(c => c.redFlags && c.redFlags.length > 0).length,
      percentage: 0,
      severity: "high",
      status: "issue",
    },
    {
      category: "Background Check Failed",
      count: candidates.filter(c => normalizeYesNo(c.backgroundCheck) === "no").length,
      percentage: 0,
      severity: "high",
      status: "failed",
    },
    {
      category: "Background Check Missing",
      count: candidates.filter(c => normalizeYesNo(c.backgroundCheck) === "unknown").length,
      percentage: 0,
      severity: "high",
      status: "missing",
    },
    {
      category: "TB Test Failed",
      count: candidates.filter(c => normalizeYesNo(c.tbTestNegative) === "no").length,
      percentage: 0,
      severity: "high",
      status: "failed",
    },
    {
      category: "TB Test Missing",
      count: candidates.filter(c => normalizeYesNo(c.tbTestNegative) === "unknown").length,
      percentage: 0,
      severity: "medium",
      status: "missing",
    },
    {
      category: "No CPR Certification",
      count: candidates.filter(c => normalizeYesNo(c.cprCertificate) !== "yes").length,
      percentage: 0,
      severity: "medium",
      status: "missing",
    },
    {
      category: "No Valid License",
      count: candidates.filter(c => normalizeYesNo(c.validDriverLicense) !== "yes").length,
      percentage: 0,
      severity: "medium",
      status: "missing",
    },
    {
      category: "No Reliable Transport",
      count: candidates.filter(c => normalizeYesNo(c.reliableTransport) !== "yes").length,
      percentage: 0,
      severity: "medium",
      status: "missing",
    },
    {
      category: "Insufficient Experience",
      count: candidates.filter(c => normalizeYesNo(c.oneYearExperience) !== "yes").length,
      percentage: 0,
      severity: "low",
      status: "missing",
    },
  ];

  risks.forEach(risk => {
    risk.percentage = total > 0 ? (risk.count / total) * 100 : 0;
  });

  return risks.filter(r => r.count > 0);
}

export function calculateAverageScores(candidates: CandidateEvaluation[]): {
  experience: number;
  compassion: number;
  safety: number;
  professionalism: number;
  overall: number;
} {
  const getAverageWithCount = (scoreField: keyof CandidateEvaluation): { avg: number; count: number } => {
    const scores = candidates
      .map(c => {
        const value = c[scoreField] as string;
        if (!value || value.trim() === "") return NaN;
        return parseFloat(value);
      })
      .filter(s => !isNaN(s));
    
    return {
      avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      count: scores.length,
    };
  };

  const expResult = getAverageWithCount("experienceScore");
  const compResult = getAverageWithCount("compassionScore");
  const safeResult = getAverageWithCount("safetyScore");
  const profResult = getAverageWithCount("professionalismScore");

  const validScores = [
    expResult.count > 0 ? expResult.avg : null,
    compResult.count > 0 ? compResult.avg : null,
    safeResult.count > 0 ? safeResult.avg : null,
    profResult.count > 0 ? profResult.avg : null,
  ].filter((s): s is number => s !== null);

  const overallAvg = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;

  return {
    experience: expResult.avg,
    compassion: compResult.avg,
    safety: safeResult.avg,
    professionalism: profResult.avg,
    overall: overallAvg,
  };
}

export interface ResultDistribution {
  result: string;
  count: number;
  percentage: number;
}

export function calculateResultDistribution(candidates: CandidateEvaluation[]): ResultDistribution[] {
  const total = candidates.length;
  const resultMap = new Map<string, number>();

  candidates.forEach(c => {
    const result = c.result || "UNKNOWN";
    resultMap.set(result, (resultMap.get(result) || 0) + 1);
  });

  return Array.from(resultMap.entries())
    .map(([result, count]) => ({
      result,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export interface ScoreCorrelation {
  score1: string;
  score2: string;
  correlation: number;
}

export function calculateScoreCorrelations(candidates: CandidateEvaluation[]): ScoreCorrelation[] {
  const scoreFields: Array<{ key: keyof CandidateEvaluation; label: string }> = [
    { key: "experienceScore", label: "Experience" },
    { key: "compassionScore", label: "Compassion" },
    { key: "safetyScore", label: "Safety" },
    { key: "professionalismScore", label: "Professionalism" },
  ];

  const getScores = (field: keyof CandidateEvaluation): number[] => {
    return candidates
      .map(c => {
        const value = c[field] as string;
        if (!value || value.trim() === "") return NaN;
        return parseFloat(value);
      })
      .filter(s => !isNaN(s));
  };

  const calculateCorrelation = (x: number[], y: number[]): number => {
    if (x.length === 0 || y.length === 0 || x.length !== y.length) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  const correlations: ScoreCorrelation[] = [];

  for (let i = 0; i < scoreFields.length; i++) {
    for (let j = i + 1; j < scoreFields.length; j++) {
      const scores1 = getScores(scoreFields[i].key);
      const scores2 = getScores(scoreFields[j].key);

      const validPairs = candidates
        .map(c => {
          const v1 = c[scoreFields[i].key] as string;
          const v2 = c[scoreFields[j].key] as string;
          return {
            s1: (!v1 || v1.trim() === "") ? NaN : parseFloat(v1),
            s2: (!v2 || v2.trim() === "") ? NaN : parseFloat(v2),
          };
        })
        .filter(p => !isNaN(p.s1) && !isNaN(p.s2));

      if (validPairs.length > 0) {
        const correlation = calculateCorrelation(
          validPairs.map(p => p.s1),
          validPairs.map(p => p.s2)
        );

        correlations.push({
          score1: scoreFields[i].label,
          score2: scoreFields[j].label,
          correlation,
        });
      }
    }
  }

  return correlations;
}

export interface TravelAbilityData {
  category: string;
  count: number;
  percentage: number;
}

export function calculateTravelAbility(candidates: CandidateEvaluation[]): TravelAbilityData[] {
  const total = candidates.length;
  let canTravel = 0;
  let cannotTravel = 0;
  let unknown = 0;

  candidates.forEach(c => {
    const normalized = normalizeYesNo(c.canTravel);
    if (normalized === "yes") {
      canTravel++;
    } else if (normalized === "no") {
      cannotTravel++;
    } else {
      unknown++;
    }
  });

  return [
    {
      category: "Can Travel",
      count: canTravel,
      percentage: total > 0 ? (canTravel / total) * 100 : 0,
    },
    {
      category: "Cannot Travel",
      count: cannotTravel,
      percentage: total > 0 ? (cannotTravel / total) * 100 : 0,
    },
    {
      category: "Unknown",
      count: unknown,
      percentage: total > 0 ? (unknown / total) * 100 : 0,
    },
  ].filter(item => item.count > 0);
}

export interface RedFlagFrequency {
  flag: string;
  count: number;
  percentage: number;
}

export function calculateRedFlagFrequency(candidates: CandidateEvaluation[]): RedFlagFrequency[] {
  const flagMap = new Map<string, number>();
  let totalWithFlags = 0;

  candidates.forEach(c => {
    if (c.redFlags && c.redFlags.length > 0) {
      totalWithFlags++;
      c.redFlags.forEach(flag => {
        flagMap.set(flag, (flagMap.get(flag) || 0) + 1);
      });
    }
  });

  return Array.from(flagMap.entries())
    .map(([flag, count]) => ({
      flag,
      count,
      percentage: totalWithFlags > 0 ? (count / totalWithFlags) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export interface ScoreByClientType {
  clientType: string;
  averageExperience: number;
  averageCompassion: number;
  averageSafety: number;
  averageProfessionalism: number;
  averageOverall: number;
  count: number;
}

export function calculateScoresByClientType(candidates: CandidateEvaluation[]): ScoreByClientType[] {
  const typeMap = new Map<string, CandidateEvaluation[]>();

  candidates.forEach(c => {
    const type = c.clientType || "Unknown";
    if (!typeMap.has(type)) {
      typeMap.set(type, []);
    }
    typeMap.get(type)!.push(c);
  });

  return Array.from(typeMap.entries())
    .map(([clientType, group]) => {
      const getAverageWithCount = (scoreField: keyof CandidateEvaluation): { avg: number; count: number } => {
        const scores = group
          .map(c => {
            const value = c[scoreField] as string;
            if (!value || value.trim() === "") return NaN;
            return parseFloat(value);
          })
          .filter(s => !isNaN(s));
        return {
          avg: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
          count: scores.length,
        };
      };

      const expResult = getAverageWithCount("experienceScore");
      const compResult = getAverageWithCount("compassionScore");
      const safeResult = getAverageWithCount("safetyScore");
      const profResult = getAverageWithCount("professionalismScore");

      const validScores = [
        expResult.count > 0 ? expResult.avg : null,
        compResult.count > 0 ? compResult.avg : null,
        safeResult.count > 0 ? safeResult.avg : null,
        profResult.count > 0 ? profResult.avg : null,
      ].filter((s): s is number => s !== null);

      const overallAvg = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;

      return {
        clientType,
        averageExperience: expResult.avg,
        averageCompassion: compResult.avg,
        averageSafety: safeResult.avg,
        averageProfessionalism: profResult.avg,
        averageOverall: overallAvg,
        count: group.length,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export interface StatisticalSummary {
  metric: string;
  mean: number;
  std: number;
  min: number;
  q25: number;
  median: number;
  q75: number;
  max: number;
  count: number;
}

export function calculateStatisticalSummary(candidates: CandidateEvaluation[]): StatisticalSummary[] {
  const scoreFields: Array<{ key: keyof CandidateEvaluation; label: string }> = [
    { key: "experienceScore", label: "Experience" },
    { key: "compassionScore", label: "Compassion" },
    { key: "safetyScore", label: "Safety" },
    { key: "professionalismScore", label: "Professionalism" },
  ];

  const calculateStats = (scores: number[]): Omit<StatisticalSummary, "metric"> => {
    if (scores.length === 0) {
      return { mean: 0, std: 0, min: 0, q25: 0, median: 0, q75: 0, max: 0, count: 0 };
    }

    const sorted = [...scores].sort((a, b) => a - b);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / scores.length;
    const std = Math.sqrt(variance);

    const getPercentile = (p: number): number => {
      const index = (p / 100) * (sorted.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;
      return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    };

    return {
      mean,
      std,
      min: sorted[0],
      q25: getPercentile(25),
      median: getPercentile(50),
      q75: getPercentile(75),
      max: sorted[sorted.length - 1],
      count: scores.length,
    };
  };

  return scoreFields.map(field => {
    const scores = candidates
      .map(c => {
        const value = c[field.key] as string;
        if (!value || value.trim() === "") return NaN;
        return parseFloat(value);
      })
      .filter(s => !isNaN(s));

    return {
      metric: field.label,
      ...calculateStats(scores),
    };
  });
}

export interface ComplianceCredentials {
  credential: string;
  hasCredential: number;
  missingCredential: number;
  failedCheck: number;
  total: number;
}

export function calculateComplianceCredentials(candidates: CandidateEvaluation[]): ComplianceCredentials[] {
  const total = candidates.length;

  const credentials = [
    { name: "Background Check", field: "backgroundCheck" },
    { name: "TB Test", field: "tbTestNegative" },
    { name: "CPR Certificate", field: "cprCertificate" },
    { name: "Valid Driver License", field: "validDriverLicense" },
  ];

  return credentials.map(cred => {
    let hasCredential = 0;
    let missingCredential = 0;
    let failedCheck = 0;

    candidates.forEach(c => {
      const value = (c as any)[cred.field];
      const normalized = normalizeYesNo(value);

      if (normalized === "yes") {
        hasCredential++;
      } else if (normalized === "no") {
        failedCheck++;
      } else {
        missingCredential++;
      }
    });

    return {
      credential: cred.name,
      hasCredential,
      missingCredential,
      failedCheck,
      total,
    };
  });
}
