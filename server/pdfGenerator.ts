import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CandidateEvaluation, CustomerService, FormStaffSubmission } from '@shared/schema';

function parseQuestions(text: string | undefined): string[] {
  if (!text || !text.trim()) {
    return [];
  }
  
  const questions: string[] = [];
  let parts = text.split(/[,?]/);
  
  for (let part of parts) {
    const trimmed = part.trim();
    if (trimmed) {
      const question = trimmed.endsWith('?') ? trimmed : `${trimmed}?`;
      questions.push(question);
    }
  }
  
  return questions;
}

function formatPreviousLocation(location: string | undefined, period: string | number | undefined): string {
  const loc = location?.trim() || '';
  const per = period ? String(period).trim() : '';
  
  const naValues = ['n/a', 'none', 'never', '', '-'];
  const isLocationNA = naValues.includes(loc.toLowerCase());
  const isPeriodNA = naValues.includes(per.toLowerCase());
  
  if (isLocationNA) {
    return 'N/A';
  }
  
  if (!isPeriodNA && per) {
    return `${loc} (${per})`;
  }
  
  return loc;
}

function calculateOverallScore(candidate: CandidateEvaluation): { score: number; rating: string; color: number[] } {
  const scores = [
    parseFloat(candidate.experienceScore || '0'),
    parseFloat(candidate.compassionScore || '0'),
    parseFloat(candidate.professionalismScore || '0'),
    parseFloat(candidate.safetyScore || '0'),
  ].filter(s => s > 0);
  
  if (scores.length === 0) {
    return { score: 0, rating: 'N/A', color: [128, 128, 128] };
  }
  
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const roundedScore = Math.round(average * 10) / 10;
  
  let rating = '';
  let color: number[] = [];
  
  if (roundedScore >= 4.5) {
    rating = 'Exceptional';
    color = [34, 197, 94];
  } else if (roundedScore >= 3.5) {
    rating = 'Good';
    color = [59, 130, 246];
  } else if (roundedScore >= 2.5) {
    rating = 'Average';
    color = [251, 191, 36];
  } else if (roundedScore >= 1.5) {
    rating = 'Below Average';
    color = [249, 115, 22];
  } else {
    rating = 'Poor';
    color = [239, 68, 68];
  }
  
  return { score: roundedScore, rating, color };
}

// Helper function to generate a single candidate PDF page (matches client-side format exactly)
function generateCandidatePage(
  doc: jsPDF, 
  candidate: CandidateEvaluation, 
  generatedTimestamp: string,
  reportIdTimestamp: number,
  isFirstPage: boolean = false
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  if (!isFirstPage) {
    doc.addPage();
  }
  
  // Title - matches client/src/lib/pdfGenerator.ts exactly
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Post-Interview Evaluation Report", pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${generatedTimestamp}`, pageWidth / 2, 28, { align: 'center' });
  
  // Status box with colored background
  const statusColor = candidate.result === "PASS" ? [34, 197, 94] : [239, 68, 68];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.rect(15, 35, pageWidth - 30, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Status: ${candidate.result}`, pageWidth / 2, 43, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Candidate Information", 15, 58);
  
  const tableWidth = pageWidth - 30;
  const colWidth = tableWidth / 2;
  
  // Candidate Information table
  autoTable(doc, {
    startY: 62,
    head: [['Field', 'Value']],
    body: [
      ['Name', candidate.contactName],
      ['Phone Number', candidate.phoneNumber],
      ['Email', candidate.emailAddress || 'N/A'],
      ['Interview Date', candidate.dateTime],
      ['Previous Employment Location', formatPreviousLocation(candidate.previousLocation, candidate.employmentPeriod)],
    ],
    theme: 'striped',
    tableWidth: 'auto',
    headStyles: { 
      fillColor: [59, 130, 246], 
      textColor: 255, 
      halign: 'left', 
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    bodyStyles: {
      halign: 'left',
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    columnStyles: {
      0: { cellWidth: colWidth, halign: 'left', valign: 'middle' },
      1: { cellWidth: colWidth, halign: 'left', valign: 'middle' }
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
  });
  
  // Qualifications & Requirements section
  const yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("Qualifications & Requirements", 15, yPos);
  
  autoTable(doc, {
    startY: yPos + 4,
    head: [['Requirement', 'Status']],
    body: [
      ['Work Per Week Available', candidate.workPerWeek || 'N/A'],
      ['Can Travel', candidate.canTravel || 'N/A'],
      ['One Year Experience', candidate.oneYearExperience || 'N/A'],
      ['Valid Driver License', candidate.validDriverLicense || 'N/A'],
      ['Reliable Transport', candidate.reliableTransport || 'N/A'],
      ['Pay Rate Agreement', candidate.payRate || 'N/A'],
      ['TB Test Negative', candidate.tbTestNegative || 'N/A'],
      ['CPR Certificate', candidate.cprCertificate || 'N/A'],
    ],
    theme: 'striped',
    tableWidth: 'auto',
    headStyles: { 
      fillColor: [59, 130, 246], 
      textColor: 255, 
      halign: 'left', 
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    bodyStyles: {
      halign: 'left',
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    columnStyles: {
      0: { cellWidth: colWidth, halign: 'left', valign: 'middle' },
      1: { cellWidth: colWidth, halign: 'left', valign: 'middle' }
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
  });
  
  // Calculate overall score first
  const overall = calculateOverallScore(candidate);
  
  // Experience & Assessments section
  const yPos2 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("Experience & Assessments", 15, yPos2);
  
  // Performance Metric section
  autoTable(doc, {
    startY: yPos2 + 4,
    head: [['Performance Metric', 'Score (1: Poor, 5: Exceptional)']],
    body: [
      ['Experience', candidate.experienceScore || 'N/A'],
      ['Compassion', candidate.compassionScore || 'N/A'],
      ['Professional', candidate.professionalismScore || 'N/A'],
      ['Safety', candidate.safetyScore || 'N/A'],
      ['Overall Performance', `${overall.score.toFixed(1)} / 5.0 - ${overall.rating}`],
    ],
    theme: 'striped',
    tableWidth: 'auto',
    headStyles: { 
      fillColor: [59, 130, 246], 
      textColor: 255, 
      halign: 'left', 
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    bodyStyles: {
      halign: 'left',
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    columnStyles: {
      0: { cellWidth: colWidth, halign: 'left', valign: 'middle' },
      1: { cellWidth: colWidth, halign: 'left', valign: 'middle' }
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
    didParseCell: function(data) {
      if (data.section === 'body' && data.row.index === 4) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 11;
      }
    },
  });
  
  // Performance Summary section
  let yPos3 = (doc as any).lastAutoTable.finalY + 10;
  const pageHeight = doc.internal.pageSize.getHeight();
  
  if (yPos3 + 30 > pageHeight - 20) {
    doc.addPage();
    yPos3 = 20;
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Performance Summary", 15, yPos3);
  
  autoTable(doc, {
    startY: yPos3 + 4,
    body: [[candidate.performanceSummary || 'None']],
    theme: 'striped',
    tableWidth: 'auto',
    styles: { 
      cellPadding: 3, 
      fontSize: 10,
      halign: 'left',
      valign: 'middle'
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
  });
  
  // Red Flags section
  let yPos4 = (doc as any).lastAutoTable.finalY + 10;
  
  if (yPos4 + 30 > pageHeight - 20) {
    doc.addPage();
    yPos4 = 20;
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Red Flag(s)", 15, yPos4);
  
  const redFlags = candidate.redFlags || [];
  const redFlagRows = redFlags.length > 0
    ? redFlags.map((flag, idx) => [`${idx + 1}. ${flag}`])
    : [['None']];
  
  autoTable(doc, {
    startY: yPos4 + 4,
    body: redFlagRows,
    theme: 'striped',
    tableWidth: 'auto',
    styles: { 
      cellPadding: 3, 
      fontSize: 10,
      halign: 'left',
      valign: 'middle'
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
  });
  
  // Questions Asked section
  let yPos5 = (doc as any).lastAutoTable.finalY + 10;
  
  if (yPos5 + 30 > pageHeight - 20) {
    doc.addPage();
    yPos5 = 20;
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Questions Asked", 15, yPos5);
  
  const questions = candidate.questionsAsked || [];
  const questionRows = questions.length > 0 
    ? questions.map((q, idx) => [`${idx + 1}. ${q}`])
    : [['None']];
  
  autoTable(doc, {
    startY: yPos5 + 4,
    body: questionRows,
    theme: 'striped',
    tableWidth: 'auto',
    styles: { 
      cellPadding: 2, 
      fontSize: 10,
      halign: 'left',
      valign: 'middle'
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
  });
  
  // Recommended Follow-up Questions section
  let yPos6 = (doc as any).lastAutoTable.finalY + 10;
  
  if (yPos6 + 30 > pageHeight - 20) {
    doc.addPage();
    yPos6 = 20;
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Recommended Follow up Questions for the next interview", 15, yPos6);
  
  const followUpQuestions = candidate.followUpQuestions || [];
  const followUpRows = followUpQuestions.length > 0
    ? followUpQuestions.map((q, idx) => [`${idx + 1}. ${q}`])
    : [['None']];
  
  autoTable(doc, {
    startY: yPos6 + 4,
    body: followUpRows,
    theme: 'striped',
    tableWidth: 'auto',
    styles: { 
      cellPadding: 2, 
      fontSize: 10,
      halign: 'left',
      valign: 'middle'
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
  });
  
  // Available Date for Next Interview section
  let yPos7 = (doc as any).lastAutoTable.finalY + 10;
  
  if (yPos7 + 20 > pageHeight - 20) {
    doc.addPage();
    yPos7 = 20;
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Available Date for Next Interview", 15, yPos7);
  
  const callbackDate = candidate.callbackDate?.trim() || '';
  const callbackDates = callbackDate ? callbackDate.split(/\s+and\s+/i).map(date => date.trim()).filter(date => date.length > 0) : [];
  const callbackRows = callbackDates.length > 0 
    ? callbackDates.map((date, idx) => [`${idx + 1}. ${date}`])
    : [['None']];
  
  autoTable(doc, {
    startY: yPos7 + 4,
    body: callbackRows,
    theme: 'striped',
    tableWidth: 'auto',
    styles: { 
      cellPadding: 3, 
      fontSize: 10,
      halign: 'left',
      valign: 'middle'
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
  });
  
  // Footer - matches client-side format exactly
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report ID: ${reportIdTimestamp}-${candidate.phoneNumber}`, 15, pageHeight - 10);
  doc.text("BrightStart Interview Evaluation System", pageWidth / 2, pageHeight - 10, { align: 'center' });
}

export function generateCandidatesPDF(candidates: CandidateEvaluation[]): Buffer {
  const doc = new jsPDF();
  
  // Generate timestamp once for consistency across all pages
  const generatedTimestamp = new Date().toLocaleString();
  const reportIdTimestamp = Date.now();
  
  // Generate a page for each candidate using the exact same format as client-side
  candidates.forEach((candidate, index) => {
    generateCandidatePage(doc, candidate, generatedTimestamp, reportIdTimestamp, index === 0);
  });
  
  // Convert PDF to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

// Helper function to generate a single customer service PDF page
function generateCustomerPage(
  doc: jsPDF,
  customer: CustomerService,
  generatedTimestamp: string,
  reportIdTimestamp: number,
  isFirstPage: boolean = false
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  if (!isFirstPage) {
    doc.addPage();
  }
  
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("In-Home Care Service Report", pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${generatedTimestamp}`, pageWidth / 2, 28, { align: 'center' });
  
  const nurseVisit = customer.nurseVisit?.toLowerCase() === "yes";
  const statusColor = nurseVisit ? [34, 197, 94] : [59, 130, 246];
  const statusText = nurseVisit ? "NURSE VISIT SCHEDULED" : "INITIAL CONTACT";
  
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.rect(15, 35, pageWidth - 30, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(statusText, pageWidth / 2, 43, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Contact Information", 15, 58);
  
  const tableWidth = pageWidth - 30;
  const colWidth = tableWidth / 2;
  
  autoTable(doc, {
    startY: 62,
    head: [['Field', 'Value']],
    body: [
      ['Contact Name', customer.contactName || 'N/A'],
      ['Phone Number', customer.phoneNumber || 'N/A'],
      ['Email Address', customer.clientEmail || 'N/A'],
      ['Address', customer.clientAddress || 'N/A'],
      ['ZIP Code', customer.zipCode || 'N/A'],
      ['Contact Date/Time', customer.dateTime || 'N/A'],
    ],
    theme: 'striped',
    tableWidth: 'auto',
    headStyles: { 
      fillColor: [59, 130, 246], 
      textColor: 255, 
      halign: 'left', 
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    bodyStyles: {
      halign: 'left',
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    columnStyles: {
      0: { cellWidth: colWidth, halign: 'left', valign: 'middle' },
      1: { cellWidth: colWidth, halign: 'left', valign: 'middle' }
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
  });
  
  const yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("Care Service Details", 15, yPos);
  
  autoTable(doc, {
    startY: yPos + 4,
    head: [['Service Category', 'Details']],
    body: [
      ['Referral Source', customer.referral || 'N/A'],
      ['Previous Service Experience', customer.serviceExperience || 'N/A'],
      ['Patient/Client Relationship', customer.patientIdentity || 'N/A'],
      ['Required Service Hours', customer.serviceHours || 'N/A'],
      ['Preferred Service Time', customer.serviceTime || 'N/A'],
      ['Nurse Visit Requested', customer.nurseVisit || 'N/A'],
      ['Follow-up Callback Date', customer.callbackDate || 'N/A'],
    ],
    theme: 'striped',
    tableWidth: 'auto',
    headStyles: { 
      fillColor: [59, 130, 246], 
      textColor: 255, 
      halign: 'left', 
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    bodyStyles: {
      halign: 'left',
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    columnStyles: {
      0: { cellWidth: colWidth, halign: 'left', valign: 'middle' },
      1: { cellWidth: colWidth, halign: 'left', valign: 'middle' }
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
  });
  
  let yPos2 = (doc as any).lastAutoTable.finalY + 10;
  
  if (yPos2 + 30 > pageHeight - 20) {
    doc.addPage();
    yPos2 = 20;
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Patient Care Needs & Concerns", 15, yPos2);
  
  autoTable(doc, {
    startY: yPos2 + 4,
    body: [[customer.patientProblem || 'No specific concerns noted']],
    theme: 'striped',
    tableWidth: 'auto',
    styles: { 
      cellPadding: 3, 
      fontSize: 10,
      halign: 'left',
      valign: 'middle'
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report ID: ${reportIdTimestamp}-${customer.phoneNumber}`, 15, pageHeight - 10);
  doc.text("BrightStar Care Service System", pageWidth / 2, pageHeight - 10, { align: 'center' });
}

export function generateCustomersPDF(customers: CustomerService[]): Buffer {
  const doc = new jsPDF();
  
  const generatedTimestamp = new Date().toLocaleString();
  const reportIdTimestamp = Date.now();
  
  customers.forEach((customer, index) => {
    generateCustomerPage(doc, customer, generatedTimestamp, reportIdTimestamp, index === 0);
  });
  
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

// Helper function to calculate qualification score for form submissions
function calculateQualificationScore(submission: FormStaffSubmission): { score: number; rating: string; color: number[] } {
  let score = 0;
  let maxScore = 0;

  if (submission.hasExperience) {
    maxScore++;
    if (submission.hasExperience.toLowerCase() === "yes") score++;
  }
  if (submission.hasAvailability) {
    maxScore++;
    if (submission.hasAvailability.toLowerCase() === "yes") score++;
  }
  if (submission.hasVehicle) {
    maxScore++;
    if (submission.hasVehicle.toLowerCase() === "yes") score++;
  }
  if (submission.hasCPRCertification) {
    maxScore++;
    if (submission.hasCPRCertification.toLowerCase() === "yes") score++;
  }
  if (submission.hasBackgroundCheckIssues) {
    maxScore++;
    if (submission.hasBackgroundCheckIssues.toLowerCase() !== "yes") score++;
  }
  if (submission.canProvideTBTest) {
    maxScore++;
    if (submission.canProvideTBTest.toLowerCase() === "yes") score++;
  }

  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  
  let rating = '';
  let color: number[] = [];
  
  if (percentage >= 90) {
    rating = 'Excellent';
    color = [34, 197, 94];
  } else if (percentage >= 75) {
    rating = 'Very Good';
    color = [59, 130, 246];
  } else if (percentage >= 60) {
    rating = 'Good';
    color = [251, 191, 36];
  } else if (percentage >= 40) {
    rating = 'Fair';
    color = [249, 115, 22];
  } else {
    rating = 'Needs Improvement';
    color = [239, 68, 68];
  }
  
  return { score: Math.round(percentage), rating, color };
}

function getBooleanDisplay(value: string | undefined): string {
  const normalized = value?.toLowerCase();
  if (normalized === "yes" || normalized === "true") {
    return "Yes";
  } else if (normalized === "no" || normalized === "false") {
    return "No";
  }
  return "N/A";
}

// Helper function to generate a single form submission PDF page
function generateFormSubmissionPage(
  doc: jsPDF,
  submission: FormStaffSubmission,
  generatedTimestamp: string,
  reportIdTimestamp: number,
  isFirstPage: boolean = false
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  if (!isFirstPage) {
    doc.addPage();
  }
  
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Evaluation Report for Caregiver Applicant Submitted via Web Form", pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${generatedTimestamp}`, pageWidth / 2, 28, { align: 'center' });
  
  // Check if result is PROGRESSING or FAIL
  const result = (submission as any).result;
  const isProgressing = result === "PROGRESSING";
  const isFail = result === "FAIL";
  
  if (isProgressing) {
    // Show green box with progressing message
    doc.setFillColor(34, 197, 94); // Green color
    doc.rect(15, 35, pageWidth - 30, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Progressing — all required qualifications & requirements have been met.", pageWidth / 2, 43, { align: 'center' });
  } else if (isFail) {
    // Show red box with FAIL message
    doc.setFillColor(239, 68, 68); // Red color
    doc.rect(15, 35, pageWidth - 30, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("FAIL", pageWidth / 2, 43, { align: 'center' });
  } else {
    // Show normal qualification score
    const qualificationResult = calculateQualificationScore(submission);
    doc.setFillColor(qualificationResult.color[0], qualificationResult.color[1], qualificationResult.color[2]);
    doc.rect(15, 35, pageWidth - 30, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Qualification Score: ${qualificationResult.score}% - ${qualificationResult.rating}`, pageWidth / 2, 43, { align: 'center' });
  }
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Applicant Information", 15, 58);
  
  const tableWidth = pageWidth - 30;
  const colWidth = tableWidth / 2;
  
  const applicantInfoBody: any[] = [
    ['Applicant Name', submission.contactName],
    ['Phone Number', submission.phoneNumber],
    ['Email', submission.email || 'N/A'],
    ['Brightcare location', (submission as any).locationId || 'N/A'],
    ['Submission Date', submission.dateTime],
  ];
  
  if ((submission as any).previousLocation) {
    applicantInfoBody.push(['Previous Employment Location', (submission as any).previousLocation || 'N/A']);
  }
  
  autoTable(doc, {
    startY: 62,
    head: [['Field', 'Value']],
    body: applicantInfoBody,
    theme: 'striped',
    tableWidth: 'auto',
    headStyles: { 
      fillColor: [59, 130, 246], 
      textColor: 255, 
      halign: 'left', 
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    bodyStyles: {
      halign: 'left',
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    columnStyles: {
      0: { cellWidth: colWidth, halign: 'left', valign: 'middle' },
      1: { cellWidth: colWidth, halign: 'left', valign: 'middle' }
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
  });
  
  const yPos = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("Qualifications & Requirements", 15, yPos);
  
  const qualificationsBody: any[] = [
    ['Do you have at least 1 year of professional/paid caregiving experience?', getBooleanDisplay(submission.hasExperience)],
    ['Do you have 15 to 20 hours of availability each week to work?', getBooleanDisplay(submission.hasAvailability)],
    ['Has Vehicle', getBooleanDisplay(submission.hasVehicle)],
  ];
  
  if ((submission as any).reliableTransport) {
    qualificationsBody.push(['Reliable Transport', getBooleanDisplay((submission as any).reliableTransport)]);
  }
  
  qualificationsBody.push(
    ['Are you willing to travel at least 15 minutes to care for a client?', getBooleanDisplay(submission.willingToTravel)],
    ['Our payrate is in Pennsylvania is $16.50 per hour for private pay and $14 per hour for Medicaid cases. Are you ok starting at these rates?', getBooleanDisplay(submission.payRateAcceptance)],
    ['Worked Before', getBooleanDisplay(submission.workedBefore)],
    ['CPR Certification', getBooleanDisplay(submission.hasCPRCertification)],
    ['We require 2-step TB test. Do you have a negative 2-step TB test from the past 12 months?', getBooleanDisplay(submission.canProvideTBTest)],
  );
  
  if ((submission as any).paResidency) {
    qualificationsBody.push(['Have you been a resident of Pennsylvania for at least 2 years?', getBooleanDisplay((submission as any).paResidency)]);
  }
  
  qualificationsBody.push(
    ['Background Check Issues', getBooleanDisplay(submission.hasBackgroundCheckIssues)],
    ['We run a background check for all new employees. The cost is $22 and will be taken from your first paycheck. Do you agree to this?', getBooleanDisplay(submission.backgroundCheckFeeAcceptance)],
  );
  
  autoTable(doc, {
    startY: yPos + 4,
    head: [['Requirement', 'Response']],
    body: qualificationsBody,
    theme: 'striped',
    tableWidth: 'auto',
    headStyles: { 
      fillColor: [59, 130, 246], 
      textColor: 255, 
      halign: 'left', 
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    bodyStyles: {
      halign: 'left',
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    columnStyles: {
      0: { cellWidth: colWidth * 1.4, halign: 'left', valign: 'middle' },
      1: { cellWidth: colWidth * 0.6, halign: 'left', valign: 'middle' }
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
  });
  
  let yPos2 = (doc as any).lastAutoTable.finalY + 10;
  
  if (yPos2 + 30 > pageHeight - 20) {
    doc.addPage();
    yPos2 = 20;
  }
  
  doc.setFont("helvetica", "bold");
  doc.text("Experience & Background", 15, yPos2);
  
  const experienceBody: any[] = [
    ['Caregiving Background', submission.caregivingBackground || 'N/A'],
    ['Do you have experience with dementia clients?', getBooleanDisplay(submission.hasDementiaExperience)],
  ];
  
  if ((submission as any).careExperience) {
    experienceBody.push(['Care Experience', (submission as any).careExperience || 'N/A']);
  }
  
  if ((submission as any).clientType) {
    experienceBody.push(['Client Type', (submission as any).clientType || 'N/A']);
  }
  
  experienceBody.push(['Background Check Issues Description', submission.backgroundCheckIssuesDescription || 'N/A']);
  
  autoTable(doc, {
    startY: yPos2 + 4,
    head: [['Category', 'Details']],
    body: experienceBody,
    theme: 'striped',
    tableWidth: 'auto',
    headStyles: { 
      fillColor: [59, 130, 246], 
      textColor: 255, 
      halign: 'left', 
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    bodyStyles: {
      halign: 'left',
      valign: 'middle',
      cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
    },
    columnStyles: {
      0: { cellWidth: colWidth * 1.4, halign: 'left', valign: 'middle' },
      1: { cellWidth: colWidth * 0.6, halign: 'left', valign: 'middle' }
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
  });
  
  let yPos3 = (doc as any).lastAutoTable.finalY + 10;
  
  if (yPos3 + 30 > pageHeight - 20) {
    doc.addPage();
    yPos3 = 20;
  }
  
  // Performance Scores (Pittsburgh-specific)
  if ((submission as any).experienceScore || (submission as any).compassionScore || (submission as any).safetyScore || (submission as any).professionalismScore) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Performance Scores", 15, yPos3);
    
    const scoreBody: any[] = [];
    if ((submission as any).experienceScore) scoreBody.push(['Experience Score', (submission as any).experienceScore]);
    if ((submission as any).compassionScore) scoreBody.push(['Compassion Score', (submission as any).compassionScore]);
    if ((submission as any).safetyScore) scoreBody.push(['Safety Score', (submission as any).safetyScore]);
    if ((submission as any).professionalismScore) scoreBody.push(['Professionalism Score', (submission as any).professionalismScore]);
    
    autoTable(doc, {
      startY: yPos3 + 4,
      head: [['Metric', 'Score']],
      body: scoreBody,
      theme: 'striped',
      tableWidth: 'auto',
      headStyles: { 
        fillColor: [59, 130, 246], 
        textColor: 255, 
        halign: 'left', 
        valign: 'middle',
        cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
      },
      bodyStyles: {
        halign: 'left',
        valign: 'middle',
        cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }
      },
      columnStyles: {
        0: { cellWidth: colWidth, halign: 'left', valign: 'middle' },
        1: { cellWidth: colWidth, halign: 'left', valign: 'middle' }
      },
      margin: { left: 15, right: 15 },
      pageBreak: 'avoid',
    });
    
    yPos3 = (doc as any).lastAutoTable.finalY + 10;
    if (yPos3 + 30 > pageHeight - 20) {
      doc.addPage();
      yPos3 = 20;
    }
  }
  
  // Performance Summary (Pittsburgh-specific)
  if ((submission as any).performanceSummary) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Performance Summary", 15, yPos3);
    
    autoTable(doc, {
      startY: yPos3 + 4,
      body: [[(submission as any).performanceSummary || 'None']],
      theme: 'striped',
      tableWidth: 'auto',
      styles: { 
        cellPadding: 3, 
        fontSize: 10,
        halign: 'left',
        valign: 'middle'
      },
      margin: { left: 15, right: 15 },
      pageBreak: 'avoid',
    });
    
    yPos3 = (doc as any).lastAutoTable.finalY + 10;
    if (yPos3 + 30 > pageHeight - 20) {
      doc.addPage();
      yPos3 = 20;
    }
  }
  
  // Red Flags (Pittsburgh-specific)
  if ((submission as any).redFlags) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Red Flag(s)", 15, yPos3);
    
    autoTable(doc, {
      startY: yPos3 + 4,
      body: [[(submission as any).redFlags || 'None']],
      theme: 'striped',
      tableWidth: 'auto',
      styles: { 
        cellPadding: 3, 
        fontSize: 10,
        halign: 'left',
        valign: 'middle'
      },
      margin: { left: 15, right: 15 },
      pageBreak: 'avoid',
    });
    
    yPos3 = (doc as any).lastAutoTable.finalY + 10;
    if (yPos3 + 30 > pageHeight - 20) {
      doc.addPage();
      yPos3 = 20;
    }
  }
  
  // Good Caregiver Qualities
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Good Caregiver Qualities", 15, yPos3);
  
  autoTable(doc, {
    startY: yPos3 + 4,
    body: [[submission.goodCaregiverQualities || 'None provided']],
    theme: 'striped',
    tableWidth: 'auto',
    styles: { 
      cellPadding: 3, 
      fontSize: 10,
      halign: 'left',
      valign: 'middle'
    },
    margin: { left: 15, right: 15 },
    pageBreak: 'avoid',
  });
  
  yPos3 = (doc as any).lastAutoTable.finalY + 10;
  if (yPos3 + 30 > pageHeight - 20) {
    doc.addPage();
    yPos3 = 20;
  }
  
  // Follow-up Questions (Pittsburgh-specific)
  if ((submission as any).followUpQuestions) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Follow-up Questions", 15, yPos3);
    
    autoTable(doc, {
      startY: yPos3 + 4,
      body: [[(submission as any).followUpQuestions || 'None']],
      theme: 'striped',
      tableWidth: 'auto',
      styles: { 
        cellPadding: 3, 
        fontSize: 10,
        halign: 'left',
        valign: 'middle'
      },
      margin: { left: 15, right: 15 },
      pageBreak: 'avoid',
    });
    
    yPos3 = (doc as any).lastAutoTable.finalY + 10;
    if (yPos3 + 30 > pageHeight - 20) {
      doc.addPage();
      yPos3 = 20;
    }
  }
  
  // Questions Asked (Pittsburgh-specific)
  if ((submission as any).questionsAsked) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Questions Asked", 15, yPos3);
    
    autoTable(doc, {
      startY: yPos3 + 4,
      body: [[(submission as any).questionsAsked || 'None']],
      theme: 'striped',
      tableWidth: 'auto',
      styles: { 
        cellPadding: 3, 
        fontSize: 10,
        halign: 'left',
        valign: 'middle'
      },
      margin: { left: 15, right: 15 },
      pageBreak: 'avoid',
    });
    
    yPos3 = (doc as any).lastAutoTable.finalY + 10;
    if (yPos3 + 30 > pageHeight - 20) {
      doc.addPage();
      yPos3 = 20;
    }
  }
  
  // Callback Date (Pittsburgh-specific)
  if ((submission as any).callbackDate) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Callback Date", 15, yPos3);
    
    autoTable(doc, {
      startY: yPos3 + 4,
      body: [[(submission as any).callbackDate || 'None']],
      theme: 'striped',
      tableWidth: 'auto',
      styles: { 
        cellPadding: 3, 
        fontSize: 10,
        halign: 'left',
        valign: 'middle'
      },
      margin: { left: 15, right: 15 },
      pageBreak: 'avoid',
    });
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report ID: ${reportIdTimestamp}-${submission.phoneNumber}`, 15, pageHeight - 10);
  doc.text("BrightStar Staff Form Submission System", pageWidth / 2, pageHeight - 10, { align: 'center' });
}

export function generateFormSubmissionsPDF(submissions: FormStaffSubmission[]): Buffer {
  const doc = new jsPDF();
  
  const generatedTimestamp = new Date().toLocaleString();
  const reportIdTimestamp = Date.now();
  
  submissions.forEach((submission, index) => {
    generateFormSubmissionPage(doc, submission, generatedTimestamp, reportIdTimestamp, index === 0);
  });
  
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}
