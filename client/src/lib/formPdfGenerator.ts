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
  doc.text("Staff Web Form Submission Report", pageWidth / 2, 20, { align: 'center' });
  
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
  
  autoTable(doc, {
    startY: 62,
    head: [['Field', 'Value']],
    body: [
      ['Name', submission.contactName],
      ['Phone Number', submission.phoneNumber],
      ['Email', submission.email || 'N/A'],
      ['Submission Date', submission.dateTime],
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
  doc.text("Qualifications & Requirements", 15, yPos);
  
  autoTable(doc, {
    startY: yPos + 4,
    head: [['Requirement', 'Status']],
    body: [
      ['Has Experience', getBooleanDisplay(submission.hasExperience)],
      ['Has Availability', getBooleanDisplay(submission.hasAvailability)],
      ['Has Vehicle', getBooleanDisplay(submission.hasVehicle)],
      ['Willing to Travel', getBooleanDisplay(submission.willingToTravel)],
      ['Worked Before', getBooleanDisplay(submission.workedBefore)],
      ['Pay Rate Acceptance', getBooleanDisplay(submission.payRateAcceptance)],
      ['CPR Certification', getBooleanDisplay(submission.hasCPRCertification)],
      ['Can Provide TB Test', getBooleanDisplay(submission.canProvideTBTest)],
      ['Background Check Fee Acceptance', getBooleanDisplay(submission.backgroundCheckFeeAcceptance)],
      ['Background Check Issues', getBooleanDisplay(submission.hasBackgroundCheckIssues)],
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
  
  const yPos2 = (doc as any).lastAutoTable.finalY + 10;
  const pageHeight = doc.internal.pageSize.getHeight();
  
  if (yPos2 + 30 > pageHeight - 20) {
    doc.addPage();
  }
  
  const yPos2Final = yPos2 + 30 > pageHeight - 20 ? 20 : yPos2;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Experience & Background", 15, yPos2Final);
  
  autoTable(doc, {
    startY: yPos2Final + 4,
    head: [['Experience Type', 'Details']],
    body: [
      ['Caregiving Background', submission.caregivingBackground || 'N/A'],
      ['Dementia Experience', getBooleanDisplay(submission.hasDementiaExperience)],
      ['Good Caregiver Qualities', submission.goodCaregiverQualities || 'N/A'],
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
  
  let yPos3 = (doc as any).lastAutoTable.finalY + 10;
  
  if (yPos3 + 30 > pageHeight - 20) {
    doc.addPage();
    yPos3 = 20;
  }
  
  if (submission.hasBackgroundCheckIssues?.toLowerCase() === "yes" && submission.backgroundCheckIssuesDescription) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Background Check Issues", 15, yPos3);
    
    autoTable(doc, {
      startY: yPos3 + 4,
      body: [[submission.backgroundCheckIssuesDescription]],
      theme: 'striped',
      tableWidth: 'auto',
      styles: { 
        cellPadding: 3, 
        fontSize: 10,
        halign: 'left',
        valign: 'middle',
        fillColor: [254, 226, 226]
      },
      margin: { left: 15, right: 15 },
      pageBreak: 'avoid',
    });
    
    yPos3 = (doc as any).lastAutoTable.finalY + 10;
  }
  
  if (yPos3 + 20 > pageHeight - 20) {
    doc.addPage();
    yPos3 = 20;
  }
  
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
  
  const finalY = (doc as any).lastAutoTable.finalY;
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report ID: ${Date.now()}-${submission.phoneNumber}`, 15, pageHeight - 10);
  doc.text("BrightStart Staff Form Submission System", pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  const fileName = `${submission.contactName.replace(/\s+/g, '_')}_Form_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
