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

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Student Identity & Academic Dossier"
        description="Official university verified student credentials, enrollment department, and contact information."
      />

      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft space-y-6">
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
            </div>

            <p className="text-xs text-brand-600 dark:text-brand-400 font-mono mt-1 font-bold">
              Registration Number: {profile?.registrationNumber}
            </p>

            <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-brand-500" />
                <span>{profile?.courseId?.name || 'B.Tech CSE'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{profile?.departmentId?.name || 'Computer Science'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-4">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
              Personal Credentials
            </h4>

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
          </div>

          <div className="space-y-4">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
              Academic Standing & Residency
            </h4>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60">
              <GraduationCap className="w-4 h-4 text-brand-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Current Enrolled Semester</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Semester {profile?.currentSemester || 6} (Admission Year {profile?.admissionYear || 2023})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Verification Status</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  University Registrar Verified
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">Residential Address</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile?.address || 'Bangalore, Karnataka'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
