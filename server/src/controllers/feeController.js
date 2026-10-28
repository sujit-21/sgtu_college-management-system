import { FeeCategory, FeeInvoice, PaymentRecord, StudentProfile, AuditLog } from '../models/index.js';

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
      .populate('studentId', 'fullName registrationNumber phone currentSemester')
      .sort({ createdAt: -1 });

    const results = await Promise.all(
      invoices.map(async (inv) => {
        const payments = await PaymentRecord.find({ invoiceId: inv._id }).sort({ paymentDate: -1 });
        return {
          ...inv.toObject(),
          payments,
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
    const { studentId, title, totalAmount, dueDate, semester = 1 } = req.body;
    if (!studentId || !title || !totalAmount || !dueDate) {
      return res.status(400).json({ success: false, message: 'Student, title, amount, and due date are required.' });
    }

    const count = await FeeInvoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const invoice = await FeeInvoice.create({
      invoiceNumber,
      studentId,
      title,
      totalAmount: Number(totalAmount),
      paidAmount: 0,
      dueDate: new Date(dueDate),
      semester: Number(semester),
      status: 'UNPAID',
    });

    const populated = await FeeInvoice.findById(invoice._id).populate('studentId', 'fullName registrationNumber');

    res.status(201).json({ success: true, message: 'Fee invoice generated successfully.', data: populated });
  } catch (error) {
    next(error);
  }
};

export const recordPayment = async (req, res, next) => {
  try {
    const { invoiceId, amount, paymentMethod = 'ONLINE', transactionId } = req.body;
    if (!invoiceId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid invoice and payment amount required.' });
    }

    const invoice = await FeeInvoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const payAmount = Number(amount);
    const newPaidAmount = invoice.paidAmount + payAmount;
    const finalStatus = newPaidAmount >= invoice.totalAmount ? 'PAID' : 'PARTIAL';

    const txId = transactionId || `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNumber = `RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await PaymentRecord.create({
      invoiceId: invoice._id,
      studentId: invoice.studentId,
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
      details: `Recorded payment of ₹${payAmount} for invoice ${invoice.invoiceNumber}. Receipt: ${receiptNumber}`,
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

export const getFeeCategories = async (req, res, next) => {
  try {
    const categories = await FeeCategory.find().sort({ name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};
