import type { AuditResult } from '@/types/audit';
import { gradeColor, scoreColor } from './score-utils';

// jsPDF color helper: hex "#22c55e" → [r, g, b]
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function scoreLabel(score: number): string {
  if (score >= 80) return '● Strong';
  if (score >= 60) return '◐ Decent';
  if (score >= 40) return '○ Weak';
  return '✕ Critical';
}

export async function generateAuditPDF(result: AuditResult, targetRole?: string): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = 210;   // A4 width mm
  const MARGIN = 18;
  const CONTENT_W = W - MARGIN * 2;
  let y = 0;

  const gradeRgb = hexToRgb(gradeColor(result.grade));

  // ─── helpers ────────────────────────────────────────────────
  const newPage = () => {
    doc.addPage();
    y = MARGIN;
  };

  const checkPage = (needed: number) => {
    if (y + needed > 275) newPage();
  };

  const setColor = (hex: string) => {
    const [r, g, b] = hexToRgb(hex);
    doc.setTextColor(r, g, b);
  };

  const resetColor = () => doc.setTextColor(30, 30, 30);

  const drawBar = (x: number, barY: number, score: number, width = 60, height = 3) => {
    // background
    doc.setFillColor(220, 220, 220);
    doc.roundedRect(x, barY, width, height, 1, 1, 'F');
    // fill
    const [r, g, b] = hexToRgb(scoreColor(score));
    doc.setFillColor(r, g, b);
    doc.roundedRect(x, barY, (score / 100) * width, height, 1, 1, 'F');
  };

  const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text, maxWidth);
  };

  // ─── PAGE 1 — Cover ─────────────────────────────────────────
  y = MARGIN;

  // Header band
  doc.setFillColor(15, 15, 20);
  doc.rect(0, 0, W, 52, 'F');

  // ALEX brand
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 130);
  doc.text('AUDITED BY ALEX™ — ARTIFICIAL LINKEDIN EXAMINER', MARGIN, 12);

  // Grade letter
  doc.setFontSize(64);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...gradeRgb);
  doc.text(result.grade, MARGIN, 44);

  // Score + label
  doc.setFontSize(28);
  doc.setTextColor(240, 240, 240);
  doc.text(`${Math.round(result.overall_score)}/100`, MARGIN + 26, 34);

  doc.setFontSize(11);
  doc.setTextColor(...gradeRgb);
  doc.text(result.grade_label, MARGIN + 26, 43);

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 160);
  doc.text(`Beats ${result.percentile}% of LinkedIn profiles`, MARGIN + 26, 50);

  // Target role
  if (targetRole) {
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 160);
    doc.text(`Target role: ${targetRole}`, W - MARGIN, 12, { align: 'right' });
  }

  y = 64;

  // ALEX verdict
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  setColor('#a1a1aa');
  const verdictLines = wrapText(`"${result.alex_verdict}"`, CONTENT_W, 10);
  doc.text(verdictLines, MARGIN, y);
  y += verdictLines.length * 5 + 4;

  doc.setFont('helvetica', 'normal');

  // Target role fit
  resetColor();
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 110);
  const fitLines = wrapText(`Role fit: ${result.target_role_fit}`, CONTENT_W, 9);
  doc.text(fitLines, MARGIN, y);
  y += fitLines.length * 4.5 + 10;

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 8;

  // ─── Score summary table ─────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  resetColor();
  doc.text('Section Scores', MARGIN, y);
  y += 7;

  for (const s of result.sections) {
    checkPage(12);
    const scoreRgb = hexToRgb(scoreColor(s.score));

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    resetColor();
    doc.text(s.label, MARGIN, y);

    drawBar(MARGIN + 38, y - 3, s.score, 80, 4);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...scoreRgb);
    doc.text(String(s.score), MARGIN + 124, y);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140, 140, 150);
    doc.setFontSize(8);
    doc.text(scoreLabel(s.score), MARGIN + 134, y);

    y += 8;
  }

  // ─── Action Plan ─────────────────────────────────────────────
  y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  resetColor();
  doc.text('Action Plan', MARGIN, y);
  y += 7;

  const impactColor: Record<string, string> = {
    High: '#ef4444',
    Medium: '#f97316',
    Low: '#22c55e',
  };

  for (const item of result.action_plan) {
    checkPage(12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    resetColor();
    doc.text(`${item.rank}.`, MARGIN, y);

    const actionLines = wrapText(item.action, CONTENT_W - 20, 9);
    doc.setFont('helvetica', 'normal');
    doc.text(actionLines, MARGIN + 7, y);

    const tagX = W - MARGIN;
    doc.setFontSize(7.5);
    setColor(impactColor[item.impact] ?? '#888');
    doc.text(`${item.impact} impact`, tagX, y, { align: 'right' });

    y += actionLines.length * 4.5 + 2;

    doc.setTextColor(140, 140, 150);
    doc.text(item.effort, MARGIN + 7, y);
    y += 5;
  }

  // ─── PAGES 2+ — Section Details ──────────────────────────────
  for (const section of result.sections) {
    newPage();

    const sRgb = hexToRgb(scoreColor(section.score));

    // Section header
    doc.setFillColor(15, 15, 20);
    doc.rect(0, 0, W, 22, 'F');

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(240, 240, 240);
    doc.text(section.label, MARGIN, 14);

    doc.setFontSize(18);
    doc.setTextColor(...sRgb);
    doc.text(String(section.score), W - MARGIN, 14, { align: 'right' });

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 130);
    doc.text(`Weight: ${section.weight}%  ·  ${scoreLabel(section.score)}`, W - MARGIN, 20, { align: 'right' });

    y = 32;

    // Critique
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    setColor('#525252');
    const critLines = wrapText(section.critique, CONTENT_W, 9);
    doc.text(critLines, MARGIN, y);
    y += critLines.length * 4.5 + 6;

    // Issues
    if (section.issues.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      setColor('#ef4444');
      doc.text('Issues', MARGIN, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      for (const issue of section.issues) {
        checkPage(8);
        const iLines = wrapText(`• ${issue}`, CONTENT_W - 4, 8.5);
        doc.text(iLines, MARGIN + 2, y);
        y += iLines.length * 4.2 + 1.5;
      }
      y += 2;
    }

    // Strengths
    if (section.strengths.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      setColor('#22c55e');
      doc.text('Strengths', MARGIN, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      for (const s of section.strengths) {
        checkPage(8);
        const sLines = wrapText(`✓ ${s}`, CONTENT_W - 4, 8.5);
        doc.text(sLines, MARGIN + 2, y);
        y += sLines.length * 4.2 + 1.5;
      }
      y += 2;
    }

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(MARGIN, y, W - MARGIN, y);
    y += 6;

    // BEFORE
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 110);
    doc.text('BEFORE', MARGIN, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(130, 130, 140);
    const beforeText = section.before || 'Not provided';
    const beforeLines = wrapText(beforeText, CONTENT_W, 8.5);
    // Light gray background
    doc.setFillColor(245, 245, 247);
    doc.roundedRect(MARGIN - 1, y - 3, CONTENT_W + 2, beforeLines.length * 4.5 + 4, 1, 1, 'F');
    doc.text(beforeLines, MARGIN + 1, y);
    y += beforeLines.length * 4.5 + 8;

    checkPage(20);

    // AFTER
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor('#16a34a');
    doc.text('AFTER  (copy-paste ready)', MARGIN, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 80, 40);
    const afterLines = wrapText(section.after ?? 'No rewrite available.', CONTENT_W, 8.5);
    // Light green background
    doc.setFillColor(240, 253, 244);
    const afterH = afterLines.length * 4.5 + 6;
    checkPage(afterH + 4);
    doc.roundedRect(MARGIN - 1, y - 3, CONTENT_W + 2, afterH, 1, 1, 'F');
    doc.text(afterLines, MARGIN + 1, y);
    y += afterH + 4;
  }

  // ─── Footer on every page ─────────────────────────────────────
  const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(180, 180, 190);
    doc.text(`ALEX™ LinkedIn Audit  ·  Page ${i} of ${totalPages}`, W / 2, 292, { align: 'center' });
  }

  doc.save('linkedin-audit-by-alex.pdf');
}
