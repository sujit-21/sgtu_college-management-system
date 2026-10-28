import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  User,
  Tag,
} from 'lucide-react';
import api from '../../services/api';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';

export const AnnouncementsPage = () => {
  const { user } = useAuth();
  const canPost = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'TEACHER';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // New announcement modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'ACADEMIC',
    targetRole: 'ALL',
    priority: 'NORMAL',
  });

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/announcements', formData);
      if (res.data.success) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          content: '',
          category: 'ACADEMIC',
          targetRole: 'ALL',
          priority: 'NORMAL',
        });
        loadAnnouncements();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to post announcement.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      loadAnnouncements();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to remove announcement.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Notice Board & Broadcasts"
        description="Official university notices, examination circulars, events, and campus updates."
      >
        {canPost && (
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} icon={Plus}>
            Post Announcement
          </Button>
        )}
      </PageHeader>

      {/* Announcements List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading notices...</div>
      ) : announcements.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs text-slate-400">
          No announcements published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className={`p-5 rounded-2xl bg-white dark:bg-navy-900 border ${
                ann.priority === 'HIGH'
                  ? 'border-amber-300 dark:border-amber-700/60 shadow-md'
                  : 'border-slate-200 dark:border-navy-800 shadow-soft'
              } card-elevated flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={ann.category} text={ann.category} />
                    {ann.priority === 'HIGH' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>

                  {canPost && (
                    <button
                      onClick={() => handleDeleteAnnouncement(ann._id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-4">
                  {ann.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Author: {ann.authorName}</span>
                </div>
                <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post Campus Announcement"
        subtitle="Broadcast circular to faculty, students, or entire campus."
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Notice Headline *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Schedule for Mid-Term Supplementary Examinations"
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              >
                <option value="ACADEMIC">ACADEMIC</option>
                <option value="EXAM">EXAM</option>
                <option value="EVENT">EVENT</option>
                <option value="ADMINISTRATIVE">ADMINISTRATIVE</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Target Audience</label>
              <select
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              >
                <option value="ALL">Entire Campus</option>
                <option value="STUDENT">Students Only</option>
                <option value="TEACHER">Faculty Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Notice Body *</label>
            <textarea
              rows={5}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write the full announcement text..."
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
