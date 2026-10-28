import { AttendanceRecord, StudentProfile, Subject } from '../models/index.js';

export const getAttendance = async (req, res, next) => {
  try {
    const { studentId, subjectId, semester, date } = req.query;
    const query = {};

    // Role guard: students can only see their own attendance
    if (req.user.role === 'STUDENT' && req.studentProfile) {
      query.studentId = req.studentProfile._id;
    } else if (studentId) {
      query.studentId = studentId;
    }

    if (subjectId) query.subjectId = subjectId;
    if (semester) query.semester = Number(semester);
    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const records = await AttendanceRecord.find(query)
      .populate('studentId', 'fullName registrationNumber')
      .populate('subjectId', 'name code')
      .sort({ date: -1 });

    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

export const markClassAttendance = async (req, res, next) => {
  try {
    const { subjectId, date, semester = 1, attendances } = req.body;
    // attendances: [{ studentId: "...", status: "PRESENT"|"ABSENT"|"LATE"|"EXCUSED", remarks: "..." }]

    if (!subjectId || !date || !Array.isArray(attendances) || attendances.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subject, date, and student attendance list are required.',
      });
    }

    const attendanceDate = new Date(date);
    const startOfDay = new Date(new Date(date).setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));

    const markedById = req.teacherProfile ? req.teacherProfile._id : null;

    const operations = attendances.map((item) => ({
      updateOne: {
        filter: {
          studentId: item.studentId,
          subjectId,
          date: { $gte: startOfDay, $lte: endOfDay },
        },
        update: {
          $set: {
            studentId: item.studentId,
            subjectId,
            date: attendanceDate,
            semester: Number(semester),
            status: item.status || 'PRESENT',
            remarks: item.remarks || '',
            markedById,
          },
        },
        upsert: true,
      },
    }));

    await AttendanceRecord.bulkWrite(operations);

    res.json({
      success: true,
      message: `Successfully recorded attendance for ${attendances.length} students.`,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentAttendanceSummary = async (req, res, next) => {
  try {
    const targetStudentId =
      req.user.role === 'STUDENT' && req.studentProfile
        ? req.studentProfile._id
        : req.params.studentId;

    if (!targetStudentId) {
      return res.status(400).json({ success: false, message: 'Student ID required.' });
    }

    const records = await AttendanceRecord.find({ studentId: targetStudentId }).populate('subjectId', 'name code');

    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;

    res.json({
      success: true,
      summary: {
        totalSessions: total,
        present,
        absent,
        late,
        percentage,
      },
      records,
    });
  } catch (error) {
    next(error);
  }
};
