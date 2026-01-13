// src/lib/pdf-generator.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (data: any) => {
  const doc = new jsPDF();
  
  // 1. BRANDING
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setFontSize(28);
  doc.setTextColor(255);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT QUOTE', 14, 25);
  
  doc.setFontSize(10);
  doc.text(`ID: #QF-${data.id}`, 14, 32);
  doc.text(`DATE: ${new Date().toLocaleDateString()}`, 160, 25);

  // 2. CLIENT NOTES (IF ANY)
  let startY = 50;
  if (data.notes) {
    doc.setTextColor(100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PROJECT BRIEFING:', 14, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(doc.splitTextToSize(data.notes, 180), 14, startY + 5);
    startY += 25;
  }

  // 3. SERVICE TABLE
  autoTable(doc, {
    startY: startY,
    head: [['SERVICE', 'UNIT PRICE', 'QTY', 'LINE TOTAL']],
    body: data.items.map((i: any) => [
      i.name, 
      `${data.currencySymbol}${i.customPrice || i.price}`, 
      i.quantity, 
      `${data.currencySymbol}${(i.customPrice || i.price) * i.quantity}`
    ]),
    theme: 'plain',
    headStyles: { 
      textColor: [0, 0, 0], 
      fontStyle: 'bold',
      lineWidth: 0.1, // This creates the border line
      lineColor: [200, 200, 200] 
    },
    styles: { 
      fontSize: 9, 
      cellPadding: 5 
    }
  });

  // 4. SUMMARY BOX
  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY + 15;
  
  doc.setDrawColor(240);
  doc.setFillColor("250");
  doc.roundedRect(120, finalY, 76, 50, 3, 3, 'FD');

  const printLine = (label: string, value: string, y: number, isBold = false) => {
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.text(label, 125, y);
    doc.text(value, 190, y, { align: 'right' });
  }

  printLine('Subtotal', `$${data.subtotal.toFixed(2)}`, finalY + 10);
  if (data.isExpress) printLine('Express Surcharge (25%)', 'Included', finalY + 18);
  if (data.discount > 0) printLine(`Discount (${data.discount}%)`, `-$${(data.subtotal * (data.discount/100)).toFixed(2)}`, finalY + 26);
  if (data.tax > 0) printLine(`Tax (${data.tax}%)`, `+$${(data.total - (data.subtotal - (data.subtotal * (data.discount/100)))).toFixed(2)}`, finalY + 34);

  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.text('TOTAL:', 125, finalY + 44);
  doc.text(`$${data.total.toFixed(2)}`, 190, finalY + 44, { align: 'right' });

  // 5. DELIVERY INFO
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.text(`ESTIMATED DELIVERY: ${data.isExpress ? 'EXPRESS' : 'STANDARD'}`, 14, finalY + 10);
  doc.setFontSize(22);
  doc.text(`${Math.ceil(data.subtotal / (data.isExpress ? 800 : 400))} Business Days`, 14, finalY + 20);

  doc.save(`Quote_${data.id}.pdf`);
}