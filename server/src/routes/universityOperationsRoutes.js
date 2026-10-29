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

export default router;
