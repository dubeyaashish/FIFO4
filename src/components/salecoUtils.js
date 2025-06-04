export const groupByDocumentId = (documents) =>
  documents.reduce((groups, item) => {
    if (!groups[item.document_id]) {
      groups[item.document_id] = [];
    }
    groups[item.document_id].push(item);
    return groups;
  }, {});

export const getFirstNonEmptyValue = (field, items) => {
  for (let item of items) {
    if (item[field] && item[field].toString().trim() !== "") {
      return item[field].toString().trim();
    }
  }
  return "";
};

export const getFirstValue = (field, items) =>
  items[0] && items[0][field] ? items[0][field].toString().trim() : "";

export const formatDateField = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-GB");
};

export const cleanString = (str) => (str ? str.toString().trim() : "");

export const extractDepartment = (salecoName) => {
  if (!salecoName) return { nameWithoutDepartment: "N/A", departmentName: "N/A" };
  const keyword = "แผนก";
  const idx = salecoName.indexOf(keyword);
  if (idx !== -1) {
    const departmentName = salecoName.substring(idx + keyword.length).trim();
    const nameWithoutDepartment = salecoName.substring(0, idx).trim();
    const cleanDept = departmentName.replace(/[^a-zA-Z0-9ก-๙\s]/g, "").trim();
    return { nameWithoutDepartment, departmentName: cleanDept || "N/A" };
  }
  return { nameWithoutDepartment: salecoName, departmentName: "N/A" };
};
