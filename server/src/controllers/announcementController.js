import { Announcement, AuditLog } from '../models/index.js';

export const getAnnouncements = async (req, res, next) => {
  try {
    const { role } = req.user || {};
    const filter = {};

    if (role && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      filter.targetRole = { $in: ['ALL', role] };
    }

    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category = 'ACADEMIC', targetRole = 'ALL', priority = 'NORMAL' } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category,
      targetRole,
      priority,
      authorName: req.user.email.split('@')[0],
    });

    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'CREATE_ANNOUNCEMENT',
      resource: 'COMMUNICATION',
      details: `Published announcement: "${title}"`,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Announcement published successfully.', data: announcement });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement removed.' });
  } catch (error) {
    next(error);
  }
};
