import React, { useState, useEffect } from 'react';
import {
  Award,
  CreditCard,
  Printer,
  Download,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Building2,
  Sparkles,
  FileText,
  User,
  Calendar,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';

export const CertificatesPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('id-card'); // 'id-card' | 'bonafide' | 'no-dues' | 'character'
  const [loading, setLoading] = useState(true);

  // Load students for selector
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/students?limit=50');
        if (res.data.success && res.data.data.length > 0) {
          setStudents(res.data.data);
          // If logged in student, find their profile, else default to first
          const current = res.data.data.find((s) => s.userId?._id === user?.id) || res.data.data[0];
          setSelectedStudent(current);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Identity Cards & Official Certificates"
        description="University issued high-security digital ID credentials, Bonafide documents, and academic clearance letters."
      >
        <Button variant="primary" size="sm" onClick={handlePrint} icon={Printer}>
          Print Document / PDF
        </Button>
      </PageHeader>

      {/* Tabs & Student Selector Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('id-card')}
            className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'id-card'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Digital Smart ID Card</span>
          </button>

          <button
            onClick={() => setActiveTab('bonafide')}
            className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'bonafide'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Bonafide Certificate</span>
          </button>

          <button
            onClick={() => setActiveTab('no-dues')}
            className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'no-dues'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fee No-Dues Certificate</span>
          </button>

          <button
            onClick={() => setActiveTab('character')}
            className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'character'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Conduct & Character</span>
          </button>
        </div>

        {/* Student Selector */}
        {students.length > 0 && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-slate-500 shrink-0 font-medium">Select Student:</span>
            <select
              value={selectedStudent?._id || ''}
              onChange={(e) => {
                const s = students.find((item) => item._id === e.target.value);
                if (s) setSelectedStudent(s);
              }}
              className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-semibold"
            >
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.fullName} ({s.registrationNumber})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading || !selectedStudent ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading student credentials...</div>
      ) : (
        <div>
          {/* TAB 1: SMART STUDENT ID CARD */}
          {activeTab === 'id-card' && (
            <div className="space-y-6">
              <div className="text-center text-xs text-slate-500 mb-2">
                Official University Student Smart Identification Card with embedded UIDAI Aadhaar verification & QR code.
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-4">
                {/* ID Card Front */}
                <div className="w-[340px] h-[520px] rounded-3xl bg-gradient-to-b from-brand-700 via-brand-600 to-indigo-800 text-white p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between border-2 border-white/20">
                  {/* Background Watermark SG */}
                  <div className="absolute -right-8 -bottom-8 text-[180px] font-black text-white/5 select-none pointer-events-none">
                    SG
                  </div>

                  {/* Header */}
                  <div className="text-center space-y-1 relative z-10">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xs text-white">
                        SG
                      </div>
                      <h4 className="font-black text-sm tracking-wide uppercase">
                        SG Tech University
                      </h4>
                    </div>
                    <p className="text-[10px] text-white/80 font-medium tracking-widest uppercase">
                      Smart Generation • SGTU
                    </p>
                    <div className="inline-block px-3 py-0.5 rounded-full bg-white/10 text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs">
                      Student Identity Card
                    </div>
                  </div>

                  {/* Photo & Details */}
                  <div className="text-center space-y-3 relative z-10">
                    <div className="relative inline-block">
                      <img
                        src={selectedStudent.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={selectedStudent.fullName}
                        className="w-24 h-24 rounded-2xl object-cover mx-auto border-3 border-white shadow-lg"
                      />
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-white shadow-xs">
                        {selectedStudent.bloodGroup || 'O+'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base leading-tight">
                        {selectedStudent.fullName}
                      </h3>
                      <p className="text-xs text-amber-300 font-mono font-bold mt-0.5">
                        {selectedStudent.registrationNumber}
                      </p>
                      <p className="text-[11px] text-white/90 font-medium mt-1">
                        {selectedStudent.courseId?.name || 'B.Tech Computer Science'}
                      </p>
                      <p className="text-[10px] text-white/70">
                        {selectedStudent.departmentId?.name || 'School of Computing'}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom / Barcode */}
                  <div className="space-y-2 relative z-10 pt-2 border-t border-white/15 text-center">
                    <div className="grid grid-cols-2 text-[10px] text-left text-white/80">
                      <div>
                        <span className="text-white/60 block text-[9px]">Aadhaar No</span>
                        <span className="font-mono font-bold">
                          {selectedStudent.aadhaarNumber ? `•••• ${selectedStudent.aadhaarNumber.slice(-4)}` : 'Verified'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-white/60 block text-[9px]">Valid Thru</span>
                        <span className="font-bold">JULY 2027</span>
                      </div>
                    </div>

                    {/* Barcode representation */}
                    <div className="bg-white p-2 rounded-xl text-slate-900 flex flex-col items-center shadow-xs">
                      <div className="font-mono tracking-[4px] text-[10px] font-black">
                        ||| | ||||| | || |||| | |||
                      </div>
                      <span className="text-[8px] font-mono text-slate-500">
                        {selectedStudent.registrationNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ID Card Back */}
                <div className="w-[340px] h-[520px] rounded-3xl bg-white dark:bg-navy-900 text-slate-800 dark:text-white p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between border-2 border-slate-200 dark:border-navy-800">
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 dark:border-navy-800 pb-3 text-center">
                      <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                        Terms & Emergency Coordinates
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Property of SG Tech University
                      </p>
                    </div>

                    <div className="space-y-2.5 text-[11px]">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Permanent Residential Address
                        </span>
                        <p className="font-medium text-slate-700 dark:text-slate-300 text-[10px] leading-tight">
                          {selectedStudent.address || '742 Cyber City, Tech Park Avenue, Bangalore, Karnataka - 560100'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            Emergency Phone
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {selectedStudent.emergencyContact || selectedStudent.phone}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            Caste Category
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {selectedStudent.caste || 'General'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Campus Helplines
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Anti-Ragging: 1800-180-5522 | Campus Security: +91 80 2841 0000
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
                      <QrCode className="w-12 h-12 text-slate-900 dark:text-white" />
                    </div>

                    <div className="text-right space-y-1">
                      <div className="font-serif italic text-sm text-brand-600 dark:text-brand-400 font-bold">
                        Dr. K. Venkatraman
                      </div>
                      <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                        Registrar & Controller
                      </div>
                      <div className="text-[8px] text-slate-400">
                        SG Tech University
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BONAFIDE CERTIFICATE */}
          {activeTab === 'bonafide' && (
            <div className="max-w-3xl mx-auto p-8 sm:p-12 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xl space-y-8 text-slate-800 dark:text-slate-200">
              {/* University Letterhead */}
              <div className="text-center pb-6 border-b-2 border-brand-500 space-y-1">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                    SG
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                      SG TECH UNIVERSITY
                    </h2>
                    <p className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-widest uppercase">
                      Smart Generation • Established Under State University Act
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Electronic City Phase 1, Bangalore, Karnataka - 560100 | portal.sgtu.edu.in
                </p>
              </div>

              {/* Reference & Date */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <div>Ref: SGTU/ACAD/BONA/2026/8942</div>
                <div>Date: {todayFormatted}</div>
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <span className="inline-block text-base font-black uppercase tracking-widest px-6 py-1.5 border-b-2 border-slate-900 dark:border-white">
                  BONAFIDE CERTIFICATE
                </span>
              </div>

              {/* Body */}
              <div className="text-sm leading-relaxed space-y-4 text-justify">
                <p>
                  This is to certify that <strong>{selectedStudent.fullName}</strong>, son/daughter of{' '}
                  <strong>{selectedStudent.fatherName || 'Ramesh Kumar'}</strong>, bearing University Registration
                  Number <strong className="font-mono">{selectedStudent.registrationNumber}</strong>, is a bonafide
                  regular student of this University.
                </p>
                <p>
                  He/She is currently enrolled in the <strong>Semester {selectedStudent.currentSemester}</strong> of the{' '}
                  <strong>{selectedStudent.courseId?.name || 'Bachelor of Technology (Computer Science and Engineering)'}</strong> program
                  under the <strong>{selectedStudent.departmentId?.name || 'Department of Computer Science'}</strong> for the
                  academic session 2026–2027.
                </p>
                <p>
                  As per University records, his/her date of birth is <strong>{selectedStudent.dateOfBirth || '14th May 2004'}</strong> and
                  Government Aadhaar verification stands recorded. During his/her tenure at SG Tech University, his/her conduct and
                  moral character have been found to be exemplary.
                </p>
                <p>
                  This certificate is issued on the student's request for official academic verification, passport processing, or educational grant facilitation.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-12 flex items-end justify-between text-xs">
                <div className="text-center space-y-1">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-navy-700 flex items-center justify-center text-[10px] text-slate-400 mx-auto">
                    OFFICIAL SEAL
                  </div>
                  <span className="text-[10px] text-slate-400 block">Office of Dean</span>
                </div>

                <div className="text-center space-y-1">
                  <div className="font-serif italic font-bold text-base text-brand-600 dark:text-brand-400">
                    Dr. K. Venkatraman
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white block">Registrar</span>
                  <span className="text-[11px] text-slate-500 block">SG Tech University</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NO-DUES CLEARANCE */}
          {activeTab === 'no-dues' && (
            <div className="max-w-3xl mx-auto p-8 sm:p-12 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xl space-y-8 text-slate-800 dark:text-slate-200">
              <div className="text-center pb-6 border-b-2 border-emerald-500 space-y-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  SG TECH UNIVERSITY • BURSAR & ACCOUNTS
                </h2>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Official Institutional No-Dues Clearance Clearance
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <div>Certificate No: SGTU/NODUES/2026/0411</div>
                <div>Date: {todayFormatted}</div>
              </div>

              <div className="text-sm leading-relaxed space-y-4">
                <p>
                  This certificate verifies that <strong>{selectedStudent.fullName}</strong> (Roll No:{' '}
                  <span className="font-mono font-bold">{selectedStudent.registrationNumber}</span>) has cleared all outstanding
                  financial and operational dues across university divisions as of {todayFormatted}:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 flex items-center justify-between">
                    <span>Tuition & Examination Fees</span>
                    <span className="font-bold text-emerald-600">CLEARED (₹0 Dues)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 flex items-center justify-between">
                    <span>Central Library Circulation</span>
                    <span className="font-bold text-emerald-600">ALL BOOKS RETURNED</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 flex items-center justify-between">
                    <span>Laboratories & Equipment</span>
                    <span className="font-bold text-emerald-600">NO BREAKAGES</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 flex items-center justify-between">
                    <span>Hostel & Residential Mess</span>
                    <span className="font-bold text-emerald-600">CLEARED</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 italic pt-2">
                  The student is entitled to appear for semester end examinations and receive university degree credentials without encumbrance.
                </p>
              </div>

              <div className="pt-8 flex items-end justify-between text-xs">
                <div className="text-left space-y-0.5">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Verified by:</span>
                  <p className="text-slate-500">Finance & Accounts Office</p>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="font-serif italic font-bold text-sm text-emerald-600">N. Ramanathan</div>
                  <span className="font-bold text-slate-900 dark:text-white block">Chief Finance Officer</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONDUCT & CHARACTER */}
          {activeTab === 'character' && (
            <div className="max-w-3xl mx-auto p-8 sm:p-12 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xl space-y-8 text-slate-800 dark:text-slate-200">
              <div className="text-center pb-6 border-b-2 border-indigo-500 space-y-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  SG TECH UNIVERSITY
                </h2>
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  Certificate of Conduct & Character
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <div>Ref: SGTU/CONDUCT/2026/112</div>
                <div>Issued: {todayFormatted}</div>
              </div>

              <div className="text-sm leading-relaxed space-y-4 text-justify">
                <p>
                  This is to certify that <strong>{selectedStudent.fullName}</strong>, having Student ID{' '}
                  <strong className="font-mono">{selectedStudent.registrationNumber}</strong>, has been a bona fide student
                  pursuing <strong>{selectedStudent.courseId?.name || 'B.Tech Computer Science'}</strong> at SG Tech University.
                </p>
                <p>
                  To the best of our knowledge and university disciplinary records, he/she bears an exemplary moral character.
                  He/She has actively participated in campus academic initiatives and has never been subject to disciplinary probation
                  or reprimand.
                </p>
                <p>We wish him/her the very best in all future academic and professional endeavors.</p>
              </div>

              <div className="pt-12 flex items-end justify-between text-xs">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 block">Dean of Student Affairs</span>
                </div>
                <div className="text-center">
                  <div className="font-serif italic font-bold text-sm text-indigo-600">Prof. Rajesh Sharma</div>
                  <span className="font-bold text-slate-900 dark:text-white block">Head of Department</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default CertificatesPage;
