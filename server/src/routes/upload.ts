import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { uploadSignature } from '../config/upload';
import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';

const router = Router();

router.post('/receipt', requireAuth, uploadSignature.single('receipt'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
  }
  res.json({ success: true, data: { url: `/uploads/signatures/${req.file.filename}` } });
});

router.post('/scan', requireAuth, uploadSignature.single('receipt'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
  }
  
  try {
    const filePath = req.file.path;
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    
    // Parse text to find amounts, title, etc.
    let amount = 0;
    let currency = 'INR';
    
    // Check for USD, EUR, GBP
    const textUpper = text.toUpperCase();
    if (textUpper.includes('$') || textUpper.includes('USD')) currency = 'USD';
    else if (textUpper.includes('€') || textUpper.includes('EUR')) currency = 'EUR';
    else if (textUpper.includes('£') || textUpper.includes('GBP')) currency = 'GBP';

    const amountMatch = text.match(/(?:total|amount|rs\.?|₹|\$|usd|eur|€|gbp|£)\s*:?\s*([\d,]+\.?\d*)/i);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    } else {
      const numbers = text.match(/\d+\.\d{2}/g);
      if (numbers) {
        amount = Math.max(...numbers.map(n => parseFloat(n)));
      }
    }

    // Convert to INR
    let originalAmount = amount;
    if (currency === 'USD') amount = amount * 83.5;
    else if (currency === 'EUR') amount = amount * 90.2;
    else if (currency === 'GBP') amount = amount * 105.0;
    
    let category = 'OTHER';
    const lowerText = text.toLowerCase();
    if (lowerText.includes('flight') || lowerText.includes('ticket') || lowerText.includes('travel')) category = 'TRAVEL';
    else if (lowerText.includes('food') || lowerText.includes('restaurant') || lowerText.includes('meal')) category = 'FOOD';
    else if (lowerText.includes('hotel') || lowerText.includes('room')) category = 'ACCOMMODATION';

    let title = 'Expense Receipt';
    if (category === 'TRAVEL') title = 'Travel Ticket';
    else if (category === 'FOOD') title = 'Food Bill';

    // Extract Date Robustly
    let dateStr = null;
    const dateRegex = /\b(\d{1,2})[-/.\s]+([a-zA-Z]{3,9}|\d{1,2})[-/.\s]+(\d{2,4})\b/g;
    const allMatches = [...text.matchAll(dateRegex)];
    
    for (const match of allMatches) {
      let dayStr = match[1];
      let monthStr = match[2];
      let yearStr = match[3];

      let year = parseInt(yearStr);
      if (year < 100) year += 2000; // handle '23' as 2023

      let month = 0;
      let day = parseInt(dayStr);
      
      if (isNaN(parseInt(monthStr))) {
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        month = months.findIndex(m => monthStr.toLowerCase().startsWith(m)) + 1;
      } else {
        month = parseInt(monthStr);
        // If JS would normally fail (e.g. 25/12/2023), swap them
        if (month > 12) {
          const temp = month;
          month = day;
          day = temp;
        }
      }

      // Validate
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 2000 && year <= new Date().getFullYear()) {
        const parsedDate = new Date(year, month - 1, day);
        if (!isNaN(parsedDate.getTime()) && parsedDate <= new Date()) {
          dateStr = parsedDate.toISOString();
          break; // Found a valid past/present date
        }
      }
    }

    res.json({ 
      success: true, 
      data: { 
        url: `/uploads/signatures/${req.file.filename}`,
        extracted: { 
          amount: amount ? Number(amount.toFixed(2)) : null, 
          originalAmount,
          currency,
          category, 
          title, 
          date: dateStr,
          text 
        }
      }
    });
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ success: false, error: { message: 'Failed to scan receipt' } });
  }
});

export default router;
