import React, { useState, useEffect } from 'react';
import {
  Building,
  Bed,
  DoorOpen,
  Users,
  Shield,
  Plus,
  Clock,
  CheckCircle2,
  Calendar,
  Phone,
  FileCheck,
  Utensils,
  Star,
  Coffee,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/ui/DataTable';

export const HostelPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  // Sub-tabs: 'rooms' | 'gate-passes' | 'mess'
  const [activeTab, setActiveTab] = useState('rooms');

  const [allocations, setAllocations] = useState([]);
  const [stats, setStats] = useState({
    totalRooms: 150,
    totalCapacity: 300,
    occupiedBeds: 0,
    availableBeds: 300,
    occupancyRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isGatePassOpen, setIsGatePassOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState('');

  // Weekly Mess Menu State
  const [messMenu, setMessMenu] = useState([]);
  const [loadingMess, setLoadingMess] = useState(false);

  const [gatePassForm, setGatePassForm] = useState({
    reason: '',
    destination: '',
    outTime: '',
    inTime: '',
  });

  const fetchHostelData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hostel');
      if (res.data.success) {
        setAllocations(res.data.data);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessMenu = async () => {
    setLoadingMess(true);
    try {
      const res = await api.get('/hostel/mess-menu');
      if (res.data.success) {
        setMessMenu(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMess(false);
    }
  };

  useEffect(() => {
    fetchHostelData();
  }, []);

  useEffect(() => {
    if (activeTab === 'mess') {
      fetchMessMenu();
    }
  }, [activeTab]);

  const handleRequestGatePass = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/hostel/gate-pass', gatePassForm);
      if (res.data.success) {
        setIsGatePassOpen(false);
        setGatePassForm({ reason: '', destination: '', outTime: '', inTime: '' });
        setFeedbackBanner('Digital Gate Pass submitted. Guardian SMS notification sent.');
        fetchHostelData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request gate pass.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewGatePass = async (passId, status) => {
    try {
      const res = await api.patch(`/hostel/gate-pass/${passId}/review`, { status });
      if (res.data.success) {
        setFeedbackBanner(res.data.message);
      }
    } catch (err) {
      alert('Failed to review gate pass.');
    }
  };

  const columns = [
    {
      header: 'Room',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 dark:text-white">
              Room {row.roomNumber}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {row.hostelName} ({row.block})
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Student',
      render: (row) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-900 dark:text-white">
            {row.studentName}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {row.registrationNumber}
          </div>
        </div>
      ),
    },
    {
      header: 'Bed #',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
          Bed {row.bedNumber}
        </span>
      ),
    },
    {
      header: 'Warden Contact',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-slate-800 dark:text-slate-200">
            {row.wardenName}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {row.wardenContact}
          </div>
        </div>
      ),
    },
    {
      header: 'Monthly Rent',
      render: (row) => (
        <span className="font-bold text-xs text-slate-900 dark:text-white">
          ₹{row.monthlyFee?.toLocaleString('en-IN')}/mo
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3" />
          {row.status}
        </span>
      ),
    },
  ];

  // Collect all gate passes
  const allGatePasses = allocations.flatMap((a) =>
    (a.gatePasses || []).map((gp) => ({
      ...gp,
      studentName: a.studentName,
      registrationNumber: a.registrationNumber,
      roomNumber: a.roomNumber,
      hostelName: a.hostelName,
    }))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hostel & Residential Accommodation"
        description="Campus student hostels, room allocations, dietary mess menus, and warden-verified gate passes."
      >
        <Button variant="primary" size="sm" onClick={() => setIsGatePassOpen(true)} icon={DoorOpen}>
          Request Gate Pass
        </Button>
      </PageHeader>

      {feedbackBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold">{feedbackBanner}</span>
          </div>
          <button onClick={() => setFeedbackBanner('')} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Occupied Beds</span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {stats.occupiedBeds} <span className="text-xs font-normal text-slate-400">/ {stats.totalCapacity}</span>
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">{stats.occupancyRate}% Occupancy Rate</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Available Beds</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <DoorOpen className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {stats.availableBeds} <span className="text-xs font-normal text-slate-400">vacant</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Instant Allocation Ready</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Security & Warden</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">24/7 Monitored</h3>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Biometric Gates Active</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Dining & Mess</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">FSSAI Certified</h3>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">4.6/5.0 Food Rating</p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-2">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'rooms'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Room Allocations ({allocations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gate-passes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'gate-passes'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Warden Gate Passes ({allGatePasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mess')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'mess'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Weekly Mess Menu & Diet</span>
        </button>
      </div>

      {/* TAB 1: ALLOCATIONS */}
      {activeTab === 'rooms' && (
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Active Room & Bed Allocations</h4>
          <DataTable
            columns={columns}
            data={allocations}
            loading={loading}
            emptyMessage="No student room allocations found."
          />
        </div>
      )}

      {/* TAB 2: GATE PASSES & WARDEN APPROVAL */}
      {activeTab === 'gate-passes' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Hostel Gate Passes & Night-Out Verification</h4>
              <p className="text-[11px] text-slate-400">
                Warden approvals for weekend home visits, academic hackathons, and emergency leave with guardian SMS confirmation.
              </p>
            </div>
          </div>

          {allGatePasses.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No active gate pass requests.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allGatePasses.map((pass, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {pass.studentName} ({pass.roomNumber})
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      APPROVED
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-400">Reason:</span> {pass.reason}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-slate-400">Destination:</span> {pass.destination}
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 dark:border-navy-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>OUT: {pass.outTime}</span>
                    <span>IN: {pass.inTime}</span>
                  </div>
                  {isAdmin && (
                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleReviewGatePass(pass._id || idx, 'APPROVED')}
                        className="text-[10px] px-2 py-1 rounded bg-emerald-600 text-white font-bold flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Approve & Alert Guardian
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WEEKLY MESS MENU */}
      {activeTab === 'mess' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-brand-500" />
                  <span>University Dining Hall • Weekly 7-Day Nutrition Menu</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nutritionally balanced meals audited by Chief Campus Dietician. High-protein non-veg and vegetarian counters available.
                </p>
              </div>
            </div>

            {loadingMess ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading dining schedule...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {messMenu.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/40 text-xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-navy-800">
                      <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                        {item.day}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 font-bold">
                        3 Meals Daily
                      </span>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Coffee className="w-3 h-3 text-amber-500" /> Breakfast (07:30 - 09:30 AM)
                      </p>
                      <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{item.breakfast}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Utensils className="w-3 h-3 text-emerald-500" /> Lunch (12:30 - 02:30 PM)
                      </p>
                      <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{item.lunch}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Star className="w-3 h-3 text-purple-500" /> Dinner (07:30 - 09:30 PM)
                      </p>
                      <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{item.dinner}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gate Pass Modal */}
      <Modal
        isOpen={isGatePassOpen}
        onClose={() => setIsGatePassOpen(false)}
        title="Request Hostel Gate Pass"
        subtitle="Submit permission request to hostel warden."
      >
        <form onSubmit={handleRequestGatePass} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Purpose / Reason *
            </label>
            <input
              type="text"
              required
              value={gatePassForm.reason}
              onChange={(e) => setGatePassForm({ ...gatePassForm, reason: e.target.value })}
              placeholder="e.g. Weekend Home Visit / Hackathon"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Destination Address / City *
            </label>
            <input
              type="text"
              required
              value={gatePassForm.destination}
              onChange={(e) => setGatePassForm({ ...gatePassForm, destination: e.target.value })}
              placeholder="e.g. New Delhi"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Departure Time (OUT) *
              </label>
              <input
                type="text"
                required
                value={gatePassForm.outTime}
                onChange={(e) => setGatePassForm({ ...gatePassForm, outTime: e.target.value })}
                placeholder="Friday 05:00 PM"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Return Time (IN) *
              </label>
              <input
                type="text"
                required
                value={gatePassForm.inTime}
                onChange={(e) => setGatePassForm({ ...gatePassForm, inTime: e.target.value })}
                placeholder="Sunday 08:00 PM"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 text-[11px] text-purple-700 dark:text-purple-300">
            SMS notification with departure timestamp will be automatically dispatched to registered guardian's mobile number.
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsGatePassOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HostelPage;
