const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'itppg.com',
  user: 'misppg_lg',
  password: '4xs56zssb5bxCXfvZSjJ',
  database: 'misppg_lg',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
});

module.exports = db;
