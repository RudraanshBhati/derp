import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateGeminiResponse } from './gemini-config';
import { getChatbotContext, getDistrictPredictions } from './api';

/**
 * Generate a professional PDF report for groundwater analysis
 * @param {string} district - District name
 * @param {string} reportType - Type of report (summary, detailed, forecast)
 * @param {string} language - Language (en/hi)
 */
export const generateGroundwaterReport = async (district, reportType = 'summary', language = 'en') => {
  try {
    // 1. Fetch district data - pass district as the second parameter
    const contextData = await getChatbotContext(`Generate report for this district`, district);
    
    if (!contextData.district_data || !contextData.district_found) {
      throw new Error(`No data available for district: ${district}`);
    }

    const { district_data } = contextData;
    const districtName = contextData.district_found;
    const predictions = await getDistrictPredictions(districtName);

    // 2. Generate AI summary using Gemini
    const summaryPrompt = `Generate a ${reportType} groundwater analysis report summary for ${districtName} district based on this data:

Current Status:
- Water Level: ${district_data.meanActual}m depth
- Risk Status: ${district_data.status}
- Prediction Accuracy (RMSE): ${district_data.rmse}m
- Mean Absolute Error: ${district_data.mae}m
- R² Score: ${district_data.r2}

Recent Predictions: ${predictions.length} data points available

Please provide:
1. Overall groundwater situation assessment
2. Trend analysis (increasing/decreasing/stable)
3. Short-term forecast (next 1-2 weeks)
4. Key recommendations for water management

Keep it professional, concise (150-200 words), and in ${language === 'hi' ? 'Hindi' : 'English'}.`;

    const aiSummary = await generateGeminiResponse(summaryPrompt, contextData, language);

    // 3. Create PDF
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPos = 20;

    // Header with gradient effect (simulated with rectangles)
    pdf.setFillColor(37, 99, 235); // Primary blue
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text('GROUNDWATER ANALYSIS REPORT', pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${district_data.district} District, Haryana`, pageWidth / 2, 30, { align: 'center' });

    yPos = 50;

    // Report metadata
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(9);
    const reportDate = new Date().toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    pdf.text(`Report Generated: ${reportDate}`, 15, yPos);
    pdf.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, pageWidth - 15, yPos, { align: 'right' });
    
    yPos += 15;

    // Section 1: Current Status
    pdf.setFillColor(240, 240, 240);
    pdf.rect(15, yPos, pageWidth - 30, 8, 'F');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CURRENT GROUNDWATER STATUS', 20, yPos + 5);
    yPos += 15;

    // Status table
    const statusColor = district_data.status === 'Safe' ? [34, 197, 94] : 
                       district_data.status === 'Warning' ? [251, 146, 60] : 
                       [239, 68, 68];

    autoTable(pdf, {
      startY: yPos,
      margin: { left: 15, right: 15 },
      head: [['Metric', 'Value', 'Status']],
      body: [
        ['Water Depth', `${district_data.meanActual} meters`, ''],
        ['Risk Level', district_data.status, '●'],
        ['Prediction Accuracy (RMSE)', `${district_data.rmse} meters`, ''],
        ['Mean Absolute Error', `${district_data.mae} meters`, ''],
        ['R² Score', district_data.r2?.toFixed(4) || 'N/A', ''],
      ],
      headStyles: { 
        fillColor: [37, 99, 235],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 60 },
        2: { 
          cellWidth: 20, 
          halign: 'center',
          textColor: statusColor
        }
      },
      didDrawCell: (data) => {
        if (data.column.index === 2 && data.row.index === 1) {
          pdf.setFillColor(...statusColor);
          pdf.circle(data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, 2, 'F');
        }
      }
    });

    yPos = pdf.lastAutoTable.finalY + 15;

    // Section 2: AI-Generated Summary
    pdf.setFillColor(240, 240, 240);
    pdf.rect(15, yPos, pageWidth - 30, 8, 'F');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ANALYSIS & FORECAST', 20, yPos + 5);
    yPos += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(50, 50, 50);
    
    const summaryLines = pdf.splitTextToSize(aiSummary, pageWidth - 40);
    pdf.text(summaryLines, 20, yPos);
    yPos += summaryLines.length * 5 + 10;

    // Section 3: Data Points Summary
    if (yPos > pageHeight - 60) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFillColor(240, 240, 240);
    pdf.rect(15, yPos, pageWidth - 30, 8, 'F');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PREDICTION DATA SUMMARY', 20, yPos + 5);
    yPos += 15;

    autoTable(pdf, {
      startY: yPos,
      margin: { left: 15, right: 15 },
      head: [['Category', 'Details']],
      body: [
        ['Total Predictions', `${predictions.length} data points`],
        ['Data Coverage', `${district_data.block || 'Multiple'} blocks`],
        ['Model Performance', `RMSE: ${district_data.rmse}m, R²: ${district_data.r2?.toFixed(4) || 'N/A'}`],
        ['Last Updated', reportDate],
      ],
      headStyles: { 
        fillColor: [37, 99, 235],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    yPos = pdf.lastAutoTable.finalY + 15;

    // Footer
    if (yPos > pageHeight - 40) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, yPos, pageWidth - 15, yPos);
    yPos += 10;

    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'italic');
    pdf.text('derp. - Deep Earth Resource Prediction', pageWidth / 2, yPos, { align: 'center' });
    pdf.text('Powered by AI-driven Groundwater Analytics', pageWidth / 2, yPos + 5, { align: 'center' });
    
    // Page numbers
    const pageCount = pdf.internal.getNumberOfPages();
    pdf.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - 20,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    // 4. Download PDF
    const fileName = `Groundwater_Report_${district_data.district}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    return {
      success: true,
      fileName,
      message: `Report generated successfully for ${district_data.district}`
    };

  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate report: ${error.message}`);
  }
};
