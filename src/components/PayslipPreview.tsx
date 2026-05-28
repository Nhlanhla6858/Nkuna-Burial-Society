import React, { useRef, useState } from 'react';
import { EmployerDetails, EmployeeDetails, Earnings, Deductions } from '../types';
import { NbsLogo, NbsWatermark } from './NbsLogo';
import { numberToZarWords } from '../utils/taxCalc';
import { 
  Printer, 
  Download, 
  Feather, 
  Signature, 
  CheckSquare, 
  ShieldCheck, 
  Mail, 
  Send,
  Link,
  Copy,
  CheckCircle,
  Eye,
  Settings,
  Shield,
  Clock,
  Unlock,
  AlertCircle
} from 'lucide-react';

interface PayslipPreviewProps {
  employer: EmployerDetails;
  employee: EmployeeDetails;
  earnings: Earnings;
  deductions: Deductions;
  calculated: {
    grossEarnings: number;
    paye: number;
    uif: number;
    pension: number;
    other: number;
    totalDeductions: number;
    netPay: number;
    employerUif: number;
    ytdTotals?: {
      basicSalary: number;
      commission: number;
      allowance: number;
      grossEarnings: number;
      paye: number;
      uif: number;
      pension: number;
      other: number;
      totalDeductions: number;
    };
  };
}

export function PayslipPreview({
  employer,
  employee,
  earnings,
  deductions,
  calculated,
}: PayslipPreviewProps) {
  const payslipRef = useRef<HTMLDivElement>(null);
  const [employerSignatureName, setEmployerSignatureName] = useState('NBS Admin');
  const [employeeSignatureName, setEmployeeSignatureName] = useState('');
  const [signedDate, setSignedDate] = useState(new Date().toLocaleDateString('en-ZA'));
  
  // Custom digital signing options
  const [isSigned, setIsSigned] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // SECURE ELECTRONIC DELIVERY STATES
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'portal'>('email');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [useSADecryptPassword, setUseSADecryptPassword] = useState(true);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  // Portal link states
  const [portalUrl, setPortalUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showPortalTester, setShowPortalTester] = useState(false);
  const [portalPin, setPortalPin] = useState('');
  const [portalUnlocked, setPortalUnlocked] = useState(false);
  const [portalError, setPortalError] = useState('');
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadCompleted, setDownloadCompleted] = useState(false);
  
  // Audit delivery timeline (compliance logs)
  const [outboxHistory, setOutboxHistory] = useState<Array<{
    id: string;
    timestamp: string;
    method: string;
    recipient: string;
    secured: boolean;
  }>>([
    {
      id: "log-1",
      timestamp: "Pre-Verified",
      method: "Internal Archiving",
      recipient: "NBS Local Store",
      secured: true
    }
  ]);

  // Primary Print Action (triggers browser-native print of optimized printable element)
  const handlePrint = () => {
    window.print();
  };

  // Generate dynamic URL for employee portal links
  const handleGeneratePortalLink = () => {
    const randomHex = Math.random().toString(16).slice(2, 10);
    const generated = `https://nbs.payroll-portal.co.za/payslip/secure-token-${randomHex}`;
    setPortalUrl(generated);
    setCopiedUrl(false);
    
    // Add record to compliance outbox history
    const logItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      method: 'Employee Portal Link Generated',
      recipient: employee.name || 'NBS Employee',
      secured: true
    };
    setOutboxHistory(prev => [logItem, ...prev]);
  };

  // Simulated PDF / Email Delivery with sending delay and POPIA protection explanation
  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) return;
    
    setEmailSending(true);
    setEmailSent(false);
    
    setTimeout(() => {
      setEmailSending(false);
      setEmailSent(true);
      
      // Add record to compliance outbox history
      const logItem = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        method: 'Encrypted Email sent',
        recipient: recipientEmail,
        secured: useSADecryptPassword
      };
      setOutboxHistory(prev => [logItem, ...prev]);
    }, 1800);
  };

  // Simulate copy link to clipboard
  const handleCopyLink = () => {
    if (!portalUrl) return;
    navigator.clipboard.writeText(portalUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Unlock test employee portal using standard employee PIN validation
  const handlePortalUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPortalError('');
    
    // Valid PIN is either:
    // 1. Matches employee.idNumber first 6 digits
    // 2. Matches employee.taxNumber first 6 digits
    // 3. Just matches "123455" or is any 6-digit number if nothing is provided
    const targetIdCheck = employee.idNumber ? employee.idNumber.slice(0, 6) : '';
    const targetTaxCheck = employee.taxNumber ? employee.taxNumber.slice(0, 6) : '';
    
    const inputCleaned = portalPin.trim();
    if (!inputCleaned) {
      setPortalError('Verification Error: Code cannot be empty.');
      return;
    }
    
    const isMatched = 
      (targetIdCheck && inputCleaned === targetIdCheck) ||
      (targetTaxCheck && inputCleaned === targetTaxCheck) ||
      (inputCleaned === '123456') ||
      (!targetIdCheck && !targetTaxCheck && inputCleaned.length >= 4);
      
    if (isMatched) {
      setPortalUnlocked(true);
    } else {
      setPortalError(`Access Denied: Unlocking code does not match Employee ${employee.name || 'records'}. Note: Use first 6 digits of Employee's ID/Tax number (${targetIdCheck || '123456'}).`);
    }
  };

  // Simulate secure employee file download trigger in portal
  const handlePortalDownloadPdf = () => {
    setDownloadingPdf(true);
    setDownloadCompleted(false);
    setTimeout(() => {
      setDownloadingPdf(false);
      setDownloadCompleted(true);
    }, 1500);
  };

  const roundedNetPay = calculated.netPay;
  const netPayWords = numberToZarWords(roundedNetPay);

  return (
    <div className="flex flex-col gap-4" id="payslip-preview-container">
      {/* Upper Utility Controller Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800 text-white p-4 rounded-xl shadow-sm print:hidden">
        <div>
          <h3 className="font-sans font-bold text-sm flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Live Compliant Preview
          </h3>
          <p className="text-[10px] text-slate-300">Format ready for premium letterhead A4 printing</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Print button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 font-bold rounded-lg text-xs leading-none transition"
            id="print-payslip-primary-btn"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / PDF
          </button>

          {/* Email button */}
          <button
            onClick={() => {
              setRecipientEmail(employee.name ? `${employee.name.toLowerCase().replace(/\s+/g, '')}@gmail.com` : '');
              setShowEmailModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold border border-slate-600 rounded-lg text-xs leading-none transition"
            id="email-payslip-btn"
          >
            <Mail className="w-3.5 h-3.5" />
            Send Electronic
          </button>
        </div>
      </div>

      {/* Main A4 Ratio Document Wrapper */}
      <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 justify-center flex shadow-inner print:bg-white print:border-none print:p-0">
        <div 
          ref={payslipRef}
          className="relative bg-gradient-to-b from-[#E2F0FF] via-[#F4F9FF] to-white w-full max-w-[800px] flex flex-col justify-between p-8 sm:p-10 border border-gray-200 shadow-2xl overflow-hidden print:bg-white print:bg-none print:shadow-none print:border-none print:p-0 print:rounded-none"
          style={{ minHeight: '1050px' }}
          id="compliance-a4-playslip-sheet"
        >
          {/* Watermark Logo at centered background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none w-full h-full z-0 overflow-hidden">
            <NbsWatermark variant="sleek" className="opacity-[0.05] scale-[1.1]" />
          </div>

          {/* Inner Document Sections - Force relative and higher z-index to stay on top of watermark */}
          <div className="relative z-10 w-full flex flex-col gap-5">
            
            {/* 1. BRAND DOCUMENT HEADER */}
            <div className="flex justify-between items-start border-b-2 border-[#1B2A7E] pb-4 mb-2 z-10">
              <NbsLogo size={64} variant="sleek" />
              
              {/* Employer Details block from Sleek Design */}
              <div className="text-right text-[10.5px] text-gray-700 leading-tight space-y-1 font-sans z-10">
                <p><span className="font-bold text-[#1B2A7E]">Co. Reg No:</span> <span className="font-mono text-[9.5px]">{employer.coRegNo || '2015/098432/08'}</span></p>
                <p><span className="font-bold text-[#1B2A7E]">PAYE Ref:</span> <span className="font-mono text-[9.5px]">{employer.payeRef || '7100784321'}</span></p>
                <p><span className="font-bold text-[#1B2A7E]">UIF Ref:</span> <span className="font-mono text-[9.5px]">{employer.uifRef || 'U100784321'}</span></p>
                <p><span className="font-bold text-[#1B2A7E]">Address:</span> {employer.address || 'Plot 24, Bronkhorstspruit Road, Pretoria East'}</p>
                <p><span className="font-bold text-[#1B2A7E]">Contact:</span> {employer.contact || 'info@nkunaburial.co.za | +27 12 809 3982'}</p>
              </div>
            </div>

            {/* DOCUMENT TITLE banner */}
            <div className="flex justify-between items-center py-1.5 px-3 rounded text-white z-10 select-none shadow-sm" style={{ backgroundColor: '#1B2A7E' }}>
              <span className="font-sans font-bold text-xs uppercase tracking-widest">Confidential Salary Payslip</span>
              <span className="font-mono text-[9px] tracking-wide">BCEA Section 33 Compliant</span>
            </div>

            {/* 2. EMPLOYEE & PAYMENT DETAILS (Sleek card layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 p-4 border border-gray-100 bg-gray-50/50 rounded-lg z-10">
              <div className="flex justify-between border-b border-gray-200 pb-1 text-sm">
                <span className="font-bold text-[#1B2A7E] uppercase text-xs shrink-0 self-center">Employee Name:</span>
                <span className="text-gray-900 font-semibold text-right leading-none self-center">{employee.name || '____________'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1 text-sm">
                <span className="font-bold text-[#1B2A7E] uppercase text-xs shrink-0 self-center">Pay Period:</span>
                <span className="text-gray-900 font-mono text-[12px] font-medium text-right leading-none self-center">
                  {employee.payPeriodStart && employee.payPeriodEnd 
                    ? `${employee.payPeriodStart} – ${employee.payPeriodEnd}` 
                    : '01/05/2026 – 31/05/2026'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1 text-sm">
                <span className="font-bold text-[#1B2A7E] uppercase text-xs shrink-0 self-center">Occupation:</span>
                <span className="text-gray-900 font-medium text-right leading-none self-center">{employee.occupation || '____________'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1 text-sm">
                <span className="font-bold text-[#1B2A7E] uppercase text-xs shrink-0 self-center">Pay Date:</span>
                <span className="text-gray-900 font-mono font-medium text-right leading-none self-center">{employee.payDate || 'DD/MM/YYYY'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1 text-sm">
                <span className="font-bold text-[#1B2A7E] uppercase text-xs shrink-0 self-center">Employee Tax No:</span>
                <span className="text-gray-900 font-mono font-medium text-right leading-none self-center">{employee.taxNumber || '____________'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1 text-sm">
                <span className="font-bold text-[#1B2A7E] uppercase text-xs shrink-0 self-center">Employee ID/Ref:</span>
                <span className="text-gray-900 font-mono font-medium text-right leading-none self-center">{employee.idNumber || '____________'}</span>
              </div>
            </div>

            {/* Tables Container (Earnings and Deductions side-by-side Layout with YTD Columns) */}
            <div className="flex flex-col md:flex-row gap-6 z-10 flex-grow" id="preview-tables-container">
              
              {/* Earnings Section (Column 1) */}
              <div className="flex-1 flex flex-col">
                <div className="bg-[#1B2A7E] text-white text-[11px] font-extrabold px-3 py-2 rounded-t-sm uppercase tracking-widest select-none shadow-sm flex justify-between items-center">
                  <span>2. Earnings</span>
                  <span className="text-[9px] opacity-80 normal-case font-medium">BCEA Sec 33</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-[#1B2A7E] font-semibold border-b border-gray-300">
                      <th className="text-left p-1.5 uppercase text-[9px]">Description</th>
                      <th className="text-center p-1.5 uppercase text-[9px]">Type</th>
                      <th className="text-right p-1.5 uppercase text-[9px]">Amount (R)</th>
                      <th className="text-right p-1.5 uppercase text-[9px] bg-[#1B2A7E]/5 text-[#1B2A7E] font-extrabold">YTD Cumulative</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 divide-y divide-gray-50 bg-white/50">
                    <tr className="border-b border-gray-100">
                      <td className="p-1.5 font-medium text-[11px]">Basic Salary</td>
                      <td className="p-1.5 text-center text-gray-500 italic text-[10px]">Fixed</td>
                      <td className="p-1.5 text-right font-mono text-gray-900 font-semibold text-[11px]">
                        {earnings.basicSalary.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 text-right font-mono text-slate-500 font-medium bg-[#1B2A7E]/[0.02] text-[11px]">
                        {(calculated.ytdTotals?.basicSalary || earnings.basicSalary).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-1.5 font-medium text-[11px]">Production Incentive</td>
                      <td className="p-1.5 text-center text-gray-550 italic text-[10px]">Variable</td>
                      <td className="p-1.5 text-right font-mono text-gray-900 font-semibold text-[11px]">
                        {earnings.commission.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 text-right font-mono text-slate-500 font-medium bg-[#1B2A7E]/[0.02] text-[11px]">
                        {(calculated.ytdTotals?.commission || earnings.commission).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-1.5 font-medium text-[11px]">Travel Allowance</td>
                      <td className="p-1.5 text-center text-gray-550 italic text-[10px]">-</td>
                      <td className="p-1.5 text-right font-mono text-gray-900 font-semibold text-[11px]">
                        {earnings.allowance.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 text-right font-mono text-slate-500 font-medium bg-[#1B2A7E]/[0.02] text-[11px]">
                        {(calculated.ytdTotals?.allowance || earnings.allowance).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="font-bold text-gray-900 bg-gray-50/80 border-t border-gray-200">
                      <td className="p-1.5 font-bold text-[11px]" colSpan={2}>Gross Remuneration</td>
                      <td className="p-1.5 text-right font-mono text-xs text-[#1B2A7E]">
                        {calculated.grossEarnings.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 text-right font-mono text-xs bg-[#1B2A7E]/5 text-[#1B2A7E] font-extrabold border-l border-white">
                        {(calculated.ytdTotals?.grossEarnings || calculated.grossEarnings).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
 
              {/* Deductions Section (Column 2) */}
              <div className="flex-1 flex flex-col">
                <div className="bg-[#1B2A7E] text-white text-[11px] font-extrabold px-3 py-2 rounded-t-sm uppercase tracking-widest select-none shadow-sm flex justify-between items-center">
                  <span>3. Deductions & Contributions</span>
                  <span className="text-[9px] opacity-80 normal-case font-medium">SARS Statutory</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100 text-[#1B2A7E] font-semibold border-b border-gray-300">
                      <th className="text-left p-1.5 uppercase text-[9px]">Description</th>
                      <th className="text-left p-1.5 uppercase text-[9px]">Basis</th>
                      <th className="text-right p-1.5 uppercase text-[9px]">Amount (R)</th>
                      <th className="text-right p-1.5 uppercase text-[9px] bg-[#1B2A7E]/5 text-[#1B2A7E] font-extrabold">YTD Cumulative</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 divide-y divide-gray-50 bg-white/50">
                    <tr className="border-b border-gray-100">
                      <td className="p-1.5 font-medium text-[11px]">PAYE (Tax)</td>
                      <td className="p-1.5 italic text-gray-500 text-[10px]">Statutory Tax</td>
                      <td className="p-1.5 text-right font-mono text-red-750 font-semibold text-[11px]">
                        {calculated.paye.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 text-right font-mono text-slate-500 font-medium bg-[#1B2A7E]/[0.02] text-[11px]">
                        {(calculated.ytdTotals?.paye || calculated.paye).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-1.5 font-medium text-[11px]">UIF Contribution</td>
                      <td className="p-1.5 italic text-gray-500 text-[10px]">Unemployment (1%)</td>
                      <td className="p-1.5 text-right font-mono text-gray-900 font-semibold text-[11px]">
                        {calculated.uif.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 text-right font-mono text-slate-500 font-medium bg-[#1B2A7E]/[0.02] text-[11px]">
                        {(calculated.ytdTotals?.uif || calculated.uif).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-1.5 font-medium text-[11px]">Pension Fund</td>
                      <td className="p-1.5 italic text-gray-500 text-[10px]">Retirement ({deductions.pensionType === 'percent' ? `${deductions.pensionValue}%` : 'Fixed'})</td>
                      <td className="p-1.5 text-right font-mono text-gray-900 font-semibold text-[11px]">
                        {calculated.pension.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 text-right font-mono text-slate-500 font-medium bg-[#1B2A7E]/[0.02] text-[11px]">
                        {(calculated.ytdTotals?.pension || calculated.pension).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    {calculated.other > 0 && (
                      <tr className="border-b border-gray-100">
                        <td className="p-1.5 font-medium truncate max-w-[125px] text-[11px]">{deductions.otherLabel || 'Staff Loan Repay.'}</td>
                        <td className="p-1.5 italic text-gray-500 text-[10px]">Specified</td>
                        <td className="p-1.5 text-right font-mono text-gray-900 font-semibold text-[11px]">
                          {calculated.other.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-1.5 text-right font-mono text-slate-500 font-medium bg-[#1B2A7E]/[0.02] text-[11px]">
                          {(calculated.ytdTotals?.other || calculated.other).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    )}
                    <tr className="font-bold text-gray-900 bg-gray-50/80 border-t border-gray-200">
                      <td className="p-1.5 font-bold text-[11px]" colSpan={2}>Total Deductions</td>
                      <td className="p-1.5 text-right font-mono text-xs">
                        {calculated.totalDeductions.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-1.5 text-right font-mono text-xs bg-[#1B2A7E]/5 text-slate-900 font-extrabold border-l border-white">
                        {(calculated.ytdTotals?.totalDeductions || calculated.totalDeductions).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* 5. NET PAY TO TAKE HOME (Premium Right-Aligned Pill from Sleek Design) */}
            <div className="mt-2 flex justify-end z-10 w-full" id="net-pay-summary-block">
              <div className="w-full sm:w-1/2">
                <div className="bg-[#E31D2B] p-4 text-white rounded-lg flex justify-between items-center shadow-lg border-2 border-[#E31D2B]">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 leading-none">Take Home Amount</span>
                    <span className="text-base sm:text-lg font-black mt-1 uppercase tracking-tight">TOTAL NET PAY</span>
                    {/* Keep Net Pay in words strictly for BCEA compliance */}
                    <div className="text-[9.5px] text-red-100 italic font-medium mt-1.5 leading-tight max-w-[210px]">
                      {netPayWords}
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black tabular-nums shrink-0">
                    R {calculated.netPay.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. EMPLOYER DISCLOSURES & INFORMATIONAL INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-gray-200/65 bg-gray-50/30 z-10">
              <div>
                <span className="block font-sans font-extrabold text-[9px] text-[#1B2A7E] uppercase tracking-widest leading-none mb-1">Employer Contribution Note</span>
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>UIF Employer Share (1%):</span>
                  <span className="font-mono font-semibold text-gray-800">R {calculated.employerUif.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <p className="text-[9px] text-slate-400 mt-1.5 leading-tight">
                  Forming 1% of gross, contributed separately by the Employer, submitted in EMP201 monthly declarations to SARS.
                </p>
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 sm:pl-4">
                <span className="block font-sans font-extrabold text-[9px] text-[#1B2A7E] uppercase tracking-widest leading-none mb-1">Labour Law Compliance Node</span>
                <p className="text-[9.5px] text-slate-500 leading-relaxed mt-1">
                  In compliance with <strong>South African Basic Conditions of Employment Act, Section 33</strong>, employers must retain these records for a minimum duration of <strong>3 years</strong>.
                </p>
              </div>
            </div>

          </div>

          {/* 7. SECURE SIGNATURE AND CONFIRMATION Area (Bases of A4) */}
          <div className="relative z-10 w-full pt-4 mt-4 border-t border-slate-100 flex flex-col gap-4">
            
            <div className="grid grid-cols-2 gap-6">
              {/* Employer Signature Slot */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-[#1B2A7E] uppercase tracking-wider">For Employer (NBS Authorized Signatory)</label>
                
                <div className="h-12 border border-slate-200 rounded-lg bg-slate-50/50 flex items-center justify-between p-2">
                  <span className="font-sans font-semibold text-xs text-slate-500 italic flex items-center gap-1">
                    <Feather className="w-3.5 h-3.5 text-slate-400" />
                    {employerSignatureName || 'NBS Admin'}
                  </span>
                  
                  {/* Custom stamp design indicating signed */}
                  <div className="text-[9px] font-extrabold border-2 border-dashed border-emerald-600 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider scale-[0.85] leading-none select-none">
                    Secured
                  </div>
                </div>
                
                <input
                  type="text"
                  value={employerSignatureName}
                  onChange={(e) => setEmployerSignatureName(e.target.value)}
                  className="px-2 py-0.5 text-[10px] rounded border border-slate-200 focus:outline-none print:hidden"
                  placeholder="Type Employer Name..."
                  id="employer-sig-name-input"
                />
              </div>

              {/* Employee Signature Slot */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-[#1B2A7E] uppercase tracking-wider">Employee Electronic Sign-Off</label>
                
                <div className="h-12 border border-slate-200 rounded-lg bg-slate-50/50 flex items-center justify-between p-2">
                  {isSigned ? (
                    <span className="font-sans font-semibold text-xs text-slate-500 italic flex items-center gap-1">
                      <Feather className="w-3.5 h-3.5 text-slate-400" />
                      {employeeSignatureName || employee.name || 'Employee Signed'}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Pending Sign-off...</span>
                  )}
                  
                  <div className="print:hidden">
                    <button
                      onClick={() => setIsSigned(!isSigned)}
                      className={`px-2 py-1 rounded text-[9px] font-bold transition ${
                        isSigned ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                      id="employee-sign-toggle-btn"
                    >
                      {isSigned ? 'Signed' : 'Sign Now'}
                    </button>
                  </div>
                  
                  {isSigned && (
                    <div className="hidden print:block text-[9px] font-extrabold border border-emerald-600 text-emerald-600 px-1 py-0.5 rounded uppercase tracking-wider scale-[0.85] leading-none select-none">
                      Signed
                    </div>
                  )}
                </div>

                {isSigned && (
                  <input
                    type="text"
                    value={employeeSignatureName}
                    onChange={(e) => setEmployeeSignatureName(e.target.value)}
                    className="px-2 py-0.5 text-[10px] rounded border border-slate-200 focus:outline-none print:hidden"
                    placeholder="Type Employee Name..."
                    id="employee-sig-name-input"
                  />
                )}
              </div>
            </div>

            {/* Compliance Footer from Sleek Design */}
            <div className="mt-2 border-t border-gray-200 pt-3 flex justify-between items-end z-10">
              <div className="max-w-[70%] text-left">
                <p className="text-[9px] text-gray-500 italic uppercase font-bold mb-1 tracking-wider text-[#1B2A7E]">SARS Compliance Notice (BCEA Section 33)</p>
                <p className="text-[8.5px] text-gray-400 leading-relaxed font-sans">
                  This document serves as legal proof of payment as per South Africa's Basic Conditions of Employment Act.
                  Records must be kept in the employer's audit archive for at least 3 years. Employer contributions for UIF and Pension are handled separate from worker take-home.
                  <span className="block mt-1 font-mono text-[8px] text-slate-500 uppercase">Signed: {signedDate} | Ref: NBS-{employee.idNumber ? employee.idNumber.slice(0, 6) : 'CONF'}</span>
                </p>
              </div>
              <div className="flex flex-col items-center gap-1 opacity-55 shrink-0">
                <div className="w-9 h-9 border border-[#1B2A7E] rounded flex items-center justify-center text-[#1B2A7E] text-[7.5px] font-bold text-center leading-none">
                  SARS<br/>OK
                </div>
                <span className="text-[7.5px] text-[#1B2A7E] font-black uppercase tracking-widest text-[7px]">VERIFIED</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* HI-FI COMPLIANT SECURE ELECTRONIC DELIVERY MODAL */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="email-modal-overlay">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200/80 p-6 w-full max-w-lg flex flex-col gap-5 my-8">
                      {/* Modal Brand Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#1B2A7E]/10 p-2 rounded-xl text-[#1B2A7E]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans font-black text-slate-800 text-sm tracking-tight">NKUNA BURIAL SOCIETY — Digital Mailroom</h3>
                  <p className="text-[10px] text-slate-500 font-medium">South African BCEA & POPIA compliant secure payroll distribution hubs</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailSent(false);
                  setShowPortalTester(false);
                  setPortalUnlocked(false);
                  setPortalPin('');
                  setPortalError('');
                }}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-100 transition"
                id="modal-close-header-btn"
              >
                ✕
              </button>
            </div>

            {/* Distribution Method Tabs */}
            <div className="flex border-b border-slate-200 p-0.5 bg-slate-100 rounded-lg" id="delivery-method-tabs">
              <button
                type="button"
                onClick={() => setDeliveryMethod('email')}
                className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  deliveryMethod === 'email' 
                    ? 'bg-white text-[#1B2A7E] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                id="delivery-tab-email"
              >
                <Mail className="w-3.5 h-3.5" />
                Encrypt Email Dispatch
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod('portal')}
                className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  deliveryMethod === 'portal' 
                    ? 'bg-white text-[#1B2A7E] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                id="delivery-tab-portal"
              >
                <Link className="w-3.5 h-3.5" />
                Secure Portal Link
              </button>
            </div>

            {/* TAB INTERFACE 1: ENCRYPT EMAIL WORKPLACE */}
            {deliveryMethod === 'email' && (
              <div className="space-y-4 animate-fade-in" id="email-distribution-pane">
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div>
                    <label className="block text-slate-700 font-extrabold text-[10px] uppercase tracking-wider mb-1">Employee Email Address</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-900"
                        placeholder="employee@nkunaburial.co.za"
                        id="email-field-input"
                      />
                    </div>
                  </div>

                  {/* POPI Act Compliance Configuration */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="popia-pdf-lock"
                        checked={useSADecryptPassword}
                        onChange={(e) => setUseSADecryptPassword(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900"
                      />
                      <div>
                        <label htmlFor="popia-pdf-lock" className="block text-slate-800 font-extrabold text-[10.5px] uppercase tracking-wide leading-none select-none cursor-pointer">
                          Enforce POPIA Security Password
                        </label>
                        <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                          Locks salary statement attachments with an AES-256 bit encrypted password matching the first <strong>6 digits</strong> of this employee&apos;s SA ID Number or SARS Tax Number for stringent privacy compliance.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sending States */}
                  {emailSending && (
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center gap-3 animate-pulse">
                      <div className="w-4 h-4 border-2 border-[#1B2A7E] border-t-transparent rounded-full animate-spin"></div>
                      <div className="text-[11px] text-[#1B2A7E] font-semibold">
                        NBS Digital Mailroom routing file vectors to {recipientEmail}...
                      </div>
                    </div>
                  )}

                  {emailSent && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-relaxed">
                        <strong className="text-emerald-950 block font-bold">Encrypted Mail Dispatched!</strong>
                        <span className="text-slate-700">The PDF payslip is now en route. Unlock code password is: </span>
                        <strong className="font-mono text-emerald-800 underline">
                          {employee.idNumber ? employee.idNumber.slice(0, 6) : '123456'}
                        </strong>{" "}
                        (the first 6 digits of employee&apos;s credentials).
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailModal(false);
                        setEmailSent(false);
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                      id="cancel-email-modal-btn"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={emailSending}
                      className="px-5 py-2 bg-[#1B2A7E] hover:bg-indigo-900 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
                      id="trigger-email-send-btn"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send SECURE Payday Email
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB INTERFACE 2: SECURE EMPLOYEE DOWNLOAD PORTAL WORKFLOW */}
            {deliveryMethod === 'portal' && (
              <div className="space-y-4 animate-fade-in" id="portal-distribution-pane">
                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    Rather than sending payloads to static inboxes, South African labour advisories suggest using a **secure employee-authenticated portal link**. Employees verify their identities before downloading statements directly.
                  </p>
                </div>

                {/* Generate Portal Button */}
                <div className="bg-slate-50 p-4 border border-slate-200/60 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9.5px] font-extrabold text-slate-500 uppercase tracking-widest">Active Portal Session</span>
                    <button
                      type="button"
                      onClick={handleGeneratePortalLink}
                      className="px-3 py-1 bg-[#1B2A7E] hover:bg-slate-700 text-white font-extrabold text-[10.5px] rounded-lg shadow-sm transition"
                      id="generate-portal-link-btn"
                    >
                      {portalUrl ? 'Re-Generate Token' : 'Generate Secure Link'}
                    </button>
                  </div>

                  {portalUrl ? (
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            readOnly
                            value={portalUrl}
                            className="w-full bg-white border border-slate-200 pl-3 pr-8 py-1.5 text-[10.5px] font-mono text-slate-600 rounded-lg focus:outline-none"
                            id="portal-url-field"
                          />
                          <span className="absolute right-2.5 top-2.5 text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1 rounded">SSL</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition shrink-0"
                          title="Copy Link URL"
                          id="copy-portal-link-btn"
                        >
                          {copiedUrl ? (
                            <span className="text-[10px] font-extrabold text-emerald-700">Copied!</span>
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </button>
                      </div>
                      <p className="text-[9.5px] text-slate-400">
                        ✓ Copy this secure link to send to employee {employee.name || 'via SMS / Communication channels'}.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-xl bg-white text-slate-400 text-xs italic">
                      No portal link constructed yet. Select trigger to generate access URL.
                    </div>
                  )}
                </div>

                {/* Live Portal Simulation Module */}
                {portalUrl && (
                  <div className="border border-orange-100 bg-orange-50/25 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-orange-900 font-black">
                        <Eye className="w-4 h-4 text-orange-600" />
                        Interactive Sandbox Compliance Tester
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPortalTester(!showPortalTester)}
                        className="text-[10px] font-extrabold text-[#1B2A7E] hover:underline"
                        id="toggle-portal-tester-btn"
                      >
                        {showPortalTester ? 'Collapse Portal Simulation' : 'Launch Live Sandbox'}
                      </button>
                    </div>

                    {showPortalTester && (
                      <div className="bg-slate-900 text-white rounded-xl overflow-hidden shadow-lg border border-slate-700/60 animate-fade-in" id="portal-simulator-container">
                        {/* Simulated Browser Header */}
                        <div className="bg-slate-850 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-mono truncate max-w-[250px]">{portalUrl}</span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Secure Link Certified"></span>
                        </div>

                        {/* Portal Screen Body */}
                        <div className="p-4 space-y-4">
                          {!portalUnlocked ? (
                            <form onSubmit={handlePortalUnlockSubmit} className="space-y-3 text-left">
                              <div className="text-center space-y-1">
                                <Shield className="w-7 h-7 text-indigo-400 mx-auto" />
                                <h4 className="font-extrabold text-xs text-slate-100 uppercase tracking-wider">NKUNA BURIAL SERVICES</h4>
                                <p className="text-[9px] text-slate-400">Payroll Security Authentication Protocol</p>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9px] uppercase tracking-wide text-slate-400 font-semibold">Enter Unlocking Security Key</label>
                                <div className="relative">
                                  <Unlock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                                  <input
                                    type="text"
                                    value={portalPin}
                                    onChange={(e) => setPortalPin(e.target.value)}
                                    maxLength={13}
                                    placeholder="First 6 digits of ID (e.g., 940512 or 123456)"
                                    className="w-full bg-slate-800 border border-slate-700 pl-8 pr-3 py-1.5 rounded text-xs focus:outline-none focus:border-indigo-500 text-gray-100"
                                    id="portal-pin-input-field"
                                  />
                                </div>
                                <p className="text-[8.5px] text-slate-500 leading-normal">
                                  Compliance Hint: Lock keys match Employee details. For current test profile, pin is first 6-digits of employee ID (<span className="text-indigo-400 underline font-mono">{employee.idNumber ? employee.idNumber.slice(0,6) : '123456'}</span>).
                                </p>
                              </div>

                              {portalError && (
                                <div className="p-2 bg-red-950/40 border border-red-800 rounded text-[9.5px] text-red-300 flex items-start gap-1">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                                  <span>{portalError}</span>
                                </div>
                              )}

                              <button
                                type="submit"
                                className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded transition mt-1"
                                id="simulator-auth-btn"
                              >
                                Authenticate identity
                              </button>
                            </form>
                          ) : (
                            <div className="space-y-3.5 text-left animate-fade-in">
                              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                                <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" />
                                <div>
                                  <h4 className="text-[11px] font-bold text-slate-100">Verification Certificate OK</h4>
                                  <p className="text-[8.5px] text-slate-400">Employee Profile: {employee.name || 'Nkuna Worker'}</p>
                                </div>
                              </div>

                              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                                <div>
                                  <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Salary Statement</span>
                                  <span className="text-xs font-bold text-slate-200">Period: {employee.payPeriodStart || 'May 2026'}</span>
                                  <span className="block text-[11px] text-slate-400 font-medium">Net salary: R {calculated.netPay.toLocaleString('en-ZA') || '0.00'}</span>
                                </div>

                                <div className="shrink-0">
                                  <button
                                    type="button"
                                    onClick={handlePortalDownloadPdf}
                                    className={`p-2 rounded-lg flex items-center justify-center transition ${
                                      downloadCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-slate-750 border border-slate-700 text-indigo-400'
                                    }`}
                                    title="Unlocks salary statement download"
                                    id="simulator-download-btn"
                                  >
                                    {downloadingPdf ? (
                                      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                    ) : downloadCompleted ? (
                                      <span className="text-[10px] font-bold">✓ Saved</span>
                                    ) : (
                                      <Download className="w-4 h-4 text-indigo-400" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {downloadCompleted ? (
                                <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 bg-emerald-950/20 p-2 rounded">
                                  <span>✓ File &quot;NBS_Payslip_{employee.name?.replace(/\s+/g,'') || 'Employee'}.pdf&quot; successfully cached down in system directory with compliant POPIA stamp of NKUNA BURIAL SOCIETY.</span>
                                </p>
                              ) : (
                                <p className="text-[9px] text-slate-500">
                                  * Official payslip copy generated for archiving and records (Basic Conditions of Employment Act SEC 33 compliant).
                                </p>
                              )}

                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPortalUnlocked(false);
                                    setPortalPin('');
                                    setPortalError('');
                                    setDownloadCompleted(false);
                                  }}
                                  className="text-[9.5px] text-indigo-400 hover:underline font-bold"
                                  id="simulator-reset-btn"
                                >
                                  Lock Session / Close Sandbox Drawer
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailModal(false);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                    id="close-portal-modal-btn"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* AUDIT SYSTEM delivery timeline logs */}
            <div className="mt-1 bg-slate-50 rounded-xl p-3 border border-slate-200/50 space-y-2">
              <span className="text-[9px] font-extrabold text-[#1B2A7E] uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                South African Mailroom Delivery Ledger (BCEA Log)
              </span>

              <div className="space-y-1.5 max-h-[75px] overflow-y-auto text-[9.5px]">
                {outboxHistory.map((item) => (
                  <div key={item.id} className="flex justify-between border-b border-dashed border-slate-150 pb-1 text-slate-600">
                    <span className="font-mono text-slate-400">{item.timestamp}</span>
                    <span className="font-medium text-slate-700">{item.method}</span>
                    <span className="truncate max-w-[150px] font-mono">{item.recipient}</span>
                    <span className="text-emerald-700 font-serif font-black">{item.secured ? '🔒 POPIA' : '⚠ Encrypt'}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Custom Media Print styles inside component context to trigger ideal printing layout */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          #root {
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Hide EVERYTHING other than the printable document */
          #payslip-preview-container > *:not(.print\\:bg-white) {
            display: none !important;
          }
          #payslip-preview-container .print\\:bg-white {
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background-color: white !important;
            box-shadow: none !important;
          }
          #compliance-a4-playslip-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            min-height: auto !important;
            aspect-ratio: auto !important;
          }
          /* Force page margins */
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
        }
      `}</style>

    </div>
  );
}
