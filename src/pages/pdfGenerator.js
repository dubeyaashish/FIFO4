// pdfGenerator.js
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export const generatePdf = async (documentId, formData, userName, department) => {
  try {
    if (!documentId) {
      console.error("No documentId provided!");
      return "";
    }
    console.log("Generating PDF for documentId:", documentId);

    // Fetch allocated items from backend using the document endpoint
    const allocatedResponse = await fetch(`https://saleco.ruu-d.com/documents/${documentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (!allocatedResponse.ok) {
      throw new Error(`Failed to fetch allocated items. Status: ${allocatedResponse.status}`);
    }
    let allocatedItems = await allocatedResponse.json();
    console.log("Fetched allocated items:", allocatedItems);

    // Filter out items with status "declined" (case insensitive)
    allocatedItems = allocatedItems.filter(item => {
      return !(item.status && item.status.toLowerCase() === "declined");
    });

    // Load the PDF template and font, then register fontkit
    const templateUrl = "/sid/template.pdf?nocache=" + Date.now();
    const templateBytes = await fetch(templateUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);
    pdfDoc.registerFontkit(fontkit);

    const fontUrl = "/sid/NotoSansThai-Regular.ttf?nocache=" + Date.now();
    const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
    const thaiFont = await pdfDoc.embedFont(fontBytes, { subset: true });

    const form = pdfDoc.getForm();
    console.log("All PDF Field Names:", form.getFields().map((f) => f.getName()));

    // --- Mapping Logic ---
    const fieldMapping = {
      want_date: "wantdate",
      customer_name: "customername",
      name: "saleco",
      timestamp: "created_at",
      // Additional mappings can be added here
    };

    const DEFAULT_FONT_SIZE = 10;
    // safeSetText supports splitting address fields if needed
    const safeSetText = (fieldName, value, fontSize = DEFAULT_FONT_SIZE) => {
      if (fieldName === "address") {
        const maxLen = 30;
        let part1 = value;
        let part2 = "";
        if (value.length > maxLen) {
          let idx = value.lastIndexOf(" ", maxLen);
          if (idx === -1) idx = maxLen;
          part1 = value.substring(0, idx);
          part2 = value.substring(idx).trim();
        }
        try {
          const addressField1 = form.getTextField("address1");
          addressField1.setFontSize(fontSize);
          addressField1.setText(part1 || "N/A");
          addressField1.updateAppearances(thaiFont);
        } catch (error) {
          console.error("Error setting field address1:", error);
        }
        try {
          const addressField2 = form.getTextField("address2");
          addressField2.setFontSize(fontSize);
          addressField2.setText(part2 || "N/A");
          addressField2.updateAppearances(thaiFont);
        } catch (error) {
          console.error("Error setting field address2:", error);
        }
        return;
      }
      const pdfFieldName = fieldMapping[fieldName] || fieldName;
      try {
        const field = form.getTextField(pdfFieldName);
        field.setFontSize(fontSize);
        field.setText(value || "N/A");
        field.updateAppearances(thaiFont);
      } catch (error) {
        console.error(`Error setting field ${pdfFieldName}:`, error);
      }
    };

    // Populate document-level fields from formData and current user data
    safeSetText("created_at", new Date().toLocaleDateString("en-GB"));
    safeSetText("want_date", formData.wantDate ? new Date(formData.wantDate).toLocaleDateString("en-GB") : "N/A");
    safeSetText("customer_name", formData.customerName || "N/A");
    safeSetText("address", formData.customerAddress || "N/A");
    safeSetText("name", userName || "N/A");
    safeSetText("department", department || "N/A");
    safeSetText("departmentexpense", formData.departmentExpense || "-");
    safeSetText("timestamp", new Date().toLocaleDateString("en-GB"));

    // Map request details checkboxes
    const requestDetails = formData.requestDetails || [];
    if (requestDetails.includes("ทดสอบเครื่องล้างภาชนะใหม่")) safeSetText("box1", "X");
    if (requestDetails.includes("ทดสอบเครื่องล้างภาชนะเก่า")) safeSetText("box2", "X");
    if (requestDetails.includes("ปรับปรุงเครื่องล้างภาชนะเก่า Repair & Modify")) safeSetText("box3", "X");
    if (requestDetails.includes("ตรวจสอบอุปกรณ์แถมภายในเครื่อง")) safeSetText("box4", "X");
    if (requestDetails.includes("ทดสอบเครื่องทำความสะอาดด้านพื้น")) safeSetText("box5", "X");
    if (requestDetails.includes("ทดลองใช้งานโมบาย")) safeSetText("box6", "X");
    if (requestDetails.includes("ทดสอบเครื่องจักรอุปกรณ์")) safeSetText("box7", "X");
    if (formData.remark) {
      safeSetText("box8", "X");
      safeSetText("desc1", formData.remark.slice(0, 50) || "");
      if (formData.remark.length > 50) {
        safeSetText("desc2", formData.remark.slice(50, 100) || "");
      }
    }

    // Special function for handling multiline text in Adobe Acrobat
    const setMultilineTextAcrobat = (fieldName, value, fontSize = DEFAULT_FONT_SIZE) => {
      const pdfFieldName = fieldMapping[fieldName] || fieldName;
      try {
        const field = form.getTextField(pdfFieldName);
        field.setFontSize(fontSize);
        field.enableRichFormatting();
        field.setMultiline(true);
        field.setText(value || "N/A");
        field.updateAppearances(thaiFont);
      } catch (error) {
        console.error(`Error setting multiline field ${pdfFieldName}:`, error);
        // Fallback to normal text field
        try {
          const field = form.getTextField(pdfFieldName);
          field.setFontSize(fontSize);
          field.setText(value || "N/A");
          field.updateAppearances(thaiFont);
        } catch (fallbackError) {
          console.error(`Fallback error for field ${pdfFieldName}:`, fallbackError);
        }
      }
    };

    // Function to dynamically calculate optimal font size based on content length
    const calculateFontSize = (text) => {
      const length = text.length;
      if (length > 60) return 5;
      if (length > 50) return 6;
      if (length > 40) return 7;
      if (length > 25) return 7;
      return 8;
    };

    // Populate product-level fields using the allocated items (up to 5 products)
    allocatedItems.slice(0, 5).forEach((item, index) => {
      try {
        const itemNumberField = `fill_${25 + (index * 4)}`;
        const field = form.getTextField(itemNumberField);
        field.setFontSize(DEFAULT_FONT_SIZE);
        field.setText(`${index + 1}`);
        field.updateAppearances(thaiFont);
      } catch (error) {
        console.error(`Error setting field fill_${25 + (index * 4)}:`, error);
      }
      try {
        const productId = item.product_id || "";
        const description = item.description || item.product_description || "";
        let combinedText = "";
        if (productId && description) {
          if (description.length > 15 || (productId.length + description.length) > 25) {
            combinedText = `${productId}\u2029${description}`;
          } else {
            combinedText = `${productId} - ${description}`;
          }
        } else {
          combinedText = productId;
        }
        const fontSize = calculateFontSize(combinedText);
        setMultilineTextAcrobat(`productid${index + 1}`, combinedText, fontSize);
      } catch (error) {
        console.error(`Error processing product info for item ${index + 1}:`, error);
        safeSetText(`productid${index + 1}`, item.product_id || "", 7);
      }
      safeSetText(`serialnumber${index + 1}`, item.sn_number || "");
      safeSetText(`remark${index + 1}`, item.remark || "");
      safeSetText(`qcmremark${index + 1}`, item.QcmRemark || "-");
    });

    // Finalize PDF and open preview in a new tab
    form.flatten();
    const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");

    // Optionally, upload the PDF to your server (this will override if filename exists)
    const filename = `${documentId}.pdf`;
    const uploadData = new FormData();
    uploadData.append("pdf", blob, filename);
    uploadData.append("documentId", documentId);
    console.log("Uploading PDF with document ID:", documentId);
    const uploadResponse = await fetch("https://saleco.ruu-d.com/upload-pdf", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: uploadData,
    });
    if (!uploadResponse.ok) {
      throw new Error("Failed to upload PDF");
    }
    const result = await uploadResponse.json();
    return result.pdfUrl;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return "";
  }
};
