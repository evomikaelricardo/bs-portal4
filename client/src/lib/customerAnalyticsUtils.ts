import { CustomerService } from "@shared/schema";

export interface InquiryTrendData {
  date: string;
  count: number;
}

export interface ReferralSourceData {
  source: string;
  count: number;
  percentage: number;
}

export interface SentimentData {
  sentiment: string;
  count: number;
  percentage: number;
}

export interface PatientProblemData {
  problem: string;
  count: number;
}

export interface ServiceHoursData {
  range: string;
  count: number;
}

export interface ServiceTimeData {
  time: string;
  count: number;
  percentage: number;
}

export interface ZipCodeData {
  zipCode: string;
  count: number;
}

export interface ContactMethodData {
  method: string;
  count: number;
  percentage: number;
}

export interface CallbackData {
  hasCallback: string;
  count: number;
  percentage: number;
}

export interface NursePreferenceData {
  preference: string;
  count: number;
  percentage: number;
}

export function calculateInquiryTrends(customers: CustomerService[]): InquiryTrendData[] {
  const dateMap = new Map<string, number>();
  
  customers.forEach(customer => {
    if (customer.dateTime) {
      const date = new Date(customer.dateTime).toLocaleDateString();
      dateMap.set(date, (dateMap.get(date) || 0) + 1);
    }
  });
  
  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function calculateReferralSources(customers: CustomerService[]): ReferralSourceData[] {
  const sourceMap = new Map<string, number>();
  
  customers.forEach(customer => {
    const source = customer.referral?.trim() || "Not Specified";
    sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
  });
  
  const total = customers.length;
  return Array.from(sourceMap.entries())
    .map(([source, count]) => ({
      source,
      count,
      percentage: (count / total) * 100
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateServiceSentiment(customers: CustomerService[]): SentimentData[] {
  const sentimentMap = new Map<string, number>();
  
  customers.forEach(customer => {
    let sentiment = "Neutral";
    const experience = customer.serviceExperience?.toLowerCase() || "";
    
    if (experience.includes("good") || experience.includes("excellent") || experience.includes("great")) {
      sentiment = "Positive";
    } else if (experience.includes("bad") || experience.includes("poor") || experience.includes("issue") || 
               experience.includes("late") || experience.includes("problem")) {
      sentiment = "Negative";
    } else if (experience === "") {
      sentiment = "No Experience";
    }
    
    sentimentMap.set(sentiment, (sentimentMap.get(sentiment) || 0) + 1);
  });
  
  const total = customers.length;
  return Array.from(sentimentMap.entries())
    .map(([sentiment, count]) => ({
      sentiment,
      count,
      percentage: (count / total) * 100
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculatePatientProblems(customers: CustomerService[]): PatientProblemData[] {
  const problemWords = new Map<string, number>();
  
  const keywords = [
    "memory", "dementia", "alzheimer", "forgetting", "confusion",
    "safety", "medication", "wound care", "surgery", "transplant",
    "bathing", "eating", "mobility", "fall", "supervision"
  ];
  
  customers.forEach(customer => {
    const problem = customer.patientProblem?.toLowerCase() || "";
    keywords.forEach(keyword => {
      if (problem.includes(keyword)) {
        problemWords.set(keyword, (problemWords.get(keyword) || 0) + 1);
      }
    });
  });
  
  return Array.from(problemWords.entries())
    .map(([problem, count]) => ({ problem, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function calculateServiceHours(customers: CustomerService[]): ServiceHoursData[] {
  const hoursMap = new Map<string, number>();
  
  customers.forEach(customer => {
    if (customer.serviceHours) {
      const hours = customer.serviceHours.toLowerCase();
      let range = "Not Specified";
      
      const hourMatch = hours.match(/(\d+)/);
      if (hourMatch) {
        const num = parseInt(hourMatch[1]);
        if (num <= 20) range = "0-20 hours/week";
        else if (num <= 40) range = "21-40 hours/week";
        else if (num <= 60) range = "41-60 hours/week";
        else range = "60+ hours/week";
      }
      
      hoursMap.set(range, (hoursMap.get(range) || 0) + 1);
    }
  });
  
  const order = ["0-20 hours/week", "21-40 hours/week", "41-60 hours/week", "60+ hours/week", "Not Specified"];
  return order
    .filter(range => hoursMap.has(range))
    .map(range => ({ range, count: hoursMap.get(range) || 0 }));
}

export function calculateServiceTime(customers: CustomerService[]): ServiceTimeData[] {
  const timeMap = new Map<string, number>();
  
  customers.forEach(customer => {
    const time = customer.serviceTime?.toLowerCase() || "";
    let timeOfDay = "Not Specified";
    
    if (time.includes("morning")) timeOfDay = "Morning";
    else if (time.includes("afternoon")) timeOfDay = "Afternoon";
    else if (time.includes("evening")) timeOfDay = "Evening";
    else if (time.includes("night")) timeOfDay = "Night";
    else if (time !== "") timeOfDay = "Flexible";
    
    timeMap.set(timeOfDay, (timeMap.get(timeOfDay) || 0) + 1);
  });
  
  const total = customers.length;
  return Array.from(timeMap.entries())
    .map(([time, count]) => ({
      time,
      count,
      percentage: (count / total) * 100
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateZipCodeDistribution(customers: CustomerService[]): ZipCodeData[] {
  const zipMap = new Map<string, number>();
  
  customers.forEach(customer => {
    const zip = customer.zipCode?.trim() || "Unknown";
    zipMap.set(zip, (zipMap.get(zip) || 0) + 1);
  });
  
  return Array.from(zipMap.entries())
    .map(([zipCode, count]) => ({ zipCode, count }))
    .sort((a, b) => b.count - a.count);
}

export function calculateContactMethods(customers: CustomerService[]): ContactMethodData[] {
  let emailCount = 0;
  let phoneOnlyCount = 0;
  let bothCount = 0;
  let neitherCount = 0;
  
  customers.forEach(customer => {
    const hasEmail = !!customer.clientEmail;
    const hasPhone = !!customer.phoneNumber;
    
    if (hasEmail && hasPhone) bothCount++;
    else if (hasEmail) emailCount++;
    else if (hasPhone) phoneOnlyCount++;
    else neitherCount++;
  });
  
  const total = customers.length;
  return [
    { method: "Both Email & Phone", count: bothCount, percentage: (bothCount / total) * 100 },
    { method: "Phone Only", count: phoneOnlyCount, percentage: (phoneOnlyCount / total) * 100 },
    { method: "Email Only", count: emailCount, percentage: (emailCount / total) * 100 },
    { method: "Neither", count: neitherCount, percentage: (neitherCount / total) * 100 },
  ].filter(item => item.count > 0);
}

export function calculateCallbackScheduling(customers: CustomerService[]): CallbackData[] {
  let withCallback = 0;
  let withoutCallback = 0;
  
  customers.forEach(customer => {
    if (customer.callbackDate) withCallback++;
    else withoutCallback++;
  });
  
  const total = customers.length;
  return [
    { hasCallback: "Requested Callback", count: withCallback, percentage: (withCallback / total) * 100 },
    { hasCallback: "No Callback", count: withoutCallback, percentage: (withoutCallback / total) * 100 },
  ];
}

export function calculateNursePreference(customers: CustomerService[]): NursePreferenceData[] {
  const preferenceMap = new Map<string, number>();
  
  customers.forEach(customer => {
    const preference = customer.nurseVisit?.trim() || "Not Specified";
    preferenceMap.set(preference, (preferenceMap.get(preference) || 0) + 1);
  });
  
  const total = customers.length;
  return Array.from(preferenceMap.entries())
    .map(([preference, count]) => ({
      preference,
      count,
      percentage: (count / total) * 100
    }))
    .sort((a, b) => b.count - a.count);
}

export function calculateAverageServiceHours(customers: CustomerService[]): {
  mean: number;
  median: number;
  min: number;
  max: number;
} {
  const hours: number[] = [];
  
  customers.forEach(customer => {
    if (customer.serviceHours) {
      const match = customer.serviceHours.match(/(\d+)/);
      if (match) {
        hours.push(parseInt(match[1]));
      }
    }
  });
  
  if (hours.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0 };
  }
  
  hours.sort((a, b) => a - b);
  const mean = hours.reduce((a, b) => a + b, 0) / hours.length;
  const median = hours.length % 2 === 0
    ? (hours[hours.length / 2 - 1] + hours[hours.length / 2]) / 2
    : hours[Math.floor(hours.length / 2)];
  
  return {
    mean: Math.round(mean * 10) / 10,
    median,
    min: hours[0],
    max: hours[hours.length - 1]
  };
}

export function calculateReferralConversion(customers: CustomerService[]): {
  totalInquiries: number;
  withFullContact: number;
  conversionRate: number;
} {
  let withFullContact = 0;
  
  customers.forEach(customer => {
    if (customer.phoneNumber && customer.clientEmail && customer.clientAddress) {
      withFullContact++;
    }
  });
  
  return {
    totalInquiries: customers.length,
    withFullContact,
    conversionRate: (withFullContact / customers.length) * 100
  };
}

export function calculateDementiaPercentage(customers: CustomerService[]): {
  total: number;
  withDementia: number;
  percentage: number;
} {
  let withDementia = 0;
  
  customers.forEach(customer => {
    const problem = customer.patientProblem?.toLowerCase() || "";
    if (problem.includes("dementia") || problem.includes("memory") || 
        problem.includes("alzheimer") || problem.includes("forgetting")) {
      withDementia++;
    }
  });
  
  return {
    total: customers.length,
    withDementia,
    percentage: (withDementia / customers.length) * 100
  };
}

export function calculateTop5ZipCodes(customers: CustomerService[]): ZipCodeData[] {
  return calculateZipCodeDistribution(customers).slice(0, 5);
}

export interface ReferralSentimentData {
  referral: string;
  positive: number;
  neutral: number;
  negative: number;
  noExperience: number;
}

export function calculateReferralSentimentCrossAnalysis(customers: CustomerService[]): ReferralSentimentData[] {
  const crossMap = new Map<string, {
    positive: number;
    neutral: number;
    negative: number;
    noExperience: number;
  }>();
  
  customers.forEach(customer => {
    const referral = customer.referral?.trim() || "Not Specified";
    const experience = customer.serviceExperience?.toLowerCase() || "";
    
    if (!crossMap.has(referral)) {
      crossMap.set(referral, { positive: 0, neutral: 0, negative: 0, noExperience: 0 });
    }
    
    const data = crossMap.get(referral)!;
    
    if (experience === "") {
      data.noExperience++;
    } else if (experience.includes("good") || experience.includes("excellent") || experience.includes("great")) {
      data.positive++;
    } else if (experience.includes("bad") || experience.includes("poor") || 
               experience.includes("issue") || experience.includes("late") || 
               experience.includes("problem")) {
      data.negative++;
    } else {
      data.neutral++;
    }
  });
  
  return Array.from(crossMap.entries())
    .map(([referral, data]) => ({
      referral,
      ...data
    }))
    .sort((a, b) => {
      const totalA = a.positive + a.neutral + a.negative + a.noExperience;
      const totalB = b.positive + b.neutral + b.negative + b.noExperience;
      return totalB - totalA;
    });
}
