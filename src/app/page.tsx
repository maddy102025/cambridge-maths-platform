'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';
import ContactSection from '@/components/home/ContactSection';
import { useCms } from '@/lib/useCms';
import {
  ArrowRight,
  Calculator,
  Compass,
  BarChart2,
  Atom,
  Sigma,
  Pi,
  GraduationCap,
  FileCheck,
  TrendingUp,
  BrainCircuit,
  UserCheck
} from 'lucide-react';

const DEFAULT_SUBJECTS = [
  {
    id: 'sub-math-4024',
    code: 'MATH-4024',
    name: 'Mathematics',
    syllabusInfo: 'Cambridge O Level, Syllabus D (4024 / 4025)',
    description: 'Comprehensive mastery of algebra, geometry, trigonometry, number theory, and data handling tailored for Cambridge O Level Syllabus D examinations.',
    level: 'O Level',
    scheduleInfo: 'Tuesdays & Thursdays, 4:30 PM - 6:00 PM GMT',
  },
  {
    id: 'sub-amath-4037',
    code: 'AMATH-4037',
    name: 'Additional Mathematics',
    syllabusInfo: 'Cambridge O Level (4037)',
    description: 'Rigorous preparation in advanced algebraic techniques, logarithmic functions, quadratic equations, coordinate geometry, and introductory calculus.',
    level: 'O Level',
    scheduleInfo: 'Mondays & Wednesdays, 5:00 PM - 6:30 PM GMT',
  },
  {
    id: 'sub-pure-9709',
    code: 'PURE-9709',
    name: 'Pure Mathematics',
    syllabusInfo: 'Cambridge International A Level (Papers 1, 2, and 3)',
    description: 'In-depth exploration of differential calculus, integration methods, complex numbers, vectors, trigonometry, and differential equations.',
    level: 'A Level',
    scheduleInfo: 'Saturdays, 10:00 AM - 12:30 PM GMT',
  },
  {
    id: 'sub-mech-9709',
    code: 'MECH-9709',
    name: 'Mechanics',
    syllabusInfo: 'Cambridge International A Level (Paper 4)',
    description: 'Mathematical modelling of physical systems: kinematics in linear motion, Newton’s laws of motion, work, energy, power, friction, and equilibrium.',
    level: 'A Level',
    scheduleInfo: 'Sundays, 2:00 PM - 4:00 PM GMT',
  },
  {
    id: 'sub-stat-9709',
    code: 'STAT-9709',
    name: 'Probability & Statistics',
    syllabusInfo: 'Cambridge International A Level (Papers 1 and 2)',
    description: 'Permutations, combinations, discrete random variables, continuous probability distributions, normal distributions, and hypothesis testing.',
    level: 'A Level',
    scheduleInfo: 'Fridays, 4:30 PM - 6:30 PM GMT',
  },
  {
    id: 'sub-further-9231',
    code: 'FURTHER-9231',
    name: 'Further Mathematics',
    syllabusInfo: 'Cambridge International A Level (9231)',
    description: 'Elite mathematical concepts for aspiring engineering, mathematics, and physics scholars: matrices, hyperbolic functions, and rational functions.',
    level: 'A Level',
    scheduleInfo: 'By Special Arrangement & Individual Mentorship',
  },
];

export default function HomePage() {
  const { cms } = useCms();
  const [subjects, setSubjects] = useState<any[]>(DEFAULT_SUBJECTS);

  useEffect(() => {
    fetch('/api/portal?view=public')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.subjects?.length) {
          setSubjects(data.subjects);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-ivory-100 selection:bg-sage-300 selection:text-slate-900">
      <PublicNavbar />

      {/* SECTION A: HERO - MEET THE TEACHER */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-sage-200/60">
        <div className="absolute inset-0 math-grid-pattern pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-100 border border-sage-300/70 text-xs font-bold tracking-widest uppercase text-slate-800">
                <span className="w-2 h-2 rounded-full bg-sage-600 animate-pulse" />
                <span>{cms('public_hero_badge', 'CAIE O & A LEVELS MATHEMATICS')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-muted leading-[1.12]">
                {cms('public_hero_title', 'Building Mathematical Mastery Through Rigorous Cambridge Pedagogy')}
              </h1>

              <p className="text-xl sm:text-2xl font-medium text-slate-soft tracking-tight">
                {cms('public_hero_subtitle', 'Clear Conceptual Proofs. Methodical Problem Architecture. Exceptional A* Examination Results.')}
              </p>

              <p className="text-base sm:text-lg text-slate-soft/90 leading-relaxed max-w-2xl font-normal">
                {cms('public_hero_description', 'Dedicated Cambridge International curriculum mentorship helping students master core mathematical principles, cultivate disciplined problem-solving intuition, and prepare thoroughly for Cambridge O & A Levels examinations.')}
              </p>

              {/* CTAs */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <a
                  href="#classes"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-semibold text-base shadow-sm border border-sage-400/60 transition-all focus:outline-none focus:ring-2 focus:ring-slate-muted cursor-pointer"
                >
                  <span>{cms('public_hero_cta_primary', 'Explore Cambridge Modules')}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-ivory-200 text-slate-muted font-semibold text-base border border-sage-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sage-400"
                >
                  <GraduationCap className="w-5 h-5 text-slate-soft" />
                  <span>{cms('public_hero_cta_secondary', 'Candidate Portal Access')}</span>
                </Link>
              </div>

              {/* Subtle Trust Indicators */}
              <div className="pt-8 border-t border-sage-200/80 grid grid-cols-3 gap-6 max-w-xl">
                <div>
                  <div className="text-2xl font-bold text-slate-muted">
                    {cms('public_hero_stat1_num', '98.4%')}
                  </div>
                  <div className="text-xs text-slate-soft mt-0.5">
                    {cms('public_hero_stat1_label', 'A* and A Grades in 2025 Series')}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-muted">
                    {cms('public_hero_stat2_num', '4024 & 9709')}
                  </div>
                  <div className="text-xs text-slate-soft mt-0.5">
                    {cms('public_hero_stat2_label', 'Strict CAIE Syllabus Alignment')}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-muted">
                    {cms('public_hero_stat3_num', '1-on-1 Feedback')}
                  </div>
                  <div className="text-xs text-slate-soft mt-0.5">
                    {cms('public_hero_stat3_label', 'Mark Scheme Step Annotation')}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Sophisticated Teacher Portrait & Mathematical Annotations */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full border border-sage-300/60 -z-10" />
                <div className="absolute -bottom-8 -right-8 w-44 h-44 rounded-3xl bg-sage-200/50 -z-10 rotate-6" />

                <div className="absolute -top-4 -right-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-sage-200 text-xs font-mono text-slate-muted z-20 flex items-center gap-2">
                  <span className="text-sage-700 font-bold">∫</span>
                  <span>f(x) dx = F(x) + C</span>
                </div>

                <div className="absolute -bottom-4 -left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-sage-200 text-xs font-mono text-slate-muted z-20 flex items-center gap-2">
                  <span className="text-sage-700 font-bold">e^(iπ) + 1 = 0</span>
                </div>

                <div className="relative rounded-3xl overflow-hidden bg-white border border-sage-300/80 subtle-paper-shadow p-3">
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-ivory-200 flex flex-col justify-end">
                    <img
                      src={cms('global_instructor_avatar_url') || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80'}
                      alt={cms('global_instructor_name', 'Ms. Eleanor Vance - Cambridge Mathematics Teacher')}
                      className="w-full h-full object-cover object-top"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent p-5 text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sage-300" />
                        <span className="text-xs uppercase tracking-wider font-semibold text-sage-200">
                          {cms('global_instructor_title', 'Cambridge O & A Levels Specialist')}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold tracking-tight text-white mt-1">
                        {cms('global_instructor_name', 'Ms. Eleanor Vance')}
                      </h3>
                      <p className="text-xs text-white/80 mt-0.5">
                        {cms('global_institution_bio', 'Pure & Applied Cambridge Mathematics Specialist')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: ABOUT THE TEACHER & PHILOSOPHY */}
      <section id="about" className="py-24 bg-white relative border-b border-sage-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-sage-100 text-slate-800">
              {cms('public_about_badge', 'Core Educational Philosophy')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-muted">
              {cms('public_about_title', 'Deep Conceptual Proofs Over Rote Formula Memorization')}
            </h2>
            <p className="text-base sm:text-lg text-slate-soft">
              {cms('public_about_subtitle', 'Cambridge examinations are engineered to penalize formulaic cramming and reward systematic, deductive mathematical insight.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-ivory-50 border border-sage-200/80 subtle-paper-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sage-200 flex items-center justify-center text-slate-muted">
                <BrainCircuit className="w-6 h-6 text-slate-muted" />
              </div>
              <h3 className="text-xl font-bold text-slate-muted">
                {cms('public_about_pillar1_title', 'First-Principles Conceptual Proofs')}
              </h3>
              <p className="text-sm text-slate-soft leading-relaxed">
                {cms('public_about_pillar1_desc', 'Every topic begins from foundational principles. Rather than rote drill, students learn why a method works, allowing them to tackle unfamiliar variant questions on exam day with composure.')}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-ivory-50 border border-sage-200/80 subtle-paper-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sage-200 flex items-center justify-center text-slate-muted">
                <FileCheck className="w-6 h-6 text-slate-muted" />
              </div>
              <h3 className="text-xl font-bold text-slate-muted">
                {cms('public_about_pillar2_title', 'Examiner Mark Scheme Precision')}
              </h3>
              <p className="text-sm text-slate-soft leading-relaxed">
                {cms('public_about_pillar2_desc', 'Cambridge examiners look for strict mathematical reasoning and standard notation. Students learn how marks are awarded, how to avoid algebraic slips, and how to pace multi-part questions under timed pressure.')}
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-ivory-50 border border-sage-200/80 subtle-paper-shadow space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sage-200 flex items-center justify-center text-slate-muted">
                <TrendingUp className="w-6 h-6 text-slate-muted" />
              </div>
              <h3 className="text-xl font-bold text-slate-muted">
                {cms('public_about_pillar3_title', 'Individual Step-by-Step Diagnostic')}
              </h3>
              <p className="text-sm text-slate-soft leading-relaxed">
                {cms('public_about_pillar3_desc', 'Weekly Quest problem sets and structured attendance tracking ensure no learning gaps go unnoticed. Each student receives detailed, written feedback highlighting both strengths and exact areas for revision.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION C: CLASSES & SUBJECTS OFFERED */}
      <section id="classes" className="py-24 bg-ivory-100 relative border-b border-sage-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-sage-200 text-slate-800">
                {cms('public_classes_badge', 'Official CAIE Syllabuses')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-muted mt-3">
                {cms('public_classes_title', 'Rigorous Modular Course Streams')}
              </h2>
              <p className="text-base text-slate-soft mt-2 max-w-xl">
                {cms('public_classes_subtitle', 'Structured academic cohorts strictly aligned with Cambridge Assessment International Education syllabuses for May/June and Oct/Nov exam series.')}
              </p>
            </div>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-muted hover:text-slate-900 group"
            >
              <span>{cms('public_classes_help_link_text', 'Have questions regarding syllabus paper combinations?')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((subject, idx) => {
              const icons = [Calculator, Sigma, Pi, Compass, BarChart2, Atom];
              const IconComponent = icons[idx % icons.length];

              return (
                <div
                  key={subject.id}
                  className="bg-white rounded-2xl border border-sage-200/90 p-7 flex flex-col justify-between subtle-hover-lift"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-sage-100 border border-sage-200 flex items-center justify-center text-slate-muted">
                        <IconComponent className="w-6 h-6 text-slate-muted" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-ivory-200 text-slate-soft border border-sage-200">
                        {subject.level}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-muted tracking-tight">{subject.name}</h3>
                      <p className="text-xs font-mono font-medium text-slate-light mt-1">
                        {subject.syllabusInfo}
                      </p>
                    </div>

                    <p className="text-sm text-slate-soft leading-relaxed">
                      {subject.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-sage-100 flex items-center justify-between">
                    <span className="text-xs text-slate-light font-medium">
                      {subject.scheduleInfo || 'Enrolling for 2026 series'}
                    </span>
                    <a
                      href="#contact"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-muted hover:text-slate-900 bg-sage-100 hover:bg-sage-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <span>{cms('public_classes_btn_enquire', 'Inquire for Placement')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION D: LEARNING APPROACH (4-STEP METHODOLOGY) */}
      <section id="approach" className="py-24 bg-white relative border-b border-sage-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <span className="text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-sage-100 text-slate-800">
              {cms('public_approach_badge', 'The 4-Stage Mastery Framework')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-muted">
              {cms('public_approach_title', 'A Systematic Framework from Fundamentals to Examination Confidence')}
            </h2>
            <p className="text-base text-slate-soft">
              {cms('public_approach_subtitle', 'Engineered to deconstruct cognitive friction, solidify mathematical intuition, and guarantee repeatable speed under timed conditions.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-ivory-100 border border-sage-200 flex flex-col items-start space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sage-300 text-slate-900 font-bold flex items-center justify-center text-sm shadow-sm font-mono">
                01
              </div>
              <h4 className="text-lg font-bold text-slate-muted">
                {cms('public_approach_step1_title', 'Axiomatic Derivation')}
              </h4>
              <p className="text-xs text-slate-soft leading-relaxed">
                {cms('public_approach_step1_desc', 'Deconstruct theorems and algebraic relationships through visual proofs and interactive derivations before applying algorithmic formulae.')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-ivory-100 border border-sage-200 flex flex-col items-start space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sage-300 text-slate-900 font-bold flex items-center justify-center text-sm shadow-sm font-mono">
                02
              </div>
              <h4 className="text-lg font-bold text-slate-muted">
                {cms('public_approach_step2_title', 'Topical Past Paper Sprints')}
              </h4>
              <p className="text-xs text-slate-soft leading-relaxed">
                {cms('public_approach_step2_desc', 'Solve curated problem sets classified by CAIE examiner question typology, exposing common variant traps and subtle mark scheme criteria.')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-ivory-100 border border-sage-200 flex flex-col items-start space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sage-300 text-slate-900 font-bold flex items-center justify-center text-sm shadow-sm font-mono">
                03
              </div>
              <h4 className="text-lg font-bold text-slate-muted">
                {cms('public_approach_step3_title', 'Continuous Formative Quests')}
              </h4>
              <p className="text-xs text-slate-soft leading-relaxed">
                {cms('public_approach_step3_desc', 'Upload full working through the Candidate Portal for detailed line-by-line mark auditing, pinpointing algebraic slips and syntax deficiencies.')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-ivory-100 border border-sage-200 flex flex-col items-start space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sage-300 text-slate-900 font-bold flex items-center justify-center text-sm shadow-sm font-mono">
                04
              </div>
              <h4 className="text-lg font-bold text-slate-muted">
                {cms('public_approach_step4_title', 'Timed Mock Simulations')}
              </h4>
              <p className="text-xs text-slate-soft leading-relaxed">
                {cms('public_approach_step4_desc', 'Full-length CAIE mock examinations under strict timed conditions to build composure, pacing intuition, and error-check self-discipline.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION E: CALL TO ACTION */}
      <section className="py-20 bg-sage-200/50 relative border-b border-sage-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-800 px-3 py-1 bg-white rounded-full border border-sage-300 shadow-sm">
            {cms('public_cta_badge', 'Candidate Placement & Admissions')}
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-muted tracking-tight">
            {cms('public_cta_title', '“Your Cambridge A* Starts with Mathematical Precision.”')}
          </h2>

          <p className="text-base sm:text-lg text-slate-soft max-w-2xl mx-auto leading-relaxed">
            {cms('public_cta_subtitle', 'Secure your place in upcoming small-cohort seminars or individualized Cambridge examination preparation. Diagnostic assessment included upon enrollment.')}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-muted hover:bg-slate-900 text-white font-semibold text-base shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-muted cursor-pointer"
            >
              <span>{cms('public_cta_btn_primary', 'Schedule Academic Assessment')}</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-ivory-100 text-slate-muted font-semibold text-base border border-sage-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sage-400"
            >
              <UserCheck className="w-5 h-5 text-slate-soft" />
              <span>{cms('public_cta_btn_secondary', 'Access Candidate Workspace')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION F: CONTACT INFORMATION & INQUIRY FORM */}
      <ContactSection />

      {/* FOOTER */}
      <PublicFooter />
    </div>
  );
}
