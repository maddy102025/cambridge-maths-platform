'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subjectOfInterest: 'Mathematics — Cambridge O Level (4024)',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message. Please try again.');
      }

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subjectOfInterest: 'Mathematics — Cambridge O Level (4024)',
        message: '',
      });
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <section id="contact" className="py-24 bg-ivory-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Contact details & information */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="inline-block text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-sage-200 text-slate-800 mb-3">
                Get in Touch
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-muted">
                Begin Your Cambridge Mathematics Journey
              </h2>
              <p className="mt-4 text-base text-slate-soft leading-relaxed">
                Whether you have questions regarding batch schedules, syllabus requirements, diagnostic assessments, or one-on-one mentorship, please get in touch.
              </p>
            </div>

            <div className="space-y-6 bg-white p-8 rounded-2xl border border-sage-200 subtle-paper-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-slate-muted shrink-0">
                  <Mail className="w-5 h-5 text-slate-muted" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-muted">Direct Email</h4>
                  <p className="text-sm text-slate-soft mt-0.5">eleanor.vance@cambridgemaths.edu</p>
                  <p className="text-xs text-slate-light mt-0.5">Replies typically within 24 business hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-slate-muted shrink-0">
                  <Phone className="w-5 h-5 text-slate-muted" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-muted">Phone & WhatsApp Inquiries</h4>
                  <p className="text-sm text-slate-soft mt-0.5">+44 20 7946 0912 / WhatsApp Enabled</p>
                  <p className="text-xs text-slate-light mt-0.5">Monday to Friday, 9:00 AM – 6:00 PM GMT</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sage-100 flex items-center justify-center text-slate-muted shrink-0">
                  <MapPin className="w-5 h-5 text-slate-muted" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-muted">Class Locations</h4>
                  <p className="text-sm text-slate-soft mt-0.5">London Academy Center & Global Online Live Classroom</p>
                  <p className="text-xs text-slate-light mt-0.5">Interactive digital whiteboard & recorded sessions</p>
                </div>
              </div>

              <div className="pt-2 border-t border-sage-100 flex items-center gap-2 text-xs text-slate-soft">
                <Clock className="w-4 h-4 text-slate-light shrink-0" />
                <span>Next cohort enrollments open for May/June 2026 examination series.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Class Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-sage-200 subtle-paper-shadow">
            <h3 className="text-2xl font-bold text-slate-muted mb-2">Send an Inquiry</h3>
            <p className="text-sm text-slate-soft mb-8">
              Fill in your details below. We will provide curriculum details, batch availability, and intake diagnostic materials.
            </p>

            {status === 'success' && (
              <div className="mb-6 p-4 rounded-xl bg-sage-100 border border-sage-300 text-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sage-700 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold text-slate-900">Inquiry Received Successfully!</h5>
                  <p className="text-xs text-slate-soft mt-0.5">
                    Thank you for reaching out. Ms. Vance or our academic coordinator will reply to your email shortly.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold">Could not send inquiry</h5>
                  <p className="text-xs mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+44 7911 123456"
                    className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="subjectOfInterest" className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
                    Subject of Interest *
                  </label>
                  <select
                    id="subjectOfInterest"
                    name="subjectOfInterest"
                    value={formData.subjectOfInterest}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all"
                  >
                    <option value="Mathematics — Cambridge O Level (4024)">Mathematics — Cambridge O Level (4024)</option>
                    <option value="Additional Mathematics — O Level (4037)">Additional Mathematics — O Level (4037)</option>
                    <option value="Pure Mathematics — A Level (Papers 1, 2, 3)">Pure Mathematics — A Level (Papers 1, 2, 3)</option>
                    <option value="Mechanics — A Level (Paper 4)">Mechanics — A Level (Paper 4)</option>
                    <option value="Probability & Statistics — A Level">Probability & Statistics — A Level</option>
                    <option value="Further Mathematics (9231)">Further Mathematics (9231)</option>
                    <option value="General Curriculum Consultation">General Curriculum Consultation</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
                  Message / Academic Background *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about the student's current grade, target examination session, and specific topics needing support..."
                  className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-xs text-slate-light">
                  Protected by privacy terms. Your information is never shared.
                </p>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-sage-300 hover:bg-sage-400 disabled:opacity-60 text-slate-900 font-semibold text-sm rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-muted"
                >
                  {status === 'submitting' ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <span>Send Inquiry</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
