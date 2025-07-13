import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

export const exportToPDF = async (elementId: string, filename: string = 'dashboard') => {
  try {
    toast.loading('Generating PDF...', { id: 'pdf-export' });
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${filename}.pdf`);
    
    toast.success('PDF exported successfully!', { id: 'pdf-export' });
  } catch (error) {
    console.error('Error exporting PDF:', error);
    toast.error('Failed to export PDF', { id: 'pdf-export' });
  }
};

export const exportToPNG = async (elementId: string, filename: string = 'dashboard') => {
  try {
    toast.loading('Generating PNG...', { id: 'png-export' });
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${filename}.png`);
        toast.success('PNG exported successfully!', { id: 'png-export' });
      } else {
        throw new Error('Failed to create blob');
      }
    });
  } catch (error) {
    console.error('Error exporting PNG:', error);
    toast.error('Failed to export PNG', { id: 'png-export' });
  }
};