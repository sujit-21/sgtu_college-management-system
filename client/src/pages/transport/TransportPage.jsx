import React, { useState, useEffect } from 'react';
import {
  Bus,
  MapPin,
  Clock,
  Phone,
  User,
  Users,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  Plus,
  CreditCard,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';

export const TransportPage = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [stats, setStats] = useState({
    totalBuses: 0,
    totalSeats: 0,
    totalSubscribers: 0,
    activeFleet: 0,
  });
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState(null);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transport');
      if (res.data.success) {
        setRoutes(res.data.data);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleSubscribe = async (routeId) => {
    setSubscribingId(routeId);
    try {
      const res = await api.post(`/transport/${routeId}/subscribe`);
      if (res.data.success) {
        alert(res.data.message);
        fetchRoutes();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to activate pass.');
    } finally {
      setSubscribingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Transport & Bus Fleet"
        description="Official university transit network, real-time stop schedules, vehicle tracking, and student pass subscriptions."
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Active Bus Fleet</span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {stats.totalBuses} University Buses
          </h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            GPS Monitored & Live
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Fleet Capacity</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {stats.totalSeats} Daily Seats
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Air-conditioned Comfort</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Enrolled Commuters</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {stats.totalSubscribers} Pass Holders
          </h3>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">
            {Math.round((stats.totalSubscribers / (stats.totalSeats || 1)) * 100)}% Capacity Occupied
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Safety Standard</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            100% Certified
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">First-Aid & Speed Governor</p>
        </div>
      </div>

      {/* Routes Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading campus transit routes...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routes.map((route) => {
            const occupancyPct = Math.round((route.currentSubscribers / route.capacity) * 100);
            return (
              <div
                key={route._id}
                className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft space-y-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-navy-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm shadow-xs">
                        <Bus className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                            {route.routeNumber}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {route.vehicleNumber}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                          {route.routeName}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        ₹{route.monthlyFare?.toLocaleString('en-IN')}/mo
                      </span>
                      <span className="text-[10px] text-slate-400">Monthly Fare</span>
                    </div>
                  </div>

                  {/* Driver & Capacity */}
                  <div className="grid grid-cols-2 gap-3 py-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 block">Assigned Driver:</span>
                      <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{route.driverName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{route.driverPhone}</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-400">Seats:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {route.currentSubscribers} / {route.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-navy-950 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            occupancyPct >= 90 ? 'bg-red-500' : 'bg-brand-600'
                          }`}
                          style={{ width: `${occupancyPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1 text-right">
                        {occupancyPct}% booked
                      </span>
                    </div>
                  </div>

                  {/* Stops Timeline */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Scheduled Stops & Pickup Timings
                    </span>
                    <div className="space-y-2 relative pl-4 border-l-2 border-brand-200 dark:border-brand-900/60 ml-2">
                      {route.stops?.map((stop, sIdx) => (
                        <div key={sIdx} className="relative text-xs">
                          <div className="w-2.5 h-2.5 rounded-full bg-brand-600 absolute -left-[21px] top-1 ring-4 ring-white dark:ring-navy-900" />
                          <div className="flex items-center justify-between text-slate-800 dark:text-slate-200">
                            <span className="font-medium">{stop.stopName}</span>
                            <div className="text-[11px] font-mono text-slate-500 space-x-2">
                              <span>Pickup: <strong className="text-emerald-600">{stop.pickupTime}</strong></span>
                              <span>Drop: <strong className="text-slate-600">{stop.dropTime}</strong></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Seats Available
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSubscribe(route._id)}
                    isLoading={subscribingId === route._id}
                    icon={CreditCard}
                  >
                    Activate Bus Pass
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default TransportPage;
