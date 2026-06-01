import React, { useState, useEffect } from 'react';
import { EmployerDetails, EmployeeDetails, Earnings, Deductions, PayslipRecord } from '../types';
import { validateSouthAfricanID, validateSarsTaxNumber } from '../utils/taxCalc';
import { 
  Building2, 
  User, 
  Coins, 
  HandCoins, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle, 
  Sparkles,
  ArrowRight,
  CalendarDays,
  ShieldAlert,
  FileWarning
} from 'lucide-react';

interface PayslipFormProps {
  employer: EmployerDetails;
  setEmployer: React.Dispatch<React.SetStateAction<EmployerDetails>>;
  employee: EmployeeDetails;
  setEmployee: React.Dispatch<React.SetStateAction<EmployeeDetails>>;
  earnings: Earnings;
  setEarnings: React.Dispatch<React.SetStateAction<Earnings>>;
  deductions: Deductions;
  setDeductions: React.Dispatch<React.SetStateAction<Deductions>>;
  onSave: () => void;
  onClear: () => void;
  onLoadDemo: () => void;
  grossEarnings: number;
  ytdOffsets: {
    basicSalary: number;
    commission: number;
    allowance: number;
    paye: number;
    uif: number;
    pension: number;
    other: number;
  };
  setYtdOffsets: React.Dispatch<React.SetStateAction<{
    basicSalary: number;
    commission: number;
    allowance: number;
    paye: number;
    uif: number;
    pension: number;
    other: number;
  }>>;
  useAutoYtd: boolean;
  setUseAutoYtd: React.Dispatch<React.SetStateAction<boolean>>;
  elapsedMonths: number;
}

export function PayslipForm({
  employer,
  setEmployer,
  employee,
  setEmployee,
  earnings,
  setEarnings,
  deductions,
  setDeductions,
  onSave,
  onClear,
  onLoadDemo,
  grossEarnings,
  ytdOffsets,
  setYtdOffsets,
  useAutoYtd,
  setUseAutoYtd,
  elapsedMonths
}: PayslipFormProps) {
  // State for internal validations
  const [idValidation, setIdValidation] = useState<{ isValid: boolean; birthdate?: string; gender?: string; citizenship?: string }>({ isValid: false });
  const [taxValidation, setTaxValidation] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<'employer' | 'employee' | 'earnings' | 'deductions' | 'ytd'>('employer');
  const [showErrorsInDetail, setShowErrorsInDetail] = useState<boolean>(false);
  const [showComplianceBypassModal, setShowComplianceBypassModal] = useState<boolean>(false);

  // Validate SA ID number when it changes
  useEffect(() => {
    if (employee.idNumber) {
      const res = validateSouthAfricanID(employee.idNumber);
      setIdValidation(res);
    } else {
      setIdValidation({ isValid: false });
    }
  }, [employee.idNumber]);

  // Validate Tax reference number when it changes
  useEffect(() => {
    if (employee.taxNumber) {
      setTaxValidation(validateSarsTaxNumber(employee.taxNumber));
    } else {
      setTaxValidation(true);
    }
  }, [employee.taxNumber]);

  const handleEmployerChange = (field: keyof EmployerDetails, value: string) => {
    setEmployer(prev => ({ ...prev, [field]: value }));
  };

  const handleEmployeeChange = (field: keyof EmployeeDetails, value: any) => {
    setEmployee(prev => ({ ...prev, [field]: value }));
  };

  const handleEarningsChange = (field: keyof Earnings, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEarnings(prev => ({ ...prev, [field]: numValue }));
  };

  const handleDeductionsChange = (field: keyof Deductions, value: any) => {
    setDeductions(prev => ({ ...prev, [field]: value }));
  };

  const setPensionType = (type: 'flat' | 'percent') => {
    setDeductions(prev => ({ ...prev, pensionType: type, pensionValue: 0 }));
  };

  // Real-time Visual Validation Helpers
  const getEarningsFieldError = (field: keyof Earnings) => {
    const value = earnings[field];
    if (value < 0) {
      return "Value cannot be negative.";
    }
    if (field === 'basicSalary') {
      if (value > 500000) {
        return "Exceeds standard payroll safety limit (R500,000/mo).";
      }
    }
    if (field === 'commission') {
      if (value > 500000) {
        return "Exceeds standard safety limit (R500,000/mo).";
      }
    }
    if (field === 'allowance') {
      if (value > 100000) {
        return "Exceeds standard safety limit (R100,000/mo).";
      }
    }
    return null;
  };

  const getDeductionsFieldError = (field: keyof Deductions) => {
    if (field === 'paye') {
      if (deductions.payeType === 'manual') {
        const val = deductions.paye;
        if (val < 0) return "PAYE cannot be negative.";
        if (grossEarnings > 0 && val > grossEarnings * 0.45) {
          return "Manual PAYE exceeds highest South African statutory tax bracket (45% of gross).";
        }
      }
    }
    if (field === 'uif') {
      if (deductions.uifType === 'manual') {
        const val = deductions.uif;
        if (val < 0) return "UIF cannot be negative.";
        if (val > 177.12) {
          return "Manual UIF exceeds South African statutory maximum monthly limit (R177.12).";
        }
      }
    }
    if (field === 'pensionValue') {
      const val = deductions.pensionValue;
      if (val < 0) return "Pension value cannot be negative.";
      if (deductions.pensionType === 'percent') {
        if (val > 27.5) {
          return "Exceeds South African statutory tax-free contribution cap of 27.5% of remuneration.";
        }
      } else {
        if (val > 29166.67) {
          return "Exceeds South African statutory tax-free monthly cap (R29,166.67, based on R350k/year limit).";
        }
      }
    }
    if (field === 'otherAmount') {
      const val = deductions.otherAmount;
      if (val < 0) return "Amount cannot be negative.";
      if (grossEarnings > 0 && val > grossEarnings) {
        return "Deductions cannot exceed total gross earnings.";
      }
    }
    return null;
  };

  const getYtdFieldError = (field: keyof typeof ytdOffsets) => {
    const value = ytdOffsets[field];
    if (value < 0) {
      return "Value cannot be negative.";
    }
    if (field === 'basicSalary' || field === 'commission' || field === 'allowance') {
      if (value > 2000000) {
        return "Exceeds standard cumulative limit.";
      }
    }
    if (field === 'pension' && value > 350000) {
      return "Prior pension exceeds the statutory limit (R350,000).";
    }
    if (field === 'uif' && value > 177.12 * 12) {
      return "Prior UIF exceeds standard statutory ceiling limit.";
    }
    return null;
  };

  // Real-time compliance assessment
  const complianceIssues: {
    id: string;
    category: 'employer' | 'employee' | 'earnings' | 'deductions' | 'ytd';
    categoryLabel: string;
    type: 'critical' | 'warning';
    field: string;
    message: string;
  }[] = [];

  // 1. Employer checks
  if (!employer.companyName?.trim()) {
    complianceIssues.push({
      id: 'emp-name',
      category: 'employer',
      categoryLabel: 'Employer Info',
      type: 'critical',
      field: 'Company Name',
      message: 'Employer Company Name is required for BCEA statutory compliance.',
    });
  }
  if (!employer.address?.trim()) {
    complianceIssues.push({
      id: 'emp-addr',
      category: 'employer',
      categoryLabel: 'Employer Info',
      type: 'critical',
      field: 'Physical Address',
      message: 'Employer Physical Address must be provided on statutory payslips.',
    });
  }
  if (!employer.coRegNo?.trim()) {
    complianceIssues.push({
      id: 'emp-reg',
      category: 'employer',
      categoryLabel: 'Employer Info',
      type: 'warning',
      field: 'Company Reg No',
      message: 'Company Registration Number is highly recommended for official payroll files.',
    });
  }
  if (!employer.payeRef?.trim()) {
    complianceIssues.push({
      id: 'emp-paye',
      category: 'employer',
      categoryLabel: 'Employer Info',
      type: 'warning',
      field: 'SARS PAYE Ref',
      message: 'SARS PAYE Reference is missing. Mandatory for monthly EMP201 submissions.',
    });
  }
  if (!employer.uifRef?.trim()) {
    complianceIssues.push({
      id: 'emp-uif',
      category: 'employer',
      categoryLabel: 'Employer Info',
      type: 'warning',
      field: 'UIF Ref',
      message: 'UIF registration number is missing. Required for monthly worker benefit claims.',
    });
  }

  // 2. Employee checks
  if (!employee.name?.trim()) {
    complianceIssues.push({
      id: 'employee-name-issue',
      category: 'employee',
      categoryLabel: 'Employee Details',
      type: 'critical',
      field: 'Employee Name',
      message: 'Employee Name is required for BCEA compliance.',
    });
  }
  if (!employee.occupation?.trim()) {
    complianceIssues.push({
      id: 'employee-occ',
      category: 'employee',
      categoryLabel: 'Employee Details',
      type: 'warning',
      field: 'Occupation',
      message: 'Occupation / Job Title is missing but recommended under Section 33.',
    });
  }
  if (!employee.idNumber?.trim()) {
    complianceIssues.push({
      id: 'employee-id',
      category: 'employee',
      categoryLabel: 'Employee Details',
      type: 'critical',
      field: 'ID / Ref No',
      message: 'South African 13-digit ID Number is required for payroll archives.',
    });
  } else if (!idValidation.isValid) {
    complianceIssues.push({
      id: 'employee-id-valid',
      category: 'employee',
      categoryLabel: 'Employee Details',
      type: 'critical',
      field: 'ID Luhn Check',
      message: 'SA National ID Luhn algorithm check failed. Verify the 13-digit entry.',
    });
  }

  if (!employee.taxNumber?.trim()) {
    complianceIssues.push({
      id: 'employee-tax',
      category: 'employee',
      categoryLabel: 'Employee Details',
      type: 'critical',
      field: 'SARS Tax No',
      message: 'SARS individual Tax Reference Number (10 digits) is required for SARS submissions.',
    });
  } else if (!taxValidation) {
    complianceIssues.push({
      id: 'employee-tax-valid',
      category: 'employee',
      categoryLabel: 'Employee Details',
      type: 'critical',
      field: 'Tax Format',
      message: 'SARS Tax Reference must consist of exactly 10 numerical digits.',
    });
  }

  // 3. Period / Date checks
  if (!employee.payDate) {
    complianceIssues.push({
      id: 'pay-date-issue',
      category: 'employee',
      categoryLabel: 'Employee Details',
      type: 'critical',
      field: 'Pay Date',
      message: 'Date of salary payment is legally required.',
    });
  }
  if (!employee.payPeriodStart) {
    complianceIssues.push({
      id: 'period-start-issue',
      category: 'employee',
      categoryLabel: 'Employee Details',
      type: 'critical',
      field: 'Period Start',
      message: 'Pay Period Start Date is required.',
    });
  }
  if (!employee.payPeriodEnd) {
    complianceIssues.push({
      id: 'period-end-issue',
      category: 'employee',
      categoryLabel: 'Employee Details',
      type: 'critical',
      field: 'Period End',
      message: 'Pay Period End Date is required.',
    });
  }
  if (employee.payPeriodStart && employee.payPeriodEnd && new Date(employee.payPeriodStart) > new Date(employee.payPeriodEnd)) {
    complianceIssues.push({
      id: 'period-range',
      category: 'employee',
      categoryLabel: 'Employee Details',
      type: 'critical',
      field: 'Date Range',
      message: 'Pay Period Start Date cannot occur after Pay Period End Date.',
    });
  }

  // 4. Earnings check
  if (earnings.basicSalary <= 0) {
    complianceIssues.push({
      id: 'earn-salary',
      category: 'earnings',
      categoryLabel: 'Earnings',
      type: 'critical',
      field: 'Basic Salary',
      message: 'Basic Salary / Retainer must be greater than R 0.00.',
    });
  } else if (earnings.basicSalary > 500000) {
    complianceIssues.push({
      id: 'earn-salary-limit',
      category: 'earnings',
      categoryLabel: 'Earnings',
      type: 'warning',
      field: 'Basic Salary Limit',
      message: 'Basic Salary / Retainer exceeds standard safety limits (R500,000/mo).',
    });
  }

  if (earnings.commission < 0) {
    complianceIssues.push({
      id: 'earn-comm-neg',
      category: 'earnings',
      categoryLabel: 'Earnings',
      type: 'critical',
      field: 'Commission',
      message: 'Commission & Incentives cannot be negative.',
    });
  } else if (earnings.commission > 500000) {
    complianceIssues.push({
      id: 'earn-comm-limit',
      category: 'earnings',
      categoryLabel: 'Earnings',
      type: 'warning',
      field: 'Commission Limit',
      message: 'Commission & Incentives exceeds standard safety limits (R500,000/mo).',
    });
  }

  if (earnings.allowance < 0) {
    complianceIssues.push({
      id: 'earn-allow-neg',
      category: 'earnings',
      categoryLabel: 'Earnings',
      type: 'critical',
      field: 'Allowance',
      message: 'Travel / Cell Allowance cannot be negative.',
    });
  } else if (earnings.allowance > 100000) {
    complianceIssues.push({
      id: 'earn-allow-limit',
      category: 'earnings',
      categoryLabel: 'Earnings',
      type: 'warning',
      field: 'Allowance Limit',
      message: 'Travel / Cell Allowance exceeds standard safety limits (R100,000/mo).',
    });
  }

  // 5. Deductions check
  if (deductions.payeType === 'manual' && deductions.paye < 0) {
    complianceIssues.push({
      id: 'deduct-paye-neg',
      category: 'deductions',
      categoryLabel: 'Deductions',
      type: 'critical',
      field: 'Manual PAYE Check',
      message: 'Manual PAYE Tax override cannot be negative.',
    });
  } else if (deductions.payeType === 'manual' && grossEarnings > 0 && deductions.paye > grossEarnings * 0.45) {
    complianceIssues.push({
      id: 'deduct-paye-limit',
      category: 'deductions',
      categoryLabel: 'Deductions',
      type: 'warning',
      field: 'Manual PAYE Limit Check',
      message: 'Manual PAYE exceeds 45% of gross earnings (highest South African statutory marginal tax rate).',
    });
  }

  if (deductions.uifType === 'manual' && deductions.uif < 0) {
    complianceIssues.push({
      id: 'deduct-uif-neg',
      category: 'deductions',
      categoryLabel: 'Deductions',
      type: 'critical',
      field: 'Manual UIF Check',
      message: 'Manual UIF Contribution cannot be negative.',
    });
  } else if (deductions.uifType === 'manual' && deductions.uif > 177.12) {
    complianceIssues.push({
      id: 'deduct-uif-limit',
      category: 'deductions',
      categoryLabel: 'Deductions',
      type: 'warning',
      field: 'Manual UIF Limit Check',
      message: 'Manual UIF exceeds South African statutory maximum monthly limit (R177.12).',
    });
  }

  if (deductions.pensionValue < 0) {
    complianceIssues.push({
      id: 'deduct-pension-neg',
      category: 'deductions',
      categoryLabel: 'Deductions',
      type: 'critical',
      field: 'Pension Value Check',
      message: 'Pension deduction value cannot be negative.',
    });
  } else if (deductions.pensionType === 'percent' && deductions.pensionValue > 27.5) {
    complianceIssues.push({
      id: 'deduct-pension-limit-pct',
      category: 'deductions',
      categoryLabel: 'Deductions',
      type: 'warning',
      field: 'Pension Percentage Limit',
      message: 'Pension percentage exceeds South African statutory tax-free contribution cap of 27.5% of remuneration.',
    });
  } else if (deductions.pensionType === 'flat' && deductions.pensionValue > 29166.67) {
    complianceIssues.push({
      id: 'deduct-pension-limit-flat',
      category: 'deductions',
      categoryLabel: 'Deductions',
      type: 'warning',
      field: 'Pension Flat Limit',
      message: 'Pension flat sum exceeds South African statutory tax-free monthly cap (R29,166.67, based on R350,000/year cap).',
    });
  }

  if (deductions.otherAmount < 0) {
    complianceIssues.push({
      id: 'deduct-other-neg',
      category: 'deductions',
      categoryLabel: 'Deductions',
      type: 'critical',
      field: 'Other Deduction Check',
      message: 'Other Deduction Amount cannot be negative.',
    });
  } else if (grossEarnings > 0 && deductions.otherAmount > grossEarnings) {
    complianceIssues.push({
      id: 'deduct-other-limit',
      category: 'deductions',
      categoryLabel: 'Deductions',
      type: 'critical',
      field: 'Other Deduction Limit Check',
      message: 'Deductions cannot exceed total gross earnings.',
    });
  }

  // 6. YTD check (if manual)
  if (!useAutoYtd) {
    Object.keys(ytdOffsets).forEach((k) => {
      const fieldName = k as keyof typeof ytdOffsets;
      const value = ytdOffsets[fieldName];
      if (value < 0) {
        complianceIssues.push({
          id: `ytd-${fieldName}-neg`,
          category: 'ytd',
          categoryLabel: 'YTD Setup',
          type: 'critical',
          field: `YTD ${fieldName} Check`,
          message: `Prior cumulative YTD ${fieldName} cannot be negative.`,
        });
      }
    });
  }

  const criticalIssuesCount = complianceIssues.filter(i => i.type === 'critical').length;
  const warningIssuesCount = complianceIssues.filter(i => i.type === 'warning').length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-6" id="payslip-calculator-form">
      {/* Quick Demo Action */}
      <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-red-600 animate-pulse shrink-0" />
          <span className="text-[11px] font-semibold text-red-900 leading-tight">
            Need a compliant template fast? Preload the official NBS sample.
          </span>
        </div>
        <button
          onClick={onLoadDemo}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md shadow-sm transition shrink-0"
          id="load-demo-button"
        >
          Load NBS Demo
        </button>
      </div>

      {/* Tabs / Accordion Headings */}
      <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-1">
        <button
          onClick={() => setActiveSection('employer')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all ${
            activeSection === 'employer' 
              ? 'border-b-2 text-[#1B2A7E] border-[#1B2A7E] font-bold bg-slate-50/50' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
          id="tab-employer"
        >
          <Building2 className="w-3.5 h-3.5" />
          Employer Info
        </button>
        <button
          onClick={() => setActiveSection('employee')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all ${
            activeSection === 'employee' 
              ? 'border-b-2 text-[#1B2A7E] border-[#1B2A7E] font-bold bg-slate-50/50' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
          id="tab-employee"
        >
          <User className="w-3.5 h-3.5" />
          Employee Details
        </button>
        <button
          onClick={() => setActiveSection('earnings')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all ${
            activeSection === 'earnings' 
              ? 'border-b-2 text-[#1B2A7E] border-[#1B2A7E] font-bold bg-slate-50/50' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
          id="tab-earnings"
        >
          <Coins className="w-3.5 h-3.5" />
          Earnings
        </button>
        <button
          onClick={() => setActiveSection('deductions')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all ${
            activeSection === 'deductions' 
              ? 'border-b-2 text-[#1B2A7E] border-[#1B2A7E] font-bold bg-slate-50/50' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
          id="tab-deductions"
        >
          <HandCoins className="w-3.5 h-3.5" />
          Deductions
        </button>
        <button
          onClick={() => setActiveSection('ytd')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all ${
            activeSection === 'ytd' 
              ? 'border-b-2 text-[#1B2A7E] border-[#1B2A7E] font-bold bg-slate-50/50' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
          id="tab-ytd"
        >
          <CalendarDays className="w-3.5 h-3.5" />
          YTD Setup
        </button>
      </div>

      {/* Form Content Panel */}
      <div className="min-h-[300px]" id="form-content-panel">
        
        {/* SECTION 1: EMPLOYER DETAILS */}
        {activeSection === 'employer' && (
          <div className="space-y-4 animate-fade-in" id="employer-section">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-800" />
              Employer Registration & Codes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Company / Entity Name</label>
                <input
                  type="text"
                  value={employer.companyName}
                  onChange={(e) => handleEmployerChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  placeholder="e.g. Nkuna Burial Society"
                  id="employer-company-name-input"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Company Reg Number</label>
                <input
                  type="text"
                  value={employer.coRegNo}
                  onChange={(e) => handleEmployerChange('coRegNo', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  placeholder="e.g. I998/024823/08"
                  id="employer-co-reg-no-input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Physical Address</label>
                <input
                  type="text"
                  value={employer.address}
                  onChange={(e) => handleEmployerChange('address', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  placeholder="e.g. 128 Madiba Street, Pretoria, 0002"
                  id="employer-address-input"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">SARS PAYE Ref Number</label>
                <input
                  type="text"
                  value={employer.payeRef}
                  onChange={(e) => handleEmployerChange('payeRef', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  placeholder="e.g. T721079453"
                  id="employer-paye-ref-input"
                />
                <p className="text-[9px] text-slate-400 mt-0.5">PAYE begins with a 7 or a letter followed by 9 digits</p>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">UIF Reference Number</label>
                <input
                  type="text"
                  value={employer.uifRef}
                  onChange={(e) => handleEmployerChange('uifRef', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  placeholder="e.g. U721079453"
                  id="employer-uif-ref-input"
                />
                <p className="text-[9px] text-slate-400 mt-0.5">Reference for Unemployment claims</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Contact Info (Phone/Email)</label>
                <input
                  type="text"
                  value={employer.contact}
                  onChange={(e) => handleEmployerChange('contact', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  placeholder="e.g. admin@nkunaburial.co.za / +27 (0)12 555 9823"
                  id="employer-contact-input"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setActiveSection('employee')}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition"
                id="next-to-employee-btn"
              >
                Next Section
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION 2: EMPLOYEE DETAILS */}
        {activeSection === 'employee' && (
          <div className="space-y-4 animate-fade-in" id="employee-section">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: '#1B2A7E' }} />
              Employee Profile & Identifiers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Employee Name</label>
                <input
                  type="text"
                  value={employee.name}
                  onChange={(e) => handleEmployeeChange('name', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  placeholder="e.g. Sipho Nkosi"
                  id="employee-name-input"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Occupation / Job Title</label>
                <input
                  type="text"
                  value={employee.occupation}
                  onChange={(e) => handleEmployeeChange('occupation', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  placeholder="e.g. Administration Officer"
                  id="employee-occupation-input"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">South African ID / Ref No</label>
                <input
                  type="text"
                  value={employee.idNumber}
                  onChange={(e) => handleEmployeeChange('idNumber', e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 ${
                    employee.idNumber 
                      ? idValidation.isValid 
                        ? 'border-emerald-200 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/10' 
                        : 'border-red-200 focus:ring-red-550 focus:border-red-500 bg-red-50/10'
                      : 'border-slate-200 focus:ring-blue-900 focus:border-blue-900'
                  }`}
                  placeholder="13-digit National ID (YYMMDDSSSSCAZ)"
                  id="employee-id-number-input"
                />
                
                {employee.idNumber && (
                  <div className="mt-1.5 p-2 rounded-lg text-[10px] leading-relaxed flex items-start gap-1.5 border">
                    {idValidation.isValid ? (
                      <div className="text-emerald-800 bg-emerald-50 border-emerald-100 flex items-center gap-1.5 w-full">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          <strong>Valid ID:</strong> {idValidation.birthdate} ({idValidation.gender}, {idValidation.citizenship})
                        </span>
                      </div>
                    ) : (
                      <div className="text-red-800 bg-red-50 border-red-100 flex items-center gap-1.5 w-full">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>Invalid South African 13-digit ID number (Luhn Check failed)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">SARS Tax Reference Number</label>
                <input
                  type="text"
                  value={employee.taxNumber}
                  onChange={(e) => handleEmployeeChange('taxNumber', e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-1 ${
                    employee.taxNumber 
                      ? taxValidation 
                        ? 'border-emerald-200 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/10'
                        : 'border-amber-200 focus:ring-amber-500 focus:border-amber-500'
                      : 'border-slate-200 focus:ring-blue-900 focus:border-blue-900'
                  }`}
                  placeholder="Mandatory 10-digit Income Tax No"
                  maxLength={10}
                  id="employee-tax-number-input"
                />
                {!taxValidation && employee.taxNumber && (
                  <p className="text-[9px] text-amber-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    Valid SARS tax reference number must be exactly 10 digits
                  </p>
                )}
                {taxValidation && employee.taxNumber && (
                  <p className="text-[9px] text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 shrink-0" />
                    Compliant SARS individual tax format
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Age Bracket (For SARS Rebates)</label>
                <select
                  value={employee.ageGroup}
                  onChange={(e) => handleEmployeeChange('ageGroup', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  id="employee-age-bracket-select"
                >
                  <option value="under65">Under 65 (Standard Threshold: R95,750)</option>
                  <option value="65to74">65 to 74 Years (Elevated Threshold: R148,217)</option>
                  <option value="75plus">75 Years & Older (Elevated Threshold: R165,689)</option>
                </select>
                <p className="text-[9px] text-slate-400 mt-0.5">SARS applies additional rebates as employees turn 65 and 75</p>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Pay Date</label>
                <input
                  type="date"
                  value={employee.payDate}
                  onChange={(e) => handleEmployeeChange('payDate', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  id="employee-pay-date-input"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Pay Period Start</label>
                <input
                  type="date"
                  value={employee.payPeriodStart}
                  onChange={(e) => handleEmployeeChange('payPeriodStart', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  id="employee-period-start-input"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Pay Period End</label>
                <input
                  type="date"
                  value={employee.payPeriodEnd}
                  onChange={(e) => handleEmployeeChange('payPeriodEnd', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  id="employee-period-end-input"
                />
              </div>
            </div>

            {/* STATUTORY LEAVE TRACKER (BCEA COMPLIANT) */}
            <div className="border-t border-slate-100 pt-5 mt-5">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 mb-2">
                <CalendarDays className="w-4 h-4 text-[#1B2A7E]" />
                Statutory Leave Tracking (BCEA Sec 20)
              </h4>
              <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
                The South African Basic Conditions of Employment Act requires employers to track and supply accurate records of leaves. Enter the values for this employee's leave cycles below.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Annual Leave Accrual & Taken */}
                <div className="p-3.5 bg-blue-50/20 border border-blue-100/60 rounded-xl space-y-3">
                  <div className="text-[10px] font-bold text-blue-900 uppercase tracking-widest border-b border-blue-100/40 pb-1.5 flex justify-between">
                    <span>1. Annual Leave</span>
                    <span className="text-[9px] font-mono normal-case font-medium text-blue-750">SARS Min: 15 /yr</span>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">Accrued (Days)</label>
                    <input
                      type="number"
                      value={employee.annualLeaveAccrued ?? ''}
                      onChange={(e) => handleEmployeeChange('annualLeaveAccrued', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white"
                      placeholder="e.g. 15"
                      min={0}
                      id="employee-annual-leave-accrued"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">Taken (Days)</label>
                    <input
                      type="number"
                      value={employee.annualLeaveTaken ?? ''}
                      onChange={(e) => handleEmployeeChange('annualLeaveTaken', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white"
                      placeholder="e.g. 3"
                      min={0}
                      id="employee-annual-leave-taken"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-white p-1.5 rounded border border-blue-100/50 text-[10.5px]">
                    <span className="font-semibold text-slate-500">Remaining:</span>
                    <span className="font-mono font-bold text-blue-900">
                      {Math.max(0, (employee.annualLeaveAccrued ?? 0) - (employee.annualLeaveTaken ?? 0))} Days
                    </span>
                  </div>
                </div>

                {/* Sick Leave Accrual & Taken */}
                <div className="p-3.5 bg-red-50/20 border border-red-100/60 rounded-xl space-y-3">
                  <div className="text-[10px] font-bold text-red-950 uppercase tracking-widest border-b border-red-100/40 pb-1.5 flex justify-between">
                    <span>2. Sick Leave</span>
                    <span className="text-[9px] font-mono normal-case font-medium text-red-750">3-Yr Cycle Min: 30</span>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">Accrued (Days)</label>
                    <input
                      type="number"
                      value={employee.sickLeaveAccrued ?? ''}
                      onChange={(e) => handleEmployeeChange('sickLeaveAccrued', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white"
                      placeholder="e.g. 30"
                      min={0}
                      id="employee-sick-leave-accrued"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">Taken (Days)</label>
                    <input
                      type="number"
                      value={employee.sickLeaveTaken ?? ''}
                      onChange={(e) => handleEmployeeChange('sickLeaveTaken', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white"
                      placeholder="e.g. 2"
                      min={0}
                      id="employee-sick-leave-taken"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-white p-1.5 rounded border border-red-100/50 text-[10.5px]">
                    <span className="font-semibold text-slate-500">Remaining:</span>
                    <span className="font-mono font-bold text-red-950">
                      {Math.max(0, (employee.sickLeaveAccrued ?? 0) - (employee.sickLeaveTaken ?? 0))} Days
                    </span>
                  </div>
                </div>

                {/* Family Responsibility Leave */}
                <div className="p-3.5 bg-amber-50/20 border border-amber-100/60 rounded-xl space-y-3">
                  <div className="text-[10px] font-bold text-amber-900 uppercase tracking-widest border-b border-amber-100/40 pb-1.5 flex justify-between">
                    <span>3. Family Respons.</span>
                    <span className="text-[9px] font-mono normal-case font-medium text-amber-700">Min: 3-5 /yr</span>
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">Accrued (Days)</label>
                    <input
                      type="number"
                      value={employee.familyLeaveAccrued ?? ''}
                      onChange={(e) => handleEmployeeChange('familyLeaveAccrued', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white"
                      placeholder="e.g. 5"
                      min={0}
                      id="employee-family-leave-accrued"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-1">Taken (Days)</label>
                    <input
                      type="number"
                      value={employee.familyLeaveTaken ?? ''}
                      onChange={(e) => handleEmployeeChange('familyLeaveTaken', parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white"
                      placeholder="e.g. 0"
                      min={0}
                      id="employee-family-leave-taken"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-white p-1.5 rounded border border-amber-100/50 text-[10.5px]">
                    <span className="font-semibold text-slate-500">Remaining:</span>
                    <span className="font-mono font-bold text-amber-900">
                      {Math.max(0, (employee.familyLeaveAccrued ?? 0) - (employee.familyLeaveTaken ?? 0))} Days
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setActiveSection('earnings')}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition"
                id="next-to-earnings-btn"
              >
                Next Section
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION 3: EARNINGS DETAILS */}
        {activeSection === 'earnings' && (
          <div className="space-y-4 animate-fade-in" id="earnings-section">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              Earnings Summary (ZAR)
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Basic Salary / Retainer</label>
                  <span className="text-xs font-mono font-bold text-slate-700">R {earnings.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex gap-3 items-center w-full">
                    <input
                      type="number"
                      value={earnings.basicSalary || ''}
                      onChange={(e) => handleEarningsChange('basicSalary', e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none transition-colors ${
                        getEarningsFieldError('basicSalary')
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-red-50/10'
                          : 'border-slate-200 focus:ring-1 focus:ring-blue-900 focus:border-blue-900'
                      }`}
                      placeholder="e.g. 15000"
                      id="earnings-basic-salary-input"
                    />
                  </div>
                  {getEarningsFieldError('basicSalary') && (
                    <p className="text-[10px] text-red-650 font-semibold mt-0.5 flex items-center gap-1 text-red-600 animate-fade-in">
                      <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                      {getEarningsFieldError('basicSalary')}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Commission & Incentives</label>
                  <span className="text-xs font-mono font-bold text-slate-700">R {earnings.commission.toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <input
                    type="number"
                    value={earnings.commission || ''}
                    onChange={(e) => handleEarningsChange('commission', e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none transition-colors ${
                      getEarningsFieldError('commission')
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-red-50/10'
                        : 'border-slate-200 focus:ring-1 focus:ring-blue-900 focus:border-blue-900'
                    }`}
                    placeholder="e.g. 2500"
                    id="earnings-commission-input"
                  />
                  {getEarningsFieldError('commission') && (
                    <p className="text-[10px] text-red-650 font-semibold mt-0.5 flex items-center gap-1 text-red-600 animate-fade-in">
                      <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                      {getEarningsFieldError('commission')}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Travel / Cell Allowance</label>
                  <span className="text-xs font-mono font-bold text-slate-700">R {earnings.allowance.toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <input
                    type="number"
                    value={earnings.allowance || ''}
                    onChange={(e) => handleEarningsChange('allowance', e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none transition-colors ${
                      getEarningsFieldError('allowance')
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-red-50/10'
                        : 'border-slate-200 focus:ring-1 focus:ring-blue-900 focus:border-blue-900'
                    }`}
                    placeholder="e.g. 1000"
                    id="earnings-allowance-input"
                  />
                  {getEarningsFieldError('allowance') && (
                    <p className="text-[10px] text-red-650 font-semibold mt-0.5 flex items-center gap-1 text-red-600 animate-fade-in">
                      <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                      {getEarningsFieldError('allowance')}
                    </p>
                  )}
                </div>
              </div>

              {/* Total Live Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Gross Remuneration (ZAR):</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pre-deductions base taxable income</p>
                </div>
                <span className="text-lg font-mono font-bold text-slate-800">
                  R {grossEarnings.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setActiveSection('deductions')}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition"
                id="next-to-deductions-btn"
              >
                Next Section
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION 4: DEDUCTIONS DETAILS */}
        {activeSection === 'deductions' && (
          <div className="space-y-4 animate-fade-in" id="deductions-section">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <HandCoins className="w-4 h-4 text-red-600" />
              Deductions & Statutory Contributions
            </h3>

            <div className="space-y-4">
              {/* PAYE Selection */}
              <div className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-700 text-xs font-bold">Standard PAYE (Income Tax)</label>
                  <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      onClick={() => handleDeductionsChange('payeType', 'auto')}
                      className={`px-2 py-0.5 rounded-md transition ${
                        deductions.payeType === 'auto' ? 'bg-white shadow text-blue-900' : 'text-slate-500'
                      }`}
                      id="paye-calc-auto-btn"
                    >
                      SARS Estimate
                    </button>
                    <button
                      onClick={() => handleDeductionsChange('payeType', 'manual')}
                      className={`px-2 py-0.5 rounded-md transition ${
                        deductions.payeType === 'manual' ? 'bg-white shadow text-blue-900' : 'text-slate-500'
                      }`}
                      id="paye-calc-manual-btn"
                    >
                      Override Manual
                    </button>
                  </div>
                </div>

                {deductions.payeType === 'auto' ? (
                  <div className="text-[11px] text-slate-500 leading-relaxed bg-white border border-slate-100 p-2.5 rounded-lg flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Automatic 2025/2026 SARS Estimation Active
                    </span>
                    <span>
                      Estimated PAYE Tax: <strong>R {deductions.paye.toFixed(2)}</strong> (Adjusts based on age group & package size).
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R</span>
                        <input
                          type="number"
                          value={deductions.paye || ''}
                          onChange={(e) => handleDeductionsChange('paye', parseFloat(e.target.value) || 0)}
                          className={`w-full pl-7 pr-3 py-2 text-xs rounded-lg border focus:outline-none transition-colors bg-white ${
                            getDeductionsFieldError('paye')
                              ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-red-50/10'
                              : 'border-slate-200 focus:ring-1 focus:ring-blue-900 focus:border-blue-900'
                          }`}
                          placeholder="e.g. 1500"
                          id="deductions-paye-manual-input"
                        />
                      </div>
                    </div>
                    {getDeductionsFieldError('paye') && (
                      <p className="text-[10px] text-red-650 font-semibold mt-0.5 flex items-center gap-1 text-red-600 animate-fade-in">
                        <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                        {getDeductionsFieldError('paye')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* UIF Selection */}
              <div className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-700 text-xs font-bold">UIF Contribution (1% Employee)</label>
                  <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      onClick={() => handleDeductionsChange('uifType', 'auto')}
                      className={`px-2 py-0.5 rounded-md transition ${
                        deductions.uifType === 'auto' ? 'bg-white shadow text-blue-900' : 'text-slate-500'
                      }`}
                      id="uif-calc-auto-btn"
                    >
                      Calculate (1%)
                    </button>
                    <button
                      onClick={() => handleDeductionsChange('uifType', 'manual')}
                      className={`px-2 py-0.5 rounded-md transition ${
                        deductions.uifType === 'manual' ? 'bg-white shadow text-blue-900' : 'text-slate-500'
                      }`}
                      id="uif-calc-manual-btn"
                    >
                      Manual Offset
                    </button>
                  </div>
                </div>

                {deductions.uifType === 'auto' ? (
                  <div className="text-[11px] text-slate-500 leading-relaxed bg-white border border-slate-100 p-2.5 rounded-lg flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Statutory 1% Calculation Active
                    </span>
                    <span>
                      Deduction: <strong>R {deductions.uif.toFixed(2)}</strong> {grossEarnings > 17712 ? '(Capped at limit limit R177.12)' : '(1% of gross)'}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 w-full">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R</span>
                      <input
                        type="number"
                        value={deductions.uif || ''}
                        onChange={(e) => handleDeductionsChange('uif', parseFloat(e.target.value) || 0)}
                        className={`w-full pl-7 pr-3 py-2 text-xs rounded-lg border focus:outline-none transition-colors bg-white ${
                          getDeductionsFieldError('uif')
                            ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-red-50/10'
                            : 'border-slate-200 focus:ring-1 focus:ring-blue-900 focus:border-blue-900'
                        }`}
                        placeholder="e.g. 150"
                        id="deductions-uif-manual-input"
                      />
                    </div>
                    {getDeductionsFieldError('uif') && (
                      <p className="text-[10px] text-red-650 font-semibold mt-0.5 flex items-center gap-1 text-red-600 animate-fade-in">
                        <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                        {getDeductionsFieldError('uif')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Pension / Provident */}
              <div className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-700 text-xs font-bold">Pension / Provident Fund</label>
                  <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      onClick={() => setPensionType('percent')}
                      className={`px-2 py-0.5 rounded-md transition ${
                        deductions.pensionType === 'percent' ? 'bg-white shadow text-blue-900' : 'text-slate-500'
                      }`}
                      id="pension-percent-btn"
                    >
                      Percentage (%)
                    </button>
                    <button
                      onClick={() => setPensionType('flat')}
                      className={`px-2 py-0.5 rounded-md transition ${
                        deductions.pensionType === 'flat' ? 'bg-white shadow text-blue-900' : 'text-slate-500'
                      }`}
                      id="pension-flat-btn"
                    >
                      Flat ZAR Amount
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1 w-full">
                  <div className="flex gap-2 items-center w-full">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">
                        {deductions.pensionType === 'percent' ? '%' : 'R'}
                      </span>
                      <input
                        type="number"
                        value={deductions.pensionValue || ''}
                        onChange={(e) => handleDeductionsChange('pensionValue', parseFloat(e.target.value) || 0)}
                        className={`w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none transition-colors bg-white ${
                          getDeductionsFieldError('pensionValue')
                            ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-red-50/10'
                            : 'border-slate-200 focus:ring-1 focus:ring-blue-900 focus:border-blue-900'
                        }`}
                        placeholder={deductions.pensionType === 'percent' ? 'e.g. 7.5' : 'e.g. 1200'}
                        id="deductions-pension-value-input"
                      />
                    </div>
                    {deductions.pensionType === 'percent' && (
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        = R {((earnings.basicSalary * (deductions.pensionValue || 0)) / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {getDeductionsFieldError('pensionValue') && (
                    <p className="text-[10px] text-red-650 font-semibold mt-0.5 flex items-center gap-1 text-red-600 animate-fade-in">
                      <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                      {getDeductionsFieldError('pensionValue')}
                    </p>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 mt-1">Deducted from gross taxable salary before PAYE calculations (SARS incentivized)</p>
              </div>

              {/* Other Deductions (Loan, Union, etc.) */}
              <div className="border border-slate-100 p-3.5 rounded-xl bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 text-xs font-bold mb-1">Other Custom Deduction Label</label>
                  <input
                    type="text"
                    value={deductions.otherLabel}
                    onChange={(e) => handleDeductionsChange('otherLabel', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white"
                    placeholder="e.g. Union Fee / Staff Loan repayments"
                    id="deductions-other-label-input"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 text-xs font-bold mb-1">Other Deduction Amount</label>
                  <div className="flex flex-col gap-1 w-full">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">R</span>
                      <input
                        type="number"
                        value={deductions.otherAmount || ''}
                        onChange={(e) => handleDeductionsChange('otherAmount', parseFloat(e.target.value) || 0)}
                        className={`w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none transition-colors bg-white ${
                          getDeductionsFieldError('otherAmount')
                            ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-red-50/10'
                            : 'border-slate-200 focus:ring-1 focus:ring-blue-900 focus:border-blue-900'
                        }`}
                        placeholder="e.g. 250"
                        id="deductions-other-amount-input"
                      />
                    </div>
                    {getDeductionsFieldError('otherAmount') && (
                      <p className="text-[10px] text-red-650 font-semibold mt-0.5 flex items-center gap-1 text-red-600 animate-fade-in">
                        <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                        {getDeductionsFieldError('otherAmount')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: YEAR-TO-DATE SETTINGS */}
        {activeSection === 'ytd' && (
          <div className="space-y-4 animate-fade-in" id="ytd-section">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-orange-600" />
              Year-to-Date (YTD) Cumulative Controls
            </h3>

            <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-orange-900 uppercase tracking-wider">Historical YTD Estimation</span>
                  <p className="text-[10px] text-orange-700 mt-0.5">
                    Currently in month <strong>{elapsedMonths}</strong> of South African Tax Year (starts March 1st).
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={() => setUseAutoYtd(!useAutoYtd)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    useAutoYtd ? 'bg-[#1B2A7E]' : 'bg-slate-300'
                  }`}
                  id="ytd-estimation-toggle"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useAutoYtd ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {useAutoYtd ? (
                <p className="text-[11px] text-orange-900 leading-relaxed pt-1 border-t border-orange-100/50">
                  ✓ <strong>Automatic estimation active:</strong> Previous months ({elapsedMonths - 1} months) are auto-tallied and synced with existing compliance data. Cumulative totals update in real-time.
                </p>
              ) : (
                <p className="text-[11px] text-orange-900 leading-relaxed pt-1 border-t border-orange-100/50">
                  ⚠ <strong>Manual override active:</strong> Customize starting cumulative totals (prior balances) to reflect correct mid-year payroll transitions before current month.
                </p>
              )}
            </div>

            {!useAutoYtd && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200/55 rounded-xl">
                <div>
                  <h4 className="text-[10.5px] text-slate-700 font-extrabold uppercase tracking-wide border-b border-slate-200 pb-1.5 mb-2 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-emerald-600" />
                    Prior Joint Earnings
                  </h4>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-500 font-bold text-[9px] uppercase tracking-wider mb-1">Basic Salary Prior Sum</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">R</span>
                        <input
                          type="number"
                          value={ytdOffsets.basicSalary || ''}
                          onChange={(e) => setYtdOffsets(prev => ({ ...prev, basicSalary: parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-6 pr-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none bg-white focus:ring-1 focus:ring-blue-900"
                          placeholder="e.g. 30000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[9px] uppercase tracking-wider mb-1">Commission Prior Sum</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">R</span>
                        <input
                          type="number"
                          value={ytdOffsets.commission || ''}
                          onChange={(e) => setYtdOffsets(prev => ({ ...prev, commission: parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-6 pr-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none bg-white focus:ring-1 focus:ring-blue-900"
                          placeholder="e.g. 5000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[9px] uppercase tracking-wider mb-1">Allowance Prior Sum</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">R</span>
                        <input
                          type="number"
                          value={ytdOffsets.allowance || ''}
                          onChange={(e) => setYtdOffsets(prev => ({ ...prev, allowance: parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-6 pr-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none bg-white focus:ring-1 focus:ring-blue-900"
                          placeholder="e.g. 2000"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10.5px] text-slate-700 font-extrabold uppercase tracking-wide border-b border-slate-200 pb-1.5 mb-2 flex items-center gap-1">
                    <HandCoins className="w-3.5 h-3.5 text-red-600" />
                    Prior Deductions & contributions
                  </h4>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-500 font-bold text-[9px] uppercase tracking-wider mb-1">PAYE prior cumulative</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">R</span>
                        <input
                          type="number"
                          value={ytdOffsets.paye || ''}
                          onChange={(e) => setYtdOffsets(prev => ({ ...prev, paye: parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-6 pr-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none bg-white focus:ring-1 focus:ring-blue-900"
                          placeholder="e.g. 4500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[9px] uppercase tracking-wider mb-1">UIF prior cumulative</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">R</span>
                        <input
                          type="number"
                          value={ytdOffsets.uif || ''}
                          onChange={(e) => setYtdOffsets(prev => ({ ...prev, uif: parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-6 pr-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none bg-white focus:ring-1 focus:ring-blue-900"
                          placeholder="e.g. 354"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[9px] uppercase tracking-wider mb-1">Pension prior cumulative</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">R</span>
                        <input
                          type="number"
                          value={ytdOffsets.pension || ''}
                          onChange={(e) => setYtdOffsets(prev => ({ ...prev, pension: parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-6 pr-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none bg-white focus:ring-1 focus:ring-blue-900"
                          placeholder="e.g. 2400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold text-[9px] uppercase tracking-wider mb-1">Other deduction prior</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">R</span>
                        <input
                          type="number"
                          value={ytdOffsets.other || ''}
                          onChange={(e) => setYtdOffsets(prev => ({ ...prev, other: parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-6 pr-2.5 py-1.5 text-xs rounded border border-slate-200 focus:outline-none bg-white focus:ring-1 focus:ring-blue-900"
                          placeholder="e.g. 900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <span className="text-[10px] font-medium text-slate-450 italic">
                Cumulative inputs are continuously computed and displayed as YTD in live Payslip Sheet.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Statutory Compliance Assessment Dashboard */}
      <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200/50 flex flex-col gap-3" id="payslip-compliance-assessment">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-slate-500" />
            <h4 className="font-sans font-bold text-slate-700 text-xs">Statutory Accuracy & Content Checklist</h4>
          </div>
          
          {complianceIssues.length === 0 ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] font-bold select-none shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              100% Compliant
            </span>
          ) : criticalIssuesCount > 0 ? (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-800 text-[10px] font-bold select-none shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
              </span>
              {criticalIssuesCount} Compliance Failure{criticalIssuesCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-[10px] font-semibold select-none shadow-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
              {warningIssuesCount} Advisory Warning{warningIssuesCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {complianceIssues.length === 0 ? (
          <div className="text-[11px] text-emerald-700 leading-relaxed bg-emerald-50/20 border border-emerald-100 p-2.5 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>South African BCEA & SARS Compliant!</strong> This draft includes all statutory fields required under Section 33, featuring a valid Luhn-checked ID, standard PAYE structure, and active company registers. Ready for secure ledger archiving.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                {criticalIssuesCount > 0 
                  ? `Fix the ${criticalIssuesCount} critical field${criticalIssuesCount > 1 ? 's' : ''} highlighted below to verify compliance.`
                  : `Review ${warningIssuesCount} recommended contribution warning${warningIssuesCount > 1 ? 's' : ''} before archiving.`
                }
              </span>
              <button
                type="button"
                onClick={() => setShowErrorsInDetail(!showErrorsInDetail)}
                className="text-[#1B2A7E] font-bold hover:underline select-none"
              >
                {showErrorsInDetail ? 'Hide Errors Checklist' : 'Expand Compliance Checklist'}
              </button>
            </div>

            {showErrorsInDetail && (
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {complianceIssues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className={`flex items-center justify-between p-2 rounded-lg border text-[11.5px] transition ${
                      issue.type === 'critical' 
                        ? 'bg-rose-50/20 border-rose-100 text-slate-700' 
                        : 'bg-amber-50/20 border-amber-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {issue.type === 'critical' ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span>
                        <span className="font-bold text-slate-500 mr-1">[{issue.categoryLabel}]</span>
                        {issue.message}
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setActiveSection(issue.category)}
                      className={`text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded transition ${
                        issue.type === 'critical'
                          ? 'bg-rose-100/50 hover:bg-rose-200 text-red-700'
                          : 'bg-amber-100/50 hover:bg-amber-200 text-amber-800'
                      }`}
                    >
                      Jump to Field
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compliance Bypass Confirmation Modal */}
      {showComplianceBypassModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" id="compliance-bypass-modal">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 flex flex-col gap-5">
            <div className="flex items-start gap-3">
              <div className="bg-red-50 p-2.5 rounded-xl text-red-650 shrink-0">
                <ShieldAlert className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-sans font-black text-slate-800 text-sm leading-snug">
                  BCEA Statutory Compliance Notice
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  This document cannot be fully verified as compliant under Section 33 of South Africa&apos;s labour laws.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100/50 max-h-48 overflow-y-auto">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block mb-1.5">
                Critical Compliance Faults ({criticalIssuesCount}):
              </span>
              <ul className="space-y-1 text-[11px] text-slate-600 list-disc pl-4 leading-relaxed">
                {complianceIssues.filter(i => i.type === 'critical').map(issue => (
                  <li key={issue.id}>
                    <strong>{issue.field}:</strong> {issue.message}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              We highly recommend resolving these errors in the editor (e.g. providing missing Employee ID, SARS reference numbers, or ensuring positive remuneration) before archiving. However, if you are creating a temporary draft, you may bypass this check.
            </p>

            <div className="flex justify-end gap-2.5 mt-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowComplianceBypassModal(false)}
                className="px-3.5 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition"
              >
                Go Back & Fix
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowComplianceBypassModal(false);
                  onSave();
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                id="confirm-bypass-save-btn"
              >
                Proceed Archive Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={onClear}
          type="button"
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition duration-150 text-center"
          id="clear-form-button"
        >
          Reset Form
        </button>
        
        <button
          onClick={() => {
            if (criticalIssuesCount > 0) {
              setShowComplianceBypassModal(true);
            } else {
              onSave();
            }
          }}
          type="button"
          className="px-4 py-2.5 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-1.5"
          style={{ backgroundColor: '#1B2A7E' }}
          id="save-payslip-button"
        >
          <CheckCircle className="w-4 h-4" />
          Archive & Save
        </button>
      </div>
    </div>
  );
}
