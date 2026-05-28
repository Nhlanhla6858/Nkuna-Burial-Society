import React from 'react';
import { BookOpen, ShieldAlert, BadgeCheck, FileCheck, Landmark } from 'lucide-react';

export function ComplianceGuide() {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm text-sm" id="compliance-guide-panel">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5" style={{ color: '#1B2A7E' }} />
        <h3 className="font-sans font-bold text-slate-800 text-base">South African Payslip Compliance Guide</h3>
      </div>
      
      <p className="text-slate-600 mb-4 leading-relaxed text-xs">
        Under <strong>Section 33 of the Basic Conditions of Employment Act (BCEA)</strong>, employers must provide employees with a written, compliant payslip on every pay day. Below are the statutory requirements implemented by this system.
      </p>

      <div className="space-y-4">
        <div className="flex gap-3">
          <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-700 text-xs">Section 33 Mandatory Content</h4>
            <ul className="list-disc pl-4 mt-1 text-slate-600 space-y-1 text-xs">
              <li>Employer&apos;s full name, address, and registration numbers (PAYE/UIF).</li>
              <li>Employee&apos;s name, occupation, and 10-digit SARS Tax Reference Number (mandatory for tax year filings).</li>
              <li>The pay period (start date to end date) and exact payment date.</li>
              <li>Detailed breakdown of earnings (Basic salary, commission, allowance).</li>
              <li>Detailed breakdown of deductions with statutory explanation (PAYE, UIF, Pension).</li>
              <li>The net take-home pay clearly highlighted.</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <Landmark className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#1B2A7E' }} />
          <div>
            <h4 className="font-semibold text-slate-700 text-xs">Unemployment Insurance Fund (UIF) Rules</h4>
            <p className="text-slate-600 mt-1 leading-relaxed text-xs">
              The employee deduction is strictly <strong>1% of gross earnings</strong>, subject to a statutory basic salary cap. In South Africa, the maximum earnings threshold is <strong>R17,712 per month</strong>, which caps the employee contribution at <strong>R177.12</strong>.
            </p>
            <p className="text-slate-600 mt-1 leading-relaxed text-xs">
              <strong>Employer Obligation:</strong> The employer must contribute an <em>additional 1%</em> to the UIF, totaling 2% submitted monthly to SARS via the <strong>EMP201 declaration</strong>.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <FileCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#E31D2B' }} />
          <div>
            <h4 className="font-semibold text-slate-700 text-xs">3-Year Storage & Record-Keeping</h4>
            <p className="text-slate-600 mt-1 leading-relaxed text-xs">
              Employers are legally required by South African labour law to retain all payroll records, hours worked, and payslips for <strong>at least 3 years</strong>. 
            </p>
            <p className="text-emerald-700 font-medium mt-1 text-[11px] bg-emerald-50 px-2 py-1 rounded inline-block border border-emerald-100">
              ✓ This system includes a built-in local <strong>Compliance Storage Vault</strong> to safely retain and archive your generated payslip documents locally.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-slate-700 text-xs">Delivery & Security Regulations</h4>
            <p className="text-slate-600 mt-1 leading-relaxed text-xs">
              Payslips must be delivered either during working hours at the workplace, in a sealed envelope (especially if salary is paid in physical cash), or digitally via a secure, password-protected electronic format (like a PDF emailed directly to the employee).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
