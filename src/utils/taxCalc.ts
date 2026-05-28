import { Earnings, Deductions, EmployeeDetails } from '../types';

/**
 * Calculates South African Tax (PAYE) based on standard tables (2025/2026 Tax Year)
 * @param monthlyTaxableIncome Gross monthly earnings minus tax-deductible pension/provident contributions
 * @param ageGroup The employee's age category for rebates
 */
export function calculatePaye(monthlyTaxableIncome: number, ageGroup: EmployeeDetails['ageGroup']): number {
  if (monthlyTaxableIncome <= 0) return 0;

  const annualTaxable = monthlyTaxableIncome * 12;
  let annualTaxBeforeRebate = 0;

  // 2025/2026 South African Tax Brackets
  if (annualTaxable <= 247000) {
    annualTaxBeforeRebate = annualTaxable * 0.18;
  } else if (annualTaxable <= 385300) {
    annualTaxBeforeRebate = 44460 + (annualTaxable - 247000) * 0.26;
  } else if (annualTaxable <= 533300) {
    annualTaxBeforeRebate = 80418 + (annualTaxable - 385300) * 0.31;
  } else if (annualTaxable <= 700000) {
    annualTaxBeforeRebate = 126298 + (annualTaxable - 533300) * 0.36;
  } else if (annualTaxable <= 892600) {
    annualTaxBeforeRebate = 186310 + (annualTaxable - 700000) * 0.39;
  } else if (annualTaxable <= 1884600) {
    annualTaxBeforeRebate = 261424 + (annualTaxable - 892600) * 0.41;
  } else {
    annualTaxBeforeRebate = 668144 + (annualTaxable - 1884600) * 0.45;
  }

  // Rebates
  let totalRebates = 17235; // Primary Rebate (under 65)

  if (ageGroup === '65to74') {
    totalRebates += 9444; // Secondary Rebate
  } else if (ageGroup === '75plus') {
    totalRebates += 9444 + 3145; // Secondary + Tertiary Rebate
  }

  const finalAnnualTax = Math.max(0, annualTaxBeforeRebate - totalRebates);
  const monthlyTax = finalAnnualTax / 12;

  return Math.round(monthlyTax * 100) / 100;
}

/**
 * Calculates South African Unemployment Insurance Fund (UIF) contribution
 * Employee contribution is 1% of gross earnings, capped at standard ceiling of R17,712 gross salary (R177.12 max)
 */
export function calculateUif(grossEarnings: number): number {
  const UIF_MAX_GROSS = 17712;
  const taxableUifEarnings = Math.min(grossEarnings, UIF_MAX_GROSS);
  const uifContribution = taxableUifEarnings * 0.01;
  return Math.round(uifContribution * 100) / 100;
}

/**
 * Checks if a string is a valid South African ID number
 * SA ID format: YYMMDDSSSSCAZ
 */
export function validateSouthAfricanID(id: string): { isValid: boolean; birthdate?: string; gender?: string; citizenship?: string } {
  const sanitized = id.replace(/\s+/g, '');
  if (!/^\d{13}$/.test(sanitized)) {
    return { isValid: false };
  }

  // Luhn algorithm verification
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let digit = parseInt(sanitized.charAt(i));
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  const isValid = sum % 10 === 0;
  if (!isValid) {
    return { isValid: false };
  }

  // Extract date of birth
  const yearStr = sanitized.substring(0, 2);
  const monthStr = sanitized.substring(2, 4);
  const dayStr = sanitized.substring(4, 6);
  
  const currentYear = new Date().getFullYear() % 100;
  const century = parseInt(yearStr) <= currentYear ? '20' : '19';
  const birthdate = `${dayStr}/${monthStr}/${century}${yearStr}`;

  // Extract gender
  const genderCode = parseInt(sanitized.substring(6, 10));
  const gender = genderCode < 5000 ? 'Female' : 'Male';

  // Extract citizenship
  const citizenshipCode = parseInt(sanitized.charAt(10));
  const citizenship = citizenshipCode === 0 ? 'SA Citizen' : 'Permanent Resident';

  return { isValid: true, birthdate, gender, citizenship };
}

/**
 * Checks if a string is a valid SARS 10-digit Income Tax Number
 */
export function validateSarsTaxNumber(taxNumber: string): boolean {
  const sanitized = taxNumber.replace(/[\s-]+/g, '');
  if (!/^\d{10}$/.test(sanitized)) {
    return false;
  }
  
  // Basic check: many SARS tax numbers start with 0, 1, 2, 3, 9
  return true;
}

/**
 * Converts numbers into standard currency wording (e.g., "Five Thousand Rands and Zero Cents")
 */
export function numberToZarWords(amount: number): string {
  if (amount === 0) return 'Zero Rands Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Million', 'Billion'];

  function convertGroup(n: number): string {
    let s = '';
    const h = Math.floor(n / 100);
    const t = n % 100;
    
    if (h > 0) {
      s += ones[h] + ' Hundred';
      if (t > 0) s += ' and ';
    }
    
    if (t > 0) {
      if (t < 20) {
        s += ones[t];
      } else {
        const ten = Math.floor(t / 10);
        const unit = t % 10;
        s += tens[ten];
        if (unit > 0) s += '-' + ones[unit];
      }
    }
    return s;
  }

  const rounded = Math.round(amount * 100) / 100;
  const randsVal = Math.floor(rounded);
  const centsVal = Math.round((rounded - randsVal) * 100);

  let randString = '';
  if (randsVal === 0) {
    randString = 'Zero Rands';
  } else {
    const parts: string[] = [];
    let num = randsVal;
    let scaleIdx = 0;

    while (num > 0) {
      const chunk = num % 1000;
      if (chunk > 0) {
        const groupStr = convertGroup(chunk);
        const scaleStr = scales[scaleIdx];
        parts.unshift(groupStr + (scaleStr ? ' ' + scaleStr : ''));
      }
      num = Math.floor(num / 1000);
      scaleIdx++;
    }
    
    randString = parts.join(', ') + (randsVal === 1 ? ' Rand' : ' Rands');
  }

  let centString = '';
  if (centsVal > 0) {
    centString = ' and ' + convertGroup(centsVal) + (centsVal === 1 ? ' Cent' : ' Cents');
  } else {
    centString = ' Only';
  }

  // Sanitize formatting spacings
  return (randString + centString).replace(/\s+/g, ' ').trim();
}
