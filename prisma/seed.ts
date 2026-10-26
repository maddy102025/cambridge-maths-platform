import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.submissionVersion.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.studyMaterial.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.studentEnrollment.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.contactInquiry.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Teacher / Admin Account
  const teacherHash = await bcrypt.hash('AdminPass123!', 10);
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@cambridgemaths.edu',
      passwordHash: teacherHash,
      fullName: 'Ms. Eleanor Vance',
      role: 'TEACHER',
      phone: '+44 20 7946 0912',
      phoneVerified: true,
      emailVerified: true,
      bio: 'B.A. & M.Sc. in Pure Mathematics from the University of Cambridge. 14+ years preparing students for Cambridge O & A Level excellence with conceptual mastery and structured problem-solving.',
      avatarUrl: '/images/teacher-portrait.jpg',
      projectedGrade: 'N/A',
      studyStreakDays: 140,
    },
  });
  console.log('Created teacher:', teacher.email);

  // 2. Create Student Account: Sarah Ahmed
  const studentHash = await bcrypt.hash('StudentPass123!', 10);
  const studentSarah = await prisma.user.create({
    data: {
      email: 'student@cambridgemaths.edu',
      passwordHash: studentHash,
      fullName: 'Sarah Ahmed',
      role: 'STUDENT',
      phone: '+44 7911 123456',
      phoneVerified: true,
      emailVerified: true,
      bio: 'O & A Levels candidate preparing for May/June Cambridge examinations.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      projectedGrade: 'A*',
      studyStreakDays: 8,
    },
  });
  console.log('Created student:', studentSarah.email);

  // 3. Create Student Account: Liam Chen
  const studentLiam = await prisma.user.create({
    data: {
      email: 'liam@cambridgemaths.edu',
      passwordHash: studentHash,
      fullName: 'Liam Chen',
      role: 'STUDENT',
      phone: '+44 7700 900543',
      phoneVerified: false,
      emailVerified: true,
      bio: 'A-Level student focused on Pure Mathematics and Mechanics.',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      projectedGrade: 'A',
      studyStreakDays: 4,
    },
  });
  console.log('Created student:', studentLiam.email);

  // 4. Create Subjects
  const subjectsData = [
    {
      code: 'MATH-4024',
      name: 'Mathematics',
      syllabusInfo: 'Cambridge O Level, Syllabus D (4024 / 4025)',
      description: 'Comprehensive mastery of algebra, geometry, trigonometry, number theory, and data handling tailored for Cambridge O Level Syllabus D examinations.',
      level: 'O Level',
      instructorName: 'Ms. Eleanor Vance',
      isAvailable: true,
      scheduleInfo: 'Tuesdays & Thursdays, 4:30 PM - 6:00 PM GMT',
      iconName: 'Calculator',
      orderIndex: 1,
    },
    {
      code: 'AMATH-4037',
      name: 'Additional Mathematics',
      syllabusInfo: 'Cambridge O Level (4037)',
      description: 'Rigorous preparation in advanced algebraic techniques, logarithmic functions, quadratic equations, coordinate geometry, and introductory calculus.',
      level: 'O Level',
      instructorName: 'Ms. Eleanor Vance',
      isAvailable: true,
      scheduleInfo: 'Mondays & Wednesdays, 5:00 PM - 6:30 PM GMT',
      iconName: 'Sigma',
      orderIndex: 2,
    },
    {
      code: 'PURE-9709',
      name: 'Pure Mathematics',
      syllabusInfo: 'Cambridge International A Level (Papers 1, 2, and 3)',
      description: 'In-depth exploration of differential calculus, integration methods, complex numbers, vectors, trigonometry, and differential equations.',
      level: 'A Level',
      instructorName: 'Ms. Eleanor Vance',
      isAvailable: true,
      scheduleInfo: 'Saturdays, 10:00 AM - 12:30 PM GMT',
      iconName: 'Pi',
      orderIndex: 3,
    },
    {
      code: 'MECH-9709',
      name: 'Mechanics',
      syllabusInfo: 'Cambridge International A Level (Paper 4)',
      description: 'Mathematical modelling of physical systems: kinematics in linear motion, Newton’s laws of motion, work, energy, power, friction, and equilibrium.',
      level: 'A Level',
      instructorName: 'Ms. Eleanor Vance',
      isAvailable: true,
      scheduleInfo: 'Sundays, 2:00 PM - 4:00 PM GMT',
      iconName: 'Compass',
      orderIndex: 4,
    },
    {
      code: 'STAT-9709',
      name: 'Probability & Statistics',
      syllabusInfo: 'Cambridge International A Level (Papers 1 and 2)',
      description: 'Permutations, combinations, discrete random variables, continuous probability distributions, normal distributions, and hypothesis testing.',
      level: 'A Level',
      instructorName: 'Ms. Eleanor Vance',
      isAvailable: true,
      scheduleInfo: 'Fridays, 4:30 PM - 6:30 PM GMT',
      iconName: 'BarChart2',
      orderIndex: 5,
    },
    {
      code: 'FURTHER-9231',
      name: 'Further Mathematics',
      syllabusInfo: 'Cambridge International A Level (9231)',
      description: 'Elite mathematical concepts for aspiring engineering, mathematics, and physics scholars: matrices, hyperbolic functions, and rational functions.',
      level: 'A Level',
      instructorName: 'Ms. Eleanor Vance',
      isAvailable: true,
      scheduleInfo: 'By Special Arrangement & Individual Mentorship',
      iconName: 'Atom',
      orderIndex: 6,
    },
  ];

  const createdSubjects: Record<string, any> = {};
  for (const s of subjectsData) {
    const sub = await prisma.subject.create({ data: s });
    createdSubjects[s.code] = sub;
  }
  console.log('Created 6 Cambridge subjects.');

  // 5. Enrollments
  // Sarah enrolled in MATH-4024 and AMATH-4037
  await prisma.studentEnrollment.createMany({
    data: [
      { studentId: studentSarah.id, subjectId: createdSubjects['MATH-4024'].id, status: 'ACTIVE' },
      { studentId: studentSarah.id, subjectId: createdSubjects['AMATH-4037'].id, status: 'ACTIVE' },
      { studentId: studentLiam.id, subjectId: createdSubjects['PURE-9709'].id, status: 'ACTIVE' },
      { studentId: studentLiam.id, subjectId: createdSubjects['MECH-9709'].id, status: 'ACTIVE' },
    ],
  });
  console.log('Created student enrollments.');

  // 6. Lessons
  await prisma.lesson.createMany({
    data: [
      {
        subjectId: createdSubjects['MATH-4024'].id,
        title: 'Indices and Standard Form Mastery',
        description: 'Rules of fractional and negative indices with examination question breakdown.',
        videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        durationMinutes: 50,
        orderIndex: 1,
      },
      {
        subjectId: createdSubjects['MATH-4024'].id,
        title: 'Coordinate Geometry & Straight Line Graphs',
        description: 'Gradients, midpoints, perpendicular bisectors, and equations of tangent lines.',
        videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        durationMinutes: 55,
        orderIndex: 2,
      },
      {
        subjectId: createdSubjects['MATH-4024'].id,
        title: 'Trigonometry: Sine Rule, Cosine Rule & Bearings',
        description: 'Multi-step 3D geometry and surveying bearing calculations.',
        videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        durationMinutes: 60,
        orderIndex: 3,
      },
      {
        subjectId: createdSubjects['AMATH-4037'].id,
        title: 'Quadratic Functions & Discriminant Inequalities',
        description: 'Determining real roots, completing the square, and graphical intersections.',
        videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        durationMinutes: 65,
        orderIndex: 1,
      },
      {
        subjectId: createdSubjects['AMATH-4037'].id,
        title: 'Logarithmic and Exponential Equations',
        description: 'Laws of logarithms, natural logs, and solving exponential growth systems.',
        videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        durationMinutes: 70,
        orderIndex: 2,
      },
      {
        subjectId: createdSubjects['PURE-9709'].id,
        title: 'Differentiation Techniques: Product, Quotient & Chain Rules',
        description: 'Higher order derivatives and finding stationary points of inflection.',
        videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        durationMinutes: 75,
        orderIndex: 1,
      },
    ],
  });

  // 7. Study Materials (Study Drops)
  await prisma.studyMaterial.createMany({
    data: [
      {
        subjectId: createdSubjects['MATH-4024'].id,
        title: 'Mock - 1 Revision Note',
        topic: 'Algebra & Arithmetic Revision',
        description: 'Concise summary formulas and common algebraic pitfalls to avoid before the term mock.',
        fileType: 'PDF',
        fileSize: '3.2 MB',
        fileUrl: '/sample-resources/mock-1-revision-note.pdf',
        uploadedByRole: 'TEACHER',
        uploadedById: teacher.id,
      },
      {
        subjectId: createdSubjects['MATH-4024'].id,
        title: 'Trigonometry & Bearing Past Papers (2019-2024)',
        topic: 'Geometry & Trigonometry',
        description: 'Compiled examination questions with official marking scheme annotations.',
        fileType: 'PDF',
        fileSize: '4.8 MB',
        fileUrl: '/sample-resources/trigonometry-past-papers.pdf',
        uploadedByRole: 'TEACHER',
        uploadedById: teacher.id,
      },
      {
        subjectId: createdSubjects['MATH-4024'].id,
        title: 'Equilibrium and Reversible Reaction Note',
        topic: 'Applied Mathematics & Modelling',
        description: 'Supplementary interdisciplinary mathematical modeling reference.',
        fileType: 'DOCX',
        fileSize: '1.4 MB',
        fileUrl: '/sample-resources/applied-maths-modelling.docx',
        uploadedByRole: 'TEACHER',
        uploadedById: teacher.id,
      },
      {
        subjectId: createdSubjects['AMATH-4037'].id,
        title: 'Binomial Theorem Expansion Cheatsheet',
        topic: 'Algebraic Methods',
        description: 'Pascal triangle shortcuts and finding specific coefficient terms without full expansion.',
        fileType: 'PDF',
        fileSize: '1.9 MB',
        fileUrl: '/sample-resources/binomial-cheatsheet.pdf',
        uploadedByRole: 'TEACHER',
        uploadedById: teacher.id,
      },
      {
        subjectId: createdSubjects['AMATH-4037'].id,
        title: 'Circular Measure & Radian Calculations',
        topic: 'Trigonometric Functions',
        description: 'Sector area and arc length problem sets with step-by-step worked solutions.',
        fileType: 'PDF',
        fileSize: '2.5 MB',
        fileUrl: '/sample-resources/circular-measure.pdf',
        uploadedByRole: 'TEACHER',
        uploadedById: teacher.id,
      },
      {
        subjectId: createdSubjects['PURE-9709'].id,
        title: 'Integration by Parts & Substitution Masterclass',
        topic: 'Calculus',
        description: 'Comprehensive guide to advanced integration techniques for Paper 3.',
        fileType: 'PDF',
        fileSize: '5.1 MB',
        fileUrl: '/sample-resources/pure-integration-masterclass.pdf',
        uploadedByRole: 'TEACHER',
        uploadedById: teacher.id,
      },
    ],
  });

  // 8. Assignments (Quest)
  const assignment1 = await prisma.assignment.create({
    data: {
      subjectId: createdSubjects['MATH-4024'].id,
      title: 'Problem Set 4: Quadratic Equations & Graph Sketching',
      instructions: 'Solve all questions showing full working. Plot accurate curves on standard graph paper for Question 5. Submit your solutions as a clear single PDF scan.',
      maxMarks: 50,
      assignedDate: new Date(Date.now() - 10 * 86400000),
      dueDate: new Date(Date.now() - 2 * 86400000), // Past due / Graded
      referenceFileName: 'problem-set-4-prompts.pdf',
      referenceFileUrl: '/sample-resources/problem-set-4-prompts.pdf',
      allowLateSubmissions: true,
      allowResubmissions: true,
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      subjectId: createdSubjects['MATH-4024'].id,
      title: 'Problem Set 5: Circle Theorems & Angle Properties',
      instructions: 'Identify the specific Cambridge geometric reason for each deduction (e.g. angle at centre is twice angle at circumference). Diagrams must be legibly labeled.',
      maxMarks: 40,
      assignedDate: new Date(Date.now() - 3 * 86400000),
      dueDate: new Date(Date.now() + 4 * 86400000), // Upcoming
      referenceFileName: 'circle-theorems-worksheet.pdf',
      referenceFileUrl: '/sample-resources/circle-theorems-worksheet.pdf',
      allowLateSubmissions: true,
      allowResubmissions: true,
    },
  });

  const assignment3 = await prisma.assignment.create({
    data: {
      subjectId: createdSubjects['AMATH-4037'].id,
      title: 'Additional Maths Quest: Calculus Rates of Change',
      instructions: 'Complete exercises 12A through 12D. Pay careful attention to unit conversions for volumetric rates (cm³/s vs m³/min).',
      maxMarks: 60,
      assignedDate: new Date(Date.now() - 5 * 86400000),
      dueDate: new Date(Date.now() + 1 * 86400000), // Due tomorrow
      referenceFileName: 'rates-of-change-exercises.pdf',
      referenceFileUrl: '/sample-resources/rates-of-change-exercises.pdf',
      allowLateSubmissions: true,
      allowResubmissions: true,
    },
  });

  // 9. Submissions & Grades
  // Sarah submitted Assignment 1 and it was graded
  const sub1 = await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: studentSarah.id,
      status: 'GRADED',
      currentVersion: 1,
      submittedAt: new Date(Date.now() - 3 * 86400000),
      gradeScore: 48,
      gradeMax: 50,
      gradeLetter: 'A*',
      feedback: 'Outstanding mathematical rigor, Sarah! Your graph axes and turning point calculations were mathematically precise. Minor mark lost on Question 3(b) for missing the negative root notation.',
      gradedAt: new Date(Date.now() - 1 * 86400000),
      gradedById: teacher.id,
      isPublished: true,
    },
  });

  await prisma.submissionVersion.create({
    data: {
      submissionId: sub1.id,
      versionNumber: 1,
      fileName: 'SarahAhmed_ProblemSet4_Submission.pdf',
      fileSize: '2.1 MB',
      fileType: 'PDF',
      fileUrl: '/uploads/sarah_ps4_v1.pdf',
      studentNote: 'Completed all questions including graph plots. Please check my working on question 3b.',
      submittedAt: new Date(Date.now() - 3 * 86400000),
    },
  });

  // Sarah submitted Assignment 3 (In review / pending grade)
  const sub3 = await prisma.submission.create({
    data: {
      assignmentId: assignment3.id,
      studentId: studentSarah.id,
      status: 'SUBMITTED',
      currentVersion: 1,
      submittedAt: new Date(Date.now() - 12 * 3600000),
      gradeMax: 60,
      isPublished: false,
    },
  });

  await prisma.submissionVersion.create({
    data: {
      submissionId: sub3.id,
      versionNumber: 1,
      fileName: 'SarahAhmed_CalculusRates_Final.pdf',
      fileSize: '3.4 MB',
      fileType: 'PDF',
      fileUrl: '/uploads/sarah_rates_v1.pdf',
      studentNote: 'All 4 parts complete. Question 12C required extra substitution steps.',
      submittedAt: new Date(Date.now() - 12 * 3600000),
    },
  });

  // 10. Attendance Records for Sarah: 19 recorded classes, 11 attended (exactly ~58%)
  const attendanceData = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 40);

  // 11 PRESENT classes
  for (let i = 0; i < 11; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i * 2);
    attendanceData.push({
      studentId: studentSarah.id,
      subjectId: createdSubjects['MATH-4024'].id,
      classDate: d,
      status: 'PRESENT',
      remarks: 'Active participation in algebra problem solving session.',
    });
  }

  // 5 ABSENT classes
  for (let i = 0; i < 5; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 22 + i * 2);
    attendanceData.push({
      studentId: studentSarah.id,
      subjectId: createdSubjects['MATH-4024'].id,
      classDate: d,
      status: 'ABSENT',
      remarks: 'Unexcused absence.',
    });
  }

  // 3 EXCUSED classes (11 present out of 19 total held classes = 57.9% ~ 58%)
  for (let i = 0; i < 3; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 32 + i * 2);
    attendanceData.push({
      studentId: studentSarah.id,
      subjectId: createdSubjects['MATH-4024'].id,
      classDate: d,
      status: 'EXCUSED',
      remarks: 'Prior notice given for school inter-house athletic meet.',
    });
  }

  await prisma.attendanceRecord.createMany({ data: attendanceData });
  console.log('Created 19 attendance records for Sarah (11 Present, 5 Absent, 3 Excused).');

  // 11. Announcements (Heads-up)
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Cambridge May/June 2026 Examination Registration Reminder',
        content: 'Please ensure your CIE candidate entry forms and syllabus codes (4024/4037) have been confirmed with your school exam officer by the end of this month.',
        subjectId: null, // All students
        priority: 'HIGH',
        publishedAt: new Date(Date.now() - 2 * 86400000),
        authorId: teacher.id,
      },
      {
        title: 'O Level Mathematics: Weekend Mock Exam Schedule Announced',
        content: 'Our comprehensive Syllabus D paper 1 and paper 2 mock exam will be held online this Saturday from 9:00 AM to 12:30 PM. Ensure your printer and scanner are ready.',
        subjectId: createdSubjects['MATH-4024'].id,
        priority: 'NORMAL',
        publishedAt: new Date(Date.now() - 4 * 86400000),
        authorId: teacher.id,
      },
      {
        title: 'Additional Mathematics: New Calculus Resources Added',
        content: 'Check the Study Drops tab for brand new differentiation worked examples covering Cambridge 2023-2025 variant papers.',
        subjectId: createdSubjects['AMATH-4037'].id,
        priority: 'NORMAL',
        publishedAt: new Date(Date.now() - 6 * 86400000),
        authorId: teacher.id,
      },
    ],
  });

  // 12. Notifications for Sarah
  await prisma.notification.createMany({
    data: [
      {
        userId: studentSarah.id,
        title: 'Grade Published',
        message: 'Your grade for "Problem Set 4: Quadratic Equations" has been published: 48/50 (A*). Click to view teacher feedback.',
        linkUrl: '/student/quest',
        type: 'GRADE',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 86400000),
      },
      {
        userId: studentSarah.id,
        title: 'New Assignment Published',
        message: 'New assignment "Problem Set 5: Circle Theorems" is now available. Due in 4 days.',
        linkUrl: '/student/quest',
        type: 'ASSIGNMENT',
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 86400000),
      },
      {
        userId: studentSarah.id,
        title: 'New Study Drop Uploaded',
        message: 'Ms. Eleanor Vance added "Mock - 1 Revision Note" in Mathematics (4024).',
        linkUrl: '/student/modules',
        type: 'RESOURCE',
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
    ],
  });

  // 13. Contact Inquiry Demo
  await prisma.contactInquiry.create({
    data: {
      name: 'Dr. Tariq Rahman (Parent)',
      email: 'tariq.rahman@example.com',
      phone: '+44 7890 123456',
      subjectOfInterest: 'Pure Mathematics (A Level)',
      message: 'Inquiring about weekly small group sessions and individual past paper review for my son preparing for Cambridge A Levels in 2026.',
      status: 'NEW',
    },
  });

  console.log('--- Database Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
