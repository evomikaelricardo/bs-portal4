import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormStaffSubmission } from '@shared/schema';

function getBooleanDisplay(value: string | undefined): string {
  const normalized = value?.toLowerCase();
  if (normalized === "yes" || normalized === "true") {
    return "Yes";
  } else if (normalized === "no" || normalized === "false") {
    return "No";
  }
  return "N/A";
}

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

export function generateFormPDF(submission: FormStaffSubmission) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Evaluation Report for Caregiver Applicant Submitted via Web Form", pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });
  
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
  const pageHeight = doc.internal.pageSize.getHeight();
  
  if (yPos2 + 30 > pageHeight - 20) {
    doc.addPage();
    yPos2 = 20;
  }
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
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
    
    yPos3 = (doc as any).lastAutoTable.finalY + 10;
    if (yPos3 + 30 > pageHeight - 20) {
      doc.addPage();
      yPos3 = 20;
    }
  }
  
  // Consent & Compliance
  if (submission.consentToMessages) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Consent & Compliance", 15, yPos3);
    
    autoTable(doc, {
      startY: yPos3 + 4,
      body: [
        ['Consent to Messages: ' + getBooleanDisplay(submission.consentToMessages)]
      ],
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
  doc.text(`Report ID: ${Date.now()}-${submission.phoneNumber}`, 15, pageHeight - 10);
  doc.text("BrightStar Staff Form Submission System", pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  const fileName = `${submission.contactName.replace(/\s+/g, '_')}_Form_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
