import { Examination, ExamSchedule, ExamResult, Subject, StudentProfile } from '../models/index.js';

export const getExaminations = async (req, res, next) => {
  try {
    const exams = await Examination.find().sort({ startDate: -1 });

    const results = await Promise.all(
      exams.map(async (exam) => {
        const schedules = await ExamSchedule.find({ examinationId: exam._id })
          .populate('subjectId', 'name code semester')
          .sort({ examDate: 1 });
        return {
          ...exam.toObject(),
          schedules,
        };
      })
    );

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

export const createExamination = async (req, res, next) => {
  try {
    const { title, academicYear, startDate, endDate, schedules } = req.body;
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Title, start date, and end date are required.' });
    }

    const exam = await Examination.create({
      title,
      academicYear: academicYear || '2025-2026',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'UPCOMING',
    });

    if (Array.isArray(schedules) && schedules.length > 0) {
      const scheduleDocs = schedules.map((s) => ({
        examinationId: exam._id,
        subjectId: s.subjectId,
        examDate: new Date(s.examDate),
        startTime: s.startTime || '10:00 AM',
        endTime: s.endTime || '01:00 PM',
        room: s.room || 'Examination Hall',
        maxMarks: Number(s.maxMarks) || 100,
      }));
      await ExamSchedule.insertMany(scheduleDocs);
    }

    res.status(201).json({ success: true, message: 'Examination created successfully.', data: exam });
  } catch (error) {
    next(error);
  }
};

export const enterMarks = async (req, res, next) => {
  try {
    const { examinationId, subjectId, marksList } = req.body;
    // marksList: [{ studentId, obtainedMarks, maxMarks = 100 }]

    if (!examinationId || !subjectId || !Array.isArray(marksList) || marksList.length === 0) {
      return res.status(400).json({ success: false, message: 'Exam, subject, and student marks list are required.' });
    }

    // Helper to calculate grade
    const calculateGrade = (pct) => {
      if (pct >= 90) return 'A+';
      if (pct >= 80) return 'A';
      if (pct >= 70) return 'B+';
      if (pct >= 60) return 'B';
      if (pct >= 50) return 'C';
      if (pct >= 40) return 'D';
      return 'F';
    };

    const operations = marksList.map((item) => {
      const maxMarks = Number(item.maxMarks) || 100;
      const obtained = Number(item.obtainedMarks);
      const percentage = (obtained / maxMarks) * 100;
      const grade = calculateGrade(percentage);

      return {
        updateOne: {
          filter: {
            examinationId,
            studentId: item.studentId,
            subjectId,
          },
          update: {
            $set: {
              examinationId,
              studentId: item.studentId,
              subjectId,
              obtainedMarks: obtained,
              maxMarks,
              grade,
            },
          },
          upsert: true,
        },
      };
    });

    await ExamResult.bulkWrite(operations);

    res.json({ success: true, message: `Marks recorded for ${marksList.length} students.` });
  } catch (error) {
    next(error);
  }
};

export const publishResults = async (req, res, next) => {
  try {
    const { examinationId } = req.params;
    await ExamResult.updateMany({ examinationId }, { isPublished: true });
    await Examination.findByIdAndUpdate(examinationId, { status: 'RESULTS_PUBLISHED' });

    res.json({ success: true, message: 'Exam results published successfully for all students.' });
  } catch (error) {
    next(error);
  }
};

export const getResultsForExam = async (req, res, next) => {
  try {
    const { examinationId } = req.params;
    const query = { examinationId };

    if (req.user.role === 'STUDENT' && req.studentProfile) {
      query.studentId = req.studentProfile._id;
      query.isPublished = true;
    }

    const results = await ExamResult.find(query)
      .populate('studentId', 'fullName registrationNumber')
      .populate('subjectId', 'name code credits')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};
