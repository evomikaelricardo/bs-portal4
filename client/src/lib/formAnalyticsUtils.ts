import { FormStaffSubmission } from "@shared/schema";

export interface FormQualificationData {
  name: string;
  qualified: number;
  notQualified: number;
  missing: number;
  total: number;
}

export interface FormDistribution {
  category: string;
  count: number;
  percentage: number;
}

function normalizeYesNo(value: string | undefined): "yes" | "no" | "unknown" {
  if (!value) return "unknown";
  const normalized = value.toLowerCase().trim();
  if (["yes", "y", "true", "1"].includes(normalized)) {
    return "yes";
  }
  if (["no", "n", "false", "0"].includes(normalized)) {
    return "no";
  }
  return "unknown";
}

export function isQualifiedApplicant(submission: FormStaffSubmission): boolean {
  const hasExperience = normalizeYesNo(submission.hasExperience) === "yes";
  const hasAvailability = normalizeYesNo(submission.hasAvailability) === "yes";
  const hasVehicle = normalizeYesNo(submission.hasVehicle) === "yes";
  const noBackgroundIssues = normalizeYesNo(submission.hasBackgroundCheckIssues) !== "yes";
  
  return hasExperience && hasAvailability && hasVehicle && noBackgroundIssues;
}

export function calculateFormQualificationStatus(submissions: FormStaffSubmission[]): {
  qualified: number;
  notQualified: number;
  qualifiedPercentage: number;
  missingCriteria: {
    experience: number;
    availability: number;
    vehicle: number;
    backgroundIssues: number;
  };
} {
  const qualified = submissions.filter(isQualifiedApplicant).length;
  const notQualified = submissions.length - qualified;
  const qualifiedPercentage = submissions.length > 0 
    ? (qualified / submissions.length) * 100 
    : 0;

  return {
    qualified,
    notQualified,
    qualifiedPercentage,
    missingCriteria: {
      experience: submissions.filter(s => normalizeYesNo(s.hasExperience) !== "yes").length,
      availability: submissions.filter(s => normalizeYesNo(s.hasAvailability) !== "yes").length,
      vehicle: submissions.filter(s => normalizeYesNo(s.hasVehicle) !== "yes").length,
      backgroundIssues: submissions.filter(s => normalizeYesNo(s.hasBackgroundCheckIssues) === "yes").length,
    },
  };
}

export function calculateFormQualifications(submissions: FormStaffSubmission[]): FormQualificationData[] {
  const total = submissions.length;

  const qualifications = [
    {
      name: "Experience",
      field: "hasExperience",
    },
    {
      name: "Availability",
      field: "hasAvailability",
    },
    {
      name: "Vehicle",
      field: "hasVehicle",
    },
    {
      name: "CPR Certification",
      field: "hasCPRCertification",
    },
    {
      name: "TB Test",
      field: "canProvideTBTest",
    },
    {
      name: "Willing to Travel",
      field: "willingToTravel",
    },
  ];

  return qualifications.map(qual => {
    const qualified = submissions.filter(
      s => normalizeYesNo((s as any)[qual.field]) === "yes"
    ).length;
    const notQualified = submissions.filter(
      s => normalizeYesNo((s as any)[qual.field]) === "no"
    ).length;
    const missing = submissions.filter(
      s => normalizeYesNo((s as any)[qual.field]) === "unknown"
    ).length;

    return {
      name: qual.name,
      qualified,
      notQualified,
      missing,
      total,
    };
  });
}

export function calculateExperienceDistribution(submissions: FormStaffSubmission[]): FormDistribution[] {
  const total = submissions.length;
  
  const withExperience = submissions.filter(s => normalizeYesNo(s.hasExperience) === "yes").length;
  const withoutExperience = submissions.filter(s => normalizeYesNo(s.hasExperience) === "no").length;
  const unknown = total - withExperience - withoutExperience;

  return [
    {
      category: "With Experience",
      count: withExperience,
      percentage: total > 0 ? (withExperience / total) * 100 : 0,
    },
    {
      category: "Without Experience",
      count: withoutExperience,
      percentage: total > 0 ? (withoutExperience / total) * 100 : 0,
    },
    {
      category: "Unknown",
      count: unknown,
      percentage: total > 0 ? (unknown / total) * 100 : 0,
    },
  ];
}

export function calculateBackgroundCheckIssues(submissions: FormStaffSubmission[]): FormDistribution[] {
  const total = submissions.length;
  
  const withIssues = submissions.filter(s => normalizeYesNo(s.hasBackgroundCheckIssues) === "yes").length;
  const withoutIssues = submissions.filter(s => normalizeYesNo(s.hasBackgroundCheckIssues) === "no").length;
  const unknown = total - withIssues - withoutIssues;

  return [
    {
      category: "No Issues",
      count: withoutIssues,
      percentage: total > 0 ? (withoutIssues / total) * 100 : 0,
    },
    {
      category: "Has Issues",
      count: withIssues,
      percentage: total > 0 ? (withIssues / total) * 100 : 0,
    },
    {
      category: "Unknown",
      count: unknown,
      percentage: total > 0 ? (unknown / total) * 100 : 0,
    },
  ];
}

export function calculateComplianceMetrics(submissions: FormStaffSubmission[]): FormDistribution[] {
  const total = submissions.length;

  const metrics = [
    {
      category: "CPR Certified",
      count: submissions.filter(s => normalizeYesNo(s.hasCPRCertification) === "yes").length,
    },
    {
      category: "TB Test Available",
      count: submissions.filter(s => normalizeYesNo(s.canProvideTBTest) === "yes").length,
    },
    {
      category: "Background Check Fee Accepted",
      count: submissions.filter(s => normalizeYesNo(s.backgroundCheckFeeAcceptance) === "yes").length,
    },
    {
      category: "Pay Rate Accepted",
      count: submissions.filter(s => normalizeYesNo(s.payRateAcceptance) === "yes").length,
    },
  ];

  return metrics.map(metric => ({
    category: metric.category,
    count: metric.count,
    percentage: total > 0 ? (metric.count / total) * 100 : 0,
  }));
}

export function calculateAvailabilityMetrics(submissions: FormStaffSubmission[]): FormDistribution[] {
  const total = submissions.length;

  return [
    {
      category: "Has Availability",
      count: submissions.filter(s => normalizeYesNo(s.hasAvailability) === "yes").length,
      percentage: total > 0 ? (submissions.filter(s => normalizeYesNo(s.hasAvailability) === "yes").length / total) * 100 : 0,
    },
    {
      category: "Has Vehicle",
      count: submissions.filter(s => normalizeYesNo(s.hasVehicle) === "yes").length,
      percentage: total > 0 ? (submissions.filter(s => normalizeYesNo(s.hasVehicle) === "yes").length / total) * 100 : 0,
    },
    {
      category: "Willing to Travel",
      count: submissions.filter(s => normalizeYesNo(s.willingToTravel) === "yes").length,
      percentage: total > 0 ? (submissions.filter(s => normalizeYesNo(s.willingToTravel) === "yes").length / total) * 100 : 0,
    },
  ];
}

export function calculateDementiaExperience(submissions: FormStaffSubmission[]): FormDistribution[] {
  const total = submissions.length;
  
  const withDementia = submissions.filter(s => normalizeYesNo(s.hasDementiaExperience) === "yes").length;
  const withoutDementia = submissions.filter(s => normalizeYesNo(s.hasDementiaExperience) === "no").length;
  const unknown = total - withDementia - withoutDementia;

  return [
    {
      category: "Has Dementia Experience",
      count: withDementia,
      percentage: total > 0 ? (withDementia / total) * 100 : 0,
    },
    {
      category: "No Dementia Experience",
      count: withoutDementia,
      percentage: total > 0 ? (withoutDementia / total) * 100 : 0,
    },
    {
      category: "Unknown",
      count: unknown,
      percentage: total > 0 ? (unknown / total) * 100 : 0,
    },
  ];
}

export function calculateStatisticalSummary(submissions: FormStaffSubmission[]): {
  metric: string;
  count: number;
  percentage: number;
}[] {
  const total = submissions.length;

  return [
    {
      metric: "Total Submissions",
      count: total,
      percentage: 100,
    },
    {
      metric: "Qualified Applicants",
      count: submissions.filter(isQualifiedApplicant).length,
      percentage: total > 0 ? (submissions.filter(isQualifiedApplicant).length / total) * 100 : 0,
    },
    {
      metric: "With Experience",
      count: submissions.filter(s => normalizeYesNo(s.hasExperience) === "yes").length,
      percentage: total > 0 ? (submissions.filter(s => normalizeYesNo(s.hasExperience) === "yes").length / total) * 100 : 0,
    },
    {
      metric: "With Availability",
      count: submissions.filter(s => normalizeYesNo(s.hasAvailability) === "yes").length,
      percentage: total > 0 ? (submissions.filter(s => normalizeYesNo(s.hasAvailability) === "yes").length / total) * 100 : 0,
    },
    {
      metric: "With Vehicle",
      count: submissions.filter(s => normalizeYesNo(s.hasVehicle) === "yes").length,
      percentage: total > 0 ? (submissions.filter(s => normalizeYesNo(s.hasVehicle) === "yes").length / total) * 100 : 0,
    },
    {
      metric: "Background Check Issues",
      count: submissions.filter(s => normalizeYesNo(s.hasBackgroundCheckIssues) === "yes").length,
      percentage: total > 0 ? (submissions.filter(s => normalizeYesNo(s.hasBackgroundCheckIssues) === "yes").length / total) * 100 : 0,
    },
  ];
}
