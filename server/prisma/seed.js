import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for Apex University CMS...');

  // Clear existing collections safely
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.paymentRecord.deleteMany();
  await prisma.feeInvoice.deleteMany();
  await prisma.feeCategory.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.examSchedule.deleteMany();
  await prisma.examination.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.course.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Existing data wiped.');

  // Password hashes
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const teacherPassword = await bcrypt.hash('Teacher@123', 10);
  const studentPassword = await bcrypt.hash('Student@123', 10);
  const accountantPassword = await bcrypt.hash('Accountant@123', 10);

  // 1. Departments
  const cseDept = await prisma.department.create({
    data: {
      code: 'CSE',
      name: 'Computer Science and Engineering',
      description: 'Department of modern computing, artificial intelligence, and software systems.',
      headName: 'Prof. Rajesh Sharma',
    },
  });

  const eceDept = await prisma.department.create({
    data: {
      code: 'ECE',
      name: 'Electronics and Communication Engineering',
      description: 'VLSI, embedded computing, signal processing, and telecommunications.',
      headName: 'Dr. Anand Iyer',
    },
  });

  const mgmtDept = await prisma.department.create({
    data: {
      code: 'MGMT',
      name: 'Department of Management & Business Studies',
      description: 'Enterprise leadership, business analytics, and strategic operations.',
      headName: 'Dr. Meenakshi Sundaram',
    },
  });

  console.log('✅ Departments created');

  // 2. Courses
  const btechCse = await prisma.course.create({
    data: {
      code: 'BTECH-CSE',
      name: 'Bachelor of Technology in Computer Science',
      description: '4-year accredited degree in computer science and software engineering.',
      durationYears: 4,
      totalSemesters: 8,
      credits: 160,
      departmentId: cseDept.id,
    },
  });

  const btechEce = await prisma.course.create({
    data: {
      code: 'BTECH-ECE',
      name: 'Bachelor of Technology in Electronics & Communication',
      description: '4-year engineering program in electronics and modern communications.',
      durationYears: 4,
      totalSemesters: 8,
      credits: 160,
      departmentId: eceDept.id,
    },
  });

  const mba = await prisma.course.create({
    data: {
      code: 'MBA-CORE',
      name: 'Master of Business Administration',
      description: '2-year premier postgraduate management program.',
      durationYears: 2,
      totalSemesters: 4,
      credits: 90,
      departmentId: mgmtDept.id,
    },
  });

  console.log('✅ Courses created');

  // 3. Administrative Users
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@apex.edu',
      collegeId: 'SUPER-001',
      password: adminPassword,
      role: 'SUPER_ADMIN',
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@apex.edu',
      collegeId: 'ADMIN-001',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const accountantUser = await prisma.user.create({
    data: {
      email: 'accountant@apex.edu',
      collegeId: 'ACC-001',
      password: accountantPassword,
      role: 'ACCOUNTANT',
    },
  });

  // 4. Faculty Users & Profiles
  const teacherUser1 = await prisma.user.create({
    data: {
      email: 'prof.sharma@apex.edu',
      collegeId: 'EMP-101',
      password: teacherPassword,
      role: 'TEACHER',
    },
  });

  const teacher1 = await prisma.teacherProfile.create({
    data: {
      userId: teacherUser1.id,
      employeeId: 'EMP-101',
      fullName: 'Prof. Rajesh Sharma',
      phone: '+91 98765 43210',
      designation: 'Professor & HOD',
      qualification: 'Ph.D in Distributed Systems, IIT Delhi',
      specialization: 'Cloud Computing, Distributed Databases',
      joiningDate: '2016-07-15',
      departmentId: cseDept.id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      email: 'dr.patel@apex.edu',
      collegeId: 'EMP-102',
      password: teacherPassword,
      role: 'TEACHER',
    },
  });

  const teacher2 = await prisma.teacherProfile.create({
    data: {
      userId: teacherUser2.id,
      employeeId: 'EMP-102',
      fullName: 'Dr. Neha Patel',
      phone: '+91 98765 43211',
      designation: 'Associate Professor',
      qualification: 'Ph.D in Machine Learning, IISc',
      specialization: 'Deep Learning, NLP, Data Science',
      joiningDate: '2019-01-10',
      departmentId: cseDept.id,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const teacherUser3 = await prisma.user.create({
    data: {
      email: 'prof.verma@apex.edu',
      collegeId: 'EMP-103',
      password: teacherPassword,
      role: 'TEACHER',
    },
  });

  const teacher3 = await prisma.teacherProfile.create({
    data: {
      userId: teacherUser3.id,
      employeeId: 'EMP-103',
      fullName: 'Prof. Amit Verma',
      phone: '+91 98765 43212',
      designation: 'Assistant Professor',
      qualification: 'M.Tech in Algorithms, BITS Pilani',
      specialization: 'Data Structures, Graph Theory',
      joiningDate: '2021-08-01',
      departmentId: cseDept.id,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  console.log('✅ Teachers created');

  // 5. Subjects
  const dsaSubject = await prisma.subject.create({
    data: {
      code: 'CS601',
      name: 'Advanced Data Structures & Algorithms',
      semester: 6,
      credits: 4,
      courseId: btechCse.id,
      teacherId: teacher3.id,
    },
  });

  const aiSubject = await prisma.subject.create({
    data: {
      code: 'CS602',
      name: 'Artificial Intelligence & Machine Learning',
      semester: 6,
      credits: 4,
      courseId: btechCse.id,
      teacherId: teacher2.id,
    },
  });

  const cloudSubject = await prisma.subject.create({
    data: {
      code: 'CS603',
      name: 'Cloud Computing & Distributed Architecture',
      semester: 6,
      credits: 3,
      courseId: btechCse.id,
      teacherId: teacher1.id,
    },
  });

  const dbSubject = await prisma.subject.create({
    data: {
      code: 'CS401',
      name: 'Database Engineering & Indexing Internals',
      semester: 4,
      credits: 4,
      courseId: btechCse.id,
      teacherId: teacher1.id,
    },
  });

  console.log('✅ Subjects created');

  // 6. Student Users & Profiles
  const studentUser1 = await prisma.user.create({
    data: {
      email: 'arjun.kumar@apex.edu',
      collegeId: 'APEX-2023-CS01',
      password: studentPassword,
      role: 'STUDENT',
    },
  });

  const student1 = await prisma.studentProfile.create({
    data: {
      userId: studentUser1.id,
      registrationNumber: 'APEX-2023-CS01',
      fullName: 'Arjun Kumar',
      phone: '+91 99887 76655',
      dateOfBirth: '2004-05-14',
      address: '742 Cyber City, Tech Park Avenue, Bangalore',
      gender: 'Male',
      bloodGroup: 'O+',
      currentSemester: 6,
      admissionYear: 2023,
      academicStatus: 'ACTIVE',
      departmentId: cseDept.id,
      courseId: btechCse.id,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: 'priya.sharma@apex.edu',
      collegeId: 'APEX-2023-CS02',
      password: studentPassword,
      role: 'STUDENT',
    },
  });

  const student2 = await prisma.studentProfile.create({
    data: {
      userId: studentUser2.id,
      registrationNumber: 'APEX-2023-CS02',
      fullName: 'Priya Sharma',
      phone: '+91 99887 76656',
      dateOfBirth: '2004-09-22',
      address: '124 Lakeview Enclave, Bangalore',
      gender: 'Female',
      bloodGroup: 'B+',
      currentSemester: 6,
      admissionYear: 2023,
      academicStatus: 'ACTIVE',
      departmentId: cseDept.id,
      courseId: btechCse.id,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const studentUser3 = await prisma.user.create({
    data: {
      email: 'rohit.singh@apex.edu',
      collegeId: 'APEX-2024-CS15',
      password: studentPassword,
      role: 'STUDENT',
    },
  });

  const student3 = await prisma.studentProfile.create({
    data: {
      userId: studentUser3.id,
      registrationNumber: 'APEX-2024-CS15',
      fullName: 'Rohit Singh',
      phone: '+91 99887 76657',
      dateOfBirth: '2005-02-18',
      address: '88 MG Road, Indiranagar, Bangalore',
      gender: 'Male',
      bloodGroup: 'A+',
      currentSemester: 4,
      admissionYear: 2024,
      academicStatus: 'ACTIVE',
      departmentId: cseDept.id,
      courseId: btechCse.id,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    },
  });

  const studentUser4 = await prisma.user.create({
    data: {
      email: 'sneha.reddy@apex.edu',
      collegeId: 'APEX-2024-EC08',
      password: studentPassword,
      role: 'STUDENT',
    },
  });

  const student4 = await prisma.studentProfile.create({
    data: {
      userId: studentUser4.id,
      registrationNumber: 'APEX-2024-EC08',
      fullName: 'Sneha Reddy',
      phone: '+91 99887 76658',
      dateOfBirth: '2005-11-05',
      address: '45 Koramangala 4th Block, Bangalore',
      gender: 'Female',
      bloodGroup: 'AB+',
      currentSemester: 4,
      admissionYear: 2024,
      academicStatus: 'ACTIVE',
      departmentId: eceDept.id,
      courseId: btechEce.id,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    },
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
    await prisma.attendanceRecord.create({
      data: {
        date,
        semester: 6,
        status: 'PRESENT',
        studentId: student1.id,
        subjectId: dsaSubject.id,
        markedById: teacher3.id,
        remarks: 'On time and active in code lab',
      },
    });

    await prisma.attendanceRecord.create({
      data: {
        date,
        semester: 6,
        status: 'PRESENT',
        studentId: student2.id,
        subjectId: dsaSubject.id,
        markedById: teacher3.id,
      },
    });

    await prisma.attendanceRecord.create({
      data: {
        date,
        semester: 6,
        status: Math.random() > 0.15 ? 'PRESENT' : 'ABSENT',
        studentId: student1.id,
        subjectId: aiSubject.id,
        markedById: teacher2.id,
      },
    });

    await prisma.attendanceRecord.create({
      data: {
        date,
        semester: 6,
        status: 'PRESENT',
        studentId: student2.id,
        subjectId: aiSubject.id,
        markedById: teacher2.id,
      },
    });
  }

  console.log('✅ Attendance records populated');

  // 8. Assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Lab 4: Red-Black Trees & Graph Dijkstra Implementation',
      description: 'Implement a self-balancing Red-Black Tree in C++ or Java and benchmark search performance against AVL Trees.',
      semester: 6,
      dueDate: new Date('2026-11-05T23:59:59Z'),
      totalMarks: 50,
      subjectId: dsaSubject.id,
      courseId: btechCse.id,
      teacherId: teacher3.id,
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Project 2: Convolutional Neural Network on CIFAR-100',
      description: 'Build a residual CNN architecture using PyTorch with data augmentation, achieving >= 78% test accuracy.',
      semester: 6,
      dueDate: new Date('2026-11-12T23:59:59Z'),
      totalMarks: 100,
      subjectId: aiSubject.id,
      courseId: btechCse.id,
      teacherId: teacher2.id,
    },
  });

  const assignment3 = await prisma.assignment.create({
    data: {
      title: 'Case Study: Multi-Region Kubernetes Failover Architecture',
      description: 'Design a resilient Terraform deployment with Geo-DNS routing and zero-downtime database replication.',
      semester: 6,
      dueDate: new Date('2026-11-18T23:59:59Z'),
      totalMarks: 50,
      subjectId: cloudSubject.id,
      courseId: btechCse.id,
      teacherId: teacher1.id,
    },
  });

  // Submissions
  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: student1.id,
      submissionText: 'Implemented Red-Black tree with full rotation unit tests and benchmark suite included.',
      fileUrl: 'https://storage.apex.edu/submissions/cs601_arjun_lab4.zip',
      status: 'GRADED',
      obtainedMarks: 48,
      feedback: 'Excellent clean code with comprehensive test cases. Outstanding time complexity analysis.',
    },
  });

  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: student2.id,
      submissionText: 'GitHub repository link and PDF report submitted.',
      fileUrl: 'https://storage.apex.edu/submissions/cs601_priya_lab4.pdf',
      status: 'GRADED',
      obtainedMarks: 49,
      feedback: 'Flawless balance rotations and clear benchmark graphs.',
    },
  });

  console.log('✅ Assignments and submissions created');

  // 9. Examinations, Schedules, and Published Results
  const midTermExam = await prisma.examination.create({
    data: {
      title: 'Spring 2026 Mid-Semester Theory & Practical Exams',
      academicYear: '2025-2026',
      startDate: new Date('2026-10-10T00:00:00Z'),
      endDate: new Date('2026-10-18T00:00:00Z'),
      status: 'RESULTS_PUBLISHED',
    },
  });

  const schedule1 = await prisma.examSchedule.create({
    data: {
      examinationId: midTermExam.id,
      subjectId: dsaSubject.id,
      examDate: new Date('2026-10-12T10:00:00Z'),
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      room: 'Academic Hall Alpha 301',
      maxMarks: 100,
    },
  });

  const schedule2 = await prisma.examSchedule.create({
    data: {
      examinationId: midTermExam.id,
      subjectId: aiSubject.id,
      examDate: new Date('2026-10-14T10:00:00Z'),
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      room: 'Computing Lab Beta 204',
      maxMarks: 100,
    },
  });

  // Results
  await prisma.examResult.create({
    data: {
      examinationId: midTermExam.id,
      studentId: student1.id,
      subjectId: dsaSubject.id,
      obtainedMarks: 94,
      maxMarks: 100,
      grade: 'A+',
      isPublished: true,
    },
  });

  await prisma.examResult.create({
    data: {
      examinationId: midTermExam.id,
      studentId: student1.id,
      subjectId: aiSubject.id,
      obtainedMarks: 88,
      maxMarks: 100,
      grade: 'A',
      isPublished: true,
    },
  });

  await prisma.examResult.create({
    data: {
      examinationId: midTermExam.id,
      studentId: student2.id,
      subjectId: dsaSubject.id,
      obtainedMarks: 96,
      maxMarks: 100,
      grade: 'A+',
      isPublished: true,
    },
  });

  await prisma.examResult.create({
    data: {
      examinationId: midTermExam.id,
      studentId: student2.id,
      subjectId: aiSubject.id,
      obtainedMarks: 91,
      maxMarks: 100,
      grade: 'A+',
      isPublished: true,
    },
  });

  console.log('✅ Examinations, schedules, and results seeded');

  // 10. Fee Categories, Invoices & Payments
  const tuitionCat = await prisma.feeCategory.create({
    data: {
      name: 'Semester Tuition Fee',
      amount: 65000,
      frequency: 'SEMESTER',
    },
  });

  const labCat = await prisma.feeCategory.create({
    data: {
      name: 'High-Performance Computing Lab Fee',
      amount: 12000,
      frequency: 'SEMESTER',
    },
  });

  const inv1 = await prisma.feeInvoice.create({
    data: {
      invoiceNumber: 'INV-2026-S6-001',
      title: 'Semester 6 Academic & Laboratory Tuition',
      totalAmount: 77000,
      paidAmount: 77000,
      dueDate: new Date('2026-08-15T00:00:00Z'),
      status: 'PAID',
      semester: 6,
      studentId: student1.id,
    },
  });

  await prisma.paymentRecord.create({
    data: {
      invoiceId: inv1.id,
      amount: 77000,
      transactionId: 'TXN-9847291823',
      paymentMethod: 'ONLINE',
      receiptNumber: 'RCP-2026-0881',
      status: 'COMPLETED',
      paymentDate: new Date('2026-08-10T14:32:00Z'),
    },
  });

  const inv2 = await prisma.feeInvoice.create({
    data: {
      invoiceNumber: 'INV-2026-S6-002',
      title: 'Semester 6 Academic & Laboratory Tuition',
      totalAmount: 77000,
      paidAmount: 40000,
      dueDate: new Date('2026-11-15T00:00:00Z'),
      status: 'PARTIAL',
      semester: 6,
      studentId: student2.id,
    },
  });

  await prisma.paymentRecord.create({
    data: {
      invoiceId: inv2.id,
      amount: 40000,
      transactionId: 'TXN-9847291899',
      paymentMethod: 'BANK_TRANSFER',
      receiptNumber: 'RCP-2026-0912',
      status: 'COMPLETED',
      paymentDate: new Date('2026-09-02T11:15:00Z'),
    },
  });

  console.log('✅ Fees and payment transactions seeded');

  // 11. Announcements
  await prisma.announcement.create({
    data: {
      title: 'Apex Annual Hackathon 2026 Announced ($25,000 Prize Pool)',
      content: 'Registrations are open for students across all engineering branches. 36 hours of non-stop AI, Web3, and Robotics innovation.',
      category: 'EVENT',
      targetRole: 'ALL',
      priority: 'HIGH',
      authorName: 'Office of Dean Academics',
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Mid-Semester Examination Results Officially Published',
      content: 'Students can now review their grade breakdown and instructor feedback through their personalized student portal.',
      category: 'EXAM',
      targetRole: 'STUDENT',
      priority: 'NORMAL',
      authorName: 'Examination Controller',
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Faculty Curriculum Review Meeting — Friday 3 PM',
      content: 'All HODs and teaching faculty are requested to join the conference hall for next academic year course modernization discussions.',
      category: 'ACADEMIC',
      targetRole: 'TEACHER',
      priority: 'NORMAL',
      authorName: 'Academic Council',
    },
  });

  // 12. Audit Logs
  await prisma.auditLog.create({
    data: {
      userEmail: 'admin@apex.edu',
      action: 'SYSTEM_INITIALIZATION',
      resource: 'GLOBAL',
      details: 'Apex College Management System database successfully seeded with initial administrative and academic records.',
      ipAddress: '127.0.0.1',
    },
  });

  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
