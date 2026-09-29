import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Department } from '../types';
import { BarChart3, Download, FileSpreadsheet, FileText, Filter, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Reports: React.FC<ReportsProps> = ({ showToast }) => {
  const [reportType, setReportType] = useState<'students' | 'attendance' | 'academic'>('students');
  const [reportData, setReportData] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [deptFilter, setDeptFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [lowAttendanceOnly, setLowAttendanceOnly] = useState(false);
  const [academicRiskOnly, setAcademicRiskOnly] = useState(false);

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      if (reportType === 'students') {
        const data = await api.getStudentsReport({ department_id: deptFilter, academic_status: statusFilter });
        setReportData(data);
      } else if (reportType === 'attendance') {
        const data = await api.getAttendanceReport({ max_percentage: lowAttendanceOnly ? 74.9 : 100.0 });
        setReportData(data);
      } else if (reportType === 'academic') {
        const data = await api.getAcademicReport(academicRiskOnly ? 5.99 : undefined);
        setReportData(data);
      }
    } catch (err: any) {
      showToast(err.message || 'Error generating report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportType, deptFilter, statusFilter, lowAttendanceOnly, academicRiskOnly]);

  const exportCSV = () => {
    window.open(api.getExportDownloadUrl(reportType, 'csv'), '_blank');
  };

  const exportExcel = () => {
    window.open(api.getExportDownloadUrl(reportType, 'excel'), '_blank');
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(9, 117, 246);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`CAMPUS REPORT: ${reportType.toUpperCase()}`, 14, 16);

    const headers = 
      reportType === 'students'
        ? [['Reg No', 'Name', 'Email', 'Department', 'Year', 'CGPA', 'Status']]
        : reportType === 'attendance'
        ? [['Reg No', 'Name', 'Department', 'Total Cls', 'Attended Cls', 'Attendance %', 'Warning']]
        : [['Reg No', 'Name', 'Department', 'Year', 'CGPA', 'Academic Status', 'Risk Alert']];

    const body = reportData.map(item => {
      if (reportType === 'students') {
        return [item.register_number, item.full_name, item.email, item.department, item.year, item.cgpa, item.status];
      } else if (reportType === 'attendance') {
        return [item.register_number, item.full_name, item.department, item.total_classes, item.classes_attended, `${item.attendance_percentage}%`, item.is_low_attendance ? 'LOW' : 'OK'];
      } else {
        return [item.register_number, item.full_name, item.department, item.year, item.cgpa, item.academic_status, item.is_at_risk ? 'AT RISK' : 'NORMAL'];
      }
    });

    autoTable(doc, {
      startY: 30,
      head: headers,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [9, 117, 246] },
    });

    doc.save(`${reportType}_report.pdf`);
    showToast('PDF Report downloaded!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Reports & Export Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate printable reports and export audit spreadsheets in PDF, Excel, or CSV formats
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span>CSV</span>
          </button>
          <button
            onClick={exportExcel}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Excel</span>
          </button>
          <button
            onClick={generatePDF}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { key: 'students', label: 'Complete Student Directory' },
          { key: 'attendance', label: 'Attendance Compliance Report' },
          { key: 'academic', label: 'Academic Performance & Risk' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setReportType(t.key as any)}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              reportType === t.key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4 text-xs">
        {reportType === 'students' && (
          <>
            <select
              value={deptFilter || ''}
              onChange={e => setDeptFilter(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter || ''}
              onChange={e => setStatusFilter(e.target.value || undefined)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            >
              <option value="">All Academic Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="GRADUATED">GRADUATED</option>
            </select>
          </>
        )}

        {reportType === 'attendance' && (
          <label className="flex items-center gap-2 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={lowAttendanceOnly}
              onChange={e => setLowAttendanceOnly(e.target.checked)}
              className="rounded"
            />
            <span>Filter Low Attendance (&lt; 75% Only)</span>
          </label>
        )}

        {reportType === 'academic' && (
          <label className="flex items-center gap-2 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={academicRiskOnly}
              onChange={e => setAcademicRiskOnly(e.target.checked)}
              className="rounded"
            />
            <span>Filter Academic Risk (&lt; 6.0 CGPA Only)</span>
          </label>
        )}
      </div>

      {/* Report Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-semibold text-slate-500">Generating report...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold uppercase">
                  {reportType === 'students' && (
                    <>
                      <th className="py-3.5 px-4">Reg Number</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Year</th>
                      <th className="py-3.5 px-4">CGPA</th>
                      <th className="py-3.5 px-4">Status</th>
                    </>
                  )}
                  {reportType === 'attendance' && (
                    <>
                      <th className="py-3.5 px-4">Reg Number</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Total Classes</th>
                      <th className="py-3.5 px-4">Classes Attended</th>
                      <th className="py-3.5 px-4">Attendance %</th>
                      <th className="py-3.5 px-4">Compliance Status</th>
                    </>
                  )}
                  {reportType === 'academic' && (
                    <>
                      <th className="py-3.5 px-4">Reg Number</th>
                      <th className="py-3.5 px-4">Student Name</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Year</th>
                      <th className="py-3.5 px-4">CGPA</th>
                      <th className="py-3.5 px-4">Academic Status</th>
                      <th className="py-3.5 px-4">Risk Evaluation</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    {reportType === 'students' && (
                      <>
                        <td className="py-3.5 px-4 font-mono font-bold">{row.register_number}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{row.full_name}</td>
                        <td className="py-3.5 px-4 text-slate-500">{row.email}</td>
                        <td className="py-3.5 px-4">{row.department}</td>
                        <td className="py-3.5 px-4">{row.year}</td>
                        <td className="py-3.5 px-4 font-bold">{row.cgpa.toFixed(2)}</td>
                        <td className="py-3.5 px-4">{row.status}</td>
                      </>
                    )}
                    {reportType === 'attendance' && (
                      <>
                        <td className="py-3.5 px-4 font-mono font-bold">{row.register_number}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{row.full_name}</td>
                        <td className="py-3.5 px-4">{row.department}</td>
                        <td className="py-3.5 px-4">{row.total_classes}</td>
                        <td className="py-3.5 px-4">{row.classes_attended}</td>
                        <td className="py-3.5 px-4 font-extrabold">{row.attendance_percentage}%</td>
                        <td className="py-3.5 px-4">
                          {row.is_low_attendance ? (
                            <span className="px-2 py-0.5 rounded font-bold bg-rose-100 dark:bg-rose-950 text-rose-600">
                              Low (&lt;75%)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                              Compliant
                            </span>
                          )}
                        </td>
                      </>
                    )}
                    {reportType === 'academic' && (
                      <>
                        <td className="py-3.5 px-4 font-mono font-bold">{row.register_number}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{row.full_name}</td>
                        <td className="py-3.5 px-4">{row.department}</td>
                        <td className="py-3.5 px-4">{row.year}</td>
                        <td className="py-3.5 px-4 font-extrabold">{row.cgpa.toFixed(2)}</td>
                        <td className="py-3.5 px-4">{row.academic_status}</td>
                        <td className="py-3.5 px-4">
                          {row.is_at_risk ? (
                            <span className="px-2 py-0.5 rounded font-bold bg-amber-100 dark:bg-amber-950 text-amber-600">
                              At Risk (&lt;6.0)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded font-bold bg-blue-100 dark:bg-blue-950 text-blue-600">
                              Good Standing
                            </span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
