// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const path = require('path');
const fs = require('fs').promises;
const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Middleware
app.use(express.json());
app.use(cors());

// Database connection handled in db.js

// Use routers
app.use(authRoutes.router);
app.use(uploadRoutes);
  
  const logSaleCoRequest = async (buttonId, userName, action, documentId = null, snNumber = null, additionalData = {}) => {
    try {
        const sql = `
            INSERT INTO SaleCoRequestsLog (button_id, user_name, action, document_id, sn_number, additional_data)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await db.promise().query(sql, [
            buttonId,
            userName || null,
            action,
            documentId || null,
            snNumber || null,
            JSON.stringify(additionalData),
        ]);
        console.log(`Log added: ${action} by ${userName}`);
    } catch (error) {
        console.error('Error logging SaleCoRequest:', error);
    }
};  
// API endpoint for fetching products with filters
app.get("/products", (req, res) => {
  const { search_item_code, search_item_name, search_stock_group, search_serial } = req.query;

  // First query: Get the main transaction data
  let sql = "SELECT *, ชื่อสินค้า AS description FROM ERP_QTY_Serial WHERE 1=1";

  if (search_item_code) sql += " AND รหัสสินค้า LIKE ?";
  if (search_item_name) sql += " AND ชื่อสินค้า LIKE ?";
  if (search_stock_group) sql += " AND Stock_Group LIKE ?";
  if (search_serial) sql += " AND Serial_Lot_Numbers LIKE ?";

  sql += " ORDER BY รหัสสินค้า ASC, STR_TO_DATE(วันที่, '%Y-%m-%d %H:%i:%s') ASC";

  const params = [
    search_item_code ? `%${search_item_code}%` : undefined,
    search_item_name ? `%${search_item_name}%` : undefined,
    search_stock_group ? `%${search_stock_group}%` : undefined,
    search_serial ? `%${search_serial}%` : undefined,
  ].filter(param => param !== undefined);

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    const serialNumbersStatus = {};
    const serialTotals = {};
    const remainingSerialsDetails = [];
    const unmatchedWithdrawalsDetails = [];
    const matchedTransactions = [];
    const itemLatestStatus = {};

    // First pass: Process all transactions and track latest status per item
   // First pass: Process all transactions and track latest status per item
results.forEach(transaction => {
  const quantity = Number(transaction["จำนวน"]);
  const itemCode = transaction["รหัสสินค้า"];

  // Update latest status for this item
  if (
    !itemLatestStatus[itemCode] ||
    new Date(transaction["timestamp"]) > new Date(itemLatestStatus[itemCode].timestamp)
  ) {
    itemLatestStatus[itemCode] = {
      Current_Quantity_On_Hand: Number(transaction["Current_Quantity_On_Hand"]),
      timestamp: transaction["timestamp"]
    };
  }

  // Split the Serial_Lot_Numbers field into individual serials
  const serialNumbers = transaction["Serial_Lot_Numbers"]
    ? transaction["Serial_Lot_Numbers"].split(",").map(serial => serial.trim())
    : [];

  // If there are multiple serial numbers in this record,
  // assume the quantity should be divided evenly among them.
  let quantityPerSerial = quantity;
  if (serialNumbers.length > 1) {
    quantityPerSerial = quantity / serialNumbers.length;
  }

  serialNumbers.forEach(serial => {
    if (!serialNumbersStatus[serial]) {
      serialNumbersStatus[serial] = {
        itemCode: transaction["รหัสสินค้า"],
        description: transaction["description"],
        transactions: [],
        balance: 0,
        lastTransaction: null
      };
    }

    // Use the per‑serial quantity for this transaction.
    const transactionWithQuantity = {
      ...transaction,
      "จำนวน": quantityPerSerial
    };
    serialNumbersStatus[serial].transactions.push(transactionWithQuantity);
    serialNumbersStatus[serial].balance += quantityPerSerial;
    serialNumbersStatus[serial].lastTransaction = transactionWithQuantity;
  });
});


    // Second pass: Categorize serials based on their status
    Object.entries(serialNumbersStatus).forEach(([serial, status]) => {
      const lastTransactionIsReceipt =
        status.lastTransaction && Number(status.lastTransaction["จำนวน"]) > 0;
      const itemCode = status.itemCode;

      if (status.balance > 0 && lastTransactionIsReceipt) {
        // Check if we've reached the current quantity limit for this item
        if (!serialTotals[itemCode]) {
          serialTotals[itemCode] = 0;
        }

        const currentQtyOnHand = itemLatestStatus[itemCode]?.Current_Quantity_On_Hand || 0;

        if (serialTotals[itemCode] < currentQtyOnHand) {
          serialTotals[itemCode]++;

          remainingSerialsDetails.push({
            serial,
            description: status.description, // include ชื่อสินค้า (description)
            itemCode: status.itemCode,
            currentBalance: status.balance,
            lastTransactionDate: status.lastTransaction["วันที่"],
            lastTransactionType: status.lastTransaction["ประเภทรายการ"],
            transactions: status.transactions
          });
        }
      } else if (status.transactions.length === 1 && status.balance < 0) {
        unmatchedWithdrawalsDetails.push({
          serial,
          description: status.transactions[0]["description"], // include description here as well
          transactions: status.transactions
        });
      } else {
        matchedTransactions.push({
          serial,
          description: status.transactions[0]["description"], // include description here as well
          transactions: status.transactions,
          finalBalance: status.balance
        });
      }
    });

    // Fetch statuses for remaining serials
    const serials = remainingSerialsDetails.map(item => item.serial);
    if (serials.length > 0) {
      const placeholders = serials.map(() => "?").join(",");
      const statusSql = `
        SELECT sn_number, status 
        FROM SaleCoRequests 
        WHERE sn_number IN (${placeholders})
      `;

      db.query(statusSql, serials, (statusErr, statusResults) => {
        if (statusErr) {
          console.error("Error fetching statuses:", statusErr);
          return res.status(500).json({ error: "Database query failed" });
        }

        const statusMap = {};
        statusResults.forEach(row => {
          statusMap[row.sn_number] = row.status;
        });

        const detailedResults = remainingSerialsDetails.map(item => ({
          ...item,
          status: statusMap[item.serial] || "Available"
        }));

        res.json({
          remainingSerialsDetails: detailedResults,
          unmatchedWithdrawalsDetails,
          matchedTransactions,
          debug: {
            itemTotals: serialTotals,
            itemLatestStatus: itemLatestStatus
          }
        });
      });
    } else {
      res.json({
        remainingSerialsDetails,
        unmatchedWithdrawalsDetails,
        matchedTransactions,
        debug: {
          itemTotals: serialTotals,
          itemLatestStatus: itemLatestStatus
        }
      });
    }
  });
});


app.post("/sale-co/re-request", async (req, res) => {
  const { insertData, updateData } = req.body;

  if (!insertData || !updateData) {
    return res.status(400).json({ error: "Missing required data for re-request." });
  }

  try {
    // Insert the new row with the updated serial number, description, and status as "Pending"
    const insertSql = `
      INSERT INTO SaleCoRequests (
        document_id, customer_name, customer_address, product_id, sn_number, description, wantDate,  
        รายละเอียดการแจ้งงาน, remark, quantity, status, name, note, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const insertParams = [
      insertData.document_id,
      insertData.customer_name,
      insertData.customer_address,
      insertData.product_id,
      insertData.sn_number,
      insertData.description || "", // Include description from the frontend
      insertData.wantDate,
      insertData.รายละเอียดการแจ้งงาน || "",
      insertData.remark || "",
      insertData.quantity || 1,
      "Pending", // Explicitly set the status to "Pending" for new row
      insertData.name,
      insertData.note || "", // Note for the new row remains default or empty
      insertData.timestamp || new Date(),
    ];
    await db.promise().execute(insertSql, insertParams);

    // Update the old row's note to "Re-requested", without modifying the status
    const updateSql = `
      UPDATE SaleCoRequests
      SET note = ?
      WHERE document_id = ? AND sn_number = ?
    `;
    const updateParams = ["Re-requested", updateData.document_id, updateData.sn_number];
    await db.promise().execute(updateSql, updateParams);

    res.status(200).json({ message: "Re-request submitted and previous row updated successfully." });
  } catch (error) {
    console.error("Error processing re-request:", error.message);
    res.status(500).json({ error: "Failed to process the re-request." });
  }
});



  
  app.get("/sale-co/serial-statuses", (req, res) => {
    const sql = `
      SELECT sn_number, status 
      FROM SaleCoRequest 
      WHERE status != 'Available'
      GROUP BY sn_number
      ORDER BY MAX(timestamp) DESC
    `;
  
    db.query(sql, (err, results) => {
      if (err) {
        console.error("Error fetching serial statuses:", err);
        return res.status(500).json({ error: "Database query failed" });
      }
      res.json(results);
    });
  });

// Global queue and processing flag
// Global queue and processing flag
const requestQueue = [];
let isProcessing = false;

async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;
  isProcessing = true;
  const { req, res } = requestQueue.shift(); // Get the next request in the queue

  try {
    await handleRequest(req, res);
  } catch (error) {
    console.error("Error processing request:", error.message);
    res.status(500).json({ error: "Failed to process request." });
  } finally {
    isProcessing = false;
    processQueue(); // Process the next request in the queue
  }
}

function addToQueue(req, res) {
  requestQueue.push({ req, res });
  processQueue();
}

// ------------------------
// Main Request Handler
// ------------------------

async function handleRequest(req, res) {
  // Extract common fields from the request body, including the new field departmentExpense
const {
    customerName,
    customerAddress,
    wantDate,
    requestDetails,
    remark,
    userName,
    departmentExpense, // New field from the frontend
    items  // Expecting an array of items, each with productId, quantity, description
  } = req.body;

  console.log("API Request Received:", {
    customerName,
    customerAddress,
    wantDate,
    requestDetails,
    remark,
    userName,
    departmentExpense,
    items
  });

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "No items provided." });
  }

  try {
    // Generate a unique document ID
    const currentDate = new Date();
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
    const year = currentDate.getFullYear().toString().slice(-2);
    const dateFormatted = `${month}${year}`;

    const fetchDocumentSql = `
      SELECT document_id
      FROM SaleCoRequests
      WHERE document_id LIKE 'SRQ${dateFormatted}%'
      ORDER BY document_id DESC
      LIMIT 1
    `;
    const documentResults = await new Promise((resolve, reject) => {
      db.execute(fetchDocumentSql, [], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    let runningNumber = "0001"; // Default running number
    if (documentResults && documentResults.length > 0) {
      const lastDocumentId = documentResults[0].document_id;
      const lastRunningNumber = parseInt(lastDocumentId.slice(-4));
      runningNumber = ("0000" + (lastRunningNumber + 1)).slice(-4);
    }
    const documentId = `SRQ${dateFormatted}${runningNumber}`;
    console.log("Generated Document ID:", documentId);

    // To collect allocated items across all basket items
    const allAllocatedItems = [];

    // Process each basket item one by one
    const insertPromises = items.map(async (item) => {
      const { productId, quantity, description } = item;

      // Fetch remaining serials from the /products API for this productId
      const apiUrl = `https://saleco.ruu-d.com/products?search_item_code=${productId}`;
      console.log("Fetching data from /products API:", apiUrl);

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch product data for ${productId}. Status: ${response.status}`);
      }
      const data = await response.json();
      const remainingSerials = data.remainingSerialsDetails || [];
      console.log("Fetched Serial Numbers from /products API:", remainingSerials);

      // Filter available inventory (status "Available")
      const availableSerials = remainingSerials.filter(
        (serial) => serial.status.trim() === "Available"
      );

      // Check allocated serials in SaleCoRequests
      const allocatedSerials = await new Promise((resolve, reject) => {
        const checkSerialsSql = `
          SELECT sn_number
          FROM SaleCoRequests
          WHERE product_id = ? AND status != 'Available'
        `;
        db.execute(checkSerialsSql, [productId], (err, results) => {
          if (err) return reject(err);
          resolve(results.map((row) => row.sn_number));
        });
      });
      console.log("Allocated Serials from SaleCoRequests:", allocatedSerials);

      // Filter out already allocated serials
      const filteredSerials = availableSerials.filter(
        (serial) => !allocatedSerials.includes(serial.serial)
      );
      console.log("Filtered Available Serials:", filteredSerials);

      if (filteredSerials.length < quantity) {
        throw new Error("Insufficient inventory to fulfill the request for product " + productId);
      }

      // Allocate serials based on FIFO logic
      const allocatedItems = filteredSerials.slice(0, quantity).map((serial) => ({
        serial: serial.serial,
        date: serial.lastReceiptDate,
      }));
      console.log("FIFO Allocation Complete:", allocatedItems);

      // Collect allocated items for the response
      allAllocatedItems.push(...allocatedItems);

      // Insert allocated items into SaleCoRequests using the same documentId
      const timestamp = new Date(); // The timestamp column that updates on modifications
      const insertSql = `
          INSERT INTO SaleCoRequests (
              document_id, customer_name, customer_address, product_id, sn_number, wantDate, 
              รายละเอียดการแจ้งงาน, remark, quantity, status, name, description, departmentExpense, created_at, timestamp
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?)
      `;
      const itemInsertPromises = allocatedItems.map((allocatedItem) => {
        return new Promise((resolve, reject) => {
          db.execute(
            insertSql,
            [
              documentId,
              customerName,
              customerAddress,
              productId,
              allocatedItem.serial,
              wantDate,
              requestDetails && requestDetails.length > 0 ? JSON.stringify(requestDetails) : null,
              remark,
              1,
              userName,
              description || "",
              departmentExpense,
              new Date(), // created_at: set once on creation
              timestamp,
            ],
            (err, result) => {
              if (err) {
                console.error("Error inserting allocated item:", err);
                return reject(err);
              }
              resolve(result);
            }
          );
        });
      });
      await Promise.all(itemInsertPromises);

      // Log the request creation and allocated serials
      for (const allocatedItem of allocatedItems) {
        const logSql = `
          INSERT INTO SaleCoRequestsLog (button_id, user_name, action, document_id, sn_number, additional_data)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        await db.promise().query(logSql, [
          "sale-co-request",
          userName,
          "Create Request",
          documentId,
          allocatedItem.serial,
          JSON.stringify({ productId, customerName, quantity, departmentExpense }),
        ]);
      }
    });

    await Promise.all(insertPromises);
    console.log("All allocated items inserted successfully.");

    res.status(200).json({
      message: "Request created successfully",
      documentId,
      allocatedItems: allAllocatedItems,
    });
  } catch (error) {
    console.error("Error processing request:", error.message);
    res.status(500).json({ error: "Failed to process request." });
  }
}

// Update the route to use the queue system
app.post("/sale-co/request", (req, res) => {
  addToQueue(req, res);
});


  
  

  app.get('/sale-co-requests', (req, res) => {
      const sql = "SELECT * FROM SaleCoRequests WHERE Status = 'Pending' "; // Simple query to fetch all rows
    
      db.execute(sql, (err, results) => {
        if (err) {
          console.error("Error fetching requests:", err);
          return res.status(500).json({ error: "Failed to fetch requests" });
        }
        res.status(200).json(results); // Send the results to the frontend
      });
    });


    app.put('/sale-co-requests/:document_id/status', async (req, res) => {
      const { document_id } = req.params; // Use document_id from the URL
      const { status } = req.body; // Accepted, Declined, or Sent to QCM
      const updatedTimestamp = new Date();
  
      try {
          // Update the status in the SaleCoRequests table
        const sql = `
            UPDATE SaleCoRequests
            SET status = ?, timestamp = ?
            WHERE document_id = ?
            AND (note IS NULL OR TRIM(note) = '')
            AND status NOT IN ('Pass QC', 'Fail QC')

        `;
          const [result] = await db.promise().query(sql, [status, updatedTimestamp, document_id]);
  
          if (result.affectedRows === 0) {
              return res.status(404).json({ error: 'Document not found' });
          }
  
          // Log the status update action
          const logSql = `
              INSERT INTO SaleCoRequestsLog (button_id, user_name, action, document_id, additional_data)
              VALUES (?, ?, ?, ?, ?)
          `;
          const userName = req.body.userName || null; // Assuming the userName is sent in the body
          await db.promise().query(logSql, [
              "update-status",
              userName,
              `Status updated to ${status}`,
              document_id,
              JSON.stringify({ status, updatedTimestamp }),
          ]);
  
          res.status(200).json({ message: `Status updated to ${status}` });
      } catch (error) {
          console.error(`Error updating status to ${status}:`, error);
          res.status(500).json({ error: `Failed to update status to ${status}` });
      }
  });
  
  
    // Endpoint to update status to "Recalled by User"
app.put('/sale-co-requests/:document_id/recall', (req, res) => {
  const { document_id } = req.params; // Get document ID from the URL
  const status = "Available"; // Fixed status for recall
  const note = "Cancelled"; // Note indicating cancellation
  const updatedTimestamp = new Date(); // Current timestamp

  const sql = `
    UPDATE SaleCoRequests
    SET status = ?, note = ?, timestamp = ?
    WHERE document_id = ?
  `;

  db.execute(sql, [status, note, updatedTimestamp, document_id], (err, result) => {
    if (err) {
      console.error(`Error updating status and note:`, err);
      return res.status(500).json({ error: `Failed to update status and note` });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.status(200).json({ message: `Document ${document_id} status updated to "Available" with note "Cancelled"` });
  });
});


  app.get('/inventory-status', (req, res) => {
      const sql = "SELECT * FROM SaleCoRequests WHERE Status = 'At Inventory' "; // Simple query to fetch all rows
    
      db.execute(sql, (err, results) => {
        if (err) {
          console.error("Error fetching requests:", err);
          return res.status(500).json({ error: "Failed to fetch requests" });
        }
        res.status(200).json(results); // Send the results to the frontend
      });
    });


  app.get('/inventory-out-requests', (req, res) => {
      const sql = `SELECT * 
      FROM SaleCoRequests WHERE Status = 'Sent to Qcm' and note != 'Cancelled'`; // Correct SQL syntax
    
      db.execute(sql, (err, results) => {
        if (err) {
          console.error("Error fetching requests:", err);
          return res.status(500).json({ error: "Failed to fetch requests" });
        }
        res.status(200).json(results); // Send the results to the frontend
      });
    });

    app.put('/qcm-in-requests/serial/:sn_number/accept', async (req, res) => {
      const serialNumber = decodeURIComponent(req.params.sn_number); // Decode the serial number
      const updatedTimestamp = new Date();
  
      console.log(`Received request to update serial: ${serialNumber}`);
  
      try {
          // Update the status in the SaleCoRequests table
          const sql = `
              UPDATE SaleCoRequests
              SET status = 'Sent to Qcm', timestamp = ?
              WHERE sn_number = ?
          `;
          const [result] = await db.promise().query(sql, [updatedTimestamp, serialNumber]);
  
          if (result.affectedRows === 0) {
              return res.status(404).json({ error: "Serial number not found." });
          }
  
          // Log the serial update action
          const logSql = `
              INSERT INTO SaleCoRequestsLog (button_id, user_name, action, document_id, sn_number, additional_data)
              VALUES (?, ?, ?, ?, ?, ?)
          `;
          const userName = req.body.userName || null; // Assuming the userName is sent in the body
          const documentIdQuery = `
              SELECT document_id FROM SaleCoRequests WHERE sn_number = ?
          `;
          const [documentResult] = await db.promise().query(documentIdQuery, [serialNumber]);
          const documentId = documentResult[0]?.document_id || null;
  
          await db.promise().query(logSql, [
              "send-to-qcm",
              userName,
              "Sent to QCM",
              documentId,
              serialNumber,
              JSON.stringify({ status: "Sent to QCM", updatedTimestamp }),
          ]);
  
          res.status(200).json({ message: `Serial number ${serialNumber} updated successfully.` });
      } catch (error) {
          console.error("Error updating request:", error);
          res.status(500).json({ error: "Failed to update request." });
      }
  });
  
app.get('/qcm-requests', async (req, res) => {
  try {
    const sql = `
      SELECT *
      FROM SaleCoRequests 
      WHERE status = 'At QCM' and note != 'Cancelled'
    `;
    const [results] = await db.promise().query(sql);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching QCM requests:', error);
    res.status(500).json({ error: 'Failed to fetch QCM requests' });
  }
});



app.put('/qcm-requests/:sn_number/status', async (req, res) => {
    const { sn_number } = req.params;
    const { status, remark, userName } = req.body;
    const qcmName = userName || "Unknown User";

    console.log('Received PUT request:', {
        sn_number,
        status,
        remark,
        userName,
        qcmName,
    });

    try {
        const sql = `
            UPDATE SaleCoRequests
            SET status = ?, QcmRemark = ?, QcmName = ?
            WHERE sn_number = ?;
        `;
        const [result] = await db.promise().query(sql, [status, remark, qcmName, sn_number]);

        if (result.affectedRows === 0) {
            console.warn('Serial number not found:', sn_number);
            return res.status(404).json({ error: 'Serial number not found' });
        }

        const documentIdQuery = `
            SELECT document_id FROM SaleCoRequests WHERE sn_number = ?
        `;
        const [documentResult] = await db.promise().query(documentIdQuery, [sn_number]);
        const documentId = documentResult[0]?.document_id || null;

        const logSql = `
            INSERT INTO SaleCoRequestsLog (button_id, user_name, action, document_id, sn_number, additional_data)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await db.promise().query(logSql, [
            "qcm-status-update",
            userName,
            `QCM status updated to ${status}`,
            documentId,
            sn_number,
            JSON.stringify({ status, remark, qcmName, updatedTimestamp: new Date() }),
        ]);

        console.log('Status updated successfully:', { sn_number, status });
        res.status(200).json({ message: `Status updated to ${status} successfully.` });
    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});



  
  
  

 app.get('/sale-co/history', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching transaction history for all users'); // Debug log

    const sql = `
      SELECT document_id,customer_name,customer_address,product_id, description, รายละเอียดการแจ้งงาน,sn_number,wantDate,remark,quantity,name,status,InvRemark,QcmRemark,QcmName,timestamp,note
      FROM SaleCoRequests 
      ORDER BY timestamp DESC
    `;

    // Log the SQL query
    console.log('SQL Query:', sql);

    // Execute query
    const [results] = await db.promise().query(sql);

    // Log the results
    console.log('Query results:', results);
    console.log('Number of records found:', results.length);

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
});

  
app.get('/inventory/history', authenticateToken, async (req, res) => {
  try {
      console.log('Fetching all send-to-qcm history');

      const sql = `
 SELECT DISTINCT sr.*
      FROM SaleCoRequests sr 
      INNER JOIN SaleCoRequestsLog log ON sr.document_id = log.document_id 
      WHERE log.button_id = 'send-to-qcm'
      ORDER BY sr.timestamp DESC
      `;

      console.log('SQL Query:', sql);

      const [results] = await db.promise().query(sql);

      console.log('Query results:', results);
      console.log('Number of records found:', results.length);

      res.status(200).json(results);
  } catch (error) {
      console.error('Error fetching send-to-qcm history:', error);
      console.error('Error details:', {
          message: error.message,
          stack: error.stack
      });
      res.status(500).json({ error: 'Failed to fetch send-to-qcm history' });
  }
});


app.get('/qcm-history-requests', authenticateToken, async (req, res) => {
  try {
      console.log('Fetching all send-to-qcm history');
      const sql = `
      SELECT DISTINCT sr.*
      FROM SaleCoRequests sr 
      INNER JOIN SaleCoRequestsLog log ON sr.document_id = log.document_id 
      WHERE log.button_id = 'send-to-qcm'
      ORDER BY sr.timestamp DESC
      `;
      console.log('SQL Query:', sql);
      const [results] = await db.promise().query(sql);
      console.log('Query results:', results);
      console.log('Number of records found:', results.length);
      res.status(200).json(results);
  } catch (error) {
      console.error('Error fetching send-to-qcm history:', error);
      res.status(500).json({ error: 'Failed to fetch send-to-qcm history' });
  }
});



// Example using Express
app.get('/documents', async (req, res) => {
  // Extract filter parameters from query strings
  const { start, end, product_id, sn_number, customer_name, status } = req.query;
  
  try {
    // Start building the SQL query
    let sql = `SELECT * FROM SaleCoRequests WHERE 1=1`;

    // Adjust the start and end dates to ensure they cover the full day
    let adjustedStart = start || '1970-01-01';
    let adjustedEnd = end || new Date();

    // If start date is provided, set it to the beginning of the day (00:00:00)
    if (start) {
      adjustedStart = new Date(start);
      adjustedStart.setHours(0, 0, 0, 0); // Set to 00:00:00
    }

    // If end date is provided, set it to the end of the day (23:59:59)
    if (end) {
      adjustedEnd = new Date(end);
      adjustedEnd.setHours(23, 59, 59, 999); // Set to 23:59:59
    }

    // Apply date filter
    sql += ` AND created_at BETWEEN ? AND ?`;

    // Product ID filter: apply if product_id is provided
    if (product_id) {
      sql += ` AND product_id = ?`;
    }

    // Serial number filter: apply if sn_number is provided
    if (sn_number) {
      sql += ` AND sn_number = ?`;
    }

    // Customer name filter: apply if customer_name is provided
    if (customer_name && customer_name !== 'ALL') {
      sql += ` AND customer_name IN (?)`;
    }

    // Status filter: apply if status is provided
    if (status && status !== 'ALL') {
      sql += ` AND status IN (?)`;
    }

    // Order by document_id
    sql += ` ORDER BY document_id`;

    // Prepare values for SQL query (to prevent SQL injection)
    const values = [
      ...(start && end ? [adjustedStart, adjustedEnd] : []),
      ...(product_id ? [product_id] : []),
      ...(sn_number ? [sn_number] : []),
      ...(customer_name && customer_name !== 'ALL' ? [customer_name.split(',')] : []),
      ...(status && status !== 'ALL' ? [status.split(',')] : []),
    ];

    // Query the database with the constructed SQL and values
    const results = await db.promise().query(sql, values);
    res.json(results[0]);  // Send the results back to the client
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents." });
  }
});


// Corrected /departments endpoint
app.get("/departments", async (req, res) => {
  try {
    const [rows] = await db.promise().query("SELECT DISTINCT department FROM emp_table");
    const departments = rows.map((row) => row.department);
    res.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// New endpoint to fetch all allocated items for a document
app.get('/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const sql = 'SELECT * FROM SaleCoRequests WHERE document_id = ? ORDER BY id ASC';
    const [results] = await db.promise().query(sql, [documentId]);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching document details:', error);
    res.status(500).json({ error: 'Failed to fetch document details' });
  }
});

app.get('/sale-co/failed-qc', (req, res) => {
  // You can require token authentication if needed by adding authenticateToken middleware
  const sql = "SELECT * FROM SaleCoRequests WHERE status = 'Fail QC'";
  db.execute(sql, (err, results) => {
    if (err) {
      console.error("Error fetching failed QC documents:", err);
      return res.status(500).json({ error: "Failed to fetch failed QC documents" });
    }
    res.status(200).json(results);
  });
});

app.post("/sale-co/store-nc", async (req, res) => {
  const { sn_number } = req.body;

  if (!sn_number) {
    return res.status(400).json({ error: "Serial number is required" });
  }

  try {
    // ----------------------------------------------------------
    // Generate a new custom document_id for Nc_table.
    // Format: WNC + two-digit month + two-digit year + 4-digit running counter.
    // Example: WNC04250001
    // ----------------------------------------------------------
    const now = new Date();
    const month = ("0" + (now.getMonth() + 1)).slice(-2); // two-digit month
    const year = now.getFullYear().toString().slice(-2);    // two-digit year
    const prefix = `WNC${month}${year}`;

    // Query Nc_table for the highest document_id with the current prefix.
    const queryMax = "SELECT document_id FROM Nc_table WHERE document_id LIKE ? ORDER BY document_id DESC LIMIT 1";
    const [rows] = await db.promise().query(queryMax, [`${prefix}%`]);

    let runningNumber = "0001";
    if (rows.length > 0) {
      const lastDocId = rows[0].document_id; // e.g., "WNC04250005"
      const lastRunningNumber = parseInt(lastDocId.slice(-4));
      runningNumber = ("0000" + (lastRunningNumber + 1)).slice(-4);
    }
    const newDocumentId = prefix + runningNumber; // e.g., "WNC04250006"

    // ----------------------------------------------------------
    // Insert records from SaleCoRequests into Nc_table.
    // Only copy the desired columns:
    // - Use the new document_id for Nc_table.
    // - Store the original document_id from SaleCoRequests in created_from.
    // - Exclude: remark, quantity, InvRemark, note, alert, wantDate, customer_name, customer_address.
    // ----------------------------------------------------------
    const insertSql = `
      INSERT INTO Nc_table (
        document_id,
        created_from,
        product_id,
        sn_number,
        description,
        departmentExpense,
        \`รายละเอียดการแจ้งงาน\`,
        name,
        status,
        image,
        QcmRemark,
        QcmName,
        timestamp,
        alert_status,
        created_at,
        pdf_url
      )
      SELECT 
        ?,
        document_id,
        product_id,
        sn_number,
        description,
        departmentExpense,
        \`รายละเอียดการแจ้งงาน\`,
        name,
        status,
        image,
        QcmRemark,
        QcmName,
        timestamp,
        alert_status,
        created_at,
        pdf_url
      FROM SaleCoRequests
      WHERE sn_number = ?
    `;

    const [result] = await db.promise().query(insertSql, [newDocumentId, sn_number]);

    // ----------------------------------------------------------
    // Log the action into SaleCoRequestsLog.
    // ----------------------------------------------------------
    const logSql = `
      INSERT INTO SaleCoRequestsLog (button_id, user_name, action, document_id, sn_number, additional_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.promise().query(logSql, [
      "store-nc",
      req.body.userName || "Unknown",
      "Send to Store NC",
      newDocumentId,
      sn_number,
      JSON.stringify({ message: "Copied record(s) to Nc_table", originalCount: result.affectedRows })
    ]);

    res.status(200).json({
      message: "Record(s) for the given serial number copied into Nc_table successfully.",
      newDocumentId
    });
  } catch (error) {
    console.error("Error copying record(s) into Nc_table:", error);
    res.status(500).json({ error: "Failed to copy record(s) into Nc_table." });
  }
});
// Example endpoint to update the serial status
app.put("/sale-co/store-nc/status", async (req, res) => {
  const { sn_number, status } = req.body;
  if (!sn_number || !status) {
    return res.status(400).json({ error: "Missing serial number or status" });
  }
  try {
    const sql = "UPDATE Nc_table SET status = ? WHERE sn_number = ?";
    const [result] = await db.promise().query(sql, [status, sn_number]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Serial not found" });
    }
    res.status(200).json({ message: `Serial ${sn_number} updated to ${status}` });
  } catch (error) {
    console.error("Error updating serial status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});
// New endpoint for Quality Assurance documents (NC records)
app.get('/quality-assurance/documents', async (req, res) => {
  try {
    const sql = "SELECT * FROM Nc_table where status = 'At Store NC' ORDER BY created_at DESC";
    const [results] = await db.promise().query(sql);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching NC documents:", error);
    res.status(500).json({ error: "Failed to fetch NC documents" });
  }
});
// New endpoint to update status and store the memo (action_memo) in Nc_table
app.put("/sale-co/store-nc/status-with-memo", async (req, res) => {
  // Expecting sn_number, status, and memo in the request body
  const { sn_number, status, memo } = req.body;

  if (!sn_number || !status) {
    return res.status(400).json({ error: "Missing serial number or status" });
  }

  console.log("Update with memo received:", { sn_number, status, memo });

  try {
    // Update status and store the memo in the "action_memo" column of Nc_table.
    const sql = "UPDATE Nc_table SET status = ?, action_memo = ? WHERE sn_number = ?";
    const [result] = await db.promise().query(sql, [status, memo, sn_number]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Serial not found" });
    }
    res.status(200).json({ message: `Serial ${sn_number} updated to ${status}` });
  } catch (error) {
    console.error("Error updating serial status with memo:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});
app.get('/manufacturer/documents', async (req, res) => {
  try {
    const sql = "SELECT * FROM Nc_table where status = 'Scrap' ORDER BY created_at DESC";
    const [results] = await db.promise().query(sql);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching NC documents:", error);
    res.status(500).json({ error: "Failed to fetch NC documents" });
  }
});
app.get('/environment/documents', async (req, res) => {
  try {
    const sql = "SELECT * FROM Nc_table where status = 'Scrap' ORDER BY created_at DESC";
    const [results] = await db.promise().query(sql);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error fetching NC documents:", error);
    res.status(500).json({ error: "Failed to fetch NC documents" });
  }
});
// Add this new endpoint in your server.js
app.put('/qa-requests/serial/:sn_number/request', async (req, res) => {
  const serialNumber = decodeURIComponent(req.params.sn_number);
  try {
    const sql = 'UPDATE SaleCoRequests SET status = ? WHERE sn_number = ?';
    const [result] = await db.promise().query(sql, ["request from qa", serialNumber]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Serial number not found" });
    }
    res.status(200).json({ message: `Serial ${serialNumber} updated to request from qa` });
  } catch (error) {
    console.error("Error updating serial status:", error);
    res.status(500).json({ error: "Failed to update serial status" });
  }
});

// Replace the existing /external/service-request endpoint in your server.js with this:

app.post('/external/service-request', async (req, res) => {
  try {
    const {
      customerName,
      customerAddress,
      phoneNumber,
      email,
      siteName,
      billingAddress,
      productCode,
      quantity,
      warrantyStartDate,
      warrantyPeriod,
      warrantyParts,
      serviceFrequency,
      propertyAddress,
      requestDetails,
      remark,
      wantDate,
      requestSource = 'external_form',
      requestType = 'customer_service'
    } = req.body;

    console.log('External service request received:', req.body);

    // Generate document ID (existing logic)
    const currentDate = new Date();
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
    const year = currentDate.getFullYear().toString().slice(-2);
    const dateFormatted = `${month}${year}`;

    const fetchDocumentSql = `
      SELECT document_id
      FROM SaleCoRequests
      WHERE document_id LIKE 'SRQ${dateFormatted}%'
      ORDER BY document_id DESC
      LIMIT 1
    `;
    const documentResults = await new Promise((resolve, reject) => {
      db.execute(fetchDocumentSql, [], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    let runningNumber = "0001";
    if (documentResults && documentResults.length > 0) {
      const lastDocumentId = documentResults[0].document_id;
      const lastRunningNumber = parseInt(lastDocumentId.slice(-4));
      runningNumber = ("0000" + (lastRunningNumber + 1)).slice(-4);
    }
    const documentId = `SRQ${dateFormatted}${runningNumber}`;
    console.log("Generated Document ID for external request:", documentId);

    // Create detailed remark with all external form data
    const detailedRemark = [
      `External Customer Request`,
      `Phone: ${phoneNumber}`,
      `Email: ${email}`,
      `Site: ${siteName}`,
      warrantyStartDate ? `Warranty Start: ${warrantyStartDate}` : '',
      warrantyPeriod ? `Warranty Period: ${warrantyPeriod}` : '',
      warrantyParts ? `Warranty Parts: ${warrantyParts}` : '',
      serviceFrequency ? `Service Frequency: ${serviceFrequency}` : '',
      propertyAddress ? `Property Address: ${propertyAddress}` : '',
      remark ? `Additional Notes: ${remark}` : ''
    ].filter(Boolean).join(' | ');

    const requestDetailsArray = Array.isArray(requestDetails) ? requestDetails : [requestDetails || 'External customer service request'];
    const requestDetailsJson = JSON.stringify(requestDetailsArray);

    const insertSql = `
      INSERT INTO SaleCoRequests (
        document_id, customer_name, customer_address, product_id, sn_number, wantDate,
        รายละเอียดการแจ้งงาน, remark, quantity, status, name, description, 
        departmentExpense, created_at, timestamp
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // **KEY CHANGE: Create one row per quantity instead of one row total**
    const quantityNumber = parseInt(quantity) || 1;
    
    for (let i = 1; i <= quantityNumber; i++) {
      const insertParams = [
        documentId,
        customerName,
        customerAddress,
        productCode || 'PENDING', 
        `PENDING_ALLOCATION_${i}`, // Unique placeholder per item
        wantDate || new Date().toISOString().split('T')[0],
        requestDetailsJson,
        detailedRemark,
        1, // **Always 1 per row - this matches your existing flow**
        'Pending External Review',
        `External Customer - ${customerName}`,
        `External service request - Product: ${productCode} (Item ${i}/${quantityNumber})`,
        siteName || billingAddress || '',
        new Date(),
        new Date()
      ];

      await db.promise().execute(insertSql, insertParams);
    }

    // Log the external request creation (once per document)
    const logSql = `
      INSERT INTO SaleCoRequestsLog (button_id, user_name, action, document_id, sn_number, additional_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.promise().query(logSql, [
      "external-service-request",
      `External Customer - ${customerName}`,
      "Create External Request",
      documentId,
      `${quantityNumber} items`,
      JSON.stringify({ 
        phoneNumber, 
        email, 
        siteName, 
        productCode, 
        quantity: quantityNumber, 
        requestSource: 'external_form'
      })
    ]);

    // Send Telegram notifications
    const telegramMessage = `🌐 <b>New External Customer Service Request!</b>
📄 <b>Document ID:</b> ${documentId}
👤 <b>Customer:</b> ${customerName}
📍 <b>Address:</b> ${customerAddress}
📞 <b>Phone:</b> ${phoneNumber}
📧 <b>Email:</b> ${email}
🏢 <b>Site:</b> ${siteName}
📦 <b>Product Code:</b> ${productCode}
🔢 <b>Quantity:</b> ${quantityNumber} items
📅 <b>Want Date:</b> ${wantDate}
🕒 <b>Submitted:</b> ${new Date().toLocaleString()}

<i>⚠️ External request - Awaiting SaleCo review and product allocation!</i>`;

    try {
      await Promise.all([
        fetch("https://api.telegram.org/bot7646625188:AAGS-NqBl3rUU9AlC9a01wzlbaqs6spBf7M/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: "-4614144690",
            text: telegramMessage,
            parse_mode: "HTML",
          }),
        }),
        fetch("https://api.telegram.org/bot7646625188:AAGS-NqBl3rUU9AlC9a01wzlbaqs6spBf7M/sendMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: "-4631636900", 
            text: telegramMessage,
            parse_mode: "HTML",
          }),
        })
      ]);
      console.log('External request Telegram notifications sent successfully');
    } catch (telegramError) {
      console.error('Error sending Telegram notifications:', telegramError);
    }

    res.status(200).json({
      message: "External service request submitted successfully",
      documentId: documentId,
      status: "Pending External Review",
      itemsCreated: quantityNumber,
      note: `Document created with ${quantityNumber} items awaiting SaleCo team to allocate products`,
      success: true
    });

  } catch (error) {
    console.error("Error processing external service request:", error);
    res.status(500).json({ 
      error: "Failed to process external service request",
      details: error.message 
    });
  }
});

// Add this new endpoint for SaleCo to update external requests with products
// Backend endpoint: PUT /sale-co/external-request/:documentId/add-products
// This should be added to your Express.js backend

app.put('/sale-co/external-request/:documentId/add-products', async (req, res) => {
  // Add CORS headers first
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  const { documentId } = req.params;
  const { selectedSerials, userName } = req.body;

  console.log('External request allocation received:', { documentId, selectedSerials, userName });

  if (!selectedSerials || !Array.isArray(selectedSerials)) {
    return res.status(400).json({ error: 'Invalid selectedSerials data' });
  }

  try {
    // Start transaction for data consistency
    await db.promise().beginTransaction();

    // Verify the document exists and is in the correct status
    const documentCheck = await db.promise().query(
      'SELECT COUNT(*) as count FROM SaleCoRequests WHERE document_id = ? AND status = ?',
      [documentId, 'Pending External Review']
    );

    if (documentCheck[0][0].count === 0) {
      await db.promise().rollback();
      return res.status(404).json({ 
        error: 'External request not found or not in pending status' 
      });
    }

    let updateCount = 0;

    // For each selected serial, update the existing placeholder records
    for (const item of selectedSerials) {
      const { productId, serialNumber, quantity } = item;

      console.log('Processing allocation:', { productId, serialNumber, quantity });

      // Verify the serial number is available
      // You might need to adjust this query based on your products table structure
      // For now, we'll assume it's checking the ERP_QTY_Serial table or similar

      // Update the existing placeholder record with the specific serial number
      // Change status from "Pending External Review" to "Pending" to follow normal flow
      const updateResult = await db.promise().query(
        `UPDATE SaleCoRequests 
         SET sn_number = ?, 
             status = 'Pending',
             name = ?,
             timestamp = NOW()
         WHERE document_id = ? 
           AND product_id = ? 
           AND status = 'Pending External Review'
           AND (sn_number LIKE 'PENDING_ALLOCATION_%' OR sn_number IS NULL OR sn_number = '')
         LIMIT 1`,
        [serialNumber, userName, documentId, productId]
      );

      if (updateResult[0].affectedRows > 0) {
        updateCount++;

        // Log the allocation action
        const logSql = `
          INSERT INTO SaleCoRequestsLog (button_id, user_name, action, document_id, sn_number, additional_data)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        await db.promise().query(logSql, [
          "external-allocation",
          userName,
          "Serial allocated to external request",
          documentId,
          serialNumber,
          JSON.stringify({ productId, originalStatus: 'Pending External Review', newStatus: 'Pending' })
        ]);
      } else {
        console.warn(`No placeholder record found for productId: ${productId} in document: ${documentId}`);
      }
    }

    if (updateCount === 0) {
      await db.promise().rollback();
      return res.status(400).json({ 
        error: 'No records were updated. Please check if the products match the original request.' 
      });
    }

    // Commit the transaction
    await db.promise().commit();

    console.log(`Successfully allocated ${updateCount} serials to document ${documentId}`);

    res.json({ 
      success: true, 
      message: `Successfully allocated ${updateCount} serial numbers to external request`,
      documentId: documentId,
      allocatedCount: updateCount,
      newStatus: 'Pending'
    });

  } catch (error) {
    await db.promise().rollback();
    console.error('Error processing external request allocation:', error);
    res.status(500).json({ 
      error: 'Failed to allocate serials: ' + error.message 
    });
  }
});

// Also modify the external form submission endpoint to handle product codes properly
app.post('/external/service-request', async (req, res) => {
  const {
    customerName,
    customerAddress,
    phoneNumber,
    email,
    siteName,
    billingAddress,
    productCode,
    quantity,
    warrantyStartDate,
    warrantyPeriod,
    warrantyParts,
    serviceFrequency,
    propertyAddress,
    requestSource,
    requestType,
    requestDetails,
    remark,
    wantDate
  } = req.body;

  try {
    // Generate a unique document ID
    const documentId = 'EXT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    // Insert the external request with initial status 'Pending External Review'
    await db.query(
      `INSERT INTO external_requests 
       (document_id, customer_name, customer_address, phone_number, email, 
        site_name, billing_address, product_code, quantity, warranty_start_date,
        warranty_period, warranty_parts, service_frequency, property_address,
        request_source, request_type, request_details, remark, want_date, 
        status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        documentId, customerName, customerAddress, phoneNumber, email,
        siteName, billingAddress, productCode, quantity, warrantyStartDate,
        warrantyPeriod, warrantyParts, serviceFrequency, propertyAddress,
        requestSource, requestType, JSON.stringify(requestDetails), remark, wantDate,
        'Pending External Review'
      ]
    );

    // Send notification to SaleCo team
    const telegramMessage = `🔔 <b>New External Service Request</b>
📄 <b>Document ID:</b> ${documentId}
👤 <b>Customer:</b> ${customerName}
📦 <b>Product Code:</b> ${productCode}
🔢 <b>Quantity:</b> ${quantity}
📧 <b>Email:</b> ${email}
📞 <b>Phone:</b> ${phoneNumber}
🏢 <b>Site:</b> ${siteName}
💬 <b>Remark:</b> ${remark}

⚠️ <b>Action Required:</b> SaleCo team needs to allocate specific products to this request.`;

    // Send to Telegram channels
    await Promise.all([
      fetch('https://api.telegram.org/bot7646625188:AAGS-NqBl3rUU9AlC9a01wzlbaqs6spBf7M/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: '-4614144690',
          text: telegramMessage,
          parse_mode: 'HTML'
        })
      }),
      fetch('https://api.telegram.org/bot7646625188:AAGS-NqBl3rUU9AlC9a01wzlbaqs6spBf7M/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: '-4631636900',
          text: telegramMessage,
          parse_mode: 'HTML'
        })
      })
    ]);

    res.json({ 
      success: true, 
      documentId: documentId,
      message: 'External service request submitted successfully'
    });

  } catch (error) {
    console.error('Error creating external service request:', error);
    res.status(500).json({ 
      error: 'Failed to create external service request: ' + error.message 
    });
  }
});

// Add endpoint to get external requests waiting for product allocation
app.get('/sale-co/external-requests', (req, res) => {
  const sql = "SELECT * FROM SaleCoRequests WHERE status = 'Pending External Review' ORDER BY created_at DESC";
  db.execute(sql, (err, results) => {
    if (err) {
      console.error("Error fetching external requests:", err);
      return res.status(500).json({ error: "Failed to fetch external requests" });
    }
    res.status(200).json(results);
  });
});
app.get('/sale-co/insurance-types', (req, res) => {
  const sql = "SELECT * FROM insurance_type";
  db.execute(sql, (err, results) => {
    if (err) {
      console.error("Error fetching external requests:", err);
      return res.status(500).json({ error: "Failed to fetch external requests" });
    }
    res.status(200).json(results);
  });
});
// Start server
app.listen(port, () => {
  console.log(`Server is running on https://localhost:5000${port}`);
});
