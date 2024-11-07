const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let activeSessions = {};  // Dictionary to store active sessions

// Create an absolute file path for the 'logins.xlsx' file
const filePath = path.join(__dirname, 'logins.xlsx');  // Join current directory with logins.xlsx

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if email ends with @stfrancis.ph.education
  if (!email.endsWith('@stfrancis.ph.education')) {
    return res.json({ status: 'error', message: 'Invalid email domain. Please use your @stfrancis.ph.education email.' });
  }

  // Check if user is already logged in
  if (activeSessions[email]) {
    return res.json({ status: 'already_logged_in', message: 'User already logged in.' });
  }

  console.log("Saving login data:", { email, password });

  // Add the user to the active sessions
  activeSessions[email] = true;

  // Save data to Excel
  let workbook;
  try {
    workbook = XLSX.readFile(filePath);  // Use the absolute file path
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
    XLSX.writeFile(workbook, filePath);  // Use the absolute file path
    res.json({ status: 'success', message: 'Login data saved successfully.' });
  } catch (err) {
    console.error("Error writing file:", err);
    res.json({ status: 'error', message: 'Error saving login data' });
  }
});

// Endpoint to view stored login data
app.get('/view-logins', (req, res) => {
  let workbook;
  try {
    workbook = XLSX.readFile(filePath);
  } catch (err) {
    console.error("Error reading file:", err);
    return res.json({ status: 'error', message: 'Error reading login data' });
  }

  const sheetName = 'Logins';
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    return res.json({ status: 'error', message: 'No login data found' });
  }

  const loginData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  loginData.shift();  // Remove the header row

  res.json({ status: 'success', data: loginData });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
