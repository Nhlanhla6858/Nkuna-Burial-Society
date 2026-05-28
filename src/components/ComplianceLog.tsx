import React, { useState } from 'react';
import { PayslipRecord } from '../types';
import { Search, Trash2, FileText, Download, Upload, AlertCircle, Database, RefreshCw, Calendar } from 'lucide-react';

interface ComplianceLogProps {
  records: PayslipRecord[];
  onSelectRecord: (record: PayslipRecord) => void;
  onDeleteRecord: (id: string) => void;
  onImportRecords: (records: PayslipRecord[]) => void;
}

export function ComplianceLog({ records, onSelectRecord, onDeleteRecord, onImportRecords }: ComplianceLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filter records based on search term (name, ID number, or occupation)
  const filteredRecords = records.filter(rec => {
    const term = searchTerm.toLowerCase();
    return (
      rec.employee.name.toLowerCase().includes(term) ||
      rec.employee.occupation.toLowerCase().includes(term) ||
      rec.employee.idNumber.includes(term) ||
      rec.employee.taxNumber.includes(term)
    );
  });

  // Export all database records as a JSON backup file
  const handleExportBackup = () => {
    if (records.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NBS_Payslip_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported) && imported.every(item => item.id && item.employee && item.earnings && item.deductions)) {
          onImportRecords(imported);
          alert(`Successfully imported ${imported.length} compliance records!`);
        } else {
          alert('Invalid backup storage layout file. Please ensure it is a valid NBS backup file.');
        }
      } catch (err) {
        alert('Failed to parse backup file. Please make sure it is valid JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDelete = (id: string) => {
    onDeleteRecord(id);
    setDeleteId(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" id="compliance-log-panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5" style={{ color: '#1B2A7E' }} />
          <div>
            <h3 className="font-sans font-bold text-slate-800 text-base">Compliance Storage Vault</h3>
            <p className="text-xs text-slate-500">Statutory 3-Year Record Keeping (BCEA Section 33)</p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleExportBackup}
            disabled={records.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            title="Download JSON compliance record backup"
            id="export-backup-btn"
          >
            <Download className="w-3.5 h-3.5" />
            Export Backup
          </button>
          
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5" />
            Import Backup
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
              id="import-backup-input"
            />
          </label>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-700 text-sm">No Payslip Records Stored</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
            Generate and save your first compliant payslip to automatically populate the 3-year statutory audit vault.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search bar and counter */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Employee name, occupation, ID, or Tax Ref..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                id="search-compliance-input"
              />
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-[11px] font-semibold text-blue-800 rounded-full border border-blue-100 self-start sm:self-auto shrink-0">
              <Calendar className="w-3.5 h-3.5" />
              <span>{filteredRecords.length} / {records.length} Archived Records</span>
            </div>
          </div>

          {/* Table List */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-3">Employee & Occupation</th>
                  <th className="p-3">Pay Period</th>
                  <th className="p-3">Gross Remuneration</th>
                  <th className="p-3">Total Deductions</th>
                  <th className="p-3 text-right">Net Take-Home</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      No records match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    const isConfirming = deleteId === rec.id;
                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/50 transition duration-150">
                        <td className="p-3">
                          <div className="font-semibold text-slate-800">{rec.employee.name}</div>
                          <div className="text-[10px] text-slate-500">{rec.employee.occupation}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-[10px] text-slate-700">
                            {rec.employee.payPeriodStart} - {rec.employee.payPeriodEnd}
                          </div>
                          <div className="text-[10px] text-slate-400">Paid: {rec.employee.payDate}</div>
                        </td>
                        <td className="p-3 font-mono font-medium text-slate-700">
                          R {rec.calculated.grossEarnings.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 font-mono text-slate-500">
                          R {rec.calculated.totalDeductions.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 font-mono text-right font-bold text-slate-900 bg-slate-50/25">
                          R {rec.calculated.netPay.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            {isConfirming ? (
                              <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                                <button
                                  onClick={() => handleDelete(rec.id)}
                                  className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-[10px] uppercase tracking-wider transition"
                                  id={`confirm-delete-btn-${rec.id}`}
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeleteId(null)}
                                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-[10px] uppercase tracking-wider transition"
                                  id={`cancel-delete-btn-${rec.id}`}
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => onSelectRecord(rec)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition"
                                  title="Load this record in editor & preview"
                                  id={`load-record-btn-${rec.id}`}
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => confirmDelete(rec.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition"
                                  title="Delete this compliance record"
                                  id={`delete-record-btn-${rec.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center gap-2 text-slate-500 text-[10px] border-t border-slate-100 pt-3">
            <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
            <span>Records are preserved in browser secure sandboxed LocalStorage for easy 3-year audit trail extraction.</span>
          </div>
        </div>
      )}
    </div>
  );
}
