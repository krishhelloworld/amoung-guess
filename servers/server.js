import express from "express";
import axios from "axios";
import * as cheerio from 'cheerio';
import cors from "cors";
import path from "path"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, 'public')));;
app.use(cors());
app.use(express.json());

const AKTU_URL = 'https://oneview.aktu.ac.in/webpages/aktu/oneview.aspx';
const SEED_ROLL = '1305650004'; // Known valid roll number to prime the session

// Helper: extract hidden ASP.NET fields from HTML
function extractAspNetFields(html) {
  const $ = cheerio.load(html);
  return {
    __VIEWSTATE: $('#__VIEWSTATE').val() || '',
    __VIEWSTATEGENERATOR: $('#__VIEWSTATEGENERATOR').val() || '',
    __EVENTVALIDATION: $('#__EVENTVALIDATION').val() || '',
    __EVENTTARGET: '',
    __EVENTARGUMENT: '',
  };
}

// Helper: parse result HTML into structured data
function parseResult(html) {
  const $ = cheerio.load(html);
  const result = {
    studentInfo: {},
    semesters: [],
    rawFound: false,
  };

  // Check if result actually loaded
  const bodyText = $('body').text();
  if (bodyText.includes('No Record') || bodyText.includes('Invalid Roll') || bodyText.trim().length < 200) {
    return result;
  }

  // Try to extract student name, roll no, college, course
  const infoTable = $('table').first();
  infoTable.find('tr').each((i, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 2) {
      const key = $(cells[0]).text().trim().replace(':', '').trim();
      const val = $(cells[1]).text().trim();
      if (key && val) {
        result.studentInfo[key] = val;
      }
    }
  });

  // Extract all tables that look like marksheets (subject-wise)
  $('table').each((tableIdx, table) => {
    const headers = [];
    $(table).find('tr').first().find('th, td').each((i, th) => {
      headers.push($(th).text().trim().toLowerCase());
    });

    const hasSubjectCol = headers.some(h => h.includes('subject') || h.includes('paper'));
    const hasMarksCol = headers.some(h => h.includes('mark') || h.includes('grade') || h.includes('obtained'));

    if (hasSubjectCol || hasMarksCol) {
      const rows = [];
      $(table).find('tr').each((rowIdx, row) => {
        if (rowIdx === 0) return; // skip header
        const cells = [];
        $(row).find('td, th').each((i, cell) => {
          cells.push($(cell).text().trim());
        });
        if (cells.some(c => c.length > 0)) {
          rows.push(cells);
        }
      });

      if (rows.length > 0) {
        result.semesters.push({ headers, rows });
        result.rawFound = true;
      }
    }
  });

  // If structured parse failed, try to grab all tables as raw data
  if (!result.rawFound) {
    $('table').each((tableIdx, table) => {
      const rows = [];
      $(table).find('tr').each((rowIdx, row) => {
        const cells = [];
        $(row).find('td, th').each((i, cell) => {
          cells.push($(cell).text().trim());
        });
        if (cells.some(c => c.length > 2)) {
          rows.push(cells);
        }
      });
      if (rows.length > 2) {
        const headers = rows[0] || [];
        result.semesters.push({ headers: headers.map(h => h.toLowerCase()), rows: rows.slice(1) });
        result.rawFound = true;
      }
    });
  }

  return result;
}

// Main scraping route
app.post('/api/result', async (req, res) => {
  const { rollNumber } = req.body;
  if (!rollNumber || rollNumber.trim().length < 7) {
    return res.status(400).json({ error: 'Please enter a valid roll number.' });
  }

  try {
    const cookieJar = {};

    // ── Step 1: Load the page fresh, grab cookies + hidden fields ──
    const step1 = await axios.get(AKTU_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
      maxRedirects: 5,
    });

    // Collect session cookies
    const rawCookies = step1.headers['set-cookie'] || [];
    rawCookies.forEach(c => {
      const [pair] = c.split(';');
      const [k, v] = pair.split('=');
      if (k && v) cookieJar[k.trim()] = v.trim();
    });
    const cookieString = () => Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ');

    const fields1 = extractAspNetFields(step1.data);

    // ── Step 2: POST with SEED roll number to prime the session ──
    const seedPayload = new URLSearchParams({
      ...fields1,
      ctl00$ContentPlaceHolder1$txtRollNo: SEED_ROLL,
      ctl00$ContentPlaceHolder1$btnSubmit: 'Aage Badhe',
    });

    const step2 = await axios.post(AKTU_URL, seedPayload.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': AKTU_URL,
        'Cookie': cookieString(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      maxRedirects: 5,
      validateStatus: () => true,
    });

    // Update cookies
    const rawCookies2 = step2.headers['set-cookie'] || [];
    rawCookies2.forEach(c => {
      const [pair] = c.split(';');
      const [k, v] = pair.split('=');
      if (k && v) cookieJar[k.trim()] = v.trim();
    });

    // ── Step 3: Now POST actual roll number (session is primed, no DOB needed) ──
    const fields2 = extractAspNetFields(step2.data);
    const realPayload = new URLSearchParams({
      ...fields2,
      ctl00$ContentPlaceHolder1$txtRollNo: rollNumber.trim(),
      ctl00$ContentPlaceHolder1$btnSubmit: 'Aage Badhe',
    });

    const step3 = await axios.post(AKTU_URL, realPayload.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': AKTU_URL,
        'Cookie': cookieString(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      maxRedirects: 5,
      validateStatus: () => true,
    });

    // Update cookies again
    const rawCookies3 = step3.headers['set-cookie'] || [];
    rawCookies3.forEach(c => {
      const [pair] = c.split(';');
      const [k, v] = pair.split('=');
      if (k && v) cookieJar[k.trim()] = v.trim();
    });

    const finalHtml = step3.data;

    // ── Step 4: Parse result ──
    const parsed = parseResult(finalHtml);

    // Also send raw HTML for frontend iframe fallback
    return res.json({
      success: true,
      rollNumber: rollNumber.trim(),
      parsed,
      rawHtml: finalHtml,
    });

  } catch (err) {
    console.error('Scrape error:', err.message);
    return res.status(500).json({
      error: 'Could not fetch result. The AKTU portal may be down or blocking requests. Try again in a moment.',
      details: err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ AKTU Result Checker running at http://localhost:${PORT}\n`);
});