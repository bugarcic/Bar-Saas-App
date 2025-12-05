'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../lib/supabaseClient';
import AuthPanel from '../components/auth/AuthPanel';
import AppHeader from '../components/AppHeader';

export default function LandingPage() {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push('/application');
      } else {
        setIsCheckingSession(false);
      }
    });
  }, [router]);

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-white" />
      </main>
    );
  }

  if (showAuth) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-navy">
        <div className="absolute inset-0 bg-gradient-to-b from-navy via-slate-900 to-navy" />
        
        {/* Header */}
        <div className="relative z-10">
          <AppHeader onBackClick={() => setShowAuth(false)} />
        </div>

        {/* Auth Panel */}
        <div className="relative z-10 flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-12">
          <AuthPanel />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-navy font-sans text-slate-300 selection:bg-orange selection:text-white">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-6 lg:px-12 bg-navy/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <img src="/assets/admit_logo.png" alt="Admit" className="h-10 w-auto" />
        </div>
        <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowAuth(true)}
              className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Client Login
            </button>
            <button
              onClick={() => setShowAuth(true)}
              className="rounded-none border border-white/20 bg-white/5 px-6 py-2 text-sm font-medium text-white hover:bg-white hover:text-navy transition-all duration-300"
            >
              Get Started
            </button>
        </div>
      </nav>

      {/* 1. Hero Section: Asymmetrical Split */}
      <section className="relative pt-32 lg:pt-48 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-20 pointer-events-none select-none">
            <img src="/assets/ny_seal.svg" alt="NY Seal" className="w-[600px] h-[600px]" />
        </div>
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            
            {/* Left: Copy */}
            <div className="lg:col-span-7 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange/30 bg-orange/10 text-orange text-xs font-bold uppercase tracking-widest mb-8">
                <span className="w-2 h-2 rounded-full bg-orange animate-pulse"></span>
                NY Bar Compliance
              </div>
              
              <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl font-medium text-white leading-[0.95] tracking-tight mb-8">
                Precision <br />
                <span className="text-slate-500">meet</span> Process.
              </h1>
              
              <p className="text-lg text-slate-400 leading-relaxed max-w-xl mb-10 border-l-2 border-orange/50 pl-6">
                Admit replaces the chaotic spreadsheet-and-email shuffle with a secure, intelligent platform designed specifically for the New York Bar admission process.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={() => setShowAuth(true)}
                  className="group relative px-8 py-4 bg-orange text-white font-bold overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative">Start Application</span>
                </button>
                <button
                  onClick={() => setShowAuth(true)}
                  className="group px-8 py-4 border border-slate-700 text-white font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <span>View Demo</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right: Visual Abstract */}
            <div className="lg:col-span-5 relative perspective-1000">
               {/* Glow effect */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-orange/5 blur-[100px] rounded-full pointer-events-none"></div>
               
               {/* Main Interface Container */}
               <div className="relative transform lg:rotate-y-[-10deg] lg:rotate-x-[5deg] transition-transform duration-700 ease-out hover:rotate-y-0 hover:rotate-x-0 preserve-3d">
                  
                  {/* Backdrop Layers (Depth) */}
                  <div className="absolute inset-0 bg-slate-800/30 rounded-2xl transform translate-z-[-40px] translate-x-4 translate-y-4 border border-white/5"></div>
                  
                  {/* Main Digital Dossier Card */}
                  <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                     
                     {/* Window Header */}
                     <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-950/50">
                        <div className="flex gap-2">
                           <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                           <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                           <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                        <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-900 border border-slate-800">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                           <span className="text-[10px] font-sans text-slate-400 font-medium tracking-wide">Applicant Portal</span>
                        </div>
                     </div>

                     {/* Content Body */}
                     <div className="p-6 space-y-6">
                        
                        {/* Header Section */}
                        <div className="flex items-start justify-between">
                           <div className="space-y-1">
                              <div className="text-[10px] text-orange font-bold uppercase tracking-widest">Application Status</div>
                              <div className="text-xl font-serif text-white">Ready for Submission</div>
                              <div className="text-xs text-slate-500">Last updated: Just now</div>
                           </div>
                           {/* Circular Progress */}
                           <div className="relative w-14 h-14 flex items-center justify-center">
                              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                 <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#1e293b" strokeWidth="3" />
                                 <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray="98, 100" />
                              </svg>
                              <div className="absolute text-xs font-bold text-white">98%</div>
                           </div>
                        </div>

                        {/* Checklist Items */}
                        <div className="space-y-3">
                           {[
                              { label: "Personal Questionnaire", status: "Complete", color: "text-green-500", bg: "bg-green-500/10" },
                              { label: "Employment Affidavits", status: "5/5 Signed", color: "text-green-500", bg: "bg-green-500/10" },
                              { label: "Character References", status: "Pending Review", color: "text-orange", bg: "bg-orange/10" },
                              { label: "Pro Bono Compliance", status: "Verified", color: "text-blue-400", bg: "bg-blue-500/10" }
                           ].map((item, i) => (
                              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors group cursor-default">
                                 <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${item.color === 'text-orange' ? 'bg-orange' : item.color === 'text-blue-400' ? 'bg-blue-400' : 'bg-green-500'}`}></div>
                                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                                 </div>
                                 <span className={`text-[10px] font-bold px-2 py-1 rounded ${item.bg} ${item.color}`}>
                                    {item.status}
                                 </span>
                              </div>
                           ))}
                        </div>

                        {/* Footer Info */}
                        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Target Dept</span>
                              <span className="text-sm font-serif text-white">Appellate Div. 2nd Dept.</span>
                           </div>
                           <div className="h-8 w-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                           </div>
                        </div>

                     </div>
                  </div>

                  {/* Floating Badge - 3D Element */}
                  <div className="absolute -right-6 top-20 bg-slate-800/90 backdrop-blur-md p-3 rounded-lg border border-slate-700 shadow-xl transform translate-z-10 lg:translate-x-8">
                     <div className="flex items-center gap-3">
                        <div className="bg-green-500/20 p-1.5 rounded text-green-500">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                           <div className="text-[10px] text-slate-400 uppercase font-bold">Validation</div>
                           <div className="text-xs font-bold text-white">Passed</div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Trust Strip - Minimalist */}
      <div className="border-y border-slate-800 bg-navy">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <span className="text-xs font-sans font-medium text-slate-500 uppercase tracking-wider">Trusted by incoming associates at</span>
            <div className="flex items-center gap-12 grayscale opacity-50">
                 <img src="/assets/latham.png" alt="Latham" className="h-6 w-auto invert" />
                 <img src="/assets/davis.png" alt="Davis Polk" className="h-8 w-auto invert" />
            </div>
        </div>
      </div>

      {/* 3. The Bento Grid (Features) */}
      <section className="bg-paper py-20 text-navy relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ 
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230F172A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
             }}
        />

        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 relative z-10">
          
          <div className="max-w-2xl mb-12">
            <h2 className="font-serif text-5xl font-medium mb-4">The Intelligent Way to Admit.</h2>
            <p className="text-lg text-slate-600">
                We've deconstructed the 50+ page admission questionnaire into a smart, linear workflow. 
                No more missing attachments. No more formatting nightmares.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            
            {/* Large Card - Firm Oversight */}
            <div className="md:col-span-2 row-span-2 rounded-2xl bg-slate-100 p-0 flex flex-col relative overflow-hidden shadow-sm">
                <div className="p-10 relative z-10 bg-gradient-to-b from-white via-white to-transparent">
                    <div className="w-12 h-12 bg-navy text-white flex items-center justify-center rounded-xl mb-6 shadow-lg shadow-navy/20">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <h3 className="font-serif text-3xl mb-4 text-navy">Firm-Wide Oversight</h3>
                    <p className="text-slate-600 max-w-md leading-relaxed">
                        Empower your Professional Development teams with real-time visibility. Track every associate's progress, identify bottlenecks instantly, and eliminate hundreds of billable hours spent on administrative follow-ups.
                    </p>
                </div>
                
                {/* Redesigned Dashboard Visual */}
                <div className="absolute right-0 bottom-0 left-0 h-[240px] bg-slate-50 px-8 pt-8">
                    <div className="w-full h-full bg-white rounded-t-xl shadow-sm border-x border-t border-slate-200 overflow-hidden">
                        {/* Dashboard Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                            <div className="flex items-center gap-3">
                                <div className="font-serif font-medium text-navy">Associate Tracker</div>
                                <div className="h-4 w-px bg-slate-200"></div>
                                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Class of 2025</div>
                            </div>
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                                <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                                <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">+4</div>
                            </div>
                        </div>
                        
                        {/* Dashboard Rows */}
                        <div className="divide-y divide-slate-50">
                            {[
                                { name: "Jensen, A.", dept: "Litigation", status: "Pending Signature", color: "orange" },
                                { name: "Ross, M.", dept: "Corporate", status: "Ready for Review", color: "green" },
                                { name: "Specter, H.", dept: "Litigation", status: "Processing", color: "blue" }
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between px-6 py-3 transition-colors cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full bg-${row.color === 'blue' ? 'blue-500' : row.color === 'green' ? 'green-500' : 'orange'}`}></div>
                                        <div>
                                            <div className="text-sm font-medium text-navy">{row.name}</div>
                                            <div className="text-[10px] text-slate-400 uppercase tracking-wider">{row.dept}</div>
                                        </div>
                                    </div>
                                    <div className={`text-xs font-medium px-2 py-1 rounded-md
                                        ${row.color === 'green' ? 'bg-green-50 text-green-700' : 
                                          row.color === 'blue' ? 'bg-blue-50 text-blue-700' : 
                                          'bg-orange/10 text-orange'}`}>
                                        {row.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tall Card - Vault Security */}
            <div className="md:col-span-1 row-span-2 rounded-2xl bg-navy p-0 flex flex-col text-white relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                
                <div className="p-8 relative z-10">
                    <div className="w-12 h-12 bg-orange flex items-center justify-center rounded-xl mb-6 shadow-lg shadow-orange/20">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <h3 className="font-serif text-3xl mb-4">Vault Security</h3>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Bank-grade encryption for all data at rest. Your career history is sensitive; we treat it that way.
                    </p>
                </div>

                <div className="mt-auto bg-slate-900/50 backdrop-blur-sm border-t border-slate-800 p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded bg-slate-800 text-slate-400 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <div className="text-sm font-medium text-slate-300">SOC 2 Type II</div>
                            </div>
                            <div className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">PENDING</div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded bg-slate-800 text-slate-400 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                                </div>
                                <div className="text-sm font-medium text-slate-300">AES-256</div>
                            </div>
                            <div className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">ACTIVE</div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded bg-slate-800 text-slate-400 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                </div>
                                <div className="text-sm font-medium text-slate-300">Audit Logs</div>
                            </div>
                            <div className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">LIVE</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wide Card */}
            <div className="md:col-span-3 rounded-2xl bg-orange/5 border border-orange/10 p-8 flex flex-col sm:flex-row items-center gap-10 shadow-sm">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="font-serif text-3xl text-navy">Notarization & Tracking</h3>
                        <div className="h-6 w-px bg-slate-300"></div>
                        <img src="/assets/notarize_logo.png" alt="Notarize" className="h-5 w-auto opacity-80" />
                    </div>
                    <p className="text-slate-600">
                        Integrated with third-party remote notarization services. We track every signature, handle the follow-ups, and verify completion instantly.
                    </p>
                </div>
                <div className="flex-1 flex gap-4 w-full">
                     <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                        <div className="mb-2 rounded-full bg-slate-100 p-2 text-slate-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <div className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">Sent</div>
                        <div className="text-3xl font-sans font-bold text-navy">14</div>
                     </div>
                     <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                        <div className="mb-2 rounded-full bg-green-50 p-2 text-green-600">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">Signed</div>
                        <div className="text-3xl font-sans font-bold text-green-600">12</div>
                     </div>
                     <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                        <div className="mb-2 rounded-full bg-orange/10 p-2 text-orange">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div className="text-xs font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">Pending</div>
                        <div className="text-3xl font-sans font-bold text-orange">2</div>
                     </div>
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Process Section */}
      <section className="bg-navy py-32 border-t border-slate-800 relative">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            
            {/* Header */}
            <div className="max-w-3xl mb-24">
                <div className="text-orange font-bold uppercase tracking-widest text-sm mb-6">
                    The Roadmap
                </div>
                <h2 className="font-serif text-5xl md:text-7xl text-white mb-8 leading-tight">
                    From Offer to Oath.
                </h2>
                <p className="text-slate-400 text-xl leading-relaxed max-w-2xl">
                    The timeline for admission can be months long. Admit turns a chaotic paper trail into a linear, automated path.
                </p>
            </div>

            {/* Steps Grid */}
            <div className="grid md:grid-cols-3 gap-12 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-orange via-slate-700 to-slate-800"></div>

                {[
                    { 
                        id: "01", 
                        title: "Import & Auto-Fill", 
                        desc: "Upload your resume and we'll pre-populate your employment history. No manual data entry required."
                    },
                    { 
                        id: "02", 
                        title: "Smart Collection", 
                        desc: "We generate personalized digital forms for every employer and character reference, tracking their status in real-time."
                    },
                    { 
                        id: "03", 
                        title: "Review & Export", 
                        desc: "One click generates the official PDF package, perfectly formatted for AD1, AD2, AD3, or AD4."
                    }
                ].map((step) => (
                    <div key={step.id} className="relative pt-12 group">
                        {/* Mobile Line */}
                        <div className="md:hidden absolute top-0 left-0 w-16 h-px bg-orange mb-8"></div>
                        
                        {/* Number */}
                        <div className="font-serif text-6xl text-slate-700 group-hover:text-orange transition-colors duration-500 mb-6">
                            {step.id}
                        </div>
                        
                        {/* Content */}
                        <h3 className="text-2xl text-white font-medium mb-4">{step.title}</h3>
                        <p className="text-slate-400 text-base leading-relaxed">
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>

            {/* The Result / Time Saved */}
            <div className="mt-32 border border-slate-800 bg-slate-900/50 p-8 md:p-12 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                    <h4 className="text-white text-2xl font-serif mb-2">The Admit Advantage</h4>
                    <p className="text-slate-400">Consistent, error-free applications for your entire class.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="h-16 w-px bg-slate-800 hidden md:block"></div>
                    <div className="text-center md:text-left">
                        <div className="text-4xl md:text-5xl font-bold text-white font-serif">40+ Hours</div>
                        <div className="text-orange text-sm font-bold uppercase tracking-widest mt-2">Saved Per Associate</div>
                    </div>
                </div>
            </div>

        </div>
      </section>

      {/* 5. Minimal Footer */}
      <footer className="bg-navy border-t border-slate-800/50 pt-20 pb-10 px-6 lg:px-12">
        <div className="mx-auto max-w-[1400px] flex flex-col md:flex-row justify-between items-end gap-10">
           <div>
              <img src="/assets/admit_logo.png" alt="Admit" className="h-10 w-auto mb-6" />
              <p className="text-slate-500 text-sm max-w-xs">
                  The standard for New York Bar Admission compliance and workflow automation.
              </p>
           </div>
           <div className="flex gap-8 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <span className="text-slate-600">© 2025 Admit</span>
           </div>
        </div>
      </footer>
    </main>
  );
}
