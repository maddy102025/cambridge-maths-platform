-- Cloudflare D1 Schema & Initial Seed for Cambridge O & A Levels Mathematics Platform
DROP TABLE IF EXISTS FileStorage;
DROP TABLE IF EXISTS ContactInquiry;
DROP TABLE IF EXISTS Notification;
DROP TABLE IF EXISTS Announcement;
DROP TABLE IF EXISTS AttendanceRecord;
DROP TABLE IF EXISTS SubmissionVersion;
DROP TABLE IF EXISTS Submission;
DROP TABLE IF EXISTS Assignment;
DROP TABLE IF EXISTS StudyMaterial;
DROP TABLE IF EXISTS Lesson;
DROP TABLE IF EXISTS StudentEnrollment;
DROP TABLE IF EXISTS Subject;
DROP TABLE IF EXISTS User;

CREATE TABLE User (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      fullName TEXT NOT NULL,
      phone TEXT,
      phoneVerified INTEGER DEFAULT 0,
      emailVerified INTEGER DEFAULT 1,
      role TEXT DEFAULT 'STUDENT',
      avatarUrl TEXT,
      bio TEXT,
      projectedGrade TEXT DEFAULT 'A*',
      studyStreakDays INTEGER DEFAULT 7,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
CREATE TABLE Subject (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      syllabusInfo TEXT NOT NULL,
      description TEXT NOT NULL,
      level TEXT NOT NULL,
      instructorName TEXT DEFAULT 'Ms. Eleanor Vance',
      isAvailable INTEGER DEFAULT 1,
      scheduleInfo TEXT,
      iconName TEXT,
      orderIndex INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
CREATE TABLE StudentEnrollment (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      enrolledAt TEXT NOT NULL,
      UNIQUE(studentId, subjectId)
    );
CREATE TABLE Lesson (
      id TEXT PRIMARY KEY,
      subjectId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      videoUrl TEXT,
      durationMinutes INTEGER DEFAULT 45,
      orderIndex INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
CREATE TABLE StudyMaterial (
      id TEXT PRIMARY KEY,
      subjectId TEXT NOT NULL,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      description TEXT,
      fileType TEXT NOT NULL,
      fileSize TEXT NOT NULL,
      fileUrl TEXT NOT NULL,
      uploadedByRole TEXT DEFAULT 'TEACHER',
      uploadedById TEXT NOT NULL,
      isPublicToClass INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
CREATE TABLE Assignment (
      id TEXT PRIMARY KEY,
      subjectId TEXT NOT NULL,
      title TEXT NOT NULL,
      instructions TEXT NOT NULL,
      maxMarks INTEGER DEFAULT 100,
      dueDate TEXT NOT NULL,
      assignedDate TEXT NOT NULL,
      allowLateSubmissions INTEGER DEFAULT 1,
      allowResubmissions INTEGER DEFAULT 1,
      referenceFileUrl TEXT,
      referenceFileName TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
CREATE TABLE Submission (
      id TEXT PRIMARY KEY,
      assignmentId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      status TEXT DEFAULT 'SUBMITTED',
      currentVersion INTEGER DEFAULT 1,
      submittedAt TEXT,
      gradeScore REAL,
      gradeMax REAL DEFAULT 100,
      gradeLetter TEXT,
      feedback TEXT,
      gradedAt TEXT,
      gradedById TEXT,
      isPublished INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      UNIQUE(assignmentId, studentId)
    );
CREATE TABLE SubmissionVersion (
      id TEXT PRIMARY KEY,
      submissionId TEXT NOT NULL,
      versionNumber INTEGER DEFAULT 1,
      fileUrl TEXT NOT NULL,
      fileName TEXT NOT NULL,
      fileSize TEXT NOT NULL,
      fileType TEXT NOT NULL,
      studentNote TEXT,
      submittedAt TEXT NOT NULL
    );
CREATE TABLE AttendanceRecord (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      classDate TEXT NOT NULL,
      status TEXT DEFAULT 'PRESENT',
      remarks TEXT,
      createdAt TEXT NOT NULL
    );
CREATE TABLE Announcement (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      subjectId TEXT,
      priority TEXT DEFAULT 'NORMAL',
      publishedAt TEXT NOT NULL,
      authorId TEXT NOT NULL
    );
CREATE TABLE Notification (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      linkUrl TEXT,
      type TEXT DEFAULT 'SYSTEM',
      isRead INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );
CREATE TABLE ContactInquiry (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subjectOfInterest TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'NEW',
      createdAt TEXT NOT NULL
    );
CREATE TABLE FileStorage (
      fileName TEXT PRIMARY KEY,
      mimeType TEXT NOT NULL,
      sizeBytes INTEGER NOT NULL,
      dataBase64 TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

INSERT INTO User VALUES ('cmvp5iuap00004wqc6dksh4wj', 'teacher@cambridgemaths.edu', '$2b$10$L87ubU3dteITWByEQIBYEubeWzFmX3o4mQ8UYgKXrH/rXnSq4rlhW', 'Ms. Eleanor Vance', '+44 20 7946 0912', 1, 1, 'TEACHER', '/images/teacher-portrait.jpg', 'B.A. & M.Sc. in Pure Mathematics from the University of Cambridge. 14+ years preparing students for Cambridge O & A Level excellence with conceptual mastery and structured problem-solving.', 'N/A', 140, '2026-10-26T11:06:34.080Z', '2026-10-26T11:06:34.080Z');
INSERT INTO User VALUES ('cmvp5iucj00014wqcr9d06z8e', 'student@cambridgemaths.edu', '$2b$10$6kRfLapGXRoLZqOm517Tje02Hd5nakjRq8/2udGfFuYUmJ6fappaq', 'Sarah Ahmed', '+44 7911 123456', 1, 1, 'STUDENT', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'O & A Levels candidate preparing for May/June Cambridge examinations.', 'A*', 8, '2026-10-26T11:06:34.148Z', '2026-10-26T11:06:34.148Z');
INSERT INTO User VALUES ('cmvp5iucp00024wqcrq2d5r4k', 'liam@cambridgemaths.edu', '$2b$10$6kRfLapGXRoLZqOm517Tje02Hd5nakjRq8/2udGfFuYUmJ6fappaq', 'Liam Chen', '+44 7700 900543', 0, 1, 'STUDENT', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80', 'A-Level student focused on Pure Mathematics and Mechanics.', 'A', 4, '2026-10-26T11:06:34.153Z', '2026-10-26T11:06:34.153Z');
INSERT INTO Subject VALUES ('cmvp5iucv00034wqcaxd1qdl8', 'MATH-4024', 'Mathematics', 'Cambridge O Level, Syllabus D (4024 / 4025)', 'Comprehensive mastery of algebra, geometry, trigonometry, number theory, and data handling tailored for Cambridge O Level Syllabus D examinations.', 'O Level', 'Ms. Eleanor Vance', 1, 'Tuesdays & Thursdays, 4:30 PM - 6:00 PM GMT', 'Calculator', 1, '2026-10-26T11:06:34.159Z', '2026-10-26T11:06:34.159Z');
INSERT INTO Subject VALUES ('cmvp5iud100044wqcg9oeg65v', 'AMATH-4037', 'Additional Mathematics', 'Cambridge O Level (4037)', 'Rigorous preparation in advanced algebraic techniques, logarithmic functions, quadratic equations, coordinate geometry, and introductory calculus.', 'O Level', 'Ms. Eleanor Vance', 1, 'Mondays & Wednesdays, 5:00 PM - 6:30 PM GMT', 'Sigma', 2, '2026-10-26T11:06:34.165Z', '2026-10-26T11:06:34.165Z');
INSERT INTO Subject VALUES ('cmvp5iud500054wqcmoyakf9q', 'PURE-9709', 'Pure Mathematics', 'Cambridge International A Level (Papers 1, 2, and 3)', 'In-depth exploration of differential calculus, integration methods, complex numbers, vectors, trigonometry, and differential equations.', 'A Level', 'Ms. Eleanor Vance', 1, 'Saturdays, 10:00 AM - 12:30 PM GMT', 'Pi', 3, '2026-10-26T11:06:34.169Z', '2026-10-26T11:06:34.169Z');
INSERT INTO Subject VALUES ('cmvp5iuda00064wqcodgm0xjs', 'MECH-9709', 'Mechanics', 'Cambridge International A Level (Paper 4)', 'Mathematical modelling of physical systems: kinematics in linear motion, Newton’s laws of motion, work, energy, power, friction, and equilibrium.', 'A Level', 'Ms. Eleanor Vance', 1, 'Sundays, 2:00 PM - 4:00 PM GMT', 'Compass', 4, '2026-10-26T11:06:34.175Z', '2026-10-26T11:06:34.175Z');
INSERT INTO Subject VALUES ('cmvp5iudg00074wqc9v7e5xim', 'STAT-9709', 'Probability & Statistics', 'Cambridge International A Level (Papers 1 and 2)', 'Permutations, combinations, discrete random variables, continuous probability distributions, normal distributions, and hypothesis testing.', 'A Level', 'Ms. Eleanor Vance', 1, 'Fridays, 4:30 PM - 6:30 PM GMT', 'BarChart2', 5, '2026-10-26T11:06:34.180Z', '2026-10-26T11:06:34.180Z');
INSERT INTO Subject VALUES ('cmvp5iudk00084wqcraevwrq7', 'FURTHER-9231', 'Further Mathematics', 'Cambridge International A Level (9231)', 'Elite mathematical concepts for aspiring engineering, mathematics, and physics scholars: matrices, hyperbolic functions, and rational functions.', 'A Level', 'Ms. Eleanor Vance', 1, 'By Special Arrangement & Individual Mentorship', 'Atom', 6, '2026-10-26T11:06:34.184Z', '2026-10-26T11:06:34.184Z');
INSERT INTO StudentEnrollment VALUES ('cmvp5iudo00094wqcp5hko2w6', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', 'ACTIVE', '2026-10-26T11:06:34.188Z');
INSERT INTO StudentEnrollment VALUES ('cmvp5iudo000a4wqc06kj5v8r', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iud100044wqcg9oeg65v', 'ACTIVE', '2026-10-26T11:06:34.188Z');
INSERT INTO StudentEnrollment VALUES ('cmvp5iudo000b4wqcnkgit5si', 'cmvp5iucp00024wqcrq2d5r4k', 'cmvp5iud500054wqcmoyakf9q', 'ACTIVE', '2026-10-26T11:06:34.188Z');
INSERT INTO StudentEnrollment VALUES ('cmvp5iudo000c4wqccc0zru5x', 'cmvp5iucp00024wqcrq2d5r4k', 'cmvp5iuda00064wqcodgm0xjs', 'ACTIVE', '2026-10-26T11:06:34.188Z');
INSERT INTO Lesson VALUES ('cmvp5iudu000d4wqcwq5uxldj', 'cmvp5iucv00034wqcaxd1qdl8', 'Indices and Standard Form Mastery', 'Rules of fractional and negative indices with examination question breakdown.', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 50, 1, '2026-10-26T11:06:34.194Z', '2026-10-26T11:06:34.194Z');
INSERT INTO Lesson VALUES ('cmvp5iudu000e4wqcz2fx5lb2', 'cmvp5iucv00034wqcaxd1qdl8', 'Coordinate Geometry & Straight Line Graphs', 'Gradients, midpoints, perpendicular bisectors, and equations of tangent lines.', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 55, 2, '2026-10-26T11:06:34.194Z', '2026-10-26T11:06:34.194Z');
INSERT INTO Lesson VALUES ('cmvp5iudu000f4wqcc3ovoa5k', 'cmvp5iucv00034wqcaxd1qdl8', 'Trigonometry: Sine Rule, Cosine Rule & Bearings', 'Multi-step 3D geometry and surveying bearing calculations.', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 60, 3, '2026-10-26T11:06:34.194Z', '2026-10-26T11:06:34.194Z');
INSERT INTO Lesson VALUES ('cmvp5iudu000g4wqcwr2fscxf', 'cmvp5iud100044wqcg9oeg65v', 'Quadratic Functions & Discriminant Inequalities', 'Determining real roots, completing the square, and graphical intersections.', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 65, 1, '2026-10-26T11:06:34.194Z', '2026-10-26T11:06:34.194Z');
INSERT INTO Lesson VALUES ('cmvp5iudu000h4wqcv9qkekub', 'cmvp5iud100044wqcg9oeg65v', 'Logarithmic and Exponential Equations', 'Laws of logarithms, natural logs, and solving exponential growth systems.', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 70, 2, '2026-10-26T11:06:34.194Z', '2026-10-26T11:06:34.194Z');
INSERT INTO Lesson VALUES ('cmvp5iudu000i4wqcvdhea8zu', 'cmvp5iud500054wqcmoyakf9q', 'Differentiation Techniques: Product, Quotient & Chain Rules', 'Higher order derivatives and finding stationary points of inflection.', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', 75, 1, '2026-10-26T11:06:34.194Z', '2026-10-26T11:06:34.194Z');
INSERT INTO StudyMaterial VALUES ('cmvp5iudw000j4wqc9u007trj', 'cmvp5iucv00034wqcaxd1qdl8', 'Mock - 1 Revision Note', 'Algebra & Arithmetic Revision', 'Concise summary formulas and common algebraic pitfalls to avoid before the term mock.', 'PDF', '3.2 MB', '/sample-resources/mock-1-revision-note.pdf', 'TEACHER', 'cmvp5iuap00004wqc6dksh4wj', 1, '2026-10-26T11:06:34.197Z', '2026-10-26T11:06:34.197Z');
INSERT INTO StudyMaterial VALUES ('cmvp5iudw000k4wqcy7txb3c3', 'cmvp5iucv00034wqcaxd1qdl8', 'Trigonometry & Bearing Past Papers (2019-2024)', 'Geometry & Trigonometry', 'Compiled examination questions with official marking scheme annotations.', 'PDF', '4.8 MB', '/sample-resources/trigonometry-past-papers.pdf', 'TEACHER', 'cmvp5iuap00004wqc6dksh4wj', 1, '2026-10-26T11:06:34.197Z', '2026-10-26T11:06:34.197Z');
INSERT INTO StudyMaterial VALUES ('cmvp5iudw000l4wqc910xjnkq', 'cmvp5iucv00034wqcaxd1qdl8', 'Equilibrium and Reversible Reaction Note', 'Applied Mathematics & Modelling', 'Supplementary interdisciplinary mathematical modeling reference.', 'DOCX', '1.4 MB', '/sample-resources/applied-maths-modelling.docx', 'TEACHER', 'cmvp5iuap00004wqc6dksh4wj', 1, '2026-10-26T11:06:34.197Z', '2026-10-26T11:06:34.197Z');
INSERT INTO StudyMaterial VALUES ('cmvp5iudw000m4wqcxg1udozh', 'cmvp5iud100044wqcg9oeg65v', 'Binomial Theorem Expansion Cheatsheet', 'Algebraic Methods', 'Pascal triangle shortcuts and finding specific coefficient terms without full expansion.', 'PDF', '1.9 MB', '/sample-resources/binomial-cheatsheet.pdf', 'TEACHER', 'cmvp5iuap00004wqc6dksh4wj', 1, '2026-10-26T11:06:34.197Z', '2026-10-26T11:06:34.197Z');
INSERT INTO StudyMaterial VALUES ('cmvp5iudw000n4wqcd2px5qfp', 'cmvp5iud100044wqcg9oeg65v', 'Circular Measure & Radian Calculations', 'Trigonometric Functions', 'Sector area and arc length problem sets with step-by-step worked solutions.', 'PDF', '2.5 MB', '/sample-resources/circular-measure.pdf', 'TEACHER', 'cmvp5iuap00004wqc6dksh4wj', 1, '2026-10-26T11:06:34.197Z', '2026-10-26T11:06:34.197Z');
INSERT INTO StudyMaterial VALUES ('cmvp5iudw000o4wqcu55ryz4s', 'cmvp5iud500054wqcmoyakf9q', 'Integration by Parts & Substitution Masterclass', 'Calculus', 'Comprehensive guide to advanced integration techniques for Paper 3.', 'PDF', '5.1 MB', '/sample-resources/pure-integration-masterclass.pdf', 'TEACHER', 'cmvp5iuap00004wqc6dksh4wj', 1, '2026-10-26T11:06:34.197Z', '2026-10-26T11:06:34.197Z');
INSERT INTO Assignment VALUES ('cmvp5iue1000q4wqc72lliep0', 'cmvp5iucv00034wqcaxd1qdl8', 'Problem Set 4: Quadratic Equations & Graph Sketching', 'Solve all questions showing full working. Plot accurate curves on standard graph paper for Question 5. Submit your solutions as a clear single PDF scan.', 50, '2026-10-24T11:06:34.199Z', '2026-10-16T11:06:34.199Z', 1, 1, '/sample-resources/problem-set-4-prompts.pdf', 'problem-set-4-prompts.pdf', '2026-10-26T11:06:34.201Z', '2026-10-26T11:06:34.201Z');
INSERT INTO Assignment VALUES ('cmvp5iue4000s4wqc6ca5kv56', 'cmvp5iucv00034wqcaxd1qdl8', 'Problem Set 5: Circle Theorems & Angle Properties', 'Identify the specific Cambridge geometric reason for each deduction (e.g. angle at centre is twice angle at circumference). Diagrams must be legibly labeled.', 40, '2026-10-30T11:06:34.204Z', '2026-10-23T11:06:34.204Z', 1, 1, '/sample-resources/circle-theorems-worksheet.pdf', 'circle-theorems-worksheet.pdf', '2026-10-26T11:06:34.205Z', '2026-10-26T11:06:34.205Z');
INSERT INTO Assignment VALUES ('cmvp5iue8000u4wqcghixpsfi', 'cmvp5iud100044wqcg9oeg65v', 'Additional Maths Quest: Calculus Rates of Change', 'Complete exercises 12A through 12D. Pay careful attention to unit conversions for volumetric rates (cm³/s vs m³/min).', 60, '2026-10-27T11:06:34.207Z', '2026-10-21T11:06:34.207Z', 1, 1, '/sample-resources/rates-of-change-exercises.pdf', 'rates-of-change-exercises.pdf', '2026-10-26T11:06:34.208Z', '2026-10-26T11:06:34.208Z');
INSERT INTO Submission VALUES ('cmvp5iueb000w4wqc8g8984so', 'cmvp5iue1000q4wqc72lliep0', 'cmvp5iucj00014wqcr9d06z8e', 'GRADED', 1, '2026-10-23T11:06:34.210Z', 48, 50, 'A*', 'Outstanding mathematical rigor, Sarah! Your graph axes and turning point calculations were mathematically precise. Minor mark lost on Question 3(b) for missing the negative root notation.', '2026-10-25T11:06:34.210Z', 'cmvp5iuap00004wqc6dksh4wj', 1, '2026-10-26T11:06:34.211Z', '2026-10-26T11:06:34.211Z');
INSERT INTO Submission VALUES ('cmvp5iueh00104wqcctcryakb', 'cmvp5iue8000u4wqcghixpsfi', 'cmvp5iucj00014wqcr9d06z8e', 'SUBMITTED', 1, '2026-10-25T23:06:34.216Z', NULL, 60, NULL, NULL, NULL, NULL, 0, '2026-10-26T11:06:34.217Z', '2026-10-26T11:06:34.217Z');
INSERT INTO SubmissionVersion VALUES ('cmvp5iuee000y4wqcq8u8p3gb', 'cmvp5iueb000w4wqc8g8984so', 1, '/uploads/sarah_ps4_v1.pdf', 'SarahAhmed_ProblemSet4_Submission.pdf', '2.1 MB', 'PDF', 'Completed all questions including graph plots. Please check my working on question 3b.', '2026-10-23T11:06:34.214Z');
INSERT INTO SubmissionVersion VALUES ('cmvp5iuej00124wqcb0td060s', 'cmvp5iueh00104wqcctcryakb', 1, '/uploads/sarah_rates_v1.pdf', 'SarahAhmed_CalculusRates_Final.pdf', '3.4 MB', 'PDF', 'All 4 parts complete. Question 12C required extra substitution steps.', '2026-10-25T23:06:34.219Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen00134wqchyrptru7', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-09-16T11:06:34.222Z', 'PRESENT', 'Active participation in algebra problem solving session.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen00144wqcrc12kemk', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-09-18T11:06:34.222Z', 'PRESENT', 'Active participation in algebra problem solving session.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen00154wqc4k1vj1a6', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-09-20T11:06:34.222Z', 'PRESENT', 'Active participation in algebra problem solving session.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen00164wqcoybjxkvb', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-09-22T11:06:34.222Z', 'PRESENT', 'Active participation in algebra problem solving session.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen00174wqcp647m3kj', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-09-24T11:06:34.222Z', 'PRESENT', 'Active participation in algebra problem solving session.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen00184wqcadrzsuca', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-09-26T11:06:34.222Z', 'PRESENT', 'Active participation in algebra problem solving session.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen00194wqcquonvr9u', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-09-28T11:06:34.222Z', 'PRESENT', 'Active participation in algebra problem solving session.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen001a4wqckzdmet27', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-09-30T11:06:34.222Z', 'PRESENT', 'Active participation in algebra problem solving session.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen001b4wqcpfru2rjc', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-10-02T11:06:34.222Z', 'PRESENT', 'Active participation in algebra problem solving session.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen001c4wqc75b4rcyw', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-10-04T11:06:34.222Z', 'PRESENT', 'Active participation in algebra problem solving session.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen001d4wqc3ecu3f43', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-10-06T11:06:34.222Z', 'PRESENT', 'Active participation in algebra problem solving session.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen001e4wqcxxdt49ku', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-10-08T11:06:34.222Z', 'ABSENT', 'Unexcused absence.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen001f4wqc9qphy84f', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-10-10T11:06:34.222Z', 'ABSENT', 'Unexcused absence.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen001g4wqc801tp1k5', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-10-12T11:06:34.222Z', 'ABSENT', 'Unexcused absence.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen001h4wqce3hq67qw', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-10-14T11:06:34.222Z', 'ABSENT', 'Unexcused absence.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen001i4wqcir74dind', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-10-16T11:06:34.222Z', 'ABSENT', 'Unexcused absence.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen001j4wqcmjv4bfec', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-10-18T11:06:34.222Z', 'EXCUSED', 'Prior notice given for school inter-house athletic meet.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen001k4wqcjmt4k0id', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-10-20T11:06:34.222Z', 'EXCUSED', 'Prior notice given for school inter-house athletic meet.', '2026-10-26T11:06:34.224Z');
INSERT INTO AttendanceRecord VALUES ('cmvp5iuen001l4wqcgxnujija', 'cmvp5iucj00014wqcr9d06z8e', 'cmvp5iucv00034wqcaxd1qdl8', '2026-10-22T11:06:34.222Z', 'EXCUSED', 'Prior notice given for school inter-house athletic meet.', '2026-10-26T11:06:34.224Z');
INSERT INTO Announcement VALUES ('cmvp5iuer001m4wqcfb09atf4', 'Cambridge May/June 2026 Examination Registration Reminder', 'Please ensure your CIE candidate entry forms and syllabus codes (4024/4037) have been confirmed with your school exam officer by the end of this month.', NULL, 'HIGH', '2026-10-24T11:06:34.227Z', 'cmvp5iuap00004wqc6dksh4wj');
INSERT INTO Announcement VALUES ('cmvp5iuer001n4wqczf1ph1tm', 'O Level Mathematics: Weekend Mock Exam Schedule Announced', 'Our comprehensive Syllabus D paper 1 and paper 2 mock exam will be held online this Saturday from 9:00 AM to 12:30 PM. Ensure your printer and scanner are ready.', 'cmvp5iucv00034wqcaxd1qdl8', 'NORMAL', '2026-10-22T11:06:34.227Z', 'cmvp5iuap00004wqc6dksh4wj');
INSERT INTO Announcement VALUES ('cmvp5iuer001o4wqc9dl01iz1', 'Additional Mathematics: New Calculus Resources Added', 'Check the Study Drops tab for brand new differentiation worked examples covering Cambridge 2023-2025 variant papers.', 'cmvp5iud100044wqcg9oeg65v', 'NORMAL', '2026-10-20T11:06:34.227Z', 'cmvp5iuap00004wqc6dksh4wj');
INSERT INTO Notification VALUES ('cmvp5iueu001p4wqc77c6qicb', 'cmvp5iucj00014wqcr9d06z8e', 'Grade Published', 'Your grade for "Problem Set 4: Quadratic Equations" has been published: 48/50 (A*). Click to view teacher feedback.', '/student/quest', 'GRADE', 0, '2026-10-25T11:06:34.230Z');
INSERT INTO Notification VALUES ('cmvp5iueu001q4wqc4vwwduob', 'cmvp5iucj00014wqcr9d06z8e', 'New Assignment Published', 'New assignment "Problem Set 5: Circle Theorems" is now available. Due in 4 days.', '/student/quest', 'ASSIGNMENT', 0, '2026-10-23T11:06:34.230Z');
INSERT INTO Notification VALUES ('cmvp5iueu001r4wqcw06dtjkv', 'cmvp5iucj00014wqcr9d06z8e', 'New Study Drop Uploaded', 'Ms. Eleanor Vance added "Mock - 1 Revision Note" in Mathematics (4024).', '/student/modules', 'RESOURCE', 1, '2026-10-21T11:06:34.230Z');
INSERT INTO ContactInquiry VALUES ('cmvp5iuex001s4wqcfk6itg0u', 'Dr. Tariq Rahman (Parent)', 'tariq.rahman@example.com', '+44 7890 123456', 'Pure Mathematics (A Level)', 'Inquiring about weekly small group sessions and individual past paper review for my son preparing for Cambridge A Levels in 2026.', 'NEW', '2026-10-26T11:06:34.233Z');