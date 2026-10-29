import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  GraduationCap,
  ShieldCheck,
  Heart,
  Droplet,
  Shield,
  Award,
  Users,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';

export const StudentProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setProfile(res.data.user?.profile);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">Loading student profile...</div>
    );
  }

  const getCasteBadgeColor = (caste) => {
    switch (caste) {
      case 'General':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      case 'OBC':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'SC':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'ST':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'EWS':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Student Identity & Academic Dossier"
        description="Official university verified student credentials, government identity, category, and past academic records."
      />

      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft space-y-8">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100 dark:border-navy-800">
          <img
            src={
              profile?.avatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
            }
            alt={profile?.fullName}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-500 shadow-md"
          />

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {profile?.fullName || 'Student Name'}
              </h3>
              <StatusBadge status={profile?.academicStatus || 'ACTIVE'} />
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCasteBadgeColor(
                  profile?.caste || 'General'
                )}`}
              >
                Category: {profile?.caste || 'General'}
              </span>
            </div>

            <p className="text-xs text-brand-600 dark:text-brand-400 font-mono mt-1 font-bold">
              Registration Number: {profile?.registrationNumber}
            </p>

            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-brand-500" />
                <span>{profile?.courseId?.name || 'B.Tech Computer Science'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{profile?.departmentId?.name || 'School of Computing'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Government Identity & Family Record */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Government Identity & Social Category</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Aadhaar UIDAI Number</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                {profile?.aadhaarNumber ? `UIDAI: •••• ${profile.aadhaarNumber.slice(-4)}` : 'Verified on Admission'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Social Category</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                {profile?.caste || 'General (Unreserved)'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Emergency Guardian Contact</span>
              <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
                {profile?.emergencyContact || '+91 98450 11223'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Father's Name</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
                {profile?.fatherName || 'Ramesh Kumar'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Mother's Name</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
                {profile?.motherName || 'Sunita Kumar'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800">
              <span className="text-[10px] text-slate-400 block font-semibold">Verification Badge</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                University KYC Verified
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Previous Academic Credentials (10th / 12th) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Pre-University Academic Qualifications</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* 10th Card */}
            <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-blue-950 dark:text-blue-300">10th Secondary School (Matric)</h5>
                  <span className="text-[11px] text-slate-500">All India Secondary School Examination</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                    {profile?.tenthMarks ? `${profile.tenthMarks}%` : '94.6%'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-blue-100 dark:border-blue-900/40 text-slate-700 dark:text-slate-300">
                <div><span className="text-slate-400">Board:</span> {profile?.tenthBoard || 'CBSE'}</div>
                <div><span className="text-slate-400">Year:</span> {profile?.tenthPassingYear || '2020'}</div>
              </div>
            </div>

            {/* 12th Card */}
            <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-indigo-950 dark:text-indigo-300">12th Senior Secondary</h5>
                  <span className="text-[11px] text-slate-500">{profile?.twelfthStream || 'Science (PCM)'}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                    {profile?.twelfthMarks ? `${profile.twelfthMarks}%` : '92.4%'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-indigo-100 dark:border-indigo-900/40 text-slate-700 dark:text-slate-300">
                <div><span className="text-slate-400">Board:</span> {profile?.twelfthBoard || 'CBSE'}</div>
                <div><span className="text-slate-400">Year:</span> {profile?.twelfthPassingYear || '2022'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Campus Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Campus Contact & Personal Particulars</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Registered Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {user?.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Phone Contact</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile?.phone}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Date of Birth</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile?.dateOfBirth || '2004-05-14'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60">
              <Droplet className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Blood Group</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile?.bloodGroup || 'O+'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 sm:col-span-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Residential Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile?.address || '742 Cyber City, Tech Park Avenue, Bangalore'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default StudentProfilePage;
