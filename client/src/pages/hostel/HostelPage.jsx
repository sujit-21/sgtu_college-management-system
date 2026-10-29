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

  useEffect(() => {
    fetchHostelData();
  }, []);

  const handleRequestGatePass = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/hostel/gate-pass', gatePassForm);
      if (res.data.success) {
        setIsGatePassOpen(false);
        setGatePassForm({ reason: '', destination: '', outTime: '', inTime: '' });
        alert('Digital Gate Pass requested and approved by warden.');
        fetchHostelData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request gate pass.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: 'Resident Student',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white leading-tight">
            {row.studentName}
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            {row.registrationNumber}
          </div>
        </div>
      ),
    },
    {
      header: 'Hostel Block',
      render: (row) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            {row.hostelName}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Type: {row.hostelType}
          </div>
        </div>
      ),
    },
    {
      header: 'Room & Bed',
      render: (row) => (
        <div className="text-xs">
          <span className="font-bold text-brand-600 dark:text-brand-400">
            Room {row.roomNumber}
          </span>
          <span className="text-slate-400 ml-1.5 font-mono">({row.bedNumber})</span>
          <div className="text-[10px] text-slate-400">{row.roomType}</div>
        </div>
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
        description="Campus student hostels, room and bed allocations, mess services, and digital night-out gate passes."
      >
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsGatePassOpen(true)}
          icon={DoorOpen}
        >
          Request Gate Pass
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Bed Capacity</span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {stats.totalCapacity} Beds
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Across 2 Campus Hostels</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Occupied Beds</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {stats.occupiedBeds} Students
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {stats.occupancyRate}% Occupancy Rate
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Vacant Beds Available</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <DoorOpen className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {stats.availableBeds} Vacancies
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
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            24/7 Monitored
          </h3>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Biometric Gates Active</p>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
          Active Room & Bed Allocations
        </h4>
        <DataTable
          columns={columns}
          data={allocations}
          loading={loading}
          emptyMessage="No student room allocations found."
        />
      </div>

      {/* Digital Gate Pass Requests */}
      <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Recent Hostel Gate Passes & Night Out Logs
            </h4>
            <p className="text-[11px] text-slate-400">
              Approved permissions for weekend travel, academic hackathons, and emergency home visits.
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
              </div>
            ))}
          </div>
        )}
      </div>

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
              placeholder="e.g. Bangalore Urban or Home"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Departure Date & Time *
              </label>
              <input
                type="text"
                required
                value={gatePassForm.outTime}
                onChange={(e) => setGatePassForm({ ...gatePassForm, outTime: e.target.value })}
                placeholder="2026-10-30 05:00 PM"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expected Return Date & Time *
              </label>
              <input
                type="text"
                required
                value={gatePassForm.inTime}
                onChange={(e) => setGatePassForm({ ...gatePassForm, inTime: e.target.value })}
                placeholder="2026-11-01 08:00 AM"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
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
