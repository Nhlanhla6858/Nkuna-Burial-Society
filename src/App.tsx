import React, { useState, useEffect } from 'react';
import { EmployerDetails, EmployeeDetails, Earnings, Deductions, PayslipRecord } from './types';
import { calculatePaye, calculateUif } from './utils/taxCalc';
import { PayslipForm } from './components/PayslipForm';
import { PayslipPreview } from './components/PayslipPreview';
import { ComplianceLog } from './components/ComplianceLog';
import { ComplianceGuide } from './components/ComplianceGuide';
import { NbsLogo } from './components/NbsLogo';
import { 
  Calculator, 
  Archive, 
  BookOpen, 
  Smartphone, 
  LayoutGrid, 
  Database,
  FileCheck,
  Building2,
  CalendarDays,
  HelpCircle,
  FileText
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'nbs_payslip_records';

export default function App() {
  // 1. Initial State Configurations
  const initialEmployer: EmployerDetails = {
    companyName: 'NKUNA BURIAL SOCIETY',
    address: 'Plot 24, Bronkhorstspruit Road, Pretoria East, 0002, South Africa',
    coRegNo: '2015/098432/08',
    payeRef: '7100784321', // compliant 10-digit tax ref starting with 7
    uifRef: 'U100784321',
    contact: 'info@nkunaburial.co.za / +27 (0)12 809 3982',
  };

  const initialEmployee: EmployeeDetails = {
    name: '',
    occupation: '',
    idNumber: '',
    taxNumber: '',
    payPeriodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substring(0, 10),
    payPeriodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().substring(0, 10),
    payDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().substring(0, 10),
    ageGroup: 'under65',
  };

  const initialEarnings: Earnings = {
    basicSalary: 0,
    commission: 0,
    allowance: 0,
  };

  const initialDeductions: Deductions = {
    paye: 0,
    payeType: 'auto',
    uif: 0,
    uifType: 'auto',
    pensionType: 'percent',
    pensionValue: 0,
    otherLabel: 'Other Deduction',
    otherAmount: 0,
  };

  // State managers
  const [employer, setEmployer] = useState<EmployerDetails>(initialEmployer);
  const [employee, setEmployee] = useState<EmployeeDetails>(initialEmployee);
  const [earnings, setEarnings] = useState<Earnings>(initialEarnings);
  const [deductions, setDeductions] = useState<Deductions>(initialDeductions);
  
  // YTD Override Offsets (For custom setup)
  const [ytdOffsets, setYtdOffsets] = useState({
    basicSalary: 0,
    commission: 0,
    allowance: 0,
    paye: 0,
    uif: 0,
    pension: 0,
    other: 0,
  });
  const [useAutoYtd, setUseAutoYtd] = useState(true);
  
  // Historical Records (Statutory 3-Year Archive)
  const [records, setRecords] = useState<PayslipRecord[]>([]);
  
  // UI Tabs / Controls
  const [activeTab, setActiveTab] = useState<'editor' | 'vault' | 'guide'>('editor');
  const [lastNotification, setLastNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Load compliance records from localStorage on initial render
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setRecords(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load local storage archive:', err);
    }
  }, []);

  // Save compliance records helper
  const saveRecordsToLocalStorage = (newRecords: PayslipRecord[]) => {
    try {
      setRecords(newRecords);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newRecords));
    } catch (err) {
      console.error('Failed to save to local storage:', err);
    }
  };

  // 2. Computed Values Panel
  const grossEarnings = (earnings.basicSalary || 0) + (earnings.commission || 0) + (earnings.allowance || 0);
  
  // Calculate pension contribution flat amount
  const pensionContribution = deductions.pensionType === 'percent'
    ? ((earnings.basicSalary || 0) * (deductions.pensionValue || 0)) / 100
    : (deductions.pensionValue || 0);

  // South African Taxable Income = Gross Remuneration - pension contributions
  const taxableIncome = Math.max(0, grossEarnings - pensionContribution);

  // Compile calculations in real-time
  const calculatedPaye = deductions.payeType === 'auto'
    ? calculatePaye(taxableIncome, employee.ageGroup)
    : (deductions.paye || 0);

  const calculatedUif = deductions.uifType === 'auto'
    ? calculateUif(grossEarnings)
    : (deductions.uif || 0);

  const totalDeductions = calculatedPaye + calculatedUif + pensionContribution + (deductions.otherAmount || 0);
  const netPay = Math.max(0, grossEarnings - totalDeductions);

  // Additional stats
  const employerUifContribution = calculateUif(grossEarnings);

  // Helper to calculate South African Tax Year months elapsed (starts March 1st)
  const getSAFiscalMonths = (payDateStr: string): number => {
    if (!payDateStr) return 1;
    const d = new Date(payDateStr);
    if (isNaN(d.getTime())) return 1;
    const month = d.getMonth(); // 0-indexed, 0 = January, 11 = December
    // March is Index 2. March=1, April=2, ..., Feb=12
    const map: { [key: number]: number } = {
      2: 1,  // March
      3: 2,  // April
      4: 3,  // May
      5: 4,  // June
      6: 5,  // July
      7: 6,  // August
      8: 7,  // September
      9: 8,  // October
      10: 9, // November
      11: 10,// December
      0: 11, // January
      1: 12  // February
    };
    return map[month] || 1;
  };

  const elapsedMonths = getSAFiscalMonths(employee.payDate);

  // Helper to sum matching records from our vault (Compliance Registry)
  const getHistoricalYtdForField = (field: string): number => {
    if (!employee.name) return 0;
    
    const payDateObj = employee.payDate ? new Date(employee.payDate) : new Date();
    if (isNaN(payDateObj.getTime())) return 0;
    const payYear = payDateObj.getFullYear();
    const payMonth = payDateObj.getMonth();
    
    // South African tax year ranges from March 1st to late February
    const taxYearStartYear = payMonth >= 2 ? payYear : payYear - 1;
    const taxYearStart = new Date(taxYearStartYear, 2, 1);
    const taxYearEnd = new Date(taxYearStartYear + 1, 1, 28, 23, 59, 59);
    
    const matchingRecords = records.filter(rec => {
      // Match by exact same ID or name
      const isSameEmployee = 
        (rec.employee.idNumber && employee.idNumber && rec.employee.idNumber === employee.idNumber) ||
        (rec.employee.name.toLowerCase().trim() === employee.name.toLowerCase().trim());
        
      if (!isSameEmployee) return false;
      
      const recPayDate = rec.employee.payDate ? new Date(rec.employee.payDate) : null;
      if (!recPayDate || isNaN(recPayDate.getTime())) return false;
      
      // Must be in the same South African tax year, and before current date
      return recPayDate >= taxYearStart && recPayDate <= taxYearEnd && recPayDate < payDateObj;
    });
    
    return matchingRecords.reduce((sum, rec) => {
      if (field === 'basicSalary') return sum + (rec.earnings.basicSalary || 0);
      if (field === 'commission') return sum + (rec.earnings.commission || 0);
      if (field === 'allowance') return sum + (rec.earnings.allowance || 0);
      if (field === 'paye') return sum + (rec.calculated.paye || 0);
      if (field === 'uif') return sum + (rec.calculated.uif || 0);
      if (field === 'pension') return sum + (rec.calculated.pension || 0);
      if (field === 'other') return sum + (rec.calculated.other || 0);
      return sum;
    }, 0);
  };

  // Compute final YTD totals for columns
  const currentBasicSalary = earnings.basicSalary || 0;
  const basicSalaryYtd = currentBasicSalary + 
    getHistoricalYtdForField('basicSalary') + 
    (useAutoYtd ? (currentBasicSalary * (elapsedMonths - 1)) : ytdOffsets.basicSalary);
    
  const currentCommission = earnings.commission || 0;
  const commissionYtd = currentCommission + 
    getHistoricalYtdForField('commission') + 
    (useAutoYtd ? (currentCommission * (elapsedMonths - 1)) : ytdOffsets.commission);

  const currentAllowance = earnings.allowance || 0;
  const allowanceYtd = currentAllowance + 
    getHistoricalYtdForField('allowance') + 
    (useAutoYtd ? (currentAllowance * (elapsedMonths - 1)) : ytdOffsets.allowance);

  const currentPaye = calculatedPaye || 0;
  const payeYtd = currentPaye + 
    getHistoricalYtdForField('paye') + 
    (useAutoYtd ? (currentPaye * (elapsedMonths - 1)) : ytdOffsets.paye);

  const currentUif = calculatedUif || 0;
  const uifYtd = currentUif + 
    getHistoricalYtdForField('uif') + 
    (useAutoYtd ? (currentUif * (elapsedMonths - 1)) : ytdOffsets.uif);

  const currentPension = pensionContribution || 0;
  const pensionYtd = currentPension + 
    getHistoricalYtdForField('pension') + 
    (useAutoYtd ? (currentPension * (elapsedMonths - 1)) : ytdOffsets.pension);

  const currentOther = deductions.otherAmount || 0;
  const otherYtd = currentOther + 
    getHistoricalYtdForField('other') + 
    (useAutoYtd ? (currentOther * (elapsedMonths - 1)) : ytdOffsets.other);

  const grossEarningsYtd = basicSalaryYtd + commissionYtd + allowanceYtd;
  const totalDeductionsYtd = payeYtd + uifYtd + pensionYtd + otherYtd;
  const netPayYtd = Math.max(0, grossEarningsYtd - totalDeductionsYtd);

  // Auto-recalculate estimated fields in state
  useEffect(() => {
    if (deductions.payeType === 'auto') {
      setDeductions(prev => ({ ...prev, paye: calculatedPaye }));
    }
  }, [taxableIncome, employee.ageGroup, deductions.payeType]);

  useEffect(() => {
    if (deductions.uifType === 'auto') {
      setDeductions(prev => ({ ...prev, uif: calculatedUif }));
    }
  }, [grossEarnings, deductions.uifType]);

  // Toast Notification Helper
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setLastNotification({ message, type });
    setTimeout(() => {
      setLastNotification(null);
    }, 4500);
  };

  // 3. System Handlers
  const handleLoadDemo = () => {
    setEmployee({
      name: 'Sipho Khumalo',
      occupation: 'Senior Cemetery & Family Consultant',
      idNumber: '8507115082084', // Valid Louhn birthdate
      taxNumber: '2498532450',
      payPeriodStart: '2026-05-01',
      payPeriodEnd: '2026-05-31',
      payDate: '2026-05-31',
      ageGroup: 'under65',
    });
    setEarnings({
      basicSalary: 16500,
      commission: 4500,
      allowance: 1200,
    });
    setDeductions({
      paye: 0, // Will be overridden by auto-calculator anyway
      payeType: 'auto',
      uif: 0,
      uifType: 'auto',
      pensionType: 'percent',
      pensionValue: 7.5,
      otherLabel: 'Staff Cash Loan Repayment',
      otherAmount: 450,
    });
    showToast('Loaded compliant NBS demonstration profile details!', 'info');
  };

  const handleClear = () => {
    setEmployee(initialEmployee);
    setEarnings(initialEarnings);
    setDeductions(initialDeductions);
    showToast('All editor values safely reset', 'info');
  };

  const handleSave = () => {
    if (!employee.name) {
      alert('Compliance Error: Employee Name can not be empty.');
      return;
    }

    const newRecord: PayslipRecord = {
      id: `nbs-${Date.now()}`,
      createdAt: new Date().toISOString(),
      employer,
      employee,
      earnings,
      deductions,
      calculated: {
        grossEarnings,
        paye: calculatedPaye,
        uif: calculatedUif,
        pension: pensionContribution,
        other: deductions.otherAmount,
        totalDeductions,
        netPay,
        employerUif: employerUifContribution,
        ytdTotals: {
          basicSalary: basicSalaryYtd,
          commission: commissionYtd,
          allowance: allowanceYtd,
          grossEarnings: grossEarningsYtd,
          paye: payeYtd,
          uif: uifYtd,
          pension: pensionYtd,
          other: otherYtd,
          totalDeductions: totalDeductionsYtd,
        }
      }
    };

    const updated = [newRecord, ...records];
    saveRecordsToLocalStorage(updated);
    showToast('Payslip successfully archived and saved to statutory 3-year compliance vault!');
  };

  const handleSelectRecord = (record: PayslipRecord) => {
    setEmployer(record.employer);
    setEmployee(record.employee);
    setEarnings(record.earnings);
    setDeductions(record.deductions);
    if (record.calculated.ytdTotals) {
      setUseAutoYtd(false);
      setYtdOffsets({
        basicSalary: record.calculated.ytdTotals.basicSalary - (record.earnings.basicSalary || 0),
        commission: record.calculated.ytdTotals.commission - (record.earnings.commission || 0),
        allowance: record.calculated.ytdTotals.allowance - (record.earnings.allowance || 0),
        paye: record.calculated.ytdTotals.paye - (record.calculated.paye || 0),
        uif: record.calculated.ytdTotals.uif - (record.calculated.uif || 0),
        pension: record.calculated.ytdTotals.pension - (record.calculated.pension || 0),
        other: record.calculated.ytdTotals.other - (record.calculated.other || 0),
      });
    } else {
      setUseAutoYtd(true);
    }
    setActiveTab('editor');
    showToast(`Loaded ${record.employee.name} payslip record in generator editor.`, 'info');
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(rec => rec.id !== id);
    saveRecordsToLocalStorage(updated);
    showToast('Compliance record successfully purged from local archive storage.', 'info');
  };

  const handleImportRecords = (imported: PayslipRecord[]) => {
    const combined = [...imported, ...records];
    // Filter duplicates by ID
    const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    saveRecordsToLocalStorage(unique);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#A2CEFF] via-[#EAF5FF] to-white bg-no-repeat bg-fixed flex flex-col text-slate-800 relative overflow-x-hidden" id="main-applet-container">
      {/* Decorative Cloud nodes abstracted from branding image */}
      <div className="absolute top-[8%] left-[10%] w-[35rem] h-[35rem] bg-white/40 rounded-full blur-[110px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[15%] right-[5%] w-[40rem] h-[40rem] bg-white/35 rounded-full blur-[130px] pointer-events-none z-0"></div>
      
      {/* 1. BRAND GLOBAL SYSTEM HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm print:hidden" id="global-system-header">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
          <NbsLogo size={42} />

          {/* Tab Selection */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200" id="navigation-pills">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'editor' 
                  ? 'bg-white text-[#1B2A7E] shadow-sm font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="pill-editor"
            >
              <Calculator className="w-3.5 h-3.5" />
              Generator & Calculator
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                activeTab === 'vault' 
                  ? 'bg-white text-[#1B2A7E] shadow-sm font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="pill-vault"
            >
              <Database className="w-3.5 h-3.5" />
              Compliance Vault
              {records.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 text-[9px] font-bold bg-[#E31D2B] text-white rounded-full flex items-center justify-center px-1 shadow">
                  {records.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'guide' 
                  ? 'bg-white text-[#1B2A7E] shadow-sm font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="pill-guide"
            >
              <BookOpen className="w-3.5 h-3.5" />
              BCEA Law Guide
            </button>
          </div>
        </div>
      </header>

      {/* 2. LIVE INTERACTIVE PAGE WORKSPACE */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6 relative" id="main-interactive-workspace">
        
        {/* TOAST SYSTEM (Bottom Left) */}
        {lastNotification && (
          <div 
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border transition-all duration-300 animate-slide-up bg-white max-w-sm ${
              lastNotification.type === 'success' ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900' : 'border-blue-100 bg-blue-50/50 text-blue-900'
            }`}
            id="global-toast-agent"
          >
            <div className="rounded-full bg-white p-1 shadow">
              <FileCheck className={`w-4 h-4 ${lastNotification.type === 'success' ? 'text-emerald-700' : 'text-blue-700'}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">Payroll Action Notification</span>
              <span className="text-[11px] leading-snug mt-0.5 text-slate-600">{lastNotification.message}</span>
            </div>
          </div>
        )}

        {/* CONTROLLER SECTION SWAP */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="generator-workspace-layout">
            
            {/* Left Hand: Config Inputs */}
            <div className="lg:col-span-5 flex flex-col gap-6 print:hidden">
              <div className="flex flex-col">
                <h1 className="font-sans font-black text-2xl tracking-tight text-slate-800 leading-tight">
                  SARS & BCEA Payslip Generator
                </h1>
                <p className="text-slate-500 text-xs mt-1 leading-normal">
                  Calculate and archive South African labour law compliant payslips with absolute precision.
                </p>
              </div>

              {/* Calculator Form */}
              <PayslipForm
                employer={employer}
                setEmployer={setEmployer}
                employee={employee}
                setEmployee={setEmployee}
                earnings={earnings}
                setEarnings={setEarnings}
                deductions={deductions}
                setDeductions={setDeductions}
                onSave={handleSave}
                onClear={handleClear}
                onLoadDemo={handleLoadDemo}
                grossEarnings={grossEarnings}
                ytdOffsets={ytdOffsets}
                setYtdOffsets={setYtdOffsets}
                useAutoYtd={useAutoYtd}
                setUseAutoYtd={setUseAutoYtd}
                elapsedMonths={elapsedMonths}
              />
              
              {/* Quick Compact Legal Summary under form */}
              <div className="p-4 bg-slate-100/60 rounded-xl border border-slate-200/50 flex flex-col gap-1 text-[11px] text-slate-500">
                <span className="font-bold text-slate-700 uppercase tracking-widest text-[9px]">COMPLIANCE SNAPSHOT (SECTION 33)</span>
                <p className="leading-snug">
                  ✓ Includes PAYE ref & UIF contributions. Capped UIF statutory deduction matches standard 1% ceiling (R177.12). Stored history meets 3-year record mandate.
                </p>
              </div>
            </div>

            {/* Right Hand: Render sheet preview */}
            <div className="lg:col-span-7" id="preview-workspace-pane">
              <PayslipPreview
                employer={employer}
                employee={employee}
                earnings={earnings}
                deductions={deductions}
                calculated={{
                  grossEarnings,
                  paye: calculatedPaye,
                  uif: calculatedUif,
                  pension: pensionContribution,
                  other: deductions.otherAmount,
                  totalDeductions,
                  netPay,
                  employerUif: employerUifContribution,
                  ytdTotals: {
                    basicSalary: basicSalaryYtd,
                    commission: commissionYtd,
                    allowance: allowanceYtd,
                    grossEarnings: grossEarningsYtd,
                    paye: payeYtd,
                    uif: uifYtd,
                    pension: pensionYtd,
                    other: otherYtd,
                    totalDeductions: totalDeductionsYtd
                  }
                }}
              />
            </div>

          </div>
        )}

        {activeTab === 'vault' && (
          <div className="animate-fade-in" id="vault-workspace-layout">
            <div className="flex flex-col mb-4">
              <h1 className="font-sans font-black text-2xl tracking-tight text-slate-800">
                Audit Registry & Storage Vault
              </h1>
              <p className="text-slate-500 text-xs mt-1">
                South African Basic Conditions of Employment Act requires maintaining these comprehensive records for 3 years.
              </p>
            </div>

            <ComplianceLog
              records={records}
              onSelectRecord={handleSelectRecord}
              onDeleteRecord={handleDeleteRecord}
              onImportRecords={handleImportRecords}
            />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start animate-fade-in" id="guide-workspace-layout">
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="font-sans font-black text-2xl tracking-tight text-slate-800">
                  Regulatory Legal Reference
                </h1>
                <p className="text-slate-500 text-xs mt-1">
                  Reference and audit policies concerning South African BCEA regulations.
                </p>
              </div>
              <ComplianceGuide />
            </div>

            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Building2 className="w-5 h-5 text-red-650 shrink-0" style={{ color: '#E31D2B' }} />
                <h3 className="font-bold text-slate-800 text-sm">NKUNA BURIAL SOCIETY — Compliance Policy</h3>
              </div>

              <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
                <p>
                  As a registered company <strong className="font-mono text-slate-700">Reg No. 2015/098432/08</strong>, NbS is fully committed to compliance and protecting employee rights. Every employee payroll run must strictly submit 1% UIF deduction capped at R177.12 alongside the corresponding employer 1% matching fund (another R177.12) to SARS.
                </p>
                <p>
                  <strong>Internal Payslip Delivery Checklists:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>Verify that employee Tax numbers are exactly 10 digits before saving/submitting filings.</li>
                  <li>Print payslips on double-sided high-grade A4 letterheads or distribute securely via encrypted electronic records.</li>
                  <li>Incentives and Variable commissions must be reported on the exact month of distribution to avoid SARS EMP501 mismatch penalties.</li>
                  <li>Ensure pension contributions are deducted from taxable base, reducing PAYE burden lawfully.</li>
                </ul>
              </div>

              <div className="p-4 bg-red-50/40 border border-red-100/50 rounded-xl text-[11px] text-red-900 mt-2 flex flex-col gap-1">
                <span className="font-bold flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  EMP201 Declarations Reminder
                </span>
                <p className="leading-snug text-slate-600">
                  Monthly EMP201 declarations (containing PAYE, UIF, and SDL) must be declared and settled with SARS on or before the <strong>7th of every month</strong>. Late declarations attract 10% penalties and compounding interest.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 4. FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs mt-12 print:hidden" id="global-system-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="font-sans font-extrabold text-[#E31D2B]">NBS</span>
            <span className="text-slate-500">|</span>
            <span className="text-[11px]">South African Payslip Compliance Engine v4.0.1</span>
          </div>

          <p className="text-slate-500 text-[10px]">&copy; 2026 NKUNA BURIAL SOCIETY. Licensed for Section 33 regulatory payroll auditing.</p>
        </div>
      </footer>
    </div>
  );
}
