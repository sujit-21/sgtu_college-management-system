import { Assignment, AssignmentSubmission, Subject, Course } from '../models/index.js';

export const getAssignments = async (req, res, next) => {
  try {
    const { courseId, subjectId, semester } = req.query;
    const query = {};

    if (courseId) query.courseId = courseId;
    if (subjectId) query.subjectId = subjectId;
    if (semester) query.semester = Number(semester);

    // If student, auto-filter to their course and semester
    if (req.user.role === 'STUDENT' && req.studentProfile) {
      query.courseId = req.studentProfile.courseId;
      query.semester = req.studentProfile.currentSemester;
    }

    const assignments = await Assignment.find(query)
      .populate('subjectId', 'name code')
      .populate('courseId', 'name code')
      .populate('teacherId', 'fullName employeeId')
      .sort({ dueDate: 1 });

    // If student, attach their submission status
    let data = assignments;
    if (req.user.role === 'STUDENT' && req.studentProfile) {
      const assignmentIds = assignments.map((a) => a._id);
      const submissions = await AssignmentSubmission.find({
        assignmentId: { $in: assignmentIds },
        studentId: req.studentProfile._id,
      });

      const submissionMap = new Map();
      submissions.forEach((s) => submissionMap.set(s.assignmentId.toString(), s));

      data = assignments.map((a) => {
        const sub = submissionMap.get(a._id.toString());
        return {
          ...a.toObject(),
          mySubmission: sub || null,
        };
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    const { title, description, subjectId, courseId, semester, dueDate, totalMarks = 100, attachmentUrl } = req.body;
    if (!title || !description || !subjectId || !courseId || !dueDate) {
      return res.status(400).json({ success: false, message: 'Title, description, subject, course, and due date are required.' });
    }

    const teacherId = req.teacherProfile ? req.teacherProfile._id : req.body.teacherId;
    if (!teacherId) {
      return res.status(400).json({ success: false, message: 'Assigning teacher ID is required.' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      subjectId,
      courseId,
      semester: Number(semester) || 1,
      dueDate: new Date(dueDate),
      totalMarks: Number(totalMarks),
      attachmentUrl,
      teacherId,
    });

    const populated = await Assignment.findById(assignment._id)
      .populate('subjectId', 'name code')
      .populate('courseId', 'name code')
      .populate('teacherId', 'fullName');

    res.status(201).json({ success: true, message: 'Assignment published successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

export const submitAssignment = async (req, res, next) => {
  try {
    const { id } = req.params; // assignmentId
    const { submissionText, fileUrl } = req.body;

    if (!req.studentProfile) {
      return res.status(403).json({ success: false, message: 'Only registered students can submit coursework.' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    const isLate = new Date() > new Date(assignment.dueDate);

    const submission = await AssignmentSubmission.findOneAndUpdate(
      { assignmentId: id, studentId: req.studentProfile._id },
      {
        submissionText,
        fileUrl,
        submittedAt: new Date(),
        status: isLate ? 'LATE' : 'SUBMITTED',
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: isLate ? 'Assignment submitted (Marked Late).' : 'Assignment submitted successfully.',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { obtainedMarks, feedback } = req.body;

    const submission = await AssignmentSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    submission.obtainedMarks = Number(obtainedMarks);
    submission.feedback = feedback;
    submission.status = 'GRADED';
    await submission.save();

    res.json({ success: true, message: 'Submission graded successfully.', data: submission });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionsForAssignment = async (req, res, next) => {
  try {
    const submissions = await AssignmentSubmission.find({ assignmentId: req.params.id })
      .populate('studentId', 'fullName registrationNumber phone avatar currentSemester')
      .sort({ submittedAt: -1 });

    res.json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
};
