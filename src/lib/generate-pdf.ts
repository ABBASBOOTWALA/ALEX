import type { AuditResult } from '@/types/audit';
import type { InterviewKit } from '@/types/interview';
import { gradeColor, scoreColor } from './score-utils';

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

// Line height in mm for a given font size in pt
function lh(pt: number, ratio = 1.55): number {
  return (pt * 25.4) / 72 * ratio;
}

export async function generateAuditPDF(result: AuditResult, interviewKit?: InterviewKit, targetRole?: string): Promise<void> {
  const { jsPDF } = await import('jspdf');

  const W = 210;
  const H = 297;
  const ML = 20;   // left margin
  const MR = 20;   // right margin
  const CW = W - ML - MR;  // content width
  const BOTTOM = H - 16;   // footer boundary

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let y = 0;
  let pageNum = 1;

  // ── cursor helpers ────────────────────────────────────────────
  const addPage = () => {
    doc.addPage();
    pageNum++;
    y = 24;
    // subtle top rule
    doc.setDrawColor(230, 230, 232);
    doc.setLineWidth(0.2);
    doc.line(ML, 14, W - MR, 14);
    // page label
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 185);
    doc.text('ALEX — LinkedIn Profile Audit', ML, 11);
    doc.text(`Page ${pageNum}`, W - MR, 11, { align: 'right' });
  };

  // Ensure at least `need` mm remain before BOTTOM; if not, add page
  const need = (mm: number) => { if (y + mm > BOTTOM) addPage(); };

  // Wrap text and return lines (also sets font size on doc)
  const wrap = (text: string, width: number, size: number): string[] => {
    doc.setFontSize(size);
    return doc.splitTextToSize(text || '', width);
  };

  // Draw a filled pill/tag
  const pill = (
    px: number, py: number, label: string,
    bg: [number, number, number], fg: [number, number, number],
    size = 7
  ) => {
    doc.setFontSize(size);
    const tw = doc.getTextWidth(label);
    const pw = tw + 4; const ph = lh(size) + 1.5;
    doc.setFillColor(...bg);
    doc.roundedRect(px, py - ph + 1, pw, ph, 1, 1, 'F');
    doc.setTextColor(...fg);
    doc.text(label, px + 2, py);
  };

  // Draw progress bar
  const bar = (bx: number, by: number, score: number, w = 70, h = 3) => {
    doc.setFillColor(230, 230, 232);
    doc.roundedRect(bx, by, w, h, 1, 1, 'F');
    if (score > 0) {
      doc.setFillColor(...hexToRgb(scoreColor(score)));
      doc.roundedRect(bx, by, Math.max(2, (score / 100) * w), h, 1, 1, 'F');
    }
  };

  // Draw a labeled text block with a colored left border
  const textBlock = (
    label: string, content: string,
    borderHex: string, bgHex: string, textHex: string
  ) => {
    const lines = wrap(content || 'Not provided', CW - 10, 8.5);
    const blockH = lines.length * lh(8.5) + 8;
    need(blockH + 10);
    // label
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...hexToRgb(borderHex));
    doc.text(label, ML, y);
    y += 4;
    // bg fill
    const [br, bg2, bb] = hexToRgb(bgHex);
    doc.setFillColor(br, bg2, bb);
    doc.roundedRect(ML, y, CW, blockH - 2, 2, 2, 'F');
    // left accent border
    doc.setFillColor(...hexToRgb(borderHex));
    doc.rect(ML, y, 2.5, blockH - 2, 'F');
    // text
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...hexToRgb(textHex));
    doc.text(lines, ML + 6, y + 5);
    y += blockH + 4;
  };

  // ── PAGE 1: Cover ─────────────────────────────────────────────
  y = 0;
  const gradeRgb = hexToRgb(gradeColor(result.grade));

  // Dark header
  doc.setFillColor(14, 14, 18);
  doc.rect(0, 0, W, 64, 'F');

  // Thin accent line at bottom of header
  doc.setFillColor(...gradeRgb);
  doc.rect(0, 63, W, 1, 'F');

  // ALEX label
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 100);
  doc.text('ALEX  /  ARTIFICIAL LINKEDIN EXAMINER', ML, 12);

  // Date top right
  doc.setTextColor(70, 70, 80);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(dateStr, W - MR, 12, { align: 'right' });

  // Grade letter
  doc.setFontSize(72);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...gradeRgb);
  doc.text(result.grade, ML, 52);

  // Score
  doc.setFontSize(32);
  doc.setTextColor(240, 240, 242);
  doc.text(`${Math.round(result.overall_score)}`, ML + 28, 46);
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 110);
  doc.text('/100', ML + 28 + doc.getTextWidth(`${Math.round(result.overall_score)}`) + 1, 46);

  // Grade label
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...gradeRgb);
  doc.text(result.grade_label, ML + 28, 54);

  // Percentile pill
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 140);
  doc.text(`Beats ${result.percentile}% of LinkedIn profiles`, ML + 28, 61);

  // Target role
  if (targetRole) {
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 110);
    const roleLines = wrap(`Target role: ${targetRole}`, 80, 8.5);
    doc.text(roleLines, W - MR, 44, { align: 'right' });
  }

  y = 76;

  // ALEX verdict
  const verdictLines = wrap(`"${result.alex_verdict}"`, CW, 9.5);
  need(verdictLines.length * lh(9.5) + 8);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(80, 80, 90);
  doc.text(verdictLines, ML, y);
  y += verdictLines.length * lh(9.5) + 3;

  // Role fit
  const fitLines = wrap(result.target_role_fit, CW, 8.5);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(130, 130, 140);
  doc.text(fitLines, ML, y);
  y += fitLines.length * lh(8.5) + 12;

  // ── Section scores table ──────────────────────────────────────
  need(12 + result.sections.length * 11);

  // Table header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(140, 140, 150);
  doc.text('SECTION', ML, y);
  doc.text('SCORE', W - MR, y, { align: 'right' });
  y += 3;
  doc.setDrawColor(220, 220, 224);
  doc.setLineWidth(0.3);
  doc.line(ML, y, W - MR, y);
  y += 5;

  for (const s of result.sections) {
    need(11);
    const scoreRgb = hexToRgb(scoreColor(s.score));

    // Row bg on alternating rows (subtle)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 45);
    doc.text(s.label, ML, y);

    // Weight badge
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 170);
    doc.text(`${s.weight}%`, ML + 36, y);

    // Progress bar
    bar(ML + 46, y - 3.5, s.score, 80, 3.5);

    // Score number
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...scoreRgb);
    doc.text(String(s.score), W - MR, y, { align: 'right' });

    y += 9;
    doc.setDrawColor(240, 240, 242);
    doc.setLineWidth(0.1);
    doc.line(ML, y - 2.5, W - MR, y - 2.5);
  }

  y += 8;

  // ── Action plan ───────────────────────────────────────────────
  need(14 + result.action_plan.length * 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(140, 140, 150);
  doc.text('ACTION PLAN', ML, y);
  y += 3;
  doc.setDrawColor(220, 220, 224);
  doc.setLineWidth(0.3);
  doc.line(ML, y, W - MR, y);
  y += 6;

  const impactBg: Record<string, [number, number, number]> = {
    High:   [254, 226, 226],
    Medium: [255, 237, 213],
    Low:    [220, 252, 231],
  };
  const impactFg: Record<string, [number, number, number]> = {
    High:   [185, 28, 28],
    Medium: [194, 65, 12],
    Low:    [22, 101, 52],
  };

  for (const item of result.action_plan) {
    const actionLines = wrap(item.action, CW - 40, 9);
    const rowH = Math.max(12, actionLines.length * lh(9) + 6);
    need(rowH + 2);

    // Rank circle
    doc.setFillColor(235, 235, 240);
    doc.circle(ML + 3.5, y - 1.5, 3.5, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 90);
    doc.text(String(item.rank), ML + 3.5, y + 0.5, { align: 'center' });

    // Action text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 45);
    doc.text(actionLines, ML + 10, y);

    // Impact pill
    const ibg = impactBg[item.impact] ?? [235, 235, 240];
    const ifg = impactFg[item.impact] ?? [80, 80, 90];
    pill(W - MR - 28, y, item.impact, ibg, ifg, 7);

    y += rowH;

    // Effort label
    doc.setFontSize(7.5);
    doc.setTextColor(160, 160, 170);
    doc.text(item.effort, ML + 10, y - 3);
  }

  // ── Pages 2+: Section details ─────────────────────────────────
  for (const section of result.sections) {
    addPage();

    const sRgb = hexToRgb(scoreColor(section.score));

    // Section header bar
    doc.setFillColor(14, 14, 18);
    doc.rect(ML - 20, 14, W, 22, 'F');

    // Score accent line (colored by score)
    doc.setFillColor(...sRgb);
    doc.rect(ML - 20, 35.5, W, 0.8, 'F');

    // Section label
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(235, 235, 238);
    doc.text(section.label, ML, 29);

    // Score
    doc.setFontSize(22);
    doc.setTextColor(...sRgb);
    doc.text(String(section.score), W - MR, 29, { align: 'right' });

    // Weight + /100
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 90, 100);
    doc.text(`Weight ${section.weight}%  /100`, W - MR, 35, { align: 'right' });

    y = 46;

    // Score bar (full width, thin)
    bar(ML, y, section.score, CW, 4);
    y += 10;

    // Critique
    const critLines = wrap(section.critique, CW, 9.5);
    need(critLines.length * lh(9.5) + 8);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(60, 60, 68);
    doc.text(critLines, ML, y);
    y += critLines.length * lh(9.5) + 8;

    // Issues
    if (section.issues.length > 0) {
      need(8 + section.issues.length * 10);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(185, 28, 28);
      doc.text('ISSUES', ML, y);
      y += 5;

      for (const issue of section.issues) {
        const iLines = wrap(`- ${issue}`, CW - 6, 8.5);
        need(iLines.length * lh(8.5) + 3);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 30, 30);
        doc.text(iLines, ML + 4, y);
        y += iLines.length * lh(8.5) + 2;
      }
      y += 4;
    }

    // Strengths
    if (section.strengths.length > 0) {
      need(8 + section.strengths.length * 10);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52);
      doc.text('STRENGTHS', ML, y);
      y += 5;

      for (const strength of section.strengths) {
        const sLines = wrap(`+ ${strength}`, CW - 6, 8.5);
        need(sLines.length * lh(8.5) + 3);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(20, 70, 35);
        doc.text(sLines, ML + 4, y);
        y += sLines.length * lh(8.5) + 2;
      }
      y += 6;
    }

    // BEFORE block
    textBlock('BEFORE', section.before ?? 'Not provided', '#71717a', '#f7f7f8', '#444450');

    // AFTER block
    textBlock('AFTER  —  copy-paste ready', section.after ?? 'Rewrite not available.', '#16a34a', '#f0fdf4', '#14532d');
  }

  // ── Interview Kit Pages ───────────────────────────────────────
  if (interviewKit) {
    addPage();
    doc.setFillColor(14, 14, 18);
    doc.rect(ML - 20, 14, W, 22, 'F');
    doc.setFillColor(59, 130, 246);
    doc.rect(ML - 20, 35.5, W, 0.8, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(235, 235, 238);
    doc.text('Interview Prep Kit', ML, 29);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 90, 100);
    doc.text(`${interviewKit.extracted.seniority} ${interviewKit.extracted.domain}  ·  ${interviewKit.extracted.roleType}`, W - MR, 29, { align: 'right' });
    y = 46;

    if (interviewKit.extracted.skills.length > 0) {
      doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(140, 140, 150);
      doc.text('KEY SKILLS', ML, y); y += 5;
      const skillLines = wrap(interviewKit.extracted.skills.join('  ·  '), CW, 8.5);
      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(200, 200, 210);
      doc.text(skillLines, ML, y); y += skillLines.length * lh(8.5) + 8;
    }

    if (interviewKit.mustKnow.length > 0) {
      need(12 + interviewKit.mustKnow.length * 8);
      doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(217, 119, 6);
      doc.text('MUST KNOW', ML, y); y += 5;
      for (const item of interviewKit.mustKnow) {
        const iLines = wrap(`- ${item.topic}: ${item.why}`, CW, 8.5);
        need(iLines.length * lh(8.5) + 3);
        doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 60, 68);
        doc.text(iLines, ML + 3, y); y += iLines.length * lh(8.5) + 2;
      }
      y += 6;
    }

    if (interviewKit.revisionPlan.length > 0) {
      need(14 + interviewKit.revisionPlan.length * 16);
      doc.setFontSize(7.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(140, 140, 150);
      doc.text('30-MINUTE REVISION PLAN', ML, y); y += 5;
      for (const slot of interviewKit.revisionPlan) {
        need(14);
        doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246); doc.text(slot.slot, ML, y);
        doc.setTextColor(40, 40, 45); doc.text(slot.title, ML + 22, y); y += 4;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(120, 120, 130);
        doc.text(slot.topics.join('  ·  '), ML + 4, y); y += 7;
      }
    }

    const qSections: { label: string; questions: typeof interviewKit.technical }[] = [
      { label: 'Technical Questions', questions: interviewKit.technical },
      { label: 'Behavioral Questions', questions: interviewKit.behavioral },
      { label: 'Coding Questions', questions: interviewKit.coding },
      { label: 'System Design Questions', questions: interviewKit.systemDesign },
    ].filter((s) => s.questions.length > 0);

    for (const qs of qSections) {
      addPage();
      doc.setFillColor(14, 14, 18); doc.rect(ML - 20, 14, W, 22, 'F');
      doc.setFillColor(59, 130, 246); doc.rect(ML - 20, 35.5, W, 0.8, 'F');
      doc.setFontSize(13); doc.setFont('helvetica', 'bold'); doc.setTextColor(235, 235, 238);
      doc.text(qs.label, ML, 29);
      doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(90, 90, 100);
      doc.text(`${qs.questions.length} questions`, W - MR, 29, { align: 'right' });
      y = 46;

      for (let qi = 0; qi < qs.questions.length; qi++) {
        const q = qs.questions[qi];
        const qLines = wrap(`${qi + 1}. ${q.q}`, CW, 9);
        const answerLines = q.sampleAnswer ? wrap(q.sampleAnswer, CW - 6, 8) : [];
        need(qLines.length * lh(9) + answerLines.length * lh(8) + 24);
        doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(40, 40, 45);
        doc.text(qLines, ML, y); y += qLines.length * lh(9) + 3;
        const diffColors: Record<string, [number, number, number]> = {
          easy: [22, 101, 52], medium: [146, 64, 14], hard: [185, 28, 28],
        };
        doc.setFontSize(7); doc.setFont('helvetica', 'normal');
        doc.setTextColor(...(diffColors[q.difficulty] ?? [100, 100, 110]));
        doc.text(q.difficulty.toUpperCase(), ML, y);
        if (q.topic) { doc.setTextColor(120, 120, 130); doc.text(`  ${q.topic}`, ML + doc.getTextWidth(q.difficulty.toUpperCase()) + 2, y); }
        y += 5;
        if (q.framework) {
          const fLines = wrap(`Framework: ${q.framework}`, CW - 6, 8);
          doc.setFontSize(8); doc.setTextColor(100, 100, 110);
          doc.text(fLines, ML + 3, y); y += fLines.length * lh(8) + 3;
        }
        if (answerLines.length > 0) {
          const blockH = answerLines.length * lh(8) + 6;
          need(blockH + 4);
          doc.setFillColor(240, 249, 255); doc.roundedRect(ML, y, CW, blockH, 1, 1, 'F');
          doc.setFillColor(59, 130, 246); doc.rect(ML, y, 2.5, blockH, 'F');
          doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 60, 100);
          doc.text(answerLines, ML + 6, y + 4); y += blockH + 6;
        }
        doc.setDrawColor(240, 240, 242); doc.setLineWidth(0.1);
        doc.line(ML, y, W - MR, y); y += 5;
      }
    }
  }

  // ── Footer: page 1 ───────────────────────────────────────────
  doc.setPage(1);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 185);
  doc.setDrawColor(220, 220, 224);
  doc.setLineWidth(0.2);
  doc.line(ML, H - 12, W - MR, H - 12);
  doc.text('ALEX — Artificial LinkedIn Examiner', ML, H - 7);
  doc.text('Page 1', W - MR, H - 7, { align: 'right' });

  doc.save('linkedin-audit-by-alex.pdf');
}
