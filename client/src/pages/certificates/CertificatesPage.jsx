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
  Camera,
  Image as ImageIcon,
  Check,
  AlertCircle,
  X,
  GraduationCap,
  Briefcase,
  BookOpen,
  DollarSign,
  Shield,
  Layers,
  Edit3,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';

// Role Category Definitions for Identity Cards
const ROLE_CATEGORIES = [
  { id: 'STUDENTS', label: 'Students', icon: GraduationCap, badge: 'Undergrad & Postgrad' },
  { id: 'HODS', label: 'HODs', icon: Building2, badge: 'Heads of Departments' },
  { id: 'FACULTY', label: 'Faculties', icon: Briefcase, badge: 'Professors & Teaching Staff' },
  { id: 'LIBRARIANS', label: 'Librarians', icon: BookOpen, badge: 'Knowledge & Archives' },
  { id: 'ACCOUNTANTS', label: 'Accountants', icon: DollarSign, badge: 'Finance & Bursar' },
];

// Preset realistic portraits for quick Admin assignment
const PRESET_AVATARS = [
  { name: 'Male Scholar / Student', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80' },
  { name: 'Female Scholar / Student', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' },
  { name: 'Senior Professor (HOD)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80' },
  { name: 'Associate Professor', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80' },
  { name: 'Chief Librarian', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80' },
  { name: 'Accounts Officer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
  { name: 'Faculty Member', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80' },
  { name: 'Academic Researcher', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80' },
];

export const CertificatesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState('id-card'); // 'id-card' | 'bonafide' | 'no-dues' | 'character'
  const [selectedCategory, setSelectedCategory] = useState('STUDENTS');
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // Fallback student list for Bonafide / No-Dues certificates
  const [studentsList, setStudentsList] = useState([]);

  // Admin Photo Upload & Format modal state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [modalAvatarUrl, setModalAvatarUrl] = useState('');
  const [modalPhotoFormat, setModalPhotoFormat] = useState('PASSPORT_SIZE'); // 'PASSPORT_SIZE' | 'STAMP_SIZE'
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('');

  // Fetch members whenever category changes
  useEffect(() => {
    const fetchCategoryMembers = async () => {
      setCategoryLoading(true);
      try {
        const res = await api.get(`/id-cards/members?category=${selectedCategory}`);
        if (res.data.success && res.data.data.length > 0) {
          setMembers(res.data.data);
          setSelectedMember(res.data.data[0]);
          if (selectedCategory === 'STUDENTS') {
            setStudentsList(res.data.data);
          }
        } else {
          setMembers([]);
          setSelectedMember(null);
        }
      } catch (err) {
        console.error('Failed to load ID card members:', err);
        // Fallback for students if endpoint had unexpected error
        if (selectedCategory === 'STUDENTS') {
          try {
            const fallback = await api.get('/students?limit=50');
            if (fallback.data.success && fallback.data.data.length > 0) {
              const mapped = fallback.data.data.map(s => ({
                id: s.userId?._id || s._id,
                profileId: s._id,
                fullName: s.fullName,
                collegeId: s.registrationNumber,
                email: s.email || s.userId?.email,
                phone: s.phone,
                role: 'STUDENT',
                categoryTitle: 'Student Identity Card',
                departmentName: s.departmentId?.name || 'Computer Science & Engineering',
                departmentCode: s.departmentId?.code || 'CSE',
                courseName: s.courseId?.name || 'B.Tech Computer Science',
                currentSemester: s.currentSemester || 6,
                designation: 'Undergraduate Scholar',
                bloodGroup: s.bloodGroup || 'O+',
                aadhaarNumber: s.aadhaarNumber ? `•••• ${s.aadhaarNumber.slice(-4)}` : 'Verified',
                address: s.address || 'SG Tech University Campus Hostel',
                emergencyContact: s.emergencyContact || s.phone,
                validThru: 'JULY 2027',
                avatar: s.avatar || s.userId?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
                photoFormat: s.photoFormat || s.userId?.photoFormat || 'PASSPORT_SIZE',
              }));
              setMembers(mapped);
              setSelectedMember(mapped[0]);
              setStudentsList(mapped);
            }
          } catch (e2) {
            console.error(e2);
          }
        }
      } finally {
        setCategoryLoading(false);
        setLoading(false);
      }
    };

    fetchCategoryMembers();
  }, [selectedCategory]);

  // Handle Photo Format toggle directly from ID Card view (Admin or interactive preview)
  const handleFormatToggle = async (newFormat) => {
    if (!selectedMember) return;
    if (selectedMember.photoFormat === newFormat) return;

    // Optimistic UI update
    const updatedMember = { ...selectedMember, photoFormat: newFormat };
    setSelectedMember(updatedMember);
    setMembers((prev) => prev.map((m) => (m.id === selectedMember.id ? updatedMember : m)));

    // If Admin, auto-save the selection to the database
    if (isAdmin) {
      try {
        await api.patch(`/id-cards/photo/${selectedMember.id}`, {
          photoFormat: newFormat,
          avatar: selectedMember.avatar,
        });
        setAdminSuccessMsg(`Photo format set to ${newFormat === 'PASSPORT_SIZE' ? 'Passport Size (35×45mm)' : 'Stamp Size (25×30mm)'}`);
        setTimeout(() => setAdminSuccessMsg(''), 3000);
      } catch (err) {
        console.error('Error saving format:', err);
      }
    }
  };

  // Open the Admin Photo & Format Editor Modal
  const openPhotoModal = () => {
    if (!selectedMember) return;
    setModalAvatarUrl(selectedMember.avatar || '');
    setModalPhotoFormat(selectedMember.photoFormat || 'PASSPORT_SIZE');
    setIsPhotoModalOpen(true);
  };

  // Save changes from Admin modal
  const handleSavePhotoModal = async () => {
    if (!selectedMember) return;
    setSavingPhoto(true);
    try {
      const res = await api.patch(`/id-cards/photo/${selectedMember.id}`, {
        avatar: modalAvatarUrl,
        photoFormat: modalPhotoFormat,
      });

      if (res.data.success) {
        const updated = {
          ...selectedMember,
          avatar: modalAvatarUrl,
          photoFormat: modalPhotoFormat,
        };
        setSelectedMember(updated);
        setMembers((prev) => prev.map((m) => (m.id === selectedMember.id ? updated : m)));
        setIsPhotoModalOpen(false);
        setAdminSuccessMsg('Identity Card photo and format successfully updated!');
        setTimeout(() => setAdminSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update photo & format.');
    } finally {
      setSavingPhoto(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Card theme helper based on member category
  const getCardTheme = () => {
    switch (selectedCategory) {
      case 'HODS':
        return {
          gradient: 'from-rose-950 via-red-900 to-amber-950',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
          tag: 'Head of Department (HOD)',
          accentColor: 'text-amber-300',
        };
      case 'FACULTY':
        return {
          gradient: 'from-emerald-950 via-teal-900 to-cyan-950',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
          tag: 'Faculty / Teaching Staff',
          accentColor: 'text-emerald-300',
        };
      case 'LIBRARIANS':
        return {
          gradient: 'from-purple-950 via-indigo-950 to-slate-950',
          badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
          tag: 'University Librarian',
          accentColor: 'text-purple-300',
        };
      case 'ACCOUNTANTS':
        return {
          gradient: 'from-slate-950 via-blue-950 to-amber-950',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
          tag: 'Accounts & Bursar Division',
          accentColor: 'text-amber-300',
        };
      case 'STUDENTS':
      default:
        return {
          gradient: 'from-brand-800 via-brand-700 to-indigo-950',
          badgeBg: 'bg-white/20 text-white border-white/20',
          tag: 'Student Identity Card',
          accentColor: 'text-amber-300',
        };
    }
  };

  const theme = getCardTheme();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Official Identity Cards & Academic Credentials"
        description="High-security university identity card system for Students, HODs, Faculties, Librarians, and Accountants with configurable Passport Size & Stamp Size photo formats."
      >
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={openPhotoModal}
              icon={Camera}
              disabled={!selectedMember}
            >
              Admin: Edit Photo & Format
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={handlePrint} icon={Printer}>
            Print / Save PDF
          </Button>
        </div>
      </PageHeader>

      {/* Main Mode Tabs: ID Card vs Bonafide vs No-Dues vs Character */}
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

        {/* Member Selector (For Active Tab) */}
        {activeTab === 'id-card' ? (
          members.length > 0 && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-slate-500 shrink-0 font-medium">
                Select {ROLE_CATEGORIES.find((c) => c.id === selectedCategory)?.label.slice(0, -1) || 'Member'}:
              </span>
              <select
                value={selectedMember?.id || ''}
                onChange={(e) => {
                  const m = members.find((item) => item.id === e.target.value);
                  if (m) setSelectedMember(m);
                }}
                className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-semibold text-slate-900 dark:text-slate-100"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.collegeId})
                  </option>
                ))}
              </select>
            </div>
          )
        ) : (
          studentsList.length > 0 && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-slate-500 shrink-0 font-medium">Select Student:</span>
              <select
                value={selectedMember?.id || ''}
                onChange={(e) => {
                  const s = studentsList.find((item) => item.id === e.target.value);
                  if (s) setSelectedMember(s);
                }}
                className="text-xs px-3 py-1.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-semibold"
              >
                {studentsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.collegeId})
                  </option>
                ))}
              </select>
            </div>
          )
        )}
      </div>

      {/* TAB 1: SMART IDENTITY CARDS SECTION */}
      {activeTab === 'id-card' && (
        <div className="space-y-6">
          {/* 1. SEPARATE ROLE SELECTOR TABS */}
          <div className="bg-white dark:bg-navy-900 p-4 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Identity Card Directory by Role</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a category to view institutional identity cards with role-specific departmental data and photo format.
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-brand-50 dark:bg-navy-950 text-brand-600 dark:text-brand-400 font-bold border border-brand-200 dark:border-navy-700">
                {members.length} {selectedCategory.toLowerCase()} registered
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
              {ROLE_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-brand-50 dark:bg-navy-950 border-brand-500 ring-2 ring-brand-500/20 text-brand-700 dark:text-brand-300 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-navy-950/50 border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-navy-700'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-500'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black truncate">{cat.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {cat.badge}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. PHOTO SPECIFICATION & FORMAT SECTION (PASSPORT SIZE vs STAMP SIZE - USE ONLY ONE) */}
          <div className="bg-gradient-to-r from-slate-900 via-navy-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Camera className="w-4 h-4" />
                </span>
                <h4 className="font-black text-sm tracking-wide">
                  Identity Card Photo Dimension & Aspect Ratio Section
                </h4>
              </div>
              <p className="text-xs text-slate-300">
                Both standard formats are supported: <strong>PASSPORT SIZE (35×45mm)</strong> and <strong>STAMP SIZE (25×30mm)</strong>.
                <span className="text-amber-400 font-bold ml-1">The active ID card uses only one format at a time.</span>
              </p>
            </div>

            {/* Toggle format buttons */}
            <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
              <button
                onClick={() => handleFormatToggle('PASSPORT_SIZE')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedMember?.photoFormat === 'PASSPORT_SIZE'
                    ? 'bg-brand-600 text-white shadow-md ring-2 ring-brand-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Passport Size (35×45mm)</span>
                {selectedMember?.photoFormat === 'PASSPORT_SIZE' && (
                  <Check className="w-3 h-3 text-emerald-300" />
                )}
              </button>

              <button
                onClick={() => handleFormatToggle('STAMP_SIZE')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedMember?.photoFormat === 'STAMP_SIZE'
                    ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Stamp Size (25×30mm)</span>
                {selectedMember?.photoFormat === 'STAMP_SIZE' && (
                  <Check className="w-3 h-3 text-emerald-300" />
                )}
              </button>
            </div>
          </div>

          {/* Admin Success Toast Message */}
          {adminSuccessMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{adminSuccessMsg}</span>
              </div>
              <button onClick={() => setAdminSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 3. PHYSICAL ID CARD PREVIEW (FRONT & BACK) */}
          {categoryLoading ? (
            <div className="py-24 text-center">
              <RefreshCw className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading {selectedCategory} credentials...</p>
            </div>
          ) : !selectedMember ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No registered members found for {selectedCategory}.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center text-xs text-slate-500">
                Official University Identification Card • Embedded UIDAI Verification • Micro-Barcode Authentication
              </div>

              <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-4">
                {/* ID CARD FRONT */}
                <div
                  className={`w-[340px] h-[530px] rounded-3xl bg-gradient-to-b ${theme.gradient} text-white p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between border-2 border-white/20 select-none`}
                >
                  {/* Background Watermark SG */}
                  <div className="absolute -right-8 -bottom-8 text-[180px] font-black text-white/5 select-none pointer-events-none">
                    SG
                  </div>

                  {/* Header */}
                  <div className="text-center space-y-1 relative z-10">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xs text-white shadow-xs">
                        SG
                      </div>
                      <h4 className="font-black text-sm tracking-wide uppercase">
                        SG Tech University
                      </h4>
                    </div>
                    <p className="text-[10px] text-white/80 font-medium tracking-widest uppercase">
                      Smart Generation • SGTU
                    </p>
                    <div
                      className={`inline-block px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border backdrop-blur-xs ${theme.badgeBg}`}
                    >
                      {selectedMember.categoryTitle || theme.tag}
                    </div>
                  </div>

                  {/* Photo & Role-Specific Details */}
                  <div className="text-center space-y-2 relative z-10">
                    {/* PHOTO SECTION (PASSPORT SIZE OR STAMP SIZE - USES ONLY ONE) */}
                    <div className="relative inline-block mx-auto group">
                      {selectedMember.photoFormat === 'STAMP_SIZE' ? (
                        /* STAMP SIZE IMAGE (25mm x 30mm ratio, compact 80x96px) */
                        <div className="relative inline-block">
                          <img
                            src={
                              selectedMember.avatar ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                            }
                            alt={selectedMember.fullName}
                            className="w-20 h-24 rounded-lg object-cover mx-auto border-2 border-white/95 shadow-md ring-2 ring-white/30"
                          />
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[8px] font-black bg-amber-500 text-slate-900 shadow-xs uppercase tracking-tight whitespace-nowrap">
                            🏷️ Stamp Size (25×30mm)
                          </span>
                        </div>
                      ) : (
                        /* PASSPORT SIZE IMAGE (35mm x 45mm ratio, standard 112x144px) */
                        <div className="relative inline-block">
                          <img
                            src={
                              selectedMember.avatar ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                            }
                            alt={selectedMember.fullName}
                            className="w-28 h-36 rounded-xl object-cover mx-auto border-2 border-white/95 shadow-xl ring-2 ring-white/20"
                          />
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[8px] font-black bg-brand-500 text-white shadow-xs uppercase tracking-tight whitespace-nowrap">
                            📷 Passport Size (35×45mm)
                          </span>
                        </div>
                      )}

                      {/* Blood Group Tag */}
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-600 text-white shadow-xs border border-white/60">
                        {selectedMember.bloodGroup || 'O+'}
                      </span>

                      {/* Admin Quick Action Button on Hover */}
                      {isAdmin && (
                        <button
                          onClick={openPhotoModal}
                          title="Admin: Edit Photo & Format"
                          className="absolute -bottom-2 -right-3 p-1 rounded-full bg-slate-900/90 text-amber-300 border border-amber-400 shadow-lg hover:scale-110 transition-transform"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="pt-1">
                      <h3 className="font-extrabold text-base leading-tight">
                        {selectedMember.fullName}
                      </h3>
                      <p className={`text-xs font-mono font-bold mt-0.5 ${theme.accentColor}`}>
                        {selectedMember.collegeId}
                      </p>

                      {/* Role Specific Subtitle Data */}
                      {selectedCategory === 'STUDENTS' && (
                        <>
                          <p className="text-[11px] text-white/90 font-medium mt-1">
                            {selectedMember.courseName || 'B.Tech Computer Science'}
                          </p>
                          <p className="text-[10px] text-white/70">
                            {selectedMember.departmentName || 'School of Computing'} • Sem {selectedMember.currentSemester || 6}
                          </p>
                        </>
                      )}

                      {selectedCategory === 'HODS' && (
                        <>
                          <p className="text-[11px] text-white/95 font-bold mt-1">
                            {selectedMember.designation || 'Professor & Head of Department'}
                          </p>
                          <p className="text-[10px] text-white/80">
                            {selectedMember.departmentName}
                          </p>
                          {selectedMember.qualification && (
                            <p className="text-[9px] text-amber-300/90 italic mt-0.5">
                              {selectedMember.qualification}
                            </p>
                          )}
                        </>
                      )}

                      {selectedCategory === 'FACULTY' && (
                        <>
                          <p className="text-[11px] text-white/95 font-bold mt-1">
                            {selectedMember.designation || 'Associate Professor'}
                          </p>
                          <p className="text-[10px] text-white/80">
                            {selectedMember.departmentName}
                          </p>
                          {selectedMember.specialization && (
                            <p className="text-[9px] text-emerald-300/90 italic mt-0.5">
                              Spec: {selectedMember.specialization}
                            </p>
                          )}
                        </>
                      )}

                      {selectedCategory === 'LIBRARIANS' && (
                        <>
                          <p className="text-[11px] text-white/95 font-bold mt-1">
                            {selectedMember.designation || 'Chief University Librarian'}
                          </p>
                          <p className="text-[10px] text-white/80">
                            {selectedMember.departmentName || 'Central Library & Digital Archives'}
                          </p>
                          <p className="text-[9px] text-purple-200/90 font-mono mt-0.5">
                            CLEARANCE: ARCHIVE LEVEL-IV
                          </p>
                        </>
                      )}

                      {selectedCategory === 'ACCOUNTANTS' && (
                        <>
                          <p className="text-[11px] text-white/95 font-bold mt-1">
                            {selectedMember.designation || 'Accounts Officer & Bursar'}
                          </p>
                          <p className="text-[10px] text-white/80">
                            {selectedMember.departmentName || 'Finance & Accounts Division'}
                          </p>
                          <p className="text-[9px] text-amber-200/90 font-mono mt-0.5">
                            SIGNING AUTHORITY: LEVEL-II
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom / Barcode */}
                  <div className="space-y-2 relative z-10 pt-2 border-t border-white/15 text-center">
                    <div className="grid grid-cols-2 text-[10px] text-left text-white/80">
                      <div>
                        <span className="text-white/60 block text-[9px]">UIDAI / Govt ID</span>
                        <span className="font-mono font-bold">
                          {selectedMember.aadhaarNumber || 'Verified Official'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-white/60 block text-[9px]">Valid Thru</span>
                        <span className="font-bold">{selectedMember.validThru || 'PERMANENT'}</span>
                      </div>
                    </div>

                    {/* Barcode representation */}
                    <div className="bg-white p-2 rounded-xl text-slate-900 flex flex-col items-center shadow-xs">
                      <div className="font-mono tracking-[4px] text-[10px] font-black">
                        ||| | ||||| | || |||| | |||
                      </div>
                      <span className="text-[8px] font-mono text-slate-500">
                        {selectedMember.collegeId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ID CARD BACK */}
                <div className="w-[340px] h-[530px] rounded-3xl bg-white dark:bg-navy-900 text-slate-800 dark:text-white p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between border-2 border-slate-200 dark:border-navy-800 select-none">
                  <div className="space-y-3.5">
                    <div className="border-b border-slate-100 dark:border-navy-800 pb-2.5 text-center">
                      <h4 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                        Terms & Emergency Coordinates
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Property of SG Tech University • Bangalore
                      </p>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          {selectedCategory === 'STUDENTS' ? 'Permanent Residential Address' : 'Official Chamber / Staff Quarters'}
                        </span>
                        <p className="font-medium text-slate-700 dark:text-slate-300 text-[10px] leading-tight">
                          {selectedMember.address || 'SG Tech University Campus, Electronic City, Bangalore - 560100'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            Emergency Phone
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {selectedMember.emergencyContact || selectedMember.phone}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">
                            Official Role
                          </span>
                          <span className="font-bold text-brand-600 dark:text-brand-400 uppercase text-[10px]">
                            {selectedMember.role}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Campus Coordinates & Contact
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {selectedMember.email} | Ext: 4402
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">
                          Helpline & Security Control
                        </span>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Campus Security: +91 80 2841 0000 | Control: 1800-180-5522
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
                      <QrCode className="w-12 h-12 text-slate-900 dark:text-white" />
                    </div>

                    <div className="text-right space-y-0.5">
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
        </div>
      )}

      {/* TAB 2: BONAFIDE CERTIFICATE (For Students) */}
      {activeTab === 'bonafide' && selectedMember && (
        <div className="max-w-3xl mx-auto p-8 sm:p-12 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xl space-y-8 text-slate-800 dark:text-slate-200">
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

          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <div>Ref: SGTU/ACAD/BONA/2026/8942</div>
            <div>Date: {todayFormatted}</div>
          </div>

          <div className="text-center py-2">
            <span className="inline-block text-base font-black uppercase tracking-widest px-6 py-1.5 border-b-2 border-slate-900 dark:border-white">
              BONAFIDE CERTIFICATE
            </span>
          </div>

          <div className="text-sm leading-relaxed space-y-4 text-justify">
            <p>
              This is to certify that <strong>{selectedMember.fullName}</strong>, bearing University Registration
              Number <strong className="font-mono">{selectedMember.collegeId}</strong>, is a bonafide
              regular student of this University.
            </p>
            <p>
              He/She is currently enrolled in the <strong>Semester {selectedMember.currentSemester || 6}</strong> of the{' '}
              <strong>{selectedMember.courseName || 'Bachelor of Technology (Computer Science and Engineering)'}</strong> program
              under the <strong>{selectedMember.departmentName || 'Department of Computer Science'}</strong> for the
              academic session 2026–2027.
            </p>
            <p>
              As per University records, Government Aadhaar and UIDAI verification stands recorded. During his/her tenure at SG Tech University, his/her conduct and
              moral character have been found to be exemplary.
            </p>
            <p>
              This certificate is issued on the student's request for official academic verification, passport processing, or educational grant facilitation.
            </p>
          </div>

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
      {activeTab === 'no-dues' && selectedMember && (
        <div className="max-w-3xl mx-auto p-8 sm:p-12 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-xl space-y-8 text-slate-800 dark:text-slate-200">
          <div className="text-center pb-6 border-b-2 border-emerald-500 space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              SG TECH UNIVERSITY • BURSAR & ACCOUNTS
            </h2>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Official Institutional No-Dues Clearance
            </p>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <div>Certificate No: SGTU/NODUES/2026/0411</div>
            <div>Date: {todayFormatted}</div>
          </div>

          <div className="text-sm leading-relaxed space-y-4">
            <p>
              This certificate verifies that <strong>{selectedMember.fullName}</strong> (Roll / College ID:{' '}
              <span className="font-mono font-bold">{selectedMember.collegeId}</span>) has cleared all outstanding
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
      {activeTab === 'character' && selectedMember && (
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
              This is to certify that <strong>{selectedMember.fullName}</strong>, having Student ID{' '}
              <strong className="font-mono">{selectedMember.collegeId}</strong>, has been a bona fide student
              pursuing <strong>{selectedMember.courseName || 'B.Tech Computer Science'}</strong> at SG Tech University.
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

      {/* ADMIN PHOTO & FORMAT UPDATE MODAL */}
      {isPhotoModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-navy-900 rounded-3xl border border-slate-200 dark:border-navy-800 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Admin: ID Card Photo & Format
                  </h3>
                  <p className="text-xs text-slate-500">
                    Updating photo for {selectedMember.fullName} ({selectedMember.collegeId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMAT SELECTOR (PASSPORT vs STAMP SIZE - USE ONLY ONE) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select Photo Format (Use Only One):
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setModalPhotoFormat('PASSPORT_SIZE')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    modalPhotoFormat === 'PASSPORT_SIZE'
                      ? 'border-brand-500 bg-brand-50/70 dark:bg-navy-950 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-navy-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      📷 Passport Size
                    </span>
                    {modalPhotoFormat === 'PASSPORT_SIZE' && (
                      <CheckCircle2 className="w-4 h-4 text-brand-600" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">35 mm × 45 mm</div>
                  <div className="text-[10px] text-brand-600 font-semibold mt-1">
                    Standard 7:9 Institutional Portrait
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setModalPhotoFormat('STAMP_SIZE')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    modalPhotoFormat === 'STAMP_SIZE'
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-navy-950 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-navy-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      🏷️ Stamp Size
                    </span>
                    {modalPhotoFormat === 'STAMP_SIZE' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">25 mm × 30 mm</div>
                  <div className="text-[10px] text-amber-600 font-semibold mt-1">
                    Compact 5:6 Pocket Seal Photo
                  </div>
                </button>
              </div>
            </div>

            {/* LIVE PREVIEW IN CHOSEN FORMAT */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center gap-4">
              <div className="shrink-0">
                {modalPhotoFormat === 'STAMP_SIZE' ? (
                  <img
                    src={modalAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt="Preview"
                    className="w-16 h-20 rounded-lg object-cover border-2 border-brand-500 shadow-sm"
                  />
                ) : (
                  <img
                    src={modalAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt="Preview"
                    className="w-20 h-26 rounded-xl object-cover border-2 border-brand-500 shadow-md"
                  />
                )}
              </div>
              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Live Card Preview: {modalPhotoFormat === 'STAMP_SIZE' ? 'Stamp Size (25×30mm)' : 'Passport Size (35×45mm)'}
                </div>
                <p className="text-[11px] text-slate-500">
                  The image will be cropped cleanly to standard aspect ratio and securely saved to the user's permanent credential record.
                </p>
              </div>
            </div>

            {/* IMAGE URL INPUT */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Photo URL (Web or Direct Image Link):
              </label>
              <input
                type="text"
                value={modalAvatarUrl}
                onChange={(e) => setModalAvatarUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-hidden font-mono"
              />
            </div>

            {/* QUICK PRESET PORTRAITS */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                Or Choose from Official Institutional Presets:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setModalAvatarUrl(preset.url)}
                    className={`relative p-1 rounded-xl border text-center transition-all ${
                      modalAvatarUrl === preset.url
                        ? 'border-brand-500 ring-2 ring-brand-500/30'
                        : 'border-slate-200 dark:border-navy-800 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-12 object-cover rounded-lg mb-1"
                    />
                    <div className="text-[9px] font-bold text-slate-600 dark:text-slate-300 truncate">
                      {preset.name.split(' ')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPhotoModalOpen(false)}
                disabled={savingPhoto}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSavePhotoModal}
                disabled={savingPhoto || !modalAvatarUrl}
                icon={Check}
              >
                {savingPhoto ? 'Saving Changes...' : 'Save to ID Card'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
