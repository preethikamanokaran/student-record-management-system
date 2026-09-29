import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Student, AcademicRecord, Attendance, Document as StudentDoc } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  User, 
  GraduationCap, 
  ClipboardCheck, 
  FileText, 
  Users, 
  Award, 
  Camera, 
  Download, 
  Upload, 
  Loader2,
  Trash2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface StudentDetailProps {
  studentId: number;
  onNavigate: (path: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const StudentDetail: React.FC<StudentDetailProps> = ({ studentId, onNavigate, showToast }) => {
  const { user } = useAuth();
  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'FACULTY';

  const [student, setStudent] = useState<Student | null>(null);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [documents, setDocuments] = useState<StudentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'attendance' | 'documents' | 'parent' | 'additional'>('personal');

  // Photo / Doc Upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('ID_PROOF');
  const [docFile, setDocFile] = useState<File | null>(null);

  const fetchStudentFullProfile = async () => {
    try {
      setLoading(true);
      const [sData, aData, attData, docData] = await Promise.all([
        api.getStudent(studentId),
        api.getStudentAcademicRecords(studentId),
        api.getStudentAttendance(studentId),
        api.getStudentDocuments(studentId),
      ]);
      setStudent(sData);
      setAcademicRecords(aData);
      setAttendanceRecords(attData);
      setDocuments(docData);
    } catch (err: any) {
      showToast(err.message || 'Failed to load student profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentFullProfile();
  }, [studentId]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingPhoto(true);
    try {
      const updated = await api.uploadStudentPhoto(studentId, file);
      setStudent(updated);
      showToast('Profile photo updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docFile) {
      showToast('Please provide a document title and select a file', 'error');
      return;
    }
    setUploadingDoc(true);
    try {
      await api.uploadStudentDocument(studentId, docTitle, docType, docFile);
      showToast('Document uploaded successfully!', 'success');
      setDocTitle('');
      setDocFile(null);
      fetchStudentFullProfile();
    } catch (err: any) {
      showToast(err.message || 'Failed to upload document', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (docId: number) => {
    try {
      await api.deleteDocument(docId);
      showToast('Document deleted', 'success');
      fetchStudentFullProfile();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete document', 'error');
    }
  };

  const generatePDFReport = () => {
    if (!student) return;
    const doc = new jsPDF();

    // Header
    doc.setFillColor(9, 117, 246);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL STUDENT RECORD PROFILE', 14, 18);

    doc.setFontSize(9);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 140, 18);

    // Personal details table
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Personal & Academic Profile', 14, 40);

    autoTable(doc, {
      startY: 45,
      head: [['Field', 'Information']],
      body: [
        ['Full Name', student.full_name],
        ['Register Number', student.register_number],
        ['Email Address', student.email],
        ['Phone Number', student.phone || 'N/A'],
        ['Department', student.department_name || 'N/A'],
        ['Course', student.course_name || 'N/A'],
        ['Academic Year & Sem', `Year ${student.year} - Semester ${student.semester}`],
        ['Current CGPA', student.cgpa.toFixed(2)],
        ['Academic Status', student.academic_status],
      ],
      theme: 'grid',
      headStyles: { fillColor: [9, 117, 246] },
    });

    // Academic records table
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.text('Academic Performance Records', 14, finalY + 15);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Subject', 'Credits', 'Internal', 'External', 'Total', 'Grade', 'Grade Point']],
      body: academicRecords.map(r => [
        r.subject_name || `Subject ${r.subject_id}`,
        r.credits || 3,
        r.internal_marks,
        r.external_marks,
        r.total_marks,
        r.grade,
        r.grade_point,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
    });

    doc.save(`Student_Profile_${student.register_number}.pdf`);
    showToast('Student PDF report generated successfully!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-semibold text-slate-500">Loading student profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6 text-center text-rose-500 font-semibold">
        Student profile not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/students')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </button>

        <button
          onClick={generatePDFReport}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* Student Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row items-center gap-6">
        {/* Photo Avatar */}
        <div className="relative group flex-shrink-0">
          <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-blue-500/30 overflow-hidden flex items-center justify-center text-3xl font-extrabold text-blue-600 dark:text-blue-400 shadow-inner">
            {student.profile_photo ? (
              <img
                src={`http://127.0.0.1:8000${student.profile_photo}`}
                alt={student.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              student.full_name.charAt(0)
            )}
          </div>

          {isStaffOrAdmin && (
            <label className="absolute inset-0 rounded-3xl bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
              <Camera className="w-6 h-6" />
              <span className="text-[10px] font-semibold mt-1">Change</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Essential Metadata */}
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
              {student.full_name}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {student.register_number}
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            {student.department_name} &bull; {student.course_name}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs">
            <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              Year {student.year} - Semester {student.semester} ({student.section})
            </div>
            <div className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
              CGPA: {student.cgpa.toFixed(2)}
            </div>
            <div className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
              {student.academic_status}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2">
        {[
          { key: 'personal', label: 'Personal Info', icon: User },
          { key: 'academic', label: 'Academic Performance', icon: GraduationCap },
          { key: 'attendance', label: 'Attendance Record', icon: ClipboardCheck },
          { key: 'documents', label: 'Documents', icon: FileText },
          { key: 'parent', label: 'Parent / Guardian', icon: Users },
          { key: 'additional', label: 'Skills & Achievements', icon: Award },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Email Address</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{student.email}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Phone Number</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{student.phone || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Date of Birth</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{student.dob || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Gender</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{student.gender || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Blood Group</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{student.blood_group || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Admission Year</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{student.admission_year}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-3 space-y-1 pt-2">
              <span className="text-slate-400 font-semibold uppercase">Permanent Residential Address</span>
              <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                {student.address || 'N/A'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Subject Marks & Grades Breakdown
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4">Internal Marks</th>
                    <th className="py-3 px-4">External Marks</th>
                    <th className="py-3 px-4">Total Marks</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {academicRecords.map(r => (
                    <tr key={r.id}>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{r.subject_name}</p>
                        <p className="text-[10px] text-slate-400">{r.subject_code}</p>
                      </td>
                      <td className="py-3 px-4">{r.credits || 3}</td>
                      <td className="py-3 px-4 font-semibold">{r.internal_marks}</td>
                      <td className="py-3 px-4 font-semibold">{r.external_marks}</td>
                      <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">{r.total_marks}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-800">
                          {r.grade}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">{r.grade_point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Subject-wise Attendance Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attendanceRecords.map(att => (
                <div key={att.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{att.subject_name}</p>
                      <p className="text-[10px] text-slate-400">{att.subject_code}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      att.attendance_percentage >= 75
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}>
                      {att.attendance_percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        att.attendance_percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, att.attendance_percentage)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Attended: {att.classes_attended} / {att.total_classes}</span>
                    <span>Absent: {att.classes_absent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            {isStaffOrAdmin && (
              <form onSubmit={handleDocUpload} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">Upload New Document</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="Document Title (e.g. 10th Mark Sheet)"
                    value={docTitle}
                    onChange={e => setDocTitle(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  />
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="ID_PROOF">ID Proof</option>
                    <option value="CERTIFICATE">Certificate</option>
                    <option value="MARK_SHEET">Mark Sheet</option>
                    <option value="BONAFIDE">Bonafide Certificate</option>
                    <option value="TRANSFER">Transfer Certificate</option>
                    <option value="OTHER">Other Document</option>
                  </select>
                  <input
                    type="file"
                    required
                    onChange={e => setDocFile(e.target.files?.[0] || null)}
                    className="px-3 py-1.5 text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2"
                >
                  {uploadingDoc && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Upload Document</span>
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map(doc => (
                <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{doc.title}</p>
                      <p className="text-[10px] text-slate-400">{doc.doc_type} &bull; {(doc.file_size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={api.getDocumentDownloadUrl(doc.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    {isStaffOrAdmin && (
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'parent' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Parent / Guardian Name</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{student.parent_name || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Relationship</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{student.parent_relationship || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Parent Phone</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{student.parent_phone || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Parent Email</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{student.parent_email || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Occupation</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{student.parent_occupation || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-semibold uppercase">Emergency Contact</span>
              <p className="font-bold text-slate-800 dark:text-slate-100">{student.emergency_contact || 'N/A'}</p>
            </div>
          </div>
        )}

        {activeTab === 'additional' && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold uppercase block mb-1">Technical & Soft Skills</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                {student.skills || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase block mb-1">Professional Certifications</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                {student.certifications || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase block mb-1">Achievements & Honors</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                {student.achievements || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase block mb-1">Extracurricular Activities</span>
              <p className="font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                {student.extracurriculars || 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
