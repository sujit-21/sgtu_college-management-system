import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Plus,
  Search,
  BookmarkCheck,
  Clock,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Library,
  BookMarked,
  Layers,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Filter,
  Check,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { DashboardStatCard } from '../../components/ui/DashboardStatCard';

export const LibraryPage = () => {
  const { user } = useAuth();
  const isAdminOrTeacher =
    user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';

  // Active Tab
  const [activeTab, setActiveTab] = useState('catalogue'); // 'catalogue' | 'circulations' | 'my-books'

  // Catalogue State
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingBooks, setLoadingBooks] = useState(true);

  // Stats State
  const [stats, setStats] = useState(null);

  // Circulations State
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [issueStatusFilter, setIssueStatusFilter] = useState('');

  // Modals State
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState(null);
  const [selectedIssueForReturn, setSelectedIssueForReturn] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  // Students list for Issue Modal
  const [students, setStudents] = useState([]);

  // Form states
  const [bookForm, setBookForm] = useState({
    title: '',
    isbn: '',
    author: '',
    category: 'Computer Science',
    publisher: '',
    edition: '1st Edition',
    totalCopies: 5,
    shelfLocation: 'Stack A, Rack 101',
    description: '',
  });

  const [issueForm, setIssueForm] = useState({
    bookId: '',
    studentId: '',
    dueDate: '',
    remarks: '',
  });

  const [returnForm, setReturnForm] = useState({
    finePaid: true,
    waived: false,
  });

  // Fetch Library Metrics & Catalogue
  const loadStats = async () => {
    try {
      const res = await api.get('/library/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadBooks = async () => {
    setLoadingBooks(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);

      const res = await api.get(`/library/books?${params.toString()}`);
      if (res.data.success) {
        setBooks(res.data.data);
        if (res.data.categories) {
          setCategories(res.data.categories);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBooks(false);
    }
  };

  const loadIssues = async () => {
    setLoadingIssues(true);
    try {
      const params = new URLSearchParams();
      if (issueStatusFilter) params.append('status', issueStatusFilter);

      const res = await api.get(`/library/issues?${params.toString()}`);
      if (res.data.success) {
        setIssues(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIssues(false);
    }
  };

  const loadStudents = async () => {
    if (isAdminOrTeacher) {
      try {
        const res = await api.get('/students?limit=100');
        if (res.data.success) {
          setStudents(res.data.data);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    loadStats();
    loadBooks();
    if (isAdminOrTeacher) {
      loadStudents();
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    if (activeTab === 'circulations' || activeTab === 'my-books') {
      loadIssues();
    }
  }, [activeTab, issueStatusFilter]);

  // Handle Add Book
  const handleAddBook = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/library/books', bookForm);
      if (res.data.success) {
        setSuccessBanner(`Book "${res.data.data.title}" successfully added to the library catalogue.`);
        setIsAddBookModalOpen(false);
        setBookForm({
          title: '',
          isbn: '',
          author: '',
          category: 'Computer Science',
          publisher: '',
          edition: '1st Edition',
          totalCopies: 5,
          shelfLocation: 'Stack A, Rack 101',
          description: '',
        });
        loadBooks();
        loadStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add book to catalogue.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Issue Modal for a specific book
  const openIssueModal = (book) => {
    setSelectedBookForIssue(book);
    // default due date: 14 days from now
    const d = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setIssueForm({
      bookId: book._id,
      studentId: '',
      dueDate: d,
      remarks: '',
    });
    setIsIssueModalOpen(true);
  };

  // Handle Issue Book
  const handleIssueBook = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/library/issues', issueForm);
      if (res.data.success) {
        setSuccessBanner(res.data.message);
        setIsIssueModalOpen(false);
        loadBooks();
        loadStats();
        if (activeTab === 'circulations') loadIssues();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue book.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Return Modal
  const openReturnModal = (issue) => {
    setSelectedIssueForReturn(issue);
    setReturnForm({
      finePaid: true,
      waived: false,
    });
    setIsReturnModalOpen(true);
  };

  // Handle Return Book
  const handleReturnBook = async (e) => {
    e.preventDefault();
    if (!selectedIssueForReturn) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/library/issues/${selectedIssueForReturn._id}/return`, returnForm);
      if (res.data.success) {
        setSuccessBanner(res.data.message);
        setIsReturnModalOpen(false);
        loadIssues();
        loadBooks();
        loadStats();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process return.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library & Knowledge Center"
        description="Search university catalogue, borrow engineering textbooks, monitor circulation rosters, and track book issues."
      >
        {isAdminOrTeacher && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddBookModalOpen(true)}
            icon={Plus}
          >
            Add New Title
          </Button>
        )}
      </PageHeader>

      {/* Success Notification Alert */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner('')} className="font-bold underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          title="Catalogued Titles"
          value={stats?.totalBooks || books.length}
          trendText="Unique book volumes"
          icon={BookOpen}
          color="indigo"
          index={0}
        />
        <DashboardStatCard
          title="Total Physical Copies"
          value={stats?.totalCopies || 0}
          trendText={`${stats?.availableCopies || 0} on shelves`}
          icon={Layers}
          color="purple"
          index={1}
        />
        <DashboardStatCard
          title="Active Loans"
          value={stats?.issuedCount || 0}
          trendText="Currently in circulation"
          icon={BookmarkCheck}
          color="emerald"
          index={2}
        />
        <DashboardStatCard
          title="Overdue Returns"
          value={stats?.overdueCount || 0}
          trend={stats?.overdueCount > 0 ? 'Requires Action' : 'All Clear'}
          trendText="Past return due date"
          icon={AlertTriangle}
          color="amber"
          index={3}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-navy-800 pb-2">
        <button
          onClick={() => setActiveTab('catalogue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'catalogue'
              ? 'bg-brand-500 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Book Catalogue</span>
        </button>

        {isAdminOrTeacher && (
          <button
            onClick={() => setActiveTab('circulations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'circulations'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            <Library className="w-4 h-4" />
            <span>Circulation & Issues</span>
          </button>
        )}

        {isStudent && (
          <button
            onClick={() => setActiveTab('my-books')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'my-books'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>My Borrowed Books</span>
          </button>
        )}
      </div>

      {/* VIEW 1: BOOK CATALOGUE */}
      {activeTab === 'catalogue' && (
        <div className="space-y-6">
          {/* Search & Category Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, ISBN, or subject..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === ''
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                    : 'bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                All Domains
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                      : 'bg-slate-50 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Book Cards Grid */}
          {loadingBooks ? (
            <div className="py-20 text-center text-xs text-slate-400">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading library catalogue...
            </div>
          ) : books.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-slate-400">
              <BookOpen className="w-12 h-12 stroke-[1.2] mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-sm">No books found matching criteria.</p>
              <p className="text-xs mt-1">Try another keyword or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {books.map((book) => {
                const isAvailable = book.availableCopies > 0;

                return (
                  <div
                    key={book._id}
                    className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft hover:shadow-premium transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-md border border-brand-100 dark:border-brand-900">
                          {book.category}
                        </span>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                          }`}
                        >
                          {isAvailable ? `${book.availableCopies}/${book.totalCopies} Available` : 'Circulating'}
                        </span>
                      </div>

                      {/* Title & Author */}
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2 mb-1">
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                        by {book.author}
                      </p>

                      {/* Metadata Details */}
                      <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50/70 dark:bg-navy-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-navy-800 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">ISBN:</span>
                          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {book.isbn}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Shelf:</span>
                          <span className="font-medium flex items-center gap-1 text-slate-700 dark:text-slate-300">
                            <MapPin className="w-3 h-3 text-brand-500" />
                            {book.shelfLocation}
                          </span>
                        </div>
                        {book.publisher && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Publisher:</span>
                            <span className="truncate max-w-[150px]">{book.publisher}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-navy-800">
                      {isAdminOrTeacher ? (
                        <Button
                          variant={isAvailable ? 'primary' : 'secondary'}
                          size="sm"
                          disabled={!isAvailable}
                          onClick={() => openIssueModal(book)}
                          className="w-full text-xs font-bold"
                          icon={BookmarkCheck}
                        >
                          {isAvailable ? 'Issue to Student' : 'All Copies Issued'}
                        </Button>
                      ) : (
                        <div className="text-center py-1">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {isAvailable ? 'Available for borrowing at Library Desk' : 'Currently in circulation'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2 & 3: CIRCULATION ISSUES TABLE */}
      {(activeTab === 'circulations' || activeTab === 'my-books') && (
        <div className="space-y-4">
          {/* Circulation Filter Bar (Admin) */}
          {activeTab === 'circulations' && (
            <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-soft flex items-center justify-between gap-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Library className="w-4 h-4 text-brand-500" />
                <span>Live Book Circulations ({issues.length})</span>
              </h3>

              <div className="flex items-center gap-2">
                <select
                  value={issueStatusFilter}
                  onChange={(e) => setIssueStatusFilter(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-1.5 text-slate-700 dark:text-slate-200 font-semibold"
                >
                  <option value="">All Statuses</option>
                  <option value="ISSUED">Currently Issued</option>
                  <option value="RETURNED">Returned</option>
                </select>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50/75 dark:bg-navy-950/50 border-b border-slate-100 dark:border-navy-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-5 py-3.5">Book Title & ISBN</th>
                    {isAdminOrTeacher && <th className="px-5 py-3.5">Student Borrower</th>}
                    <th className="px-5 py-3.5">Issue Date</th>
                    <th className="px-5 py-3.5">Due Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Overdue Fine</th>
                    {isAdminOrTeacher && <th className="px-5 py-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                  {loadingIssues ? (
                    <tr>
                      <td colSpan={isAdminOrTeacher ? 7 : 5} className="py-12 text-center text-xs text-slate-400">
                        Loading borrowing records...
                      </td>
                    </tr>
                  ) : issues.length === 0 ? (
                    <tr>
                      <td colSpan={isAdminOrTeacher ? 7 : 5} className="py-12 text-center text-xs text-slate-400">
                        No active book loans or circulation records found.
                      </td>
                    </tr>
                  ) : (
                    issues.map((issue) => {
                      const isReturned = issue.status === 'RETURNED';
                      const isOverdue = issue.isOverdue || (!isReturned && new Date(issue.dueDate) < new Date());

                      return (
                        <tr
                          key={issue._id}
                          className="hover:bg-slate-50/50 dark:hover:bg-navy-800/40 transition-colors"
                        >
                          {/* Book info */}
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {issue.bookId?.title}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              ISBN: {issue.bookId?.isbn} • {issue.bookId?.category}
                            </div>
                          </td>

                          {/* Student info */}
                          {isAdminOrTeacher && (
                            <td className="px-5 py-4">
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                {issue.studentId?.fullName}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                {issue.studentId?.registrationNumber}
                              </div>
                            </td>
                          )}

                          {/* Issue Date */}
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                            {new Date(issue.issueDate).toLocaleDateString()}
                          </td>

                          {/* Due Date */}
                          <td className="px-5 py-4">
                            <span
                              className={`font-semibold ${
                                isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {new Date(issue.dueDate).toLocaleDateString()}
                            </span>
                            {isOverdue && (
                              <span className="block text-[10px] text-red-500 font-bold uppercase">
                                Overdue
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <StatusBadge
                              status={isReturned ? 'COMPLETED' : isOverdue ? 'FAILED' : 'IN_PROGRESS'}
                              label={isReturned ? 'Returned' : isOverdue ? 'Overdue' : 'Active Loan'}
                            />
                          </td>

                          {/* Overdue Fine */}
                          <td className="px-5 py-4">
                            {issue.fineAmount > 0 || issue.calculatedFine > 0 ? (
                              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                ₹{issue.fineAmount || issue.calculatedFine} ({issue.fineStatus})
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono text-xs">₹0</span>
                            )}
                          </td>

                          {/* Action */}
                          {isAdminOrTeacher && (
                            <td className="px-5 py-4 text-right">
                              {!isReturned ? (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => openReturnModal(issue)}
                                  icon={RotateCcw}
                                  className="text-xs"
                                >
                                  Process Return
                                </Button>
                              ) : (
                                <span className="text-xs text-slate-400 flex items-center justify-end gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  Returned {new Date(issue.returnDate).toLocaleDateString()}
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW BOOK (ADMIN) */}
      <Modal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        title="Register New Library Book"
        subtitle="Add a textbook or research volume to the SGTU Knowledge Center."
      >
        <form onSubmit={handleAddBook} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Book Title *</label>
              <input
                type="text"
                required
                value={bookForm.title}
                onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                placeholder="e.g. Introduction to Algorithms"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Author(s) *</label>
              <input
                type="text"
                required
                value={bookForm.author}
                onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                placeholder="e.g. Thomas H. Cormen, Charles E. Leiserson"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">ISBN Code *</label>
              <input
                type="text"
                required
                value={bookForm.isbn}
                onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                placeholder="e.g. 978-0262046305"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Discipline / Category *</label>
              <input
                type="text"
                required
                value={bookForm.category}
                onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                placeholder="e.g. Computer Science, AI, Mechanical"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Publisher</label>
              <input
                type="text"
                value={bookForm.publisher}
                onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                placeholder="e.g. MIT Press or Pearson"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Total Physical Copies *</label>
              <input
                type="number"
                min="1"
                required
                value={bookForm.totalCopies}
                onChange={(e) => setBookForm({ ...bookForm, totalCopies: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Shelf Location *</label>
              <input
                type="text"
                required
                value={bookForm.shelfLocation}
                onChange={(e) => setBookForm({ ...bookForm, shelfLocation: e.target.value })}
                placeholder="e.g. Stack A, Rack 102"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1">Description / Syllabus Scope</label>
              <textarea
                rows="2"
                value={bookForm.description}
                onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                placeholder="Brief synopsis or reference notes..."
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsAddBookModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Register Book
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ISSUE BOOK (ADMIN / TEACHER) */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue Book to Student"
        subtitle={selectedBookForIssue ? `Circulate "${selectedBookForIssue.title}"` : ''}
      >
        <form onSubmit={handleIssueBook} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Select Student *</label>
            <select
              required
              value={issueForm.studentId}
              onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            >
              <option value="">Choose Enrolled Student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.fullName} ({s.registrationNumber}) - Sem {s.currentSemester}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Return Due Date *</label>
              <input
                type="date"
                required
                value={issueForm.dueDate}
                onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Issue Remarks</label>
              <input
                type="text"
                value={issueForm.remarks}
                onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
                placeholder="e.g. Project reference, Thesis work"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Confirm Issue
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: PROCESS RETURN & FINE */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Process Book Return"
        subtitle={
          selectedIssueForReturn
            ? `Returning "${selectedIssueForReturn.bookId?.title}" from ${selectedIssueForReturn.studentId?.fullName}`
            : ''
        }
      >
        <form onSubmit={handleReturnBook} className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Issue Date:</span>
              <span className="font-semibold">
                {selectedIssueForReturn && new Date(selectedIssueForReturn.issueDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Agreed Due Date:</span>
              <span className="font-semibold">
                {selectedIssueForReturn && new Date(selectedIssueForReturn.dueDate).toLocaleDateString()}
              </span>
            </div>
            {selectedIssueForReturn?.isOverdue && (
              <div className="flex justify-between text-red-600 font-bold border-t pt-2 border-slate-200 dark:border-navy-800">
                <span>Calculated Late Fine (₹5/day):</span>
                <span>₹{selectedIssueForReturn.calculatedFine || 20}</span>
              </div>
            )}
          </div>

          {selectedIssueForReturn?.isOverdue && (
            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={returnForm.finePaid}
                  onChange={(e) => setReturnForm({ ...returnForm, finePaid: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Fine Paid at Library Circulation Counter</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-slate-500">
                <input
                  type="checkbox"
                  checked={returnForm.waived}
                  onChange={(e) => setReturnForm({ ...returnForm, waived: e.target.checked })}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Waive fine under special academic permission</span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsReturnModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Accept Return
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
