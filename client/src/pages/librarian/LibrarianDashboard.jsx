import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BookMarked,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Plus,
  Search,
  RotateCcw,
  Sparkles,
  DollarSign,
  Library,
  FileText,
  Bookmark,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';

export const LibrarianDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchLibrarianData = async () => {
    try {
      const res = await api.get('/dashboard/librarian');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load librarian dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrarianData();
  }, []);

  const handleReturnBook = async (issueId) => {
    if (!window.confirm('Process return for this book copy?')) return;
    setProcessingId(issueId);
    try {
      const res = await api.post(`/library/issues/${issueId}/return`);
      if (res.data.success) {
        fetchLibrarianData();
      }
    } catch (err) {
      console.error('Failed to return book:', err);
      alert('Error processing book return.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading Central Library Portal...</p>
      </div>
    );
  }

  const { stats, activeCirculations, overdueList, categoryStats } = data || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Central Library &amp; Knowledge Resource Center"
        subtitle="University Circulation Desk, Book Acquisitions, ISBN Registry &amp; Student Borrowing Management"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/question-papers')}
            className="flex items-center gap-1.5 text-xs"
          >
            <BookMarked className="w-4 h-4" />
            PYQ Archives
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/library')}
            className="bg-primary hover:bg-primary-600 text-white flex items-center gap-1.5 text-xs shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            Manage Catalogue
          </Button>
        </div>
      </PageHeader>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-navy-900 rounded-xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.uniqueTitles || 0}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Unique Titles Catalogued
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.totalCopies || 0}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Physical Volumes
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.availableCopies || 0}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Copies Available On Shelves
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.currentlyIssued || 0}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Circulations
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl p-5 border border-slate-200 dark:border-navy-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats?.overdueCount || 0}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Overdue / Pending Returns
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Circulations Table & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Circulations Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-navy-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Active Book Circulations &amp; Due Returns
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track borrowed volumes, student due dates, and process instantaneous book returns.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/library')}
              className="text-xs"
            >
              Full History
            </Button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-navy-800 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Student Borrower</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800 text-slate-700 dark:text-slate-300">
                {activeCirculations && activeCirculations.length > 0 ? (
                  activeCirculations.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50 dark:hover:bg-navy-800/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {item.bookId?.title || 'Unknown Title'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ISBN: {item.bookId?.isbn || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {item.studentId?.fullName || 'Student'}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {item.studentId?.registrationNumber}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 dark:text-slate-300">
                          {item.issueDate ? new Date(item.issueDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            item.status === 'OVERDUE'
                              ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={processingId === item._id}
                          onClick={() => handleReturnBook(item._id)}
                          className="text-[11px] py-1 px-2.5 h-auto text-primary hover:bg-primary/10 border-primary/30"
                        >
                          {processingId === item._id ? 'Processing...' : 'Return'}
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No active books currently out on issue. All volumes are checked in!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Category Distribution & Quick Links (1 col) */}
        <div className="space-y-6">
          {/* Books by Subject Category */}
          <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Library className="w-5 h-5 text-primary" />
              Catalogue by Discipline
            </h3>
            <div className="space-y-2.5">
              {categoryStats && categoryStats.length > 0 ? (
                categoryStats.map((cat, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-slate-100 dark:border-navy-800 bg-slate-50 dark:bg-navy-800/60 flex justify-between items-center text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cat._id || 'General Reference'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold">
                      {cat.count} Titles ({cat.available} Available)
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">No category statistics available.</div>
              )}
            </div>
          </div>

          {/* Quick Librarian Operations */}
          <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Librarian Quick Desks
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => navigate('/library')}
                className="p-3 rounded-lg bg-slate-50 dark:bg-navy-800/50 hover:bg-primary/5 dark:hover:bg-primary/10 border border-slate-200 dark:border-navy-800 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Add Book to Catalogue
                  </div>
                  <div className="text-[11px] text-slate-400">Barcode, ISBN, Author &amp; Shelf Rack</div>
                </div>
                <Plus className="w-4 h-4 text-primary" />
              </button>

              <button
                onClick={() => navigate('/question-papers')}
                className="p-3 rounded-lg bg-slate-50 dark:bg-navy-800/50 hover:bg-primary/5 dark:hover:bg-primary/10 border border-slate-200 dark:border-navy-800 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    Examination Papers (PYQ)
                  </div>
                  <div className="text-[11px] text-slate-400">Archive university question papers</div>
                </div>
                <BookMarked className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibrarianDashboard;
