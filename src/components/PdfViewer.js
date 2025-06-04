import React, { useState, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const PdfViewer = () => {
  const [pdfUrl, setPdfUrl] = useState(null);

  // Example dynamic data—you can replace this with your actual data
  const data = {
    customerName: 'John Doe',
    departmentExpense: '1500 ฿',
    requestDate: '2023-08-15',
    additionalText: 'Additional information goes here...',
  };

  useEffect(() => {
    async function generatePdf() {
      try {
        // Fetch your PDF template from the public folder (adjust path if needed)
        const templateBytes = await fetch('/sid/template.pdf?nocache=' + Date.now())
          .then(res => res.arrayBuffer());

        // Load the PDF document
        const pdfDoc = await PDFDocument.load(templateBytes);

        // Embed a standard font; you can choose another font if desired
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Get the first page of the template
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();

        // Insert dynamic text onto the PDF at specific coordinates.
        // Adjust the coordinates (x, y) to match your template layout.
        firstPage.drawText(`Customer Name: ${data.customerName}`, {
          x: 50,
          y: height - 100,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        firstPage.drawText(`Department Expense: ${data.departmentExpense}`, {
          x: 50,
          y: height - 120,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        firstPage.drawText(`Request Date: ${data.requestDate}`, {
          x: 50,
          y: height - 140,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        firstPage.drawText(data.additionalText, {
          x: 50,
          y: height - 160,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        // Add more drawText calls if needed for other fields

        // Serialize the modified PDFDocument to bytes
        const pdfBytes = await pdfDoc.save();

        // Create a Blob from the PDF bytes and then an object URL
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(blob);

        // Set the blob URL to state so it can be used for display and download
        setPdfUrl(blobUrl);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }

    generatePdf();
  }, []);

  if (!pdfUrl) {
    return <div>Loading PDF...</div>;
  }

  return (
    <div>
      {/* Display the PDF in an iframe */}
      <iframe src={pdfUrl} width="100%" height="600px" title="PDF Viewer" />

      {/* Provide a download link */}
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <a href={pdfUrl} download="generated.pdf" className="btn btn-primary">
          Download PDF
        </a>
      </div>
    </div>
  );
};

export default PdfViewer;
