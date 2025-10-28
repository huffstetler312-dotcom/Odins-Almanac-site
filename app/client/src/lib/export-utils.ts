import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
}

export interface ExportData {
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: any[];
  filename?: string;
}

/**
 * Export data to CSV format
 */
export function exportToCSV(exportData: ExportData): void {
  const { columns, data, filename = 'export' } = exportData;
  
  // Create CSV content
  const headers = columns.map(col => col.header).join(',');
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.key];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  );
  
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
}

/**
 * Export data to Excel XLSX format
 */
export function exportToXLSX(exportData: ExportData): void {
  const { title, columns, data, filename = 'export' } = exportData;
  
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  
  // Prepare data for XLSX
  const worksheetData = [
    columns.map(col => col.header), // Headers
    ...data.map(row => columns.map(col => row[col.key] ?? '')) // Data rows
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  const colWidths = columns.map(col => ({ 
    wch: col.width || Math.max(col.header.length, 15) 
  }));
  worksheet['!cols'] = colWidths;
  
  // Style the header row
  if (worksheet['!ref']) {
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[headerCell]) continue;
      worksheet[headerCell].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E2E8F0" } }
      };
    }
  }
  
  XLSX.utils.book_append_sheet(workbook, worksheet, title);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export data to PDF format
 */
export function exportToPDF(exportData: ExportData): void {
  const { title, subtitle, columns, data, filename = 'export' } = exportData;
  
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 20);
  
  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 14, 30);
  }
  
  // Add timestamp
  const timestamp = new Date().toLocaleString();
  doc.setFontSize(9);
  doc.text(`Generated: ${timestamp}`, 14, subtitle ? 40 : 30);
  
  // Prepare table data
  const tableHeaders = columns.map(col => col.header);
  const tableData = data.map(row => 
    columns.map(col => String(row[col.key] ?? ''))
  );
  
  // Generate table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: subtitle ? 45 : 35,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [34, 197, 94], // Green color
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Light gray
    },
    columnStyles: columns.reduce((styles, col, index) => {
      if (col.width) {
        styles[index] = { cellWidth: col.width };
      }
      return styles;
    }, {} as any),
  });
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
}

/**
 * Main export function that handles all formats
 */
export function exportData(exportData: ExportData, format: ExportFormat): void {
  try {
    switch (format) {
      case 'csv':
        exportToCSV(exportData);
        break;
      case 'xlsx':
        exportToXLSX(exportData);
        break;
      case 'pdf':
        exportToPDF(exportData);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Failed to export ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Helper function to format data for export
 */
export function prepareExportData(rawData: any[], transformFn?: (item: any) => any): any[] {
  return rawData.map(item => {
    if (transformFn) {
      return transformFn(item);
    }
    return item;
  });
}

/**
 * Common export columns for different data types
 */
export const EXPORT_COLUMNS = {
  inventory: [
    { key: 'name', header: 'Item Name', width: 25 },
    { key: 'category', header: 'Category', width: 15 },
    { key: 'currentStock', header: 'Current Stock', width: 12 },
    { key: 'unit', header: 'Unit', width: 10 },
    { key: 'minimumStock', header: 'Minimum Stock', width: 12 },
    { key: 'cost', header: 'Cost per Unit', width: 12 },
    { key: 'totalValue', header: 'Total Value', width: 12 },
  ],
  parRecommendations: [
    { key: 'itemName', header: 'Item Name', width: 25 },
    { key: 'category', header: 'Category', width: 15 },
    { key: 'currentStock', header: 'Current Stock', width: 12 },
    { key: 'recommendedPar', header: 'Recommended Par', width: 15 },
    { key: 'safetyStock', header: 'Safety Stock', width: 12 },
    { key: 'confidence', header: 'Confidence', width: 10 },
    { key: 'rationale', header: 'MAPO Analysis', width: 30 },
    { key: 'generatedDate', header: 'Generated', width: 15 },
  ],
  dashboard: [
    { key: 'metric', header: 'Metric', width: 25 },
    { key: 'value', header: 'Value', width: 15 },
    { key: 'status', header: 'Status', width: 15 },
    { key: 'description', header: 'Description', width: 30 },
  ],
} as const;