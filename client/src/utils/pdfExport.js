import jsPDF from 'jspdf';

/**
 * Export an event plan to a formatted PDF
 * @param {Object} plan - The event plan object from the database
 */
export const exportToPDF = async (plan) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Helper Functions ─────────────────────────────────────────────────────

  const checkPageBreak = (needed = 20) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
      addHeader();
    }
  };

  const addHeader = () => {
    // Header background
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('EventGenius AI', margin, 8);
    doc.text('CONFIDENTIAL EVENT PLAN', pageWidth - margin, 8, { align: 'right' });
  };

  const setHeading = (text, size = 14, color = [30, 30, 60]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...color);
    checkPageBreak(size + 6);
    doc.text(text, margin, y);
    y += size * 0.5 + 3;
  };

  const setBody = (text, size = 10) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line) => {
      checkPageBreak(size + 2);
      doc.text(line, margin, y);
      y += size * 0.5 + 1.5;
    });
    y += 3;
  };

  const addDivider = () => {
    checkPageBreak(8);
    doc.setDrawColor(220, 220, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  const addSectionTitle = (title, emoji = '') => {
    checkPageBreak(20);
    doc.setFillColor(240, 240, 255);
    doc.roundedRect(margin, y - 5, contentWidth, 12, 2, 2, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(`${emoji} ${title}`, margin + 4, y + 3);
    y += 12;
  };

  // ── Cover Page ────────────────────────────────────────────────────────────

  // Gradient-like header rectangle
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 70, 'F');

  doc.setFillColor(168, 85, 247);
  doc.rect(pageWidth - 60, 0, 60, 70, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('EventGenius', margin, 35);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.text('AI-Powered Event Plan', margin, 47);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 58);

  y = 85;

  // Plan title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 60);
  const titleLines = doc.splitTextToSize(plan.title || 'Event Plan', contentWidth);
  titleLines.forEach((line) => { doc.text(line, margin, y); y += 10; });

  y += 5;

  // Event details grid
  const details = [
    ['Event Type', plan.eventType || '-'],
    ['City', plan.city || '-'],
    ['Date', plan.preferredDate || '-'],
    ['Guest Count', `${plan.guestCount} guests`],
    ['Total Budget', `INR ${plan.budget?.toLocaleString('en-IN')}`],
    ['Per Head Budget', `INR ${Math.round((plan.budget || 0) / (plan.guestCount || 1)).toLocaleString('en-IN')}`],
  ];

  details.forEach(([label, value], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * (contentWidth / 2);
    const itemY = y + row * 20;

    doc.setFillColor(248, 249, 255);
    doc.roundedRect(x, itemY - 4, contentWidth / 2 - 4, 16, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 130, 150);
    doc.text(label.toUpperCase(), x + 4, itemY + 1);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 60);
    doc.text(value, x + 4, itemY + 9);
  });

  y += Math.ceil(details.length / 2) * 20 + 10;
  addDivider();

  // ── Overview ──────────────────────────────────────────────────────────────

  if (plan.plan?.theme) {
    addSectionTitle('Event Theme', '✨');
    setHeading(plan.plan.theme, 13, [99, 102, 241]);
  }

  if (plan.plan?.overview) {
    addSectionTitle('Event Overview', '📋');
    setBody(plan.plan.overview);
  }

  // ── Budget Breakdown ──────────────────────────────────────────────────────

  if (plan.plan?.budgetBreakdown?.length > 0) {
    doc.addPage();
    addHeader();
    y = margin + 8;
    addSectionTitle('Budget Breakdown', '💰');

    plan.plan.budgetBreakdown.forEach((item) => {
      checkPageBreak(22);

      // Row background alternating
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 60);
      doc.text(item.category, margin, y);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text(`INR ${item.amount?.toLocaleString('en-IN')}`, pageWidth - margin, y, { align: 'right' });

      // Progress bar
      const barWidth = contentWidth * (item.percentage / 100);
      doc.setFillColor(230, 230, 250);
      doc.roundedRect(margin, y + 2, contentWidth, 4, 1, 1, 'F');
      doc.setFillColor(99, 102, 241);
      doc.roundedRect(margin, y + 2, barWidth, 4, 1, 1, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(130, 130, 150);
      doc.text(`${item.percentage}% · ${item.notes || ''}`, margin, y + 10);

      y += 18;
    });

    addDivider();

    // Total
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 60);
    doc.text('TOTAL BUDGET', margin, y);
    doc.setTextColor(99, 102, 241);
    doc.text(`INR ${plan.budget?.toLocaleString('en-IN')}`, pageWidth - margin, y, { align: 'right' });
    y += 15;
  }

  // ── Vendors ───────────────────────────────────────────────────────────────

  if (plan.plan?.vendors?.length > 0) {
    doc.addPage();
    addHeader();
    y = margin + 8;
    addSectionTitle('Recommended Vendors', '🏪');

    plan.plan.vendors.forEach((vendor) => {
      checkPageBreak(30);

      doc.setFillColor(248, 249, 255);
      doc.roundedRect(margin, y - 3, contentWidth, 24, 2, 2, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text(vendor.category?.toUpperCase() || '', margin + 4, y + 4);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 60);
      doc.text(vendor.name || '', margin + 4, y + 12);

      if (vendor.estimatedCost) {
        doc.setFontSize(10);
        doc.setTextColor(16, 185, 129);
        doc.text(vendor.estimatedCost, pageWidth - margin - 4, y + 12, { align: 'right' });
      }

      if (vendor.notes) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 120);
        const noteLines = doc.splitTextToSize(vendor.notes, contentWidth - 8);
        doc.text(noteLines[0] || '', margin + 4, y + 19);
      }

      y += 30;
    });
  }

  // ── Timeline ──────────────────────────────────────────────────────────────

  if (plan.plan?.timeline?.length > 0) {
    doc.addPage();
    addHeader();
    y = margin + 8;
    addSectionTitle('Event Timeline', '📅');

    plan.plan.timeline.forEach((item, i) => {
      checkPageBreak(25);

      // Priority color
      const priorityColor = item.priority === 'high' ? [239, 68, 68] : item.priority === 'medium' ? [245, 158, 11] : [16, 185, 129];

      doc.setFillColor(...priorityColor);
      doc.circle(margin + 4, y + 2, 3, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text(item.timeframe || '', margin + 12, y);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 60);
      const taskLines = doc.splitTextToSize(item.task || '', contentWidth - 60);
      taskLines.forEach((line, li) => {
        if (li === 0) doc.text(line, margin + 12, y + 7);
        else { y += 5; doc.text(line, margin + 12, y + 7); }
      });

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...priorityColor);
      doc.text(item.priority?.toUpperCase() || '', pageWidth - margin, y + 7, { align: 'right' });

      if (i < plan.plan.timeline.length - 1) {
        doc.setDrawColor(220, 220, 240);
        doc.line(margin + 4, y + 7, margin + 4, y + 18);
      }

      y += 20;
    });
  }

  // ── Checklist ─────────────────────────────────────────────────────────────

  if (plan.plan?.checklist?.length > 0) {
    doc.addPage();
    addHeader();
    y = margin + 8;
    addSectionTitle('Event Checklist', '✅');

    plan.plan.checklist.forEach((item) => {
      checkPageBreak(12);

      doc.setDrawColor(180, 180, 220);
      doc.rect(margin, y - 3, 6, 6);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 30, 60);
      doc.text(item.task || '', margin + 10, y + 1);

      doc.setFontSize(8);
      doc.setTextColor(130, 130, 150);
      doc.text(item.category || '', pageWidth - margin, y + 1, { align: 'right' });

      y += 10;
    });
  }

  // ── Invitation Message ────────────────────────────────────────────────────

  if (plan.invitationMessage) {
    doc.addPage();
    addHeader();
    y = margin + 8;
    addSectionTitle('AI-Generated Invitation', '📩');
    setBody(plan.invitationMessage);
  }

  // ── Footer on last page ───────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 200);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    doc.text('Generated by EventGenius AI', margin, pageHeight - 8);
  }

  // Save
  const fileName = `event-plan-${(plan.eventType || 'event').toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;
  doc.save(fileName);
};
