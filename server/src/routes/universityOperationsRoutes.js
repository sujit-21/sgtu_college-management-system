import express from 'express';
import {
  TimetableSlot,
  PayrollRecord,
  HostelAllocation,
  TransportRoute,
  PlacementDrive,
  LeaveApplication,
  CampusGrievance,
  TeacherProfile,
  StudentProfile,
  QuestionPaper,
  User,
  Department,
} from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All university operations require authentication
router.use(authenticate);

// ==========================================
// 1. TIMETABLE
// ==========================================
router.get('/timetable', async (req, res, next) => {
  try {
    const { departmentCode, semester, dayOfWeek } = req.query;
    const filter = {};
    if (departmentCode) filter.departmentCode = departmentCode;
    if (semester) filter.semester = parseInt(semester, 10);
    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;

    const slots = await TimetableSlot.find(filter).sort({ startTime: 1 });
    res.json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    next(error);
  }
});

router.post('/timetable', authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const slot = await TimetableSlot.create(req.body);
    res.status(201).json({ success: true, data: slot });
  } catch (error) {
    next(error);
  }
});

router.delete('/timetable/:id', authorize('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    await TimetableSlot.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Timetable lecture slot removed.' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. PAYROLL & HRMS
// ==========================================
router.get('/payroll', authorize('ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT', 'TEACHER'), async (req, res, next) => {
  try {
    let filter = {};
    // If teacher, only return their own payroll
    if (req.user.role === 'TEACHER') {
      const teacher = await TeacherProfile.findOne({ userId: req.user.id });
      if (teacher) {
        filter = { employeeId: teacher.employeeId };
      }
    }

    const records = await PayrollRecord.find(filter).sort({ createdAt: -1 });

    const totalDisbursed = records
      .filter((r) => r.status === 'PAID')
      .reduce((acc, r) => acc + (r.netSalary || 0), 0);

    const pendingDisbursed = records
      .filter((r) => r.status === 'PENDING')
      .reduce((acc, r) => acc + (r.netSalary || 0), 0);

    res.json({
      success: true,
      stats: {
        totalRecords: records.length,
        totalDisbursed,
        pendingDisbursed,
        processedCount: records.filter((r) => r.status === 'PAID').length,
      },
      data: records,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/payroll/generate', authorize('ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'), async (req, res, next) => {
  try {
    const { month = 'October', year = 2026 } = req.body;
    const teachers = await TeacherProfile.find();

    const created = [];
    for (const t of teachers) {
      // Calculate realistic salary components
      const basicPay = t.designation?.includes('Professor & HOD')
        ? 125000
        : t.designation?.includes('Associate')
        ? 95000
        : 75000;
      const hra = Math.round(basicPay * 0.24);
      const da = Math.round(basicPay * 0.18);
      const specialAllowance = 8000;
      const gross = basicPay + hra + da + specialAllowance;
      const epfDeduction = 1800;
      const tdsDeduction = Math.round(gross * 0.08);
      const netSalary = gross - epfDeduction - tdsDeduction;

      const record = await PayrollRecord.create({
        teacherId: t._id,
        teacherName: t.fullName,
        employeeId: t.employeeId,
        month,
        year,
        basicPay,
        hra,
        da,
        specialAllowance,
        epfDeduction,
        tdsDeduction,
        netSalary,
        status: 'PAID',
        paymentDate: '2026-10-28',
        transactionRef: `SGTU-NEFT-${Math.floor(100000 + Math.random() * 900000)}`,
        bankName: t.bankName || 'HDFC Bank',
        accountNumber: t.accountNumber || '50100492817291',
        panNumber: t.panNumber || 'ABCPD1234E',
        pfUanNumber: t.pfUanNumber || '101234567890',
      });
      created.push(record);
    }

    res.status(201).json({
      success: true,
      message: `Generated and disbursed payroll for ${created.length} faculty members for ${month} ${year}.`,
      count: created.length,
      data: created,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. HOSTEL & RESIDENTIAL
// ==========================================
router.get('/hostel', async (req, res, next) => {
  try {
    const allocations = await HostelAllocation.find().sort({ createdAt: -1 });

    const totalRooms = 150;
    const occupiedBeds = allocations.filter((a) => a.status === 'ACTIVE').length;
    const totalCapacity = 300;

    res.json({
      success: true,
      stats: {
        totalRooms,
        totalCapacity,
        occupiedBeds,
        availableBeds: totalCapacity - occupiedBeds,
        occupancyRate: Math.round((occupiedBeds / totalCapacity) * 100),
      },
      data: allocations,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/hostel/allocate', authorize('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const allocation = await HostelAllocation.create(req.body);
    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
});

router.post('/hostel/gate-pass', async (req, res, next) => {
  try {
    const { allocationId, reason, destination, outTime, inTime } = req.body;
    let allocation;
    if (allocationId) {
      allocation = await HostelAllocation.findById(allocationId);
    } else {
      allocation = await HostelAllocation.findOne();
    }

    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Hostel record not found.' });
    }

    allocation.gatePasses.push({
      reason,
      destination,
      outTime,
      inTime,
      status: 'APPROVED',
    });
    await allocation.save();

    res.status(201).json({ success: true, message: 'Gate pass authorized.', data: allocation });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 4. TRANSPORT & BUS ROUTES
// ==========================================
router.get('/transport', async (req, res, next) => {
  try {
    const routes = await TransportRoute.find().sort({ routeNumber: 1 });
    const totalBuses = routes.length;
    const totalSeats = routes.reduce((sum, r) => sum + r.capacity, 0);
    const totalSubscribers = routes.reduce((sum, r) => sum + r.currentSubscribers, 0);

    res.json({
      success: true,
      stats: {
        totalBuses,
        totalSeats,
        totalSubscribers,
        activeFleet: totalBuses,
      },
      data: routes,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/transport', authorize('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const route = await TransportRoute.create(req.body);
    res.status(201).json({ success: true, data: route });
  } catch (error) {
    next(error);
  }
});

router.post('/transport/:id/subscribe', async (req, res, next) => {
  try {
    const route = await TransportRoute.findById(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found.' });

    if (route.currentSubscribers < route.capacity) {
      route.currentSubscribers += 1;
      await route.save();
    }
    res.json({ success: true, message: 'Campus bus pass activated successfully.', data: route });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 5. TRAINING & PLACEMENT (T&P)
// ==========================================
router.get('/placement', async (req, res, next) => {
  try {
    const drives = await PlacementDrive.find().sort({ driveDate: 1 });
    const totalDrives = drives.length;
    const totalOffers = drives.reduce((sum, d) => sum + (d.totalOffers || 0), 0);
    const highestPackage = Math.max(...drives.map((d) => d.packageLpa), 0);
    const avgPackage =
      drives.length > 0
        ? (drives.reduce((sum, d) => sum + d.packageLpa, 0) / drives.length).toFixed(1)
        : '0.0';

    res.json({
      success: true,
      stats: {
        totalDrives,
        totalOffers,
        highestPackage: `${highestPackage} LPA`,
        avgPackage: `${avgPackage} LPA`,
        placementRate: '92.4%',
      },
      data: drives,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/placement', authorize('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const drive = await PlacementDrive.create(req.body);
    res.status(201).json({ success: true, data: drive });
  } catch (error) {
    next(error);
  }
});

router.post('/placement/:id/apply', async (req, res, next) => {
  try {
    const drive = await PlacementDrive.findById(req.params.id);
    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found.' });

    drive.appliedCount = (drive.appliedCount || 0) + 1;
    await drive.save();

    res.json({ success: true, message: 'Application submitted for recruitment drive.', data: drive });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 6. LEAVE & GRIEVANCE REDRESSAL
// ==========================================
router.get('/leave-grievance/leaves', async (req, res, next) => {
  try {
    const leaves = await LeaveApplication.find().sort({ createdAt: -1 });
    res.json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
});

router.post('/leave-grievance/leaves', async (req, res, next) => {
  try {
    const leave = await LeaveApplication.create(req.body);
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
});

router.patch('/leave-grievance/leaves/:id', authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const leave = await LeaveApplication.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
});

router.get('/leave-grievance/grievances', async (req, res, next) => {
  try {
    const grievances = await CampusGrievance.find().sort({ createdAt: -1 });
    res.json({ success: true, data: grievances });
  } catch (error) {
    next(error);
  }
});

router.post('/leave-grievance/grievances', async (req, res, next) => {
  try {
    const grievance = await CampusGrievance.create(req.body);
    res.status(201).json({ success: true, data: grievance });
  } catch (error) {
    next(error);
  }
});

router.patch('/leave-grievance/grievances/:id', authorize('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const grievance = await CampusGrievance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: grievance });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 7. PREVIOUS YEAR QUESTION PAPERS (PYQ)
// ==========================================
router.get('/question-papers', async (req, res, next) => {
  try {
    const { departmentCode, semester, academicYear, examType, search, hasAnswerKey } = req.query;

    const filter = {};
    if (departmentCode && departmentCode !== 'All') filter.departmentCode = departmentCode;
    if (semester && semester !== 'All') filter.semester = parseInt(semester, 10);
    if (academicYear && academicYear !== 'All') filter.academicYear = academicYear;
    if (examType && examType !== 'All') filter.examType = examType;
    if (hasAnswerKey === 'true') filter.hasAnswerKey = true;

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { subjectName: { $regex: q, $options: 'i' } },
        { subjectCode: { $regex: q, $options: 'i' } },
        { departmentName: { $regex: q, $options: 'i' } },
      ];
    }

    const papers = await QuestionPaper.find(filter).sort({ academicYear: -1, semester: 1, subjectCode: 1 });

    const totalDownloads = papers.reduce((sum, p) => sum + (p.downloadCount || 0), 0);
    const withSolutionsCount = papers.filter((p) => p.hasAnswerKey).length;

    res.json({
      success: true,
      stats: {
        totalPapers: papers.length,
        totalDownloads,
        withSolutionsCount,
      },
      data: papers,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/question-papers', authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const paper = await QuestionPaper.create(req.body);
    res.status(201).json({ success: true, message: 'Question paper archived successfully.', data: paper });
  } catch (error) {
    next(error);
  }
});

router.post('/question-papers/:id/download', async (req, res, next) => {
  try {
    const paper = await QuestionPaper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Question paper not found.' });
    }

    paper.downloadCount = (paper.downloadCount || 0) + 1;
    await paper.save();

    res.json({
      success: true,
      message: 'Download initiated.',
      downloadUrl: paper.fileUrl,
      downloadCount: paper.downloadCount,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/question-papers/:id', authorize('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    await QuestionPaper.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Question paper removed from repository.' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 10. IDENTITY CARDS PHOTO & CREDENTIALS
// ==========================================
router.get('/id-cards/members', async (req, res, next) => {
  try {
    const { category = 'STUDENTS' } = req.query; // 'STUDENTS', 'HODS', 'FACULTY', 'LIBRARIANS', 'ACCOUNTANTS'

    if (category === 'STUDENTS') {
      const students = await StudentProfile.find({ academicStatus: 'ACTIVE' })
        .populate('userId', 'email collegeId avatar photoFormat')
        .populate('departmentId', 'name code')
        .populate('courseId', 'name code')
        .sort({ createdAt: -1 });

      const mapped = students.map((s) => ({
        _id: s._id,
        userId: s.userId?._id,
        fullName: s.fullName,
        collegeId: s.registrationNumber,
        email: s.userId?.email,
        phone: s.phone,
        role: 'STUDENT',
        categoryTitle: 'Student Identity Card',
        departmentName: s.departmentId?.name || 'School of Computing',
        departmentCode: s.departmentId?.code || 'CSE',
        courseName: s.courseId?.name || 'Bachelor of Technology',
        semester: s.currentSemester,
        bloodGroup: s.bloodGroup || 'O+',
        aadhaarNumber: s.aadhaarNumber,
        validThru: 'JULY 2027',
        avatar: s.avatar || s.userId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        photoFormat: s.photoFormat || s.userId?.photoFormat || 'PASSPORT_SIZE',
      }));
      return res.json({ success: true, count: mapped.length, data: mapped });
    }

    if (category === 'HODS') {
      const hodUsers = await User.find({ role: 'HOD' });
      const hodUserIds = hodUsers.map((u) => u._id);
      const hodProfiles = await TeacherProfile.find({ userId: { $in: hodUserIds } })
        .populate('userId', 'email collegeId avatar photoFormat')
        .populate('departmentId', 'name code');

      const mapped = hodProfiles.map((h) => ({
        _id: h._id,
        userId: h.userId?._id,
        fullName: h.fullName,
        collegeId: h.employeeId,
        email: h.userId?.email,
        phone: h.phone,
        role: 'HOD',
        categoryTitle: 'Head of Department Identity Card',
        designation: h.designation || 'Professor & Head of Department',
        departmentName: h.departmentId?.name || 'Computer Science & Engineering',
        departmentCode: h.departmentId?.code || 'CSE',
        qualification: h.qualification || 'Ph.D in Distributed Systems',
        specialization: h.specialization,
        validThru: 'DEC 2028',
        avatar: h.avatar || h.userId?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        photoFormat: h.photoFormat || h.userId?.photoFormat || 'PASSPORT_SIZE',
      }));
      return res.json({ success: true, count: mapped.length, data: mapped });
    }

    if (category === 'FACULTY') {
      const teacherUsers = await User.find({ role: 'TEACHER' });
      const teacherUserIds = teacherUsers.map((u) => u._id);
      const facultyProfiles = await TeacherProfile.find({ userId: { $in: teacherUserIds } })
        .populate('userId', 'email collegeId avatar photoFormat')
        .populate('departmentId', 'name code');

      const mapped = facultyProfiles.map((f) => ({
        _id: f._id,
        userId: f.userId?._id,
        fullName: f.fullName,
        collegeId: f.employeeId,
        email: f.userId?.email,
        phone: f.phone,
        role: 'TEACHER',
        categoryTitle: 'Faculty Identity Card',
        designation: f.designation || 'Associate Professor',
        departmentName: f.departmentId?.name || 'School of Engineering',
        departmentCode: f.departmentId?.code || 'CSE',
        qualification: f.qualification || 'M.Tech / Ph.D',
        specialization: f.specialization,
        validThru: 'DEC 2028',
        avatar: f.avatar || f.userId?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        photoFormat: f.photoFormat || f.userId?.photoFormat || 'PASSPORT_SIZE',
      }));
      return res.json({ success: true, count: mapped.length, data: mapped });
    }

    if (category === 'LIBRARIANS') {
      const librarianUsers = await User.find({ role: 'LIBRARIAN' });
      const mapped = librarianUsers.map((l) => ({
        _id: l._id,
        userId: l._id,
        fullName: 'Chief University Librarian',
        collegeId: l.collegeId || 'LIB-001',
        email: l.email,
        phone: '+91 98450 11990',
        role: 'LIBRARIAN',
        categoryTitle: 'Central Library Staff Card',
        designation: 'Chief Librarian & Information Officer',
        departmentName: 'Central Library & Knowledge Resource Center',
        departmentCode: 'LIB',
        qualification: 'Master of Library & Information Science (M.Lib.I.Sc)',
        validThru: 'DEC 2028',
        avatar: l.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        photoFormat: l.photoFormat || 'PASSPORT_SIZE',
      }));
      return res.json({ success: true, count: mapped.length, data: mapped });
    }

    if (category === 'ACCOUNTANTS') {
      const accountantUsers = await User.find({ role: 'ACCOUNTANT' });
      const mapped = accountantUsers.map((a) => ({
        _id: a._id,
        userId: a._id,
        fullName: 'Chief Accounts Officer',
        collegeId: a.collegeId || 'ACC-001',
        email: a.email,
        phone: '+91 98450 11880',
        role: 'ACCOUNTANT',
        categoryTitle: 'Finance & Accounts Bureau Card',
        designation: 'Finance & Accounts Comptroller',
        departmentName: 'Finance, Treasury & Audit Bureau',
        departmentCode: 'FIN',
        qualification: 'Chartered Accountant (CA) & MBA Finance',
        validThru: 'DEC 2028',
        avatar: a.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        photoFormat: a.photoFormat || 'PASSPORT_SIZE',
      }));
      return res.json({ success: true, count: mapped.length, data: mapped });
    }

    res.status(400).json({ success: false, message: 'Invalid ID card category.' });
  } catch (error) {
    next(error);
  }
});

router.patch('/id-cards/photo/:id', authorize('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { avatar, photoFormat } = req.body; // photoFormat: 'PASSPORT_SIZE' or 'STAMP_SIZE'

    if (photoFormat && !['PASSPORT_SIZE', 'STAMP_SIZE'].includes(photoFormat)) {
      return res.status(400).json({ success: false, message: 'photoFormat must be PASSPORT_SIZE or STAMP_SIZE' });
    }

    // Try finding User by id or by profileId
    let user = await User.findById(id);
    let sProf = null;
    let tProf = null;

    if (!user) {
      sProf = await StudentProfile.findById(id);
      if (sProf) user = await User.findById(sProf.userId);
    }
    if (!user) {
      tProf = await TeacherProfile.findById(id);
      if (tProf) user = await User.findById(tProf.userId);
    }

    if (user) {
      if (avatar) user.avatar = avatar;
      if (photoFormat) user.photoFormat = photoFormat;
      await user.save();
    }

    // Update profile if student or teacher
    if (!sProf && user) sProf = await StudentProfile.findOne({ userId: user._id });
    if (sProf) {
      if (avatar) sProf.avatar = avatar;
      if (photoFormat) sProf.photoFormat = photoFormat;
      await sProf.save();
    }

    if (!tProf && user) tProf = await TeacherProfile.findOne({ userId: user._id });
    if (tProf) {
      if (avatar) tProf.avatar = avatar;
      if (photoFormat) tProf.photoFormat = photoFormat;
      await tProf.save();
    }

    res.json({
      success: true,
      message: `ID Card photo updated to ${photoFormat || 'PASSPORT_SIZE'} format successfully.`,
      avatar: avatar || user?.avatar,
      photoFormat: photoFormat || user?.photoFormat,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
