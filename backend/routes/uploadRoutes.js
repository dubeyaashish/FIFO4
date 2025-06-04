const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const db = require('../db');
const { authenticateToken } = require('./authRoutes');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/home/ruuduyk/public_html/QCM/pictures');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/home/ruuduyk/public_html/QCM/pdfs');
  },
  filename: function (req, file, cb) {
    cb(null, `${req.body.documentId}.pdf`);
  }
});
const uploadPdf = multer({ storage: pdfStorage });

router.post('/upload-image', upload.single('image'), async (req, res) => {
  const { sn_number, type } = req.body;
  if (!sn_number) {
    return res.status(400).json({ error: 'Serial number is required' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const imageUrl = `https://ruu-d.com/QCM/pictures/${req.file.filename}`;
  try {
    let sql = '';
    if (type === 'nc1') {
      sql = 'UPDATE Nc_table SET nc_image1 = ? WHERE sn_number = ?';
    } else if (type === 'nc2') {
      sql = 'UPDATE Nc_table SET nc_image2 = ? WHERE sn_number = ?';
    } else {
      sql = 'UPDATE SaleCoRequests SET image = ? WHERE sn_number = ?';
    }
    const [result] = await db.promise().query(sql, [imageUrl, sn_number]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found for given serial number.' });
    }
    res.status(200).json({ message: 'Image uploaded successfully', imageUrl });
  } catch (error) {
    console.error('Error updating DB in /upload-image:', error);
    res.status(500).json({ error: 'Failed to upload image', details: error.message });
  }
});

router.post('/upload-pdf', authenticateToken, uploadPdf.single('pdf'), async (req, res) => {
  try {
    const documentId = req.body.documentId;
    if (!req.file || !documentId) {
      return res.status(400).json({ error: 'Missing file or document ID' });
    }
    const newFileName = `${documentId}.pdf`;
    const newFilePath = path.join('/home/ruuduyk/public_html/QCM/pdfs', newFileName);
    await fs.rename(req.file.path, newFilePath);
    const pdfUrl = `https://ruu-d.com/QCM/pdfs/${newFileName}`;
    const sql = 'UPDATE SaleCoRequests SET pdf_url = ? WHERE document_id = ? LIMIT 1';
    await db.promise().query(sql, [pdfUrl, documentId]);
    res.status(200).json({ message: 'PDF uploaded successfully', pdfUrl });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    res.status(500).json({ error: 'Failed to upload PDF' });
  }
});

module.exports = router;
