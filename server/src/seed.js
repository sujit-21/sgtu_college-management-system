import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {
  User,
  Department,
  Course,
  Subject,
  StudentProfile,
  TeacherProfile,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  Examination,
  ExamSchedule,
  ExamResult,
  FeeCategory,
  FeeInvoice,
  PaymentRecord,
  Announcement,
  Notification,
  AuditLog,
  Book,
  BookIssue,
  TimetableSlot,
  PayrollRecord,
  HostelAllocation,
  TransportRoute,
  PlacementDrive,
  LeaveApplication,
  CampusGrievance,
} from './models/index.js';

dotenv.config();

const MONGO_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/sg18_college_management_system';

async function seed() {
  console.log('🌱 Starting comprehensive database seed for SG Tech University (SGTU) [Smart Generation]...');
  await mongoose.connect(MONGO_URI);

  // Clear existing collections
  await Promise.all([
    CampusGrievance.deleteMany({}),
    LeaveApplication.deleteMany({}),
    PlacementDrive.deleteMany({}),
    TransportRoute.deleteMany({}),
    HostelAllocation.deleteMany({}),
    PayrollRecord.deleteMany({}),
    TimetableSlot.deleteMany({}),
    BookIssue.deleteMany({}),
    Book.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
    Announcement.deleteMany({}),
    PaymentRecord.deleteMany({}),
    FeeInvoice.deleteMany({}),
    FeeCategory.deleteMany({}),
    ExamResult.deleteMany({}),
    ExamSchedule.deleteMany({}),
    Examination.deleteMany({}),
    AssignmentSubmission.deleteMany({}),
    Assignment.deleteMany({}),
    AttendanceRecord.deleteMany({}),
    Subject.deleteMany({}),
    Course.deleteMany({}),
    StudentProfile.deleteMany({}),
    TeacherProfile.deleteMany({}),
    Department.deleteMany({}),
    User.deleteMany({}),
  ]);

  console.log('🧹 Existing collections cleared.');

  // Password hashes
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const teacherPassword = await bcrypt.hash('Teacher@123', 10);
  const studentPassword = await bcrypt.hash('Student@123', 10);
  const accountantPassword = await bcrypt.hash('Accountant@123', 10);

  // 1. Departments
  const cseDept = await Department.create({
    code: 'CSE',
    name: 'Computer Science and Engineering',
    description: 'School of Computing, Artificial Intelligence, and Smart Generation Software Systems.',
    headName: 'Prof. Rajesh Sharma',
  });

  const eceDept = await Department.create({
    code: 'ECE',
    name: 'Electronics and Communication Engineering',
    description: 'VLSI Design, Robotics, Embedded Computing, and Next-Gen Signal Telecommunications.',
    headName: 'Dr. Anand Iyer',
  });

  const mgmtDept = await Department.create({
    code: 'MGMT',
    name: 'Department of Management & Technology Leadership',
    description: 'Enterprise Leadership, Technology Analytics, and Strategic Venture Operations.',
    headName: 'Dr. Meenakshi Sundaram',
  });

  console.log('✅ Departments created');

  // 2. Courses
  const btechCse = await Course.create({
    code: 'BTECH-CSE',
    name: 'Bachelor of Technology in Computer Science',
    description: '4-year accredited degree in computer science, distributed algorithms, and intelligent systems.',
    durationYears: 4,
    totalSemesters: 8,
    credits: 160,
    departmentId: cseDept._id,
  });

  const btechEce = await Course.create({
    code: 'BTECH-ECE',
    name: 'Bachelor of Technology in Electronics & Communication',
    description: '4-year engineering program in smart electronics and modern communication systems.',
    durationYears: 4,
    totalSemesters: 8,
    credits: 160,
    departmentId: eceDept._id,
  });

  const mba = await Course.create({
    code: 'MBA-CORE',
    name: 'Master of Business Administration',
    description: '2-year premier postgraduate technology management program.',
    durationYears: 2,
    totalSemesters: 4,
    credits: 90,
    departmentId: mgmtDept._id,
  });

  console.log('✅ Courses created');

  // 3. Administrative Accounts (SG Tech University - SGTU)
  const superAdmin = await User.create({
    email: 'superadmin@sgtu.edu',
    collegeId: 'SUPER-001',
    password: adminPassword,
    role: 'SUPER_ADMIN',
  });

  const admin = await User.create({
    email: 'admin@sgtu.edu',
    collegeId: 'ADMIN-001',
    password: adminPassword,
    role: 'ADMIN',
  });

  const accountant = await User.create({
    email: 'accountant@sgtu.edu',
    collegeId: 'ACC-001',
    password: accountantPassword,
    role: 'ACCOUNTANT',
  });

  console.log('✅ Admin and Accountant users created');

  // 4. Faculty Members
  const teacherUser1 = await User.create({
    email: 'prof.sharma@sgtu.edu',
    collegeId: 'EMP-101',
    password: teacherPassword,
    role: 'TEACHER',
  });

  const teacher1 = await TeacherProfile.create({
    userId: teacherUser1._id,
    employeeId: 'EMP-101',
    fullName: 'Prof. Rajesh Sharma',
    phone: '+91 98765 43210',
    designation: 'Professor & HOD',
    qualification: 'Ph.D in Distributed Systems, IIT Delhi',
    specialization: 'Cloud Computing, Distributed Architecture',
    joiningDate: '2016-07-15',
    departmentId: cseDept._id,
    bankName: 'HDFC Bank',
    accountNumber: '50100492817264',
    accountHolderName: 'Prof. Rajesh Sharma',
    ifscCode: 'HDFC0001234',
    branchName: 'University Campus Branch',
    panNumber: 'AAAPR1234K',
    aadhaarNumber: '8923 4561 2890',
    pfUanNumber: '100982348172',
    experienceYears: 14,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  });

  const teacherUser2 = await User.create({
    email: 'dr.patel@sgtu.edu',
    collegeId: 'EMP-102',
    password: teacherPassword,
    role: 'TEACHER',
  });

  const teacher2 = await TeacherProfile.create({
    userId: teacherUser2._id,
    employeeId: 'EMP-102',
    fullName: 'Dr. Neha Patel',
    phone: '+91 98765 43211',
    designation: 'Associate Professor',
    qualification: 'Ph.D in Machine Learning, IISc',
    specialization: 'Deep Learning, NLP, Smart Generation AI',
    joiningDate: '2019-01-10',
    departmentId: cseDept._id,
    bankName: 'State Bank of India',
    accountNumber: '30948271649',
    accountHolderName: 'Dr. Neha Patel',
    ifscCode: 'SBIN0005678',
    branchName: 'Electronic City Tech Hub',
    panNumber: 'BBBPK5678L',
    aadhaarNumber: '7812 3456 9012',
    pfUanNumber: '100982349921',
    experienceYears: 9,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  });

  const teacherUser3 = await User.create({
    email: 'prof.verma@sgtu.edu',
    collegeId: 'EMP-103',
    password: teacherPassword,
    role: 'TEACHER',
  });

  const teacher3 = await TeacherProfile.create({
    userId: teacherUser3._id,
    employeeId: 'EMP-103',
    fullName: 'Prof. Amit Verma',
    phone: '+91 98765 43212',
    designation: 'Assistant Professor',
    qualification: 'M.Tech in Algorithms, BITS Pilani',
    specialization: 'Data Structures, Graph Theory',
    joiningDate: '2021-08-01',
    departmentId: cseDept._id,
    bankName: 'ICICI Bank',
    accountNumber: '001205018392',
    accountHolderName: 'Prof. Amit Verma',
    ifscCode: 'ICIC0000012',
    branchName: 'MG Road Branch',
    panNumber: 'CCCPA9012M',
    aadhaarNumber: '6701 2345 8901',
    pfUanNumber: '100982351234',
    experienceYears: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  });

  console.log('✅ Teachers created');

  // 5. Subjects
  const dsaSubject = await Subject.create({
    code: 'CS601',
    name: 'Advanced Data Structures & Algorithms',
    semester: 6,
    credits: 4,
    courseId: btechCse._id,
    teacherId: teacher3._id,
  });

  const aiSubject = await Subject.create({
    code: 'CS602',
    name: 'Artificial Intelligence & Machine Learning',
    semester: 6,
    credits: 4,
    courseId: btechCse._id,
    teacherId: teacher2._id,
  });

  const cloudSubject = await Subject.create({
    code: 'CS603',
    name: 'Cloud Computing & Distributed Systems',
    semester: 6,
    credits: 3,
    courseId: btechCse._id,
    teacherId: teacher1._id,
  });

  const dbSubject = await Subject.create({
    code: 'CS401',
    name: 'Database Engineering & Storage Systems',
    semester: 4,
    credits: 4,
    courseId: btechCse._id,
    teacherId: teacher1._id,
  });

  console.log('✅ Subjects created');

  // 6. Students
  const studentUser1 = await User.create({
    email: 'arjun.kumar@sgtu.edu',
    collegeId: 'SGTU-2023-CS01',
    password: studentPassword,
    role: 'STUDENT',
  });

  const student1 = await StudentProfile.create({
    userId: studentUser1._id,
    registrationNumber: 'SGTU-2023-CS01',
    fullName: 'Arjun Kumar',
    phone: '+91 99887 76655',
    dateOfBirth: '2004-05-14',
    address: '742 Cyber City, Tech Park Avenue, Bangalore',
    gender: 'Male',
    bloodGroup: 'O+',
    currentSemester: 6,
    admissionYear: 2023,
    academicStatus: 'ACTIVE',
    departmentId: cseDept._id,
    courseId: btechCse._id,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    aadhaarNumber: '7823-9012-3456',
    caste: 'General',
    fatherName: 'Ramesh Kumar',
    motherName: 'Sunita Kumar',
    emergencyContact: '+91 98450 11223',
    tenthMarks: 94.6,
    tenthBoard: 'CBSE',
    tenthPassingYear: 2020,
    twelfthMarks: 92.4,
    twelfthBoard: 'CBSE',
    twelfthPassingYear: 2022,
    twelfthStream: 'Science (PCM)',
  });

  const studentUser2 = await User.create({
    email: 'priya.sharma@sgtu.edu',
    collegeId: 'SGTU-2023-CS02',
    password: studentPassword,
    role: 'STUDENT',
  });

  const student2 = await StudentProfile.create({
    userId: studentUser2._id,
    registrationNumber: 'SGTU-2023-CS02',
    fullName: 'Priya Sharma',
    phone: '+91 99887 76656',
    dateOfBirth: '2004-09-22',
    address: '124 Lakeview Enclave, Bangalore',
    gender: 'Female',
    bloodGroup: 'B+',
    currentSemester: 6,
    admissionYear: 2023,
    academicStatus: 'ACTIVE',
    departmentId: cseDept._id,
    courseId: btechCse._id,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    aadhaarNumber: '8934-1123-7890',
    caste: 'OBC',
    fatherName: 'Deepak Sharma',
    motherName: 'Anjali Sharma',
    emergencyContact: '+91 98450 44556',
    tenthMarks: 96.2,
    tenthBoard: 'ICSE',
    tenthPassingYear: 2020,
    twelfthMarks: 95.8,
    twelfthBoard: 'CBSE',
    twelfthPassingYear: 2022,
    twelfthStream: 'Science (PCMB)',
  });

  const studentUser3 = await User.create({
    email: 'rohit.singh@sgtu.edu',
    collegeId: 'SGTU-2024-CS15',
    password: studentPassword,
    role: 'STUDENT',
  });

  const student3 = await StudentProfile.create({
    userId: studentUser3._id,
    registrationNumber: 'SGTU-2024-CS15',
    fullName: 'Rohit Singh',
    phone: '+91 99887 76657',
    dateOfBirth: '2005-02-18',
    address: '88 MG Road, Indiranagar, Bangalore',
    gender: 'Male',
    bloodGroup: 'A+',
    currentSemester: 4,
    admissionYear: 2024,
    academicStatus: 'ACTIVE',
    departmentId: cseDept._id,
    courseId: btechCse._id,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    aadhaarNumber: '6712-4589-2341',
    caste: 'SC',
    fatherName: 'Sanjay Singh',
    motherName: 'Geeta Singh',
    emergencyContact: '+91 98450 77889',
    tenthMarks: 88.5,
    tenthBoard: 'State Board',
    tenthPassingYear: 2021,
    twelfthMarks: 89.2,
    twelfthBoard: 'CBSE',
    twelfthPassingYear: 2023,
    twelfthStream: 'Science (PCM)',
  });

  const studentUser4 = await User.create({
    email: 'sneha.reddy@sgtu.edu',
    collegeId: 'SGTU-2024-EC08',
    password: studentPassword,
    role: 'STUDENT',
  });

  const student4 = await StudentProfile.create({
    userId: studentUser4._id,
    registrationNumber: 'SGTU-2024-EC08',
    fullName: 'Sneha Reddy',
    phone: '+91 99887 76658',
    dateOfBirth: '2005-11-05',
    address: '45 Koramangala 4th Block, Bangalore',
    gender: 'Female',
    bloodGroup: 'AB+',
    currentSemester: 4,
    admissionYear: 2024,
    academicStatus: 'ACTIVE',
    departmentId: eceDept._id,
    courseId: btechEce._id,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    aadhaarNumber: '9234-8871-6543',
    caste: 'EWS',
    fatherName: 'Venkatesh Reddy',
    motherName: 'Lakshmi Reddy',
    emergencyContact: '+91 98450 99001',
    tenthMarks: 91.0,
    tenthBoard: 'CBSE',
    tenthPassingYear: 2021,
    twelfthMarks: 93.5,
    twelfthBoard: 'CBSE',
    twelfthPassingYear: 2023,
    twelfthStream: 'Science (PCM)',
  });

  console.log('✅ Students created');

  // 7. Attendance Records
  const attendanceDates = [
    new Date('2026-10-20T09:00:00Z'),
    new Date('2026-10-21T09:00:00Z'),
    new Date('2026-10-22T09:00:00Z'),
    new Date('2026-10-23T09:00:00Z'),
    new Date('2026-10-24T09:00:00Z'),
    new Date('2026-10-27T09:00:00Z'),
  ];

  for (const date of attendanceDates) {
    await AttendanceRecord.create({
      date,
      semester: 6,
      status: 'PRESENT',
      studentId: student1._id,
      subjectId: dsaSubject._id,
      markedById: teacher3._id,
      remarks: 'Present & active in algorithms lab',
    });

    await AttendanceRecord.create({
      date,
      semester: 6,
      status: 'PRESENT',
      studentId: student2._id,
      subjectId: dsaSubject._id,
      markedById: teacher3._id,
    });

    await AttendanceRecord.create({
      date,
      semester: 6,
      status: Math.random() > 0.15 ? 'PRESENT' : 'ABSENT',
      studentId: student1._id,
      subjectId: aiSubject._id,
      markedById: teacher2._id,
    });

    await AttendanceRecord.create({
      date,
      semester: 6,
      status: 'PRESENT',
      studentId: student2._id,
      subjectId: aiSubject._id,
      markedById: teacher2._id,
    });
  }

  console.log('✅ Attendance records created');

  // 8. Assignments & Submissions
  const assignment1 = await Assignment.create({
    title: 'Lab 4: Red-Black Trees & Graph Dijkstra Implementation',
    description: 'Implement a self-balancing Red-Black Tree in C++ or Java and benchmark search performance against AVL Trees.',
    semester: 6,
    dueDate: new Date('2026-11-05T23:59:59Z'),
    totalMarks: 50,
    subjectId: dsaSubject._id,
    courseId: btechCse._id,
    teacherId: teacher3._id,
  });

  const assignment2 = await Assignment.create({
    title: 'Project 2: Convolutional Neural Network on CIFAR-100',
    description: 'Build a residual CNN architecture using PyTorch with data augmentation, achieving >= 78% test accuracy.',
    semester: 6,
    dueDate: new Date('2026-11-12T23:59:59Z'),
    totalMarks: 100,
    subjectId: aiSubject._id,
    courseId: btechCse._id,
    teacherId: teacher2._id,
  });

  const assignment3 = await Assignment.create({
    title: 'Case Study: Multi-Region Kubernetes Failover Architecture',
    description: 'Design a resilient Terraform deployment with Geo-DNS routing and zero-downtime database replication.',
    semester: 6,
    dueDate: new Date('2026-11-18T23:59:59Z'),
    totalMarks: 50,
    subjectId: cloudSubject._id,
    courseId: btechCse._id,
    teacherId: teacher1._id,
  });

  await AssignmentSubmission.create({
    assignmentId: assignment1._id,
    studentId: student1._id,
    submissionText: 'Implemented Red-Black tree with rotation unit tests and benchmark suite included.',
    fileUrl: 'https://storage.sgtu.edu/submissions/cs601_arjun_lab4.zip',
    status: 'GRADED',
    obtainedMarks: 48,
    feedback: 'Excellent clean code with comprehensive test cases. Outstanding time complexity analysis.',
  });

  await AssignmentSubmission.create({
    assignmentId: assignment1._id,
    studentId: student2._id,
    submissionText: 'GitHub repository link and PDF report submitted.',
    fileUrl: 'https://storage.sgtu.edu/submissions/cs601_priya_lab4.pdf',
    status: 'GRADED',
    obtainedMarks: 49,
    feedback: 'Flawless balance rotations and clear benchmark graphs.',
  });

  console.log('✅ Assignments and submissions seeded');

  // 9. Examinations, Schedules, and Published Results
  const midTermExam = await Examination.create({
    title: 'Spring 2026 Mid-Semester Theory & Practical Exams',
    academicYear: '2025-2026',
    startDate: new Date('2026-10-10T00:00:00Z'),
    endDate: new Date('2026-10-18T00:00:00Z'),
    status: 'RESULTS_PUBLISHED',
  });

  await ExamSchedule.create({
    examinationId: midTermExam._id,
    subjectId: dsaSubject._id,
    examDate: new Date('2026-10-12T10:00:00Z'),
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    room: 'Academic Hall Alpha 301',
    maxMarks: 100,
  });

  await ExamSchedule.create({
    examinationId: midTermExam._id,
    subjectId: aiSubject._id,
    examDate: new Date('2026-10-14T10:00:00Z'),
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    room: 'Computing Lab Beta 204',
    maxMarks: 100,
  });

  await ExamResult.create({
    examinationId: midTermExam._id,
    studentId: student1._id,
    subjectId: dsaSubject._id,
    obtainedMarks: 94,
    maxMarks: 100,
    grade: 'A+',
    isPublished: true,
  });

  await ExamResult.create({
    examinationId: midTermExam._id,
    studentId: student1._id,
    subjectId: aiSubject._id,
    obtainedMarks: 88,
    maxMarks: 100,
    grade: 'A',
    isPublished: true,
  });

  await ExamResult.create({
    examinationId: midTermExam._id,
    studentId: student2._id,
    subjectId: dsaSubject._id,
    obtainedMarks: 96,
    maxMarks: 100,
    grade: 'A+',
    isPublished: true,
  });

  await ExamResult.create({
    examinationId: midTermExam._id,
    studentId: student2._id,
    subjectId: aiSubject._id,
    obtainedMarks: 91,
    maxMarks: 100,
    grade: 'A+',
    isPublished: true,
  });

  console.log('✅ Examinations, schedules, and results seeded');

  // 10. Fee Categories, Invoices & Payments
  await FeeCategory.create({
    name: 'Semester Tuition Fee',
    amount: 65000,
    frequency: 'SEMESTER',
  });

  await FeeCategory.create({
    name: 'High-Performance Computing Lab Fee',
    amount: 12000,
    frequency: 'SEMESTER',
  });

  const inv1 = await FeeInvoice.create({
    invoiceNumber: 'INV-2026-S6-001',
    title: 'Semester 6 Academic & Laboratory Tuition',
    totalAmount: 77000,
    paidAmount: 77000,
    dueDate: new Date('2026-08-15T00:00:00Z'),
    status: 'PAID',
    semester: 6,
    studentId: student1._id,
  });

  await PaymentRecord.create({
    invoiceId: inv1._id,
    studentId: student1._id,
    amount: 77000,
    transactionId: 'TXN-9847291823',
    paymentMethod: 'ONLINE',
    receiptNumber: 'RCP-2026-0881',
    status: 'COMPLETED',
    paymentDate: new Date('2026-08-10T14:32:00Z'),
  });

  const inv2 = await FeeInvoice.create({
    invoiceNumber: 'INV-2026-S6-002',
    title: 'Semester 6 Academic & Laboratory Tuition',
    totalAmount: 77000,
    paidAmount: 40000,
    dueDate: new Date('2026-11-15T00:00:00Z'),
    status: 'PARTIAL',
    semester: 6,
    studentId: student2._id,
  });

  await PaymentRecord.create({
    invoiceId: inv2._id,
    studentId: student2._id,
    amount: 40000,
    transactionId: 'TXN-9847291899',
    paymentMethod: 'BANK_TRANSFER',
    receiptNumber: 'RCP-2026-0912',
    status: 'COMPLETED',
    paymentDate: new Date('2026-09-02T11:15:00Z'),
  });

  console.log('✅ Fees and payment transactions seeded');

  // 11. Announcements
  await Announcement.create({
    title: 'SGTU Smart Generation Hackathon 2026 Announced ($25,000 Prize Pool)',
    content: 'SG Tech University invites student innovators across all engineering branches. 36 hours of non-stop AI, Web3, and Smart Generation robotics innovation. Innovate Today. Lead Tomorrow.',
    category: 'EVENT',
    targetRole: 'ALL',
    priority: 'HIGH',
    authorName: 'Office of Dean Academics',
  });

  await Announcement.create({
    title: 'Mid-Semester Examination Results Officially Published',
    content: 'Students can now review their grade breakdown and instructor feedback through their personalized SGTU student portal.',
    category: 'EXAM',
    targetRole: 'STUDENT',
    priority: 'NORMAL',
    authorName: 'Examination Controller',
  });

  await Announcement.create({
    title: 'Faculty Curriculum Review Meeting — Friday 3 PM',
    content: 'All HODs and teaching faculty are requested to join the conference hall for next academic year course modernization discussions.',
    category: 'ACADEMIC',
    targetRole: 'TEACHER',
    priority: 'NORMAL',
    authorName: 'Academic Council',
  });

  // 12. Library Books and Circulations
  const book1 = await Book.create({
    title: 'Introduction to Algorithms (4th Edition)',
    isbn: '978-0262046305',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
    category: 'Computer Science',
    publisher: 'MIT Press',
    edition: '4th Edition',
    totalCopies: 6,
    availableCopies: 4,
    shelfLocation: 'Stack A, Rack 102',
    description: 'The leading textbook in algorithms worldwide, thoroughly updated with new chapters on bipartite graphs, online algorithms, and machine learning.',
    status: 'AVAILABLE',
  });

  const book2 = await Book.create({
    title: 'Artificial Intelligence: A Modern Approach (4th Edition)',
    isbn: '978-0134610993',
    author: 'Stuart Russell, Peter Norvig',
    category: 'Artificial Intelligence',
    publisher: 'Pearson',
    edition: '4th Edition',
    totalCopies: 5,
    availableCopies: 3,
    shelfLocation: 'Stack A, Rack 105',
    description: 'The standard AI textbook covering intelligent agents, search, probabilistic reasoning, machine learning, and deep neural networks.',
    status: 'AVAILABLE',
  });

  const book3 = await Book.create({
    title: 'Database System Concepts (7th Edition)',
    isbn: '978-0078022159',
    author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    category: 'Computer Science',
    publisher: 'McGraw-Hill',
    edition: '7th Edition',
    totalCopies: 8,
    availableCopies: 7,
    shelfLocation: 'Stack A, Rack 201',
    description: 'Comprehensive coverage of relational databases, SQL, query processing, transactions, and NoSQL systems.',
    status: 'AVAILABLE',
  });

  const book4 = await Book.create({
    title: 'Computer Networking: A Top-Down Approach (8th Edition)',
    isbn: '978-0136681557',
    author: 'James Kurose, Keith Ross',
    category: 'Computer Science',
    publisher: 'Pearson',
    edition: '8th Edition',
    totalCopies: 5,
    availableCopies: 4,
    shelfLocation: 'Stack B, Rack 110',
    description: 'Top-down approach focusing on internet protocols, transport layers, software-defined networking, and wireless networks.',
    status: 'AVAILABLE',
  });

  const book5 = await Book.create({
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    isbn: '978-0132350884',
    author: 'Robert C. Martin (Uncle Bob)',
    category: 'Software Engineering',
    publisher: 'Prentice Hall',
    edition: '1st Edition',
    totalCopies: 7,
    availableCopies: 6,
    shelfLocation: 'Stack B, Rack 205',
    description: 'Best practices for writing meaningful names, concise functions, formatting, error handling, and test-driven development.',
    status: 'AVAILABLE',
  });

  const book6 = await Book.create({
    title: 'Deep Learning (Adaptive Computation and Machine Learning)',
    isbn: '978-0262035613',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    category: 'Artificial Intelligence',
    publisher: 'MIT Press',
    edition: '1st Edition',
    totalCopies: 4,
    availableCopies: 3,
    shelfLocation: 'Stack A, Rack 108',
    description: 'Deep mathematical foundations and algorithms for deep neural networks, CNNs, RNNs, GANs, and generative models.',
    status: 'AVAILABLE',
  });

  const book7 = await Book.create({
    title: 'Advanced Engineering Mathematics (10th Edition)',
    isbn: '978-0470458365',
    author: 'Erwin Kreyszig',
    category: 'Mathematics',
    publisher: 'Wiley',
    edition: '10th Edition',
    totalCopies: 10,
    availableCopies: 9,
    shelfLocation: 'Stack C, Rack 101',
    description: 'Differential equations, linear algebra, vector calculus, Fourier analysis, and complex analysis for engineers.',
    status: 'AVAILABLE',
  });

  const book8 = await Book.create({
    title: 'Electric Machinery Fundamentals (5th Edition)',
    isbn: '978-0073529547',
    author: 'Stephen J. Chapman',
    category: 'Electrical Engineering',
    publisher: 'McGraw-Hill',
    edition: '5th Edition',
    totalCopies: 5,
    availableCopies: 5,
    shelfLocation: 'Stack D, Rack 104',
    description: 'Transformers, AC and DC machinery, induction motors, and modern power electronics converters.',
    status: 'AVAILABLE',
  });

  // Seed Circulations
  // 1. Active borrow by Arjun Kumar (due in 7 days)
  await BookIssue.create({
    bookId: book1._id,
    studentId: student1._id,
    issuedBy: admin._id,
    issueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'ISSUED',
    fineAmount: 0,
    fineStatus: 'NO_FINE',
    remarks: 'Approved for Algorithm Analysis project',
  });

  // 2. Active borrow by Arjun Kumar (due in 11 days)
  await BookIssue.create({
    bookId: book2._id,
    studentId: student1._id,
    issuedBy: admin._id,
    issueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
    status: 'ISSUED',
    fineAmount: 0,
    fineStatus: 'NO_FINE',
    remarks: 'Reference material for AI coursework',
  });

  // 3. Overdue borrow by Priya Sharma (due 4 days ago, ₹20 fine)
  await BookIssue.create({
    bookId: book4._id,
    studentId: student2._id,
    issuedBy: admin._id,
    issueDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    status: 'ISSUED',
    fineAmount: 20,
    fineStatus: 'UNPAID',
    remarks: 'Reminder notification sent to student email',
  });

  // 4. Returned borrow by Rohit Singh (returned on time)
  await BookIssue.create({
    bookId: book3._id,
    studentId: student3._id,
    issuedBy: admin._id,
    issueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    returnDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    status: 'RETURNED',
    fineAmount: 0,
    fineStatus: 'NO_FINE',
    remarks: 'Returned in pristine condition',
  });

  console.log('✅ Library books and circulations seeded');

  // 13. Timetable Slots
  const timetableEntries = [
    // Monday
    { dayOfWeek: 'Monday', startTime: '09:00 AM', endTime: '10:00 AM', subjectName: 'Distributed Systems & Cloud Computing', subjectCode: 'CS601', teacherName: 'Dr. Amit Verma', roomNumber: 'LH-101', type: 'Lecture' },
    { dayOfWeek: 'Monday', startTime: '10:00 AM', endTime: '11:00 AM', subjectName: 'Artificial Intelligence & Neural Networks', subjectCode: 'CS602', teacherName: 'Prof. Rajesh Sharma', roomNumber: 'LH-101', type: 'Lecture' },
    { dayOfWeek: 'Monday', startTime: '11:15 AM', endTime: '01:15 PM', subjectName: 'AI & Machine Learning Practical Lab', subjectCode: 'CS602-LAB', teacherName: 'Dr. Neha Gupta', roomNumber: 'Computer Lab 3', type: 'Lab' },
    { dayOfWeek: 'Monday', startTime: '02:00 PM', endTime: '03:00 PM', subjectName: 'Software Engineering & Agile Methodologies', subjectCode: 'CS603', teacherName: 'Dr. Amit Verma', roomNumber: 'LH-102', type: 'Lecture' },

    // Tuesday
    { dayOfWeek: 'Tuesday', startTime: '09:00 AM', endTime: '10:00 AM', subjectName: 'Artificial Intelligence & Neural Networks', subjectCode: 'CS602', teacherName: 'Prof. Rajesh Sharma', roomNumber: 'LH-101', type: 'Lecture' },
    { dayOfWeek: 'Tuesday', startTime: '10:00 AM', endTime: '11:00 AM', subjectName: 'Distributed Systems & Cloud Computing', subjectCode: 'CS601', teacherName: 'Dr. Amit Verma', roomNumber: 'LH-101', type: 'Lecture' },
    { dayOfWeek: 'Tuesday', startTime: '11:15 AM', endTime: '12:15 PM', subjectName: 'Cyber Security & Cryptography', subjectCode: 'CS604', teacherName: 'Dr. Neha Gupta', roomNumber: 'LH-104', type: 'Lecture' },
    { dayOfWeek: 'Tuesday', startTime: '02:00 PM', endTime: '04:00 PM', subjectName: 'Cloud & Kubernetes Laboratory', subjectCode: 'CS601-LAB', teacherName: 'Dr. Amit Verma', roomNumber: 'Cloud Lab 1', type: 'Lab' },

    // Wednesday
    { dayOfWeek: 'Wednesday', startTime: '09:00 AM', endTime: '10:00 AM', subjectName: 'Cyber Security & Cryptography', subjectCode: 'CS604', teacherName: 'Dr. Neha Gupta', roomNumber: 'LH-104', type: 'Lecture' },
    { dayOfWeek: 'Wednesday', startTime: '10:00 AM', endTime: '11:00 AM', subjectName: 'Software Engineering & Agile Methodologies', subjectCode: 'CS603', teacherName: 'Dr. Amit Verma', roomNumber: 'LH-102', type: 'Lecture' },
    { dayOfWeek: 'Wednesday', startTime: '11:15 AM', endTime: '12:15 PM', subjectName: 'Artificial Intelligence & Neural Networks', subjectCode: 'CS602', teacherName: 'Prof. Rajesh Sharma', roomNumber: 'LH-101', type: 'Tutorial' },
    { dayOfWeek: 'Wednesday', startTime: '02:00 PM', endTime: '03:30 PM', subjectName: 'Entrepreneurship & Tech Innovation', subjectCode: 'HS601', teacherName: 'Prof. Rajesh Sharma', roomNumber: 'Seminar Hall B', type: 'Lecture' },

    // Thursday
    { dayOfWeek: 'Thursday', startTime: '09:00 AM', endTime: '10:00 AM', subjectName: 'Distributed Systems & Cloud Computing', subjectCode: 'CS601', teacherName: 'Dr. Amit Verma', roomNumber: 'LH-101', type: 'Lecture' },
    { dayOfWeek: 'Thursday', startTime: '10:00 AM', endTime: '11:00 AM', subjectName: 'Cyber Security & Cryptography', subjectCode: 'CS604', teacherName: 'Dr. Neha Gupta', roomNumber: 'LH-104', type: 'Lecture' },
    { dayOfWeek: 'Thursday', startTime: '11:15 AM', endTime: '01:15 PM', subjectName: 'Cryptography & Network Security Lab', subjectCode: 'CS604-LAB', teacherName: 'Dr. Neha Gupta', roomNumber: 'Cyber Security Center', type: 'Lab' },
    { dayOfWeek: 'Thursday', startTime: '02:00 PM', endTime: '03:00 PM', subjectName: 'Software Engineering & Agile Methodologies', subjectCode: 'CS603', teacherName: 'Dr. Amit Verma', roomNumber: 'LH-102', type: 'Tutorial' },

    // Friday
    { dayOfWeek: 'Friday', startTime: '09:00 AM', endTime: '10:00 AM', subjectName: 'Artificial Intelligence & Neural Networks', subjectCode: 'CS602', teacherName: 'Prof. Rajesh Sharma', roomNumber: 'LH-101', type: 'Lecture' },
    { dayOfWeek: 'Friday', startTime: '10:00 AM', endTime: '11:00 AM', subjectName: 'Distributed Systems & Cloud Computing', subjectCode: 'CS601', teacherName: 'Dr. Amit Verma', roomNumber: 'LH-101', type: 'Lecture' },
    { dayOfWeek: 'Friday', startTime: '11:15 AM', endTime: '12:45 PM', subjectName: 'Capstone Project Evaluation & Colloquium', subjectCode: 'CP699', teacherName: 'Prof. Rajesh Sharma', roomNumber: 'Project Lab 2', type: 'Lab' },
  ];

  await TimetableSlot.insertMany(timetableEntries);
  console.log('✅ Timetable schedule seeded');

  // 14. Payroll Records
  await PayrollRecord.create([
    {
      teacherId: teacher1._id,
      teacherName: 'Dr. Amit Verma',
      employeeId: 'EMP-101',
      month: 'October',
      year: 2026,
      basicPay: 85000,
      hra: 20400,
      da: 15300,
      specialAllowance: 9000,
      epfDeduction: 1800,
      tdsDeduction: 10376,
      netSalary: 117524,
      status: 'PAID',
      paymentDate: '2026-10-28',
      transactionRef: 'SGTU-NEFT-984210',
      bankName: 'HDFC Bank',
      accountNumber: '50100492817291',
      panNumber: 'ABCPD1234E',
      pfUanNumber: '101234567890',
    },
    {
      teacherId: teacher2._id,
      teacherName: 'Dr. Neha Gupta',
      employeeId: 'EMP-102',
      month: 'October',
      year: 2026,
      basicPay: 78000,
      hra: 18720,
      da: 14040,
      specialAllowance: 8000,
      epfDeduction: 1800,
      tdsDeduction: 9500,
      netSalary: 107460,
      status: 'PAID',
      paymentDate: '2026-10-28',
      transactionRef: 'SGTU-NEFT-984211',
      bankName: 'State Bank of India',
      accountNumber: '39481029381',
      panNumber: 'BKUPG9876Q',
      pfUanNumber: '101987654321',
    },
    {
      teacherId: teacher3._id,
      teacherName: 'Prof. Rajesh Sharma',
      employeeId: 'EMP-103',
      month: 'October',
      year: 2026,
      basicPay: 125000,
      hra: 30000,
      da: 22500,
      specialAllowance: 12000,
      epfDeduction: 1800,
      tdsDeduction: 15160,
      netSalary: 172540,
      status: 'PAID',
      paymentDate: '2026-10-28',
      transactionRef: 'SGTU-NEFT-984212',
      bankName: 'ICICI Bank',
      accountNumber: '001205009871',
      panNumber: 'CJLPS4567M',
      pfUanNumber: '101567890123',
    },
  ]);
  console.log('✅ Faculty payroll and salary records seeded');

  // 15. Hostel Allocations
  await HostelAllocation.create([
    {
      hostelName: 'Aryabhata Boys Hostel Block A',
      hostelType: 'BOYS',
      roomNumber: 'A-204',
      bedNumber: 'Bed-1',
      roomType: 'Double AC',
      studentId: student1._id,
      studentName: 'Arjun Kumar',
      registrationNumber: 'SGTU-2023-CS01',
      wardenName: 'Dr. Ramesh Narayan',
      wardenContact: '+91 98450 88221',
      monthlyFee: 9500,
      status: 'ACTIVE',
      gatePasses: [
        {
          reason: 'Weekend Home Visit',
          destination: 'Bangalore Cyber City',
          outTime: '2026-10-24 05:00 PM',
          inTime: '2026-10-26 08:00 AM',
          status: 'APPROVED',
        },
      ],
    },
    {
      hostelName: 'Gargi Girls Hostel Block B',
      hostelType: 'GIRLS',
      roomNumber: 'B-108',
      bedNumber: 'Bed-2',
      roomType: 'Double AC',
      studentId: student2._id,
      studentName: 'Priya Sharma',
      registrationNumber: 'SGTU-2023-CS02',
      wardenName: 'Prof. Meenakshi Sundaram',
      wardenContact: '+91 98450 88222',
      monthlyFee: 9500,
      status: 'ACTIVE',
      gatePasses: [
        {
          reason: 'Inter-College Hackathon at IISc',
          destination: 'IISc Bangalore',
          outTime: '2026-10-27 08:00 AM',
          inTime: '2026-10-27 09:00 PM',
          status: 'APPROVED',
        },
      ],
    },
    {
      hostelName: 'Aryabhata Boys Hostel Block A',
      hostelType: 'BOYS',
      roomNumber: 'A-312',
      bedNumber: 'Bed-1',
      roomType: 'Single AC',
      studentId: student3._id,
      studentName: 'Rohit Singh',
      registrationNumber: 'SGTU-2024-CS15',
      wardenName: 'Dr. Ramesh Narayan',
      wardenContact: '+91 98450 88221',
      monthlyFee: 12500,
      status: 'ACTIVE',
      gatePasses: [],
    },
  ]);
  console.log('✅ Hostel and residential rooms seeded');

  // 16. Transport Routes
  await TransportRoute.create([
    {
      routeNumber: 'Route-01',
      routeName: 'Electronic City Express to SGTU Campus',
      vehicleNumber: 'KA-01-EQ-4089',
      driverName: 'Manjunath Gowda',
      driverPhone: '+91 98451 12340',
      capacity: 45,
      currentSubscribers: 42,
      monthlyFare: 2200,
      stops: [
        { stopName: 'Wipro Gate Electronic City', pickupTime: '07:30 AM', dropTime: '05:30 PM' },
        { stopName: 'Silk Board Junction', pickupTime: '07:45 AM', dropTime: '05:15 PM' },
        { stopName: 'HSR Layout BDA Complex', pickupTime: '08:00 AM', dropTime: '05:00 PM' },
        { stopName: 'SGTU Main Campus Gate', pickupTime: '08:25 AM', dropTime: '04:30 PM' },
      ],
    },
    {
      routeNumber: 'Route-02',
      routeName: 'Whitefield & ITPL Corridor',
      vehicleNumber: 'KA-03-FA-7712',
      driverName: 'Suresh Kumar',
      driverPhone: '+91 98451 12341',
      capacity: 45,
      currentSubscribers: 39,
      monthlyFare: 2500,
      stops: [
        { stopName: 'Hope Farm Whitefield', pickupTime: '07:15 AM', dropTime: '05:45 PM' },
        { stopName: 'ITPL Main Entrance', pickupTime: '07:30 AM', dropTime: '05:30 PM' },
        { stopName: 'Marathahalli Bridge', pickupTime: '07:50 AM', dropTime: '05:10 PM' },
        { stopName: 'SGTU Main Campus Gate', pickupTime: '08:25 AM', dropTime: '04:30 PM' },
      ],
    },
    {
      routeNumber: 'Route-03',
      routeName: 'Indiranagar & MG Road City Line',
      vehicleNumber: 'KA-04-MB-2290',
      driverName: 'Naveen Reddy',
      driverPhone: '+91 98451 12342',
      capacity: 40,
      currentSubscribers: 36,
      monthlyFare: 2000,
      stops: [
        { stopName: 'Trinity Circle MG Road', pickupTime: '07:35 AM', dropTime: '05:25 PM' },
        { stopName: 'Indiranagar 100ft Road Metro', pickupTime: '07:50 AM', dropTime: '05:10 PM' },
        { stopName: 'Domlur Flyover', pickupTime: '08:05 AM', dropTime: '04:55 PM' },
        { stopName: 'SGTU Main Campus Gate', pickupTime: '08:25 AM', dropTime: '04:30 PM' },
      ],
    },
  ]);
  console.log('✅ University transport and bus fleet seeded');

  // 17. Placement Drives
  await PlacementDrive.create([
    {
      companyName: 'Google Cloud India',
      companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      role: 'Cloud Software Engineer (L3)',
      packageLpa: 28.5,
      eligibilityMinCgpa: 8.0,
      eligibleDepartments: ['Computer Science and Engineering', 'Electronics & Communication'],
      driveDate: '2026-11-15',
      deadline: '2026-11-10',
      location: 'Tech Auditorium 1 / Hybrid',
      rounds: 'Coding Assessment -> System Design -> Technical Core -> Leadership',
      status: 'UPCOMING',
      totalOffers: 6,
      appliedCount: 42,
    },
    {
      companyName: 'Microsoft R&D',
      companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
      role: 'Software Development Engineer I',
      packageLpa: 24.0,
      eligibilityMinCgpa: 7.5,
      eligibleDepartments: ['Computer Science and Engineering', 'Electronics & Communication'],
      driveDate: '2026-11-20',
      deadline: '2026-11-14',
      location: 'SGTU Innovation Hall',
      rounds: 'Online Hackathon -> Data Structures -> Behavioral',
      status: 'UPCOMING',
      totalOffers: 8,
      appliedCount: 55,
    },
    {
      companyName: 'Amazon Web Services (AWS)',
      companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
      role: 'Cloud Solutions Associate',
      packageLpa: 19.5,
      eligibilityMinCgpa: 7.0,
      eligibleDepartments: ['Computer Science and Engineering', 'Electronics & Communication', 'Mechanical Engineering'],
      driveDate: '2026-11-28',
      deadline: '2026-11-22',
      location: 'Virtual Assessment Center',
      rounds: 'AWS Cloud Quiz -> Coding -> Bar Raiser',
      status: 'ACTIVE',
      totalOffers: 12,
      appliedCount: 68,
    },
    {
      companyName: 'Tata Consultancy Services (TCS Digital)',
      companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
      role: 'Digital Innovator & Fullstack Dev',
      packageLpa: 9.0,
      eligibilityMinCgpa: 6.5,
      eligibleDepartments: ['Computer Science and Engineering', 'Electronics & Communication', 'Mechanical Engineering'],
      driveDate: '2026-10-18',
      deadline: '2026-10-14',
      location: 'Campus Placements Arena',
      rounds: 'NQT -> Technical -> HR',
      status: 'COMPLETED',
      totalOffers: 24,
      appliedCount: 110,
    },
  ]);
  console.log('✅ Training & placement drives seeded');

  // 18. Leave Applications
  await LeaveApplication.create([
    {
      applicantName: 'Arjun Kumar',
      applicantRole: 'STUDENT',
      collegeId: 'SGTU-2023-CS01',
      leaveType: 'Sick / Medical Leave',
      startDate: '2026-10-15',
      endDate: '2026-10-17',
      totalDays: 3,
      reason: 'Diagnosed with viral fever. Doctor advised complete rest.',
      status: 'APPROVED',
      approvedBy: 'Prof. Rajesh Sharma (HOD)',
      approvalRemarks: 'Medical certificate reviewed and attendance adjusted.',
    },
    {
      applicantName: 'Dr. Amit Verma',
      applicantRole: 'TEACHER',
      collegeId: 'EMP-101',
      leaveType: 'Academic Duty',
      startDate: '2026-11-04',
      endDate: '2026-11-06',
      totalDays: 3,
      reason: 'Keynote Speaker at IEEE International Conference on Cloud Systems.',
      status: 'APPROVED',
      approvedBy: 'Dean of Academics',
      approvalRemarks: 'Sanctioned with travel duty grant.',
    },
  ]);
  console.log('✅ Leave applications seeded');

  // 19. Campus Grievances
  await CampusGrievance.create([
    {
      submittedByName: 'Student Body CSE',
      userRole: 'STUDENT',
      category: 'Campus Infrastructure',
      subject: 'High-speed WiFi range extension in Library 2nd Floor',
      description: 'The study cubicles on the 2nd floor of Central Library experience weak signal for online journal research.',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      resolutionNotes: 'Two additional Cisco WiFi 6 access points deployed and speed verified at 350 Mbps.',
    },
    {
      submittedByName: 'Priya Sharma',
      userRole: 'STUDENT',
      category: 'Academic & Courses',
      subject: 'Elective course registration window extension',
      description: 'Requesting a 2-day extension for choosing the Open Elective Quantum Computing module.',
      priority: 'LOW',
      status: 'RESOLVED',
      resolutionNotes: 'Portal registration deadline extended till October 31st by Academic Council.',
    },
  ]);
  console.log('✅ Campus grievances seeded');

  // 13. Audit Logs
  await AuditLog.create({
    userEmail: 'admin@sgtu.edu',
    action: 'SYSTEM_INITIALIZATION',
    resource: 'GLOBAL',
    details: 'SG Tech University (SGTU) Smart Generation CMS database successfully seeded with initial administrative and academic records.',
    ipAddress: '127.0.0.1',
  });

  console.log('🎉 SG Tech University seeding successfully completed!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
