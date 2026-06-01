export interface EmployerDetails {
  companyName: string;
  address: string;
  coRegNo: string;
  payeRef: string;
  uifRef: string;
  contact: string;
}

export interface EmployeeDetails {
  name: string;
  occupation: string;
  idNumber: string;
  taxNumber: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  ageGroup: 'under65' | '65to74' | '75plus';
  annualLeaveAccrued?: number;
  annualLeaveTaken?: number;
  sickLeaveAccrued?: number;
  sickLeaveTaken?: number;
  familyLeaveAccrued?: number;
  familyLeaveTaken?: number;
}

export interface Earnings {
  basicSalary: number;
  commission: number;
  allowance: number; // travel & cell
}

export interface Deductions {
  paye: number;
  payeType: 'auto' | 'manual';
  uif: number;
  uifType: 'auto' | 'manual';
  pensionType: 'flat' | 'percent';
  pensionValue: number;
  otherLabel: string;
  otherAmount: number;
}

export interface PayslipRecord {
  id: string;
  createdAt: string;
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
  signatures?: {
    employerName: string;
    employeeName: string;
    employerSignedDate?: string;
    employeeSignedDate?: string;
    employerSigDataUrl?: string;
    employeeSigDataUrl?: string;
  };
}
