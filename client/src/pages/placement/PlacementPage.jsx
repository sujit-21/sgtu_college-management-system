import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Award,
  TrendingUp,
  Building2,
  Calendar,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export const PlacementPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const [drives, setDrives] = useState([]);
  const [stats, setStats] = useState({
    totalDrives: 0,
    totalOffers: 0,
    highestPackage: '0 LPA',
    avgPackage: '0 LPA',
    placementRate: '92.4%',
  });
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const initialForm = {
    companyName: '',
    role: '',
    packageLpa: '',
    eligibilityMinCgpa: 7.0,
    driveDate: '',
    deadline: '',
    location: 'Tech Auditorium / Hybrid',
    rounds: 'Coding Assessment -> Technical -> HR',
    status: 'ACTIVE',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchDrives = async () => {
    setLoading(true);
    try {
      const res = await api.get('/placement');
      if (res.data.success) {
        setDrives(res.data.data);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrives();
  }, []);

  const handleApply = async (driveId) => {
    setApplyingId(driveId);
    try {
      const res = await api.post(`/placement/${driveId}/apply`);
      if (res.data.success) {
        alert('Application submitted! Your resume & academic transcript sent to company HR.');
        fetchDrives();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplyingId(null);
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = {
        ...formData,
        packageLpa: parseFloat(formData.packageLpa),
        eligibilityMinCgpa: parseFloat(formData.eligibilityMinCgpa),
        eligibleDepartments: ['Computer Science and Engineering', 'Electronics & Communication'],
      };
      const res = await api.post('/placement', payload);
      if (res.data.success) {
        setIsAddOpen(false);
        setFormData(initialForm);
        fetchDrives();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add placement drive.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training & Placement Cell (T&P)"
        description="Campus corporate recruitment drives, internship offers, eligibility criteria, and student job applications."
      >
        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            icon={Plus}
          >
            Post Recruitment Drive
          </Button>
        )}
      </PageHeader>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Overall Placement Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {stats.placementRate}
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Class of 2026 Batch</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Highest CTC Offered</span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {stats.highestPackage}
          </h3>
          <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold mt-1">
            Google Cloud Tech
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Average Package (CTC)</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {stats.avgPackage}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Across Engineering & Tech</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Campus Offers</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {stats.totalOffers} Letters Released
          </h3>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Top Tier 1 Corporates</p>
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading placement recruitment drives...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drives.map((drive) => (
            <div
              key={drive._id}
              className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft space-y-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-navy-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-navy-950 p-2 flex items-center justify-center border border-slate-200 dark:border-navy-800 shrink-0">
                      <Building2 className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                        {drive.companyName}
                      </h4>
                      <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                        {drive.role}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      ₹{drive.packageLpa} LPA
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-1 font-semibold">
                      Full-time CTC
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Eligibility:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Min CGPA: {drive.eligibilityMinCgpa}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      0 Active Backlogs
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Drive Schedule:</span>
                    <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      <span>{drive.driveDate}</span>
                    </div>
                    <span className="text-[10px] text-red-500 block">
                      Deadline: {drive.deadline || 'Closing Soon'}
                    </span>
                  </div>
                </div>

                {drive.rounds && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-navy-800 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider mb-0.5">
                      Recruitment Process:
                    </span>
                    {drive.rounds}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  <strong>{drive.appliedCount || 0}</strong> Students Applied
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApply(drive._id)}
                  isLoading={applyingId === drive._id}
                  icon={ArrowUpRight}
                >
                  Apply Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Drive Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule Campus Recruitment Drive"
        subtitle="Invite and open applications for visiting corporate partners."
      >
        <form onSubmit={handleCreateDrive} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                placeholder="e.g. Cisco Systems"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Job Designation / Role *
              </label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Software Engineer (Fullstack)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Salary Package (LPA) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.packageLpa}
                onChange={(e) => setFormData({ ...formData, packageLpa: e.target.value })}
                placeholder="e.g. 16.5"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Minimum Eligibility CGPA *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.eligibilityMinCgpa}
                onChange={(e) => setFormData({ ...formData, eligibilityMinCgpa: e.target.value })}
                placeholder="e.g. 7.5"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Drive Date *
              </label>
              <input
                type="date"
                required
                value={formData.driveDate}
                onChange={(e) => setFormData({ ...formData, driveDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Application Deadline *
              </label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Interview & Evaluation Format
            </label>
            <input
              type="text"
              value={formData.rounds}
              onChange={(e) => setFormData({ ...formData, rounds: e.target.value })}
              placeholder="e.g. Online Hackathon -> Tech Rounds -> HR"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Publish Drive
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default PlacementPage;
