import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CustomerService } from "@shared/schema";

export function generateCustomerPDF(customer: CustomerService) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("In-Home Care Service Report", pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 28, { align: 'center' });
  
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
  
  const finalY = (doc as any).lastAutoTable.finalY;
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report ID: ${Date.now()}-${customer.phoneNumber}`, 15, pageHeight - 15);
  doc.text("BrightStart In-Home Care Services", pageWidth / 2, pageHeight - 15, { align: 'center' });
  doc.text("CONFIDENTIAL - Healthcare Information", pageWidth - 15, pageHeight - 15, { align: 'right' });
  
  doc.setFontSize(7);
  doc.text("This document contains protected healthcare information. Unauthorized disclosure is prohibited.", 15, pageHeight - 10);
  
  const safeName = customer.contactName?.replace(/\s+/g, '_') ?? 'Customer';
  const fileName = `Customer_${safeName}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
