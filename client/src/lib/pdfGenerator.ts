import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CandidateEvaluation } from '@shared/schema';

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

export function generatePDF(candidate: CandidateEvaluation) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Post-Interview Evaluation Report", pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });
  
  const statusColor = candidate.result === "PASS" ? [34, 197, 94] : [239, 68, 68];
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.rect(15, 35, pageWidth - 30, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Status: ${candidate.result}`, pageWidth / 2, 43, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Candidate Information", 15, 58);
  
  const tableWidth = pageWidth - 30;
  const colWidth = tableWidth / 2;
  
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
  
  const overall = calculateOverallScore(candidate);
  
  const yPos2 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.text("Experience & Assessments", 15, yPos2);
  
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
  
  const finalY = (doc as any).lastAutoTable.finalY;
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report ID: ${Date.now()}-${candidate.phoneNumber}`, 15, pageHeight - 10);
  doc.text("BrightStart Interview Evaluation System", pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  const fileName = `${candidate.contactName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
