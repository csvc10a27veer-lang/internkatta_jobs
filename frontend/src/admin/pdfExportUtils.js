import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export const generatePdfFromElement = async (element, filename = 'Admin_Analytics_Report.pdf') => {
  if (!element) return false;
  
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Check if there are multiple pages
    const pages = element.querySelectorAll('.pdf-page');

    if (pages.length > 0) {
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();
        
        const pageEl = pages[i];
        const dataUrl = await toPng(pageEl, {
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          cacheBust: true,
          width: pageEl.offsetWidth || 794,
          height: pageEl.offsetHeight || 1123,
          filter: (node) => {
            if (node.tagName === 'LINK' && node.rel === 'stylesheet') return false;
            return true;
          }
        });

        const imgHeight = (pageEl.offsetHeight * pdfWidth) / pageEl.offsetWidth;

        if (imgHeight <= pageHeight) {
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, imgHeight);
        } else {
          const scale = pageHeight / imgHeight;
          const scaledWidth = pdfWidth * scale;
          const xOffset = (pdfWidth - scaledWidth) / 2;
          pdf.addImage(dataUrl, 'PNG', xOffset, 0, scaledWidth, pageHeight);
        }
      }
    } else {
      // Fallback for single element
      const dataUrl = await toPng(element, {
        pixelRatio: 2, 
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: element.offsetWidth || 794,
        height: element.offsetHeight || 1123,
        filter: (node) => {
          if (node.tagName === 'LINK' && node.rel === 'stylesheet') return false;
          return true;
        }
      });
      
      const imgHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;

      if (imgHeight <= pageHeight) {
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, imgHeight);
      } else {
        const scale = pageHeight / imgHeight;
        const scaledWidth = pdfWidth * scale;
        const xOffset = (pdfWidth - scaledWidth) / 2;
        pdf.addImage(dataUrl, 'PNG', xOffset, 0, scaledWidth, pageHeight);
      }
    }
    
    pdf.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
