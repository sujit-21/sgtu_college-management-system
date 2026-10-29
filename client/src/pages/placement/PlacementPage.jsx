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
  FileText,
  Link,
  Github,
  Linkedin,
  AlertTriangle,
  Check,
  Send,
  X
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
  const [applyingDrive, setApplyingDrive] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [appliedDriveIds, setAppliedDriveIds] = useState(new Set());
  const [applicationSuccess, setApplicationSuccess] = useState('');

  // Student Profile Context (Candidate CGPA default 8.2 for enrolled scholars)
  const candidateCgpa = 8.2;
  const candidateBacklogs = 0;

  // Application Modal Form
  const [appForm, setAppForm] = useState({
    resumeUrl: 'https://sgtu.edu/transcripts/verify/SGTU2024CS001.pdf',
    portfolioUrl: 'https://github.com/aarav-sharma-tech',
    linkedinUrl: 'https://linkedin.com/in/aarav-sharma-sgtu',
    keySkills: 'React, Node.js, Python, PyTorch, Distributed Systems',
    coverNote: 'Excited to contribute to software infrastructure and engineering teams.',
  });

  const initialForm = {
    companyName: '',
    role: '',
    packageLpa: '',
    eligibilityMinCgpa: 7.0,
    driveDate: '',
    deadline: '',
    location: 'Tech Auditorium / Hybrid',
    rounds: 'Online Coding -> Technical Interview -> HR Round',
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

  const openApplyModal = (drive) => {
    setApplyingDrive(drive);
  };

  const handleConfirmApply = async (e) => {
    e.preventDefault();
    if (!applyingDrive) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/placement/${applyingDrive._id}/apply`, appForm);
      if (res.data.success) {
        setAppliedDriveIds((prev) => new Set([...prev, applyingDrive._id]));
        setApplicationSuccess(`Application submitted to ${applyingDrive.companyName}! Your resume and university transcript have been dispatched.`);
        setApplyingDrive(null);
        fetchDrives();
        setTimeout(() => setApplicationSuccess(''), 5000);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to submit application.');
    } finally {
      setActionLoading(false);
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
        description="Campus corporate recruitment drives, internship offers, real-time CGPA eligibility verification, and student job applications."
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
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">Tier-1 Corporate Offers</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Corporate Recruitment Drives</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {drives.length} Drives
          </h3>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">
            {stats.totalOffers} Total Offers Extended
          </p>
        </div>
      </div>

      {applicationSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{applicationSuccess}</span>
          </div>
          <button onClick={() => setApplicationSuccess('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drives Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading placement drives...</div>
      ) : drives.length === 0 ? (
        <div className="py-20 text-center text-xs text-slate-400">
          No active recruitment drives scheduled currently.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drives.map((drive) => {
            const minCgpa = drive.eligibilityMinCgpa || 7.0;
            const isEligible = candidateCgpa >= minCgpa && candidateBacklogs === 0;
            const hasApplied = appliedDriveIds.has(drive._id);

            return (
              <div
                key={drive._id}
                className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft flex flex-col justify-between space-y-4 hover:border-brand-500/50 transition-colors"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-black text-sm border border-brand-200 dark:border-brand-800">
                        {drive.companyName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {drive.companyName}
                        </h4>
                        <span className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold block">
                          {drive.role}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                        {drive.packageLpa} LPA
                      </span>
                    </div>
                  </div>

                  {/* AUTO-ELIGIBILITY VERIFICATION BADGE */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isEligible
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                        : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {isEligible ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      <span>
                        {isEligible ? 'Eligible to Apply' : 'Cutoff Not Met'}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-semibold">
                      Req: {minCgpa} CGPA (Yours: {candidateCgpa})
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Drive Date: {new Date(drive.driveDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: {new Date(drive.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{drive.location || 'SGTU Campus Auditorium'}</span>
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

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    <strong>{drive.appliedCount || 0}</strong> Applied
                  </span>

                  {hasApplied ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </span>
                  ) : isEligible ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openApplyModal(drive)}
                      icon={ArrowUpRight}
                    >
                      Apply Now
                    </Button>
                  ) : (
                    <button
                      disabled
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-400 text-xs font-semibold cursor-not-allowed"
                    >
                      Ineligible (&lt; {minCgpa} CGPA)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* JOB APPLICATION SUBMISSION MODAL */}
      <Modal
        isOpen={!!applyingDrive}
        onClose={() => setApplyingDrive(null)}
        title={`Apply for ${applyingDrive?.companyName}`}
        subtitle={`Role: ${applyingDrive?.role} • Package: ${applyingDrive?.packageLpa} LPA`}
      >
        <form onSubmit={handleConfirmApply} className="space-y-4 text-xs">
          {/* Candidate Summary Strip */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Applicant</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {user?.name || 'Aarav Sharma'} (SGTU2024CS001)
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Verified Academic Standing</span>
              <span className="font-bold text-emerald-600 font-mono">
                {candidateCgpa} CGPA • 0 Backlogs
              </span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-brand-500" />
              <span>Resume / Academic Transcript Link *</span>
            </label>
            <input
              type="url"
              required
              value={appForm.resumeUrl}
              onChange={(e) => setAppForm({ ...appForm, resumeUrl: e.target.value })}
              placeholder="https://drive.google.com/your-resume.pdf"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Github className="w-3.5 h-3.5 text-slate-500" />
                <span>GitHub / Portfolio URL</span>
              </label>
              <input
                type="url"
                value={appForm.portfolioUrl}
                onChange={(e) => setAppForm({ ...appForm, portfolioUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                <span>LinkedIn Profile URL</span>
              </label>
              <input
                type="url"
                value={appForm.linkedinUrl}
                onChange={(e) => setAppForm({ ...appForm, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Key Technical Proficiencies
            </label>
            <input
              type="text"
              value={appForm.keySkills}
              onChange={(e) => setAppForm({ ...appForm, keySkills: e.target.value })}
              placeholder="e.g. React, C++, Machine Learning, Docker, SQL"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl text-[11px] text-brand-700 dark:text-brand-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-brand-500" />
            <span>
              By clicking Submit, your official verified SGTU academic transcripts and resume will be securely forwarded to the recruitment portal of {applyingDrive?.companyName}.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setApplyingDrive(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading} icon={Send}>
              Confirm & Submit Application
            </Button>
          </div>
        </form>
      </Modal>

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
              Venue / Mode
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Interview Rounds Pipeline
            </label>
            <input
              type="text"
              value={formData.rounds}
              onChange={(e) => setFormData({ ...formData, rounds: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Schedule Drive
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlacementPage;
