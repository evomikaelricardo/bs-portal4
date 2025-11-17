import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CandidateEvaluation } from "@shared/schema";
import {
  calculateRecruitmentFunnel,
  calculateQualifications,
  calculateScoreDistribution,
  calculateAverageScores,
  calculateGeographicDistribution,
  calculateTimeSeriesMetrics,
  calculateRiskMetrics,
  calculateResultDistribution,
  calculateTravelAbility,
  calculateStatisticalSummary,
  calculateComplianceCredentials,
  calculateQualificationStatus,
} from "./analyticsUtils";

export function exportAnalyticsToPdf(candidates: CandidateEvaluation[]) {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;

  const addNewPageIfNeeded = (requiredSpace: number = 40) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  const addSectionTitle = (title: string) => {
    addNewPageIfNeeded(20);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, yPosition);
    yPosition += 10;
  };

  const addSubsectionTitle = (title: string) => {
    addNewPageIfNeeded(15);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, yPosition);
    yPosition += 8;
  };

  const addText = (text: string, fontSize: number = 10, style: "normal" | "bold" = "normal") => {
    addNewPageIfNeeded(10);
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);
    doc.text(text, margin, yPosition);
    yPosition += 6;
  };

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Recruitment Analytics Report", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;
  doc.text(`Total Candidates: ${candidates.length}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  const funnelData = calculateRecruitmentFunnel(candidates);
  addSectionTitle("1. Recruitment Funnel");
  autoTable(doc, {
    startY: yPosition,
    head: [["Stage", "Count", "Percentage", "Drop-off Rate"]],
    body: funnelData.map(item => [
      item.stage,
      item.count.toString(),
      `${item.percentage.toFixed(1)}%`,
      item.dropOffRate !== undefined ? `${item.dropOffRate.toFixed(1)}%` : "-",
    ]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  const qualificationStatus = calculateQualificationStatus(candidates);
  addSectionTitle("2. Qualification Status");
  addText(`Qualified for Next Interview: ${qualificationStatus.qualified} (${qualificationStatus.qualifiedPercentage.toFixed(1)}%)`);
  addText(`Not Qualified: ${qualificationStatus.notQualified}`);
  yPosition += 5;

  addSubsectionTitle("Missing Criteria Breakdown:");
  autoTable(doc, {
    startY: yPosition,
    head: [["Criterion", "Missing Count"]],
    body: [
      ["Work Per Week", qualificationStatus.missingCriteria.workPerWeek.toString()],
      ["Can Travel", qualificationStatus.missingCriteria.canTravel.toString()],
      ["1+ Year Experience", qualificationStatus.missingCriteria.oneYearExperience.toString()],
      ["Acceptable Pay Rate", qualificationStatus.missingCriteria.payRate.toString()],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  const qualifications = calculateQualifications(candidates);
  addSectionTitle("3. Qualification Profile");
  autoTable(doc, {
    startY: yPosition,
    head: [["Qualification", "Qualified", "Not Qualified", "Missing"]],
    body: qualifications.map(q => [
      q.name,
      q.qualified.toString(),
      q.notQualified.toString(),
      q.missing.toString(),
    ]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  const averageScores = calculateAverageScores(candidates);
  addSectionTitle("4. Quality Scores");
  addSubsectionTitle("Average Scores:");
  autoTable(doc, {
    startY: yPosition,
    head: [["Score Category", "Average"]],
    body: [
      ["Experience", averageScores.experience.toFixed(2)],
      ["Compassion", averageScores.compassion.toFixed(2)],
      ["Safety", averageScores.safety.toFixed(2)],
      ["Professionalism", averageScores.professionalism.toFixed(2)],
      ["Overall", averageScores.overall.toFixed(2)],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  const scoreDistribution = calculateScoreDistribution(candidates);
  addSubsectionTitle("Score Distribution:");
  autoTable(doc, {
    startY: yPosition,
    head: [["Score Range", "Experience", "Compassion", "Safety", "Professionalism", "Overall"]],
    body: ["0-1", "1-2", "2-3", "3-4", "4-5"].map((range, idx) => [
      range,
      scoreDistribution.experience[idx]?.count.toString() || "0",
      scoreDistribution.compassion[idx]?.count.toString() || "0",
      scoreDistribution.safety[idx]?.count.toString() || "0",
      scoreDistribution.professionalism[idx]?.count.toString() || "0",
      scoreDistribution.overall[idx]?.count.toString() || "0",
    ]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  const geoData = calculateGeographicDistribution(candidates);
  addSectionTitle("5. Geographic Distribution");
  autoTable(doc, {
    startY: yPosition,
    head: [["State", "Count", "Percentage"]],
    body: geoData.slice(0, 10).map(g => [
      g.state || g.location,
      g.count.toString(),
      `${g.percentage.toFixed(1)}%`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  const timeSeriesData = calculateTimeSeriesMetrics(candidates);
  addSectionTitle("6. Operational Efficiency");
  autoTable(doc, {
    startY: yPosition,
    head: [["Date", "Interviews", "Pass Rate"]],
    body: timeSeriesData.map(t => [
      t.date,
      t.interviews.toString(),
      `${t.passRate.toFixed(1)}%`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  const riskData = calculateRiskMetrics(candidates);
  if (riskData.length > 0) {
    addSectionTitle("7. Risk & Compliance");
    autoTable(doc, {
      startY: yPosition,
      head: [["Risk Category", "Count", "Percentage", "Severity"]],
      body: riskData.map(r => [
        r.category,
        r.count.toString(),
        `${r.percentage.toFixed(1)}%`,
        r.severity.toUpperCase(),
      ]),
      theme: "grid",
      headStyles: { fillColor: [231, 76, 60], textColor: 255, fontStyle: "bold" },
      margin: { left: margin, right: margin },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  const resultDistribution = calculateResultDistribution(candidates);
  addSectionTitle("8. Interview Results");
  autoTable(doc, {
    startY: yPosition,
    head: [["Result", "Count", "Percentage"]],
    body: resultDistribution.map(r => [
      r.result,
      r.count.toString(),
      `${r.percentage.toFixed(1)}%`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  const travelAbility = calculateTravelAbility(candidates);
  addSectionTitle("9. Travel Ability");
  autoTable(doc, {
    startY: yPosition,
    head: [["Category", "Count", "Percentage"]],
    body: travelAbility.map(t => [
      t.category,
      t.count.toString(),
      `${t.percentage.toFixed(1)}%`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  const complianceCredentials = calculateComplianceCredentials(candidates);
  addSectionTitle("10. Compliance Credentials");
  autoTable(doc, {
    startY: yPosition,
    head: [["Credential", "Has", "Missing", "Failed", "Percentage with Credential"]],
    body: complianceCredentials.map(c => {
      const percentage = c.total > 0 ? (c.hasCredential / c.total) * 100 : 0;
      return [
        c.credential,
        c.hasCredential.toString(),
        c.missingCredential.toString(),
        c.failedCheck.toString(),
        `${percentage.toFixed(1)}%`,
      ];
    }),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  const statisticalSummary = calculateStatisticalSummary(candidates);
  addSectionTitle("11. Statistical Analysis");
  autoTable(doc, {
    startY: yPosition,
    head: [["Metric", "Mean", "Std Dev", "Min", "Q25", "Median", "Q75", "Max", "Count"]],
    body: statisticalSummary.map(s => [
      s.metric,
      s.mean.toFixed(2),
      s.std.toFixed(2),
      s.min.toFixed(2),
      s.q25.toFixed(2),
      s.median.toFixed(2),
      s.q75.toFixed(2),
      s.max.toFixed(2),
      s.count.toString(),
    ]),
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
    margin: { left: margin, right: margin },
    styles: { fontSize: 8 },
  });

  doc.addPage();
  yPosition = 20;
  addSectionTitle("Summary");
  addText(`This comprehensive analytics report analyzes ${candidates.length} candidate interviews.`, 11, "bold");
  addText("");
  addText("Key Metrics:");
  const passedCount = candidates.filter(c => c.result === "PASS").length;
  const passRate = candidates.length > 0 ? (passedCount / candidates.length) * 100 : 0;
  addText(`• Pass Rate: ${passRate.toFixed(1)}% (${passedCount} of ${candidates.length})`);
  addText(`• Qualified for Next Interview: ${qualificationStatus.qualified} (${qualificationStatus.qualifiedPercentage.toFixed(1)}%)`);
  addText(`• Average Overall Score: ${averageScores.overall.toFixed(2)}/5.0`);
  addText("");
  addText("This report was generated by the BrightStart Interview Evaluation System.", 9);
  addText(`Generated on: ${new Date().toLocaleString()}`, 9);

  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(
      "BrightStart Interview Evaluation System",
      pageWidth - margin,
      pageHeight - 10,
      { align: "right" }
    );
  }

  const fileName = `Analytics_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
