import {
  FeeCategory,
  FeeInvoice,
  PaymentRecord,
  StudentProfile,
  AuditLog,
  ScholarshipAward,
} from '../models/index.js';

// ==========================================
// 1. INVOICES & REVENUE LEDGER
// ==========================================
export const getFeeInvoices = async (req, res, next) => {
  try {
    const { status, semester, studentId } = req.query;
    const query = {};

    if (req.user.role === 'STUDENT' && req.studentProfile) {
      query.studentId = req.studentProfile._id;
    } else if (studentId) {
      query.studentId = studentId;
    }

    if (status) query.status = status;
    if (semester) query.semester = Number(semester);

    const invoices = await FeeInvoice.find(query)
      .populate('studentId', 'fullName registrationNumber phone currentSemester email')
      .populate('scholarshipId')
      .sort({ createdAt: -1 });

    const now = new Date();

    const results = await Promise.all(
      invoices.map(async (inv) => {
        const payments = await PaymentRecord.find({ invoiceId: inv._id }).sort({ paymentDate: -1 });

        // Auto-check overdue status for milestones
        let hasOverdueMilestone = false;
        if (inv.hasInstallmentPlan && inv.installments?.length) {
          inv.installments.forEach((inst) => {
            if (inst.status === 'UNPAID' && new Date(inst.dueDate) < now) {
              inst.status = 'OVERDUE';
              hasOverdueMilestone = true;
            }
          });
        }

        const invObj = inv.toObject();
        return {
          ...invObj,
          payments,
          hasOverdueMilestone,
        };
      })
    );

    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};

export const createFeeInvoice = async (req, res, next) => {
  try {
    const {
      studentId,
      title,
      grossAmount,
      totalAmount,
      dueDate,
      semester = 1,
      scholarshipId,
      hasInstallmentPlan = false,
    } = req.body;

    if (!studentId || !title || (!totalAmount && !grossAmount) || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Student, fee description, amount, and due date are required.',
      });
    }

    const gross = Number(grossAmount || totalAmount);
    let discount = 0;
    let scholarshipRef = null;
    let scholarshipName = '';

    if (scholarshipId) {
      const scholarship = await ScholarshipAward.findById(scholarshipId);
      if (scholarship && scholarship.status === 'SANCTIONED') {
        discount = scholarship.deductionAmount || 0;
        scholarshipRef = scholarship._id;
        scholarshipName = scholarship.scholarshipName;
      }
    }

    const netPayable = Math.max(0, gross - discount);

    const count = await FeeInvoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Generate 3-Part Milestone Installments if selected
    let installments = [];
    if (hasInstallmentPlan) {
      const baseDueDate = new Date(dueDate);

      // Milestone 1: 40% (Course Enrollment & First Month)
      const m1Date = new Date(baseDueDate);

      // Milestone 2: 30% (Mid-Term Exam & Month 3)
      const m2Date = new Date(baseDueDate);
      m2Date.setDate(m2Date.getDate() + 45);

      // Milestone 3: 30% (End-Term Clearance & Month 5)
      const m3Date = new Date(baseDueDate);
      m3Date.setDate(m3Date.getDate() + 90);

      const m1Amt = Math.round(netPayable * 0.4);
      const m2Amt = Math.round(netPayable * 0.3);
      const m3Amt = netPayable - m1Amt - m2Amt; // Exact balance to prevent rounding drift

      installments = [
        {
          installmentNumber: 1,
          milestoneTitle: 'Milestone 1: Semester Registration & Course Enrollment (40%)',
          percentage: 40,
          amount: m1Amt,
          dueDate: m1Date,
          paidAmount: 0,
          status: 'UNPAID',
          reminderSent: false,
        },
        {
          installmentNumber: 2,
          milestoneTitle: 'Milestone 2: Mid-Term Examination & Internal Assessment Clearance (30%)',
          percentage: 30,
          amount: m2Amt,
          dueDate: m2Date,
          paidAmount: 0,
          status: 'UNPAID',
          reminderSent: false,
        },
        {
          installmentNumber: 3,
          milestoneTitle: 'Milestone 3: End-Term Exam, Practical Labs & No-Dues Clearance (30%)',
          percentage: 30,
          amount: m3Amt,
          dueDate: m3Date,
          paidAmount: 0,
          status: 'UNPAID',
          reminderSent: false,
        },
      ];
    }

    const invoice = await FeeInvoice.create({
      invoiceNumber,
      studentId,
      title,
      grossAmount: gross,
      scholarshipDiscount: discount,
      scholarshipId: scholarshipRef,
      scholarshipName,
      totalAmount: netPayable,
      paidAmount: 0,
      dueDate: new Date(dueDate),
      semester: Number(semester),
      status: 'UNPAID',
      hasInstallmentPlan: Boolean(hasInstallmentPlan),
      installments,
    });

    const populated = await FeeInvoice.findById(invoice._id)
      .populate('studentId', 'fullName registrationNumber')
      .populate('scholarshipId');

    res.status(201).json({
      success: true,
      message: 'Fee invoice generated successfully with verified ledger calculations.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// Convert existing invoice into a 3-part milestone schedule
export const setupInstallmentPlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await FeeInvoice.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    if (invoice.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Invoice is already fully paid.' });
    }

    const remainingNet = invoice.totalAmount - invoice.paidAmount;
    const baseDueDate = new Date(invoice.dueDate || Date.now());

    const m1Date = new Date(baseDueDate);
    const m2Date = new Date(baseDueDate);
    m2Date.setDate(m2Date.getDate() + 45);
    const m3Date = new Date(baseDueDate);
    m3Date.setDate(m3Date.getDate() + 90);

    const m1Amt = Math.round(remainingNet * 0.4);
    const m2Amt = Math.round(remainingNet * 0.3);
    const m3Amt = remainingNet - m1Amt - m2Amt;

    invoice.hasInstallmentPlan = true;
    invoice.installments = [
      {
        installmentNumber: 1,
        milestoneTitle: 'Milestone 1: Semester Registration & Course Enrollment (40%)',
        percentage: 40,
        amount: m1Amt,
        dueDate: m1Date,
        paidAmount: 0,
        status: 'UNPAID',
        reminderSent: false,
      },
      {
        installmentNumber: 2,
        milestoneTitle: 'Milestone 2: Mid-Term Examination & Internal Assessment Clearance (30%)',
        percentage: 30,
        amount: m2Amt,
        dueDate: m2Date,
        paidAmount: 0,
        status: 'UNPAID',
        reminderSent: false,
      },
      {
        installmentNumber: 3,
        milestoneTitle: 'Milestone 3: End-Term Exam, Practical Labs & No-Dues Clearance (30%)',
        percentage: 30,
        amount: m3Amt,
        dueDate: m3Date,
        paidAmount: 0,
        status: 'UNPAID',
        reminderSent: false,
      },
    ];

    await invoice.save();

    res.json({
      success: true,
      message: '3-Part Milestone Installment Schedule activated successfully.',
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// Send automated deadline reminder for milestone
export const sendInstallmentReminder = async (req, res, next) => {
  try {
    const { id, instNum } = req.params;
    const invoice = await FeeInvoice.findById(id).populate('studentId', 'fullName email phone');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const installment = invoice.installments.find((i) => i.installmentNumber === Number(instNum));
    if (!installment) {
      return res.status(404).json({ success: false, message: 'Installment milestone not found.' });
    }

    installment.reminderSent = true;
    installment.lastReminderDate = new Date();
    await invoice.save();

    const studentName = invoice.studentId?.fullName || 'Student';
    const email = invoice.studentId?.email || 'student@sgtu.ac.in';

    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'INSTALLMENT_REMINDER_SENT',
      resource: 'FEES',
      details: `Dispatched automated fee reminder for Milestone ${instNum} (₹${installment.amount}) to ${studentName} (${email}).`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Automated SMS & Email deadline reminder dispatched to ${studentName} (${email}).`,
      data: {
        installmentNumber: instNum,
        dueDate: installment.dueDate,
        amount: installment.amount,
        lastReminderDate: installment.lastReminderDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Record payment (supports standard or installment-specific settlement)
export const recordPayment = async (req, res, next) => {
  try {
    const { invoiceId, amount, paymentMethod = 'ONLINE', transactionId, installmentNumber } = req.body;
    if (!invoiceId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid invoice and payment amount required.' });
    }

    const invoice = await FeeInvoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const payAmount = Number(amount);
    const newPaidAmount = (invoice.paidAmount || 0) + payAmount;
    const finalStatus = newPaidAmount >= invoice.totalAmount ? 'PAID' : 'PARTIAL';

    const txId = transactionId || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Update specific milestone if provided
    let milestoneReceipt = null;
    if (installmentNumber && invoice.hasInstallmentPlan) {
      const inst = invoice.installments.find((i) => i.installmentNumber === Number(installmentNumber));
      if (inst) {
        inst.paidAmount = (inst.paidAmount || 0) + payAmount;
        inst.status = inst.paidAmount >= inst.amount ? 'PAID' : 'PARTIAL';
        inst.receiptNumber = receiptNumber;
        inst.paymentDate = new Date();
        inst.transactionId = txId;
        milestoneReceipt = inst.milestoneTitle;
      }
    }

    const payment = await PaymentRecord.create({
      invoiceId: invoice._id,
      studentId: invoice.studentId,
      installmentNumber: installmentNumber ? Number(installmentNumber) : undefined,
      transactionId: txId,
      amount: payAmount,
      paymentMethod,
      receiptNumber,
      status: 'COMPLETED',
      paymentDate: new Date(),
    });

    invoice.paidAmount = newPaidAmount;
    invoice.status = finalStatus;
    await invoice.save();

    await AuditLog.create({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'PAYMENT_RECORDED',
      resource: 'FEES',
      details: `Recorded payment of ₹${payAmount} for invoice ${invoice.invoiceNumber}${
        milestoneReceipt ? ` [${milestoneReceipt}]` : ''
      }. Receipt: ${receiptNumber}`,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Payment recorded and verified successfully.',
      data: {
        payment,
        invoice,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. SCHOLARSHIP LEDGER & CONCESSIONS
// ==========================================
export const getScholarships = async (req, res, next) => {
  try {
    const { studentId, category, status } = req.query;
    const query = {};

    if (req.user.role === 'STUDENT' && req.studentProfile) {
      query.studentId = req.studentProfile._id;
    } else if (studentId) {
      query.studentId = studentId;
    }

    if (category) query.category = category;
    if (status) query.status = status;

    const scholarships = await ScholarshipAward.find(query)
      .populate('studentId', 'fullName registrationNumber phone currentSemester email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: scholarships });
  } catch (error) {
    next(error);
  }
};

export const createScholarship = async (req, res, next) => {
  try {
    const {
      studentId,
      scholarshipName,
      category = 'MERIT',
      grantType = 'PERCENTAGE',
      concessionValue,
      grossTuitionFee = 85000,
      semester = 1,
      academicYear = '2025-2026',
      documentProofUrl,
      remarks,
      applyToActiveInvoice = true,
    } = req.body;

    if (!studentId || !scholarshipName || !concessionValue) {
      return res.status(400).json({
        success: false,
        message: 'Student, scholarship name, and concession value are required.',
      });
    }

    const gross = Number(grossTuitionFee);
    const value = Number(concessionValue);
    let deduction = 0;

    if (grantType === 'PERCENTAGE') {
      deduction = Math.round((gross * value) / 100);
    } else {
      deduction = value;
    }

    const netFee = Math.max(0, gross - deduction);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const sanctionOrderNumber = `SCH-${new Date().getFullYear()}-${category.substring(0, 3)}-${randomSuffix}`;

    const award = await ScholarshipAward.create({
      studentId,
      scholarshipName,
      category,
      grantType,
      concessionValue: value,
      deductionAmount: deduction,
      grossTuitionFee: gross,
      netPayableFee: netFee,
      academicYear,
      semester: Number(semester),
      sanctionOrderNumber,
      sanctionedBy: req.user.name || 'Academic Council & Finance Bureau',
      status: 'SANCTIONED',
      documentProofUrl,
      remarks: remarks || 'Sanctioned under institutional scholarship policy.',
    });

    // Auto-apply concession to active unpaid invoice if requested
    if (applyToActiveInvoice) {
      const activeInvoice = await FeeInvoice.findOne({
        studentId,
        status: { $in: ['UNPAID', 'PARTIAL'] },
      });

      if (activeInvoice) {
        activeInvoice.grossAmount = gross;
        activeInvoice.scholarshipDiscount = deduction;
        activeInvoice.scholarshipId = award._id;
        activeInvoice.scholarshipName = scholarshipName;
        activeInvoice.totalAmount = netFee;

        // Recalculate installments if active
        if (activeInvoice.hasInstallmentPlan && activeInvoice.installments?.length) {
          const m1Amt = Math.round(netFee * 0.4);
          const m2Amt = Math.round(netFee * 0.3);
          const m3Amt = netFee - m1Amt - m2Amt;

          if (activeInvoice.installments[0]) activeInvoice.installments[0].amount = m1Amt;
          if (activeInvoice.installments[1]) activeInvoice.installments[1].amount = m2Amt;
          if (activeInvoice.installments[2]) activeInvoice.installments[2].amount = m3Amt;
        }

        await activeInvoice.save();
      }
    }

    const populated = await ScholarshipAward.findById(award._id).populate(
      'studentId',
      'fullName registrationNumber'
    );

    res.status(201).json({
      success: true,
      message: 'Scholarship sanctioned and applied to student fee ledger.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateScholarshipStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const award = await ScholarshipAward.findById(id);
    if (!award) {
      return res.status(404).json({ success: false, message: 'Scholarship record not found.' });
    }

    award.status = status;
    if (remarks) award.remarks = remarks;
    await award.save();

    res.json({
      success: true,
      message: `Scholarship status updated to ${status}.`,
      data: award,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. LEDGER SUMMARY & CATEGORIES
// ==========================================
export const getLedgerSummary = async (req, res, next) => {
  try {
    const invoices = await FeeInvoice.find();
    const scholarships = await ScholarshipAward.find({ status: 'SANCTIONED' });

    const totalGrossBilled = invoices.reduce((acc, inv) => acc + (inv.grossAmount || inv.totalAmount || 0), 0);
    const totalScholarshipsGranted = scholarships.reduce((acc, s) => acc + (s.deductionAmount || 0), 0);
    const totalNetPayable = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
    const totalCollected = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0);
    const totalOutstanding = Math.max(0, totalNetPayable - totalCollected);
    const activeInstallmentPlans = invoices.filter((inv) => inv.hasInstallmentPlan).length;

    res.json({
      success: true,
      data: {
        totalGrossBilled,
        totalScholarshipsGranted,
        totalNetPayable,
        totalCollected,
        totalOutstanding,
        activeInstallmentPlans,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFeeCategories = async (req, res, next) => {
  try {
    const categories = await FeeCategory.find().sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};
