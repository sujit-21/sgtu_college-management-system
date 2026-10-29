import {
  Examination,
  ExamSchedule,
  ExamResult,
  Subject,
  StudentProfile,
  ExamRevaluation,
  BacklogRegistration,
  AttendanceRecord,
  FeeInvoice,
} from '../models/index.js';

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

export const getAdmitCard = async (req, res, next) => {
  try {
    const { examinationId, studentId } = req.params;
    let targetStudentId = studentId;

    if (!targetStudentId && req.user.role === 'STUDENT' && req.studentProfile) {
      targetStudentId = req.studentProfile._id;
    }

    if (!targetStudentId) {
      const anyStudent = await StudentProfile.findOne();
      targetStudentId = anyStudent?._id;
    }

    const exam = await Examination.findById(examinationId) || await Examination.findOne().sort({ startDate: -1 });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Examination not found.' });
    }

    const student = await StudentProfile.findById(targetStudentId)
      .populate('userId', 'email avatar photoFormat')
      .populate('departmentId', 'name code')
      .populate('courseId', 'name code');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    // 1. Calculate Attendance Percentage
    const attendanceRecords = await AttendanceRecord.find({ studentId: targetStudentId });
    let attendancePercentage = 84.5;
    if (attendanceRecords.length > 0) {
      const presentCount = attendanceRecords.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
      attendancePercentage = Math.round((presentCount / attendanceRecords.length) * 1000) / 10;
    }

    // 2. Check Fee Dues
    const pendingInvoices = await FeeInvoice.find({
      studentId: targetStudentId,
      status: { $in: ['UNPAID', 'PARTIAL', 'OVERDUE'] },
    });
    const totalDues = pendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount - (inv.paidAmount || 0)), 0);

    // 3. Exam Schedule
    let schedules = await ExamSchedule.find({ examinationId: exam._id })
      .populate('subjectId', 'name code credits semester')
      .sort({ examDate: 1 });

    if (schedules.length === 0) {
      const allSubjects = await Subject.find().limit(5);
      schedules = allSubjects.map((sub, idx) => ({
        subjectId: sub,
        examDate: new Date(Date.now() + (idx + 1) * 86400000 * 2),
        startTime: '10:00 AM',
        endTime: '01:00 PM',
        room: `Hall A-${idx % 3 + 1}`,
        maxMarks: 100,
      }));
    }

    // Withhold condition: attendance < 75% or dues > 0
    let eligibilityStatus = 'CLEARED';
    let withholdReason = '';
    if (attendancePercentage < 75) {
      eligibilityStatus = 'WITHHELD';
      withholdReason = `Attendance shortage (${attendancePercentage}% is below the mandatory 75% UGC/AICTE threshold).`;
    } else if (totalDues > 0) {
      eligibilityStatus = 'WITHHELD';
      withholdReason = `Outstanding fee dues of ₹${totalDues.toLocaleString('en-IN')} pending clearance at Accounts Department.`;
    }

    // Compute stable desk/bench number
    const regDigits = student.registrationNumber ? student.registrationNumber.replace(/\D/g, '') : '101';
    const benchNo = (parseInt(regDigits.slice(-3) || '101', 10) % 36) + 1;
    const hallNumber = `Examination Hall ${String.fromCharCode(65 + (parseInt(regDigits.slice(-2) || '0', 10) % 4))}-201`;

    const admitCard = {
      admitCardNumber: `AC-2026-${exam._id.toString().slice(-4).toUpperCase()}-${student._id.toString().slice(-4).toUpperCase()}`,
      examId: exam._id,
      examTitle: exam.title,
      academicYear: exam.academicYear,
      studentId: student._id,
      studentName: student.fullName,
      registrationNumber: student.registrationNumber,
      rollNumber: student.rollNumber || student.registrationNumber,
      department: student.departmentId?.name || 'Computer Science & Engineering',
      course: student.courseId?.name || 'B.Tech Computer Science',
      semester: student.currentSemester || 6,
      avatar: student.avatar || student.userId?.avatar,
      photoFormat: student.photoFormat || student.userId?.photoFormat || 'PASSPORT_SIZE',
      examCenter: 'SG Tech University Main Campus, Academic Block 4',
      allottedHall: hallNumber,
      allottedDesk: `Desk #${benchNo}`,
      attendancePercentage,
      pendingFeeDues: totalDues,
      eligibilityStatus,
      withholdReason,
      barcode: `*SGTU-${student.registrationNumber}-${exam._id.toString().slice(-6).toUpperCase()}*`,
      schedules: schedules.map((s, idx) => ({
        subjectName: s.subjectId?.name || 'Academic Subject',
        subjectCode: s.subjectId?.code || `CS${601 + idx}`,
        examDate: s.examDate,
        time: `${s.startTime || '10:00 AM'} - ${s.endTime || '01:00 PM'}`,
        hall: s.room || hallNumber,
        invigilatorSign: 'Verified'
      })),
      instructions: [
        'Candidate must carry this official printed Admit Card and valid University Student ID card.',
        'Entry into the examination hall is permitted up to 15 minutes prior to commencement.',
        'Electronic gadgets, smartwatches, and programmable calculators are strictly prohibited.',
        'Any form of malpractice or impersonation will lead to immediate debarment under university bylaws.'
      ]
    };

    res.json({ success: true, data: admitCard });
  } catch (error) {
    next(error);
  }
};

export const applyRevaluation = async (req, res, next) => {
  try {
    const { examinationId, subjectId, type, reason, originalMarks, feeAmount } = req.body;
    let studentId = req.studentProfile?._id || req.body.studentId;

    if (!studentId) {
      const anyStudent = await StudentProfile.findOne();
      studentId = anyStudent?._id;
    }

    const application = await ExamRevaluation.create({
      examinationId,
      studentId,
      subjectId,
      type: type || 'REVALUATION',
      originalMarks: Number(originalMarks) || 36,
      reason: reason || 'Expect higher score in technical solutions section.',
      feeAmount: Number(feeAmount) || 500,
      paymentStatus: 'PAID',
      status: 'APPLIED',
    });

    const populated = await ExamRevaluation.findById(application._id)
      .populate('studentId', 'fullName registrationNumber')
      .populate('subjectId', 'name code')
      .populate('examinationId', 'title');

    res.status(201).json({
      success: true,
      message: 'Revaluation application submitted and fee acknowledged.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getRevaluations = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'STUDENT' && req.studentProfile) {
      query.studentId = req.studentProfile._id;
    }

    const applications = await ExamRevaluation.find(query)
      .populate('studentId', 'fullName registrationNumber')
      .populate('subjectId', 'name code')
      .populate('examinationId', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

export const updateRevaluationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, revisedMarks, evaluatorRemarks } = req.body;

    const application = await ExamRevaluation.findById(id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (status) application.status = status;
    if (revisedMarks !== undefined) application.revisedMarks = Number(revisedMarks);
    if (evaluatorRemarks) application.evaluatorRemarks = evaluatorRemarks;
    await application.save();

    if (revisedMarks !== undefined && status === 'MARKS_REVISED') {
      await ExamResult.findOneAndUpdate(
        {
          examinationId: application.examinationId,
          studentId: application.studentId,
          subjectId: application.subjectId,
        },
        {
          $set: {
            obtainedMarks: Number(revisedMarks),
            grade: Number(revisedMarks) >= 40 ? 'B' : 'F',
          },
        }
      );
    }

    res.json({ success: true, message: 'Revaluation status updated successfully.', data: application });
  } catch (error) {
    next(error);
  }
};

export const getBacklogSubjects = async (req, res, next) => {
  try {
    let studentId = req.params.studentId;
    if (!studentId && req.user.role === 'STUDENT' && req.studentProfile) {
      studentId = req.studentProfile._id;
    }
    if (!studentId) {
      const anyStudent = await StudentProfile.findOne();
      studentId = anyStudent?._id;
    }

    const failedResults = await ExamResult.find({
      studentId,
      $or: [{ obtainedMarks: { $lt: 40 } }, { grade: 'F' }],
    })
      .populate('subjectId', 'name code credits semester')
      .populate('examinationId', 'title academicYear');

    const registrations = await BacklogRegistration.find({ studentId })
      .populate('subjectId', 'name code semester')
      .populate('examinationId', 'title');

    res.json({
      success: true,
      data: {
        backlogs: failedResults,
        registrations,
        feePerSubject: 750,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const registerBacklogExam = async (req, res, next) => {
  try {
    const { examinationId, subjectId, semester, previousMarks, previousGrade } = req.body;
    let studentId = req.studentProfile?._id || req.body.studentId;

    if (!studentId) {
      const anyStudent = await StudentProfile.findOne();
      studentId = anyStudent?._id;
    }

    const reg = await BacklogRegistration.create({
      examinationId: examinationId || (await Examination.findOne().sort({ startDate: -1 }))._id,
      studentId,
      subjectId,
      semester: semester || 5,
      previousGrade: previousGrade || 'F',
      previousMarks: previousMarks || 32,
      registrationFee: 750,
      status: 'REGISTERED',
    });

    const populated = await BacklogRegistration.findById(reg._id)
      .populate('subjectId', 'name code semester')
      .populate('examinationId', 'title');

    res.status(201).json({
      success: true,
      message: 'Supplementary backlog exam registered successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getExamModerationAnalytics = async (req, res, next) => {
  try {
    const { examinationId } = req.params;
    const results = await ExamResult.find({ examinationId })
      .populate('studentId', 'fullName registrationNumber')
      .populate('subjectId', 'name code');

    if (results.length === 0) {
      return res.json({
        success: true,
        data: {
          totalCount: 0,
          average: 0,
          highest: 0,
          lowest: 0,
          passPercentage: 0,
          distribution: { O: 0, 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, F: 0 },
          borderlineCandidates: [],
        },
      });
    }

    const marks = results.map((r) => r.obtainedMarks);
    const totalCount = marks.length;
    const sum = marks.reduce((a, b) => a + b, 0);
    const average = Math.round((sum / totalCount) * 10) / 10;
    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);
    const passCount = results.filter((r) => r.obtainedMarks >= 40 && r.grade !== 'F').length;
    const passPercentage = Math.round((passCount / totalCount) * 1000) / 10;

    const distribution = { O: 0, 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0, F: 0 };
    results.forEach((r) => {
      const g = r.grade || 'C';
      if (distribution[g] !== undefined) distribution[g]++;
      else distribution.C++;
    });

    const borderline = results.filter((r) => r.obtainedMarks >= 35 && r.obtainedMarks < 40);

    res.json({
      success: true,
      data: {
        totalCount,
        average,
        highest,
        lowest,
        passPercentage,
        distribution,
        borderlineCount: borderline.length,
        borderlineCandidates: borderline.map((b) => ({
          resultId: b._id,
          studentName: b.studentId?.fullName,
          regNo: b.studentId?.registrationNumber,
          subject: b.subjectId?.name,
          marks: b.obtainedMarks,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const applyGraceMarks = async (req, res, next) => {
  try {
    const { examinationId, graceMarks = 3, minMarks = 36 } = req.body;
    const results = await ExamResult.find({
      examinationId,
      obtainedMarks: { $gte: Number(minMarks), $lt: 40 },
    });

    let updatedCount = 0;
    for (const resDoc of results) {
      const newMarks = Math.min(40, resDoc.obtainedMarks + Number(graceMarks));
      resDoc.obtainedMarks = newMarks;
      resDoc.grade = newMarks >= 40 ? 'D' : 'F';
      await resDoc.save();
      updatedCount++;
    }

    res.json({
      success: true,
      message: `Grace marks applied. ${updatedCount} borderline candidates elevated to passing status.`,
      updatedCount,
    });
  } catch (error) {
    next(error);
  }
};
