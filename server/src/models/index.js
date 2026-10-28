import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// 1. User
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    collegeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT'],
      default: 'STUDENT',
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || model('User', userSchema);

// 2. Department
const departmentSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    headName: { type: String },
  },
  { timestamps: true }
);

export const Department = mongoose.models.Department || model('Department', departmentSchema);

// 3. Course
const courseSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    durationYears: { type: Number, default: 4 },
    totalSemesters: { type: Number, default: 8 },
    credits: { type: Number, default: 160 },
    isActive: { type: Boolean, default: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  },
  { timestamps: true }
);

export const Course = mongoose.models.Course || model('Course', courseSchema);

// 4. Subject
const subjectSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    semester: { type: Number, default: 1 },
    credits: { type: Number, default: 4 },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'TeacherProfile' },
  },
  { timestamps: true }
);

export const Subject = mongoose.models.Subject || model('Subject', subjectSchema);

// 5. StudentProfile
const studentProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: String },
    address: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
    bloodGroup: { type: String },
    currentSemester: { type: Number, default: 1 },
    admissionYear: { type: Number, default: 2026 },
    academicStatus: {
      type: String,
      enum: ['ACTIVE', 'PROBATION', 'GRADUATED', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    avatar: { type: String },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  },
  { timestamps: true }
);

export const StudentProfile = mongoose.models.StudentProfile || model('StudentProfile', studentProfileSchema);

// 6. TeacherProfile
const teacherProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true, uppercase: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    designation: { type: String, default: 'Assistant Professor' },
    qualification: { type: String, default: 'M.Tech / Ph.D' },
    specialization: { type: String },
    joiningDate: { type: String },
    avatar: { type: String },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  },
  { timestamps: true }
);

export const TeacherProfile = mongoose.models.TeacherProfile || model('TeacherProfile', teacherProfileSchema);

// 7. AttendanceRecord
const attendanceRecordSchema = new Schema(
  {
    date: { type: Date, required: true },
    semester: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
      default: 'PRESENT',
    },
    remarks: { type: String },
    markedById: { type: Schema.Types.ObjectId, ref: 'TeacherProfile' },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  },
  { timestamps: true }
);

attendanceRecordSchema.index({ studentId: 1, subjectId: 1, date: 1 }, { unique: true });

export const AttendanceRecord = mongoose.models.AttendanceRecord || model('AttendanceRecord', attendanceRecordSchema);

// 8. Assignment
const assignmentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    semester: { type: Number, default: 1 },
    dueDate: { type: Date, required: true },
    totalMarks: { type: Number, default: 100 },
    attachmentUrl: { type: String },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'TeacherProfile', required: true },
  },
  { timestamps: true }
);

export const Assignment = mongoose.models.Assignment || model('Assignment', assignmentSchema);

// 9. AssignmentSubmission
const assignmentSubmissionSchema = new Schema(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    submissionText: { type: String },
    fileUrl: { type: String },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['SUBMITTED', 'GRADED', 'LATE'],
      default: 'SUBMITTED',
    },
    obtainedMarks: { type: Number },
    feedback: { type: String },
  },
  { timestamps: true }
);

assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

export const AssignmentSubmission =
  mongoose.models.AssignmentSubmission || model('AssignmentSubmission', assignmentSubmissionSchema);

// 10. Examination
const examinationSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    academicYear: { type: String, default: '2025-2026' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'RESULTS_PUBLISHED'],
      default: 'UPCOMING',
    },
  },
  { timestamps: true }
);

export const Examination = mongoose.models.Examination || model('Examination', examinationSchema);

// 11. ExamSchedule
const examScheduleSchema = new Schema(
  {
    examinationId: { type: Schema.Types.ObjectId, ref: 'Examination', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    examDate: { type: Date, required: true },
    startTime: { type: String, default: '10:00 AM' },
    endTime: { type: String, default: '01:00 PM' },
    room: { type: String, default: 'Hall A-101' },
    maxMarks: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export const ExamSchedule = mongoose.models.ExamSchedule || model('ExamSchedule', examScheduleSchema);

// 12. ExamResult
const examResultSchema = new Schema(
  {
    examinationId: { type: Schema.Types.ObjectId, ref: 'Examination', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    obtainedMarks: { type: Number, required: true },
    maxMarks: { type: Number, default: 100 },
    grade: { type: String, default: 'A' },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

examResultSchema.index({ examinationId: 1, studentId: 1, subjectId: 1 }, { unique: true });

export const ExamResult = mongoose.models.ExamResult || model('ExamResult', examResultSchema);

// 13. FeeCategory
const feeCategorySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    frequency: { type: String, enum: ['SEMESTER', 'ANNUAL', 'ONE_TIME'], default: 'SEMESTER' },
  },
  { timestamps: true }
);

export const FeeCategory = mongoose.models.FeeCategory || model('FeeCategory', feeCategorySchema);

// 14. FeeInvoice
const feeInvoiceSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, uppercase: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    title: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID', 'OVERDUE'],
      default: 'UNPAID',
    },
    semester: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const FeeInvoice = mongoose.models.FeeInvoice || model('FeeInvoice', feeInvoiceSchema);

// 15. PaymentRecord
const paymentRecordSchema = new Schema(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: 'FeeInvoice', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile' },
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['ONLINE', 'BANK_TRANSFER', 'CASH', 'CHEQUE'],
      default: 'ONLINE',
    },
    paymentDate: { type: Date, default: Date.now },
    receiptNumber: { type: String, required: true, unique: true },
    status: { type: String, default: 'COMPLETED' },
  },
  { timestamps: true }
);

export const PaymentRecord = mongoose.models.PaymentRecord || model('PaymentRecord', paymentRecordSchema);

// 16. Announcement
const announcementSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ['ACADEMIC', 'EXAM', 'EVENT', 'ADMINISTRATIVE', 'URGENT'],
      default: 'ACADEMIC',
    },
    targetRole: {
      type: String,
      enum: ['ALL', 'STUDENT', 'TEACHER', 'ADMIN'],
      default: 'ALL',
    },
    authorName: { type: String, default: 'Administration' },
    priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH'], default: 'NORMAL' },
  },
  { timestamps: true }
);

export const Announcement = mongoose.models.Announcement || model('Announcement', announcementSchema);

// 17. Notification
const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['INFO', 'SUCCESS', 'WARNING', 'ALERT'], default: 'INFO' },
    isRead: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

export const Notification = mongoose.models.Notification || model('Notification', notificationSchema);

// 18. AuditLog
const auditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    details: { type: String },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const AuditLog = mongoose.models.AuditLog || model('AuditLog', auditLogSchema);

// 19. Book
const bookSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    isbn: { type: String, required: true, unique: true, uppercase: true, trim: true },
    author: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    publisher: { type: String, trim: true },
    edition: { type: String, default: '1st Edition' },
    totalCopies: { type: Number, default: 1, min: 1 },
    availableCopies: { type: Number, default: 1, min: 0 },
    shelfLocation: { type: String, default: 'Main Stacks' },
    coverImage: { type: String },
    description: { type: String },
    status: { type: String, enum: ['AVAILABLE', 'RESERVED', 'OUT_OF_STOCK'], default: 'AVAILABLE' },
  },
  { timestamps: true }
);

export const Book = mongoose.models.Book || model('Book', bookSchema);

// 20. BookIssue
const bookIssueSchema = new Schema(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
    issuedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    status: { type: String, enum: ['ISSUED', 'RETURNED', 'OVERDUE', 'LOST'], default: 'ISSUED' },
    fineAmount: { type: Number, default: 0 },
    fineStatus: { type: String, enum: ['PAID', 'UNPAID', 'WAIVED', 'NO_FINE'], default: 'NO_FINE' },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const BookIssue = mongoose.models.BookIssue || model('BookIssue', bookIssueSchema);
