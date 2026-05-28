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
  CalendarDays
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

  const handleEmployeeChange = (field: keyof EmployeeDetails, value: string) => {
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
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    value={earnings.basicSalary || ''}
                    onChange={(e) => handleEarningsChange('basicSalary', e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                    placeholder="e.g. 15000"
                    id="earnings-basic-salary-input"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Commission & Incentives</label>
                  <span className="text-xs font-mono font-bold text-slate-700">R {earnings.commission.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  value={earnings.commission || ''}
                  onChange={(e) => handleEarningsChange('commission', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  placeholder="e.g. 2500"
                  id="earnings-commission-input"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Travel / Cell Allowance</label>
                  <span className="text-xs font-mono font-bold text-slate-700">R {earnings.allowance.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  value={earnings.allowance || ''}
                  onChange={(e) => handleEarningsChange('allowance', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900"
                  placeholder="e.g. 1000"
                  id="earnings-allowance-input"
                />
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
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R</span>
                      <input
                        type="number"
                        value={deductions.paye || ''}
                        onChange={(e) => handleDeductionsChange('paye', parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white"
                        placeholder="e.g. 1500"
                        id="deductions-paye-manual-input"
                      />
                    </div>
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
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R</span>
                    <input
                      type="number"
                      value={deductions.uif || ''}
                      onChange={(e) => handleDeductionsChange('uif', parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white"
                      placeholder="e.g. 150"
                      id="deductions-uif-manual-input"
                    />
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

                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">
                      {deductions.pensionType === 'percent' ? '%' : 'R'}
                    </span>
                    <input
                      type="number"
                      value={deductions.pensionValue || ''}
                      onChange={(e) => handleDeductionsChange('pensionValue', parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white"
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
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">R</span>
                    <input
                      type="number"
                      value={deductions.otherAmount || ''}
                      onChange={(e) => handleDeductionsChange('otherAmount', parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white"
                      placeholder="e.g. 250"
                      id="deductions-other-amount-input"
                    />
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
          onClick={onSave}
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
