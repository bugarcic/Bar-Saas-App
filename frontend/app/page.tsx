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
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-white" />
      </main>
    );
  }

  if (showAuth) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-950">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

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
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle gradient orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-slate-800/30 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-slate-700/20 blur-3xl" />

      {/* Header */}
      <div className="relative z-10">
        <AppHeader showAuth onLoginClick={() => setShowAuth(true)} />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-32 lg:px-12 lg:pt-28">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-sm font-medium text-slate-300">NY Bar Admission Made Simple</span>
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Complete Your NY Bar Application{' '}
            <span className="text-slate-400">
              Without the Confusion
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
            BarSaas guides you through every form, every affidavit, and every requirement for all four 
            NY Appellate Divisions. Auto-fill your PDFs, track your progress, and submit with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => setShowAuth(true)}
              className="rounded-lg bg-white px-8 py-4 text-base font-semibold text-slate-950 shadow-lg transition-all hover:bg-slate-100"
            >
              Start Your Application →
            </button>
            <button
              onClick={() => setShowAuth(true)}
              className="rounded-lg border border-slate-700 bg-slate-800/50 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-slate-600 hover:bg-slate-800"
            >
              Sign In to Continue
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="Smart Form Filling"
            description="Enter your information once. We auto-populate the official questionnaire and all supporting forms."
          />
          <FeatureCard
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            title="Progress Tracking"
            description="Never lose your place. Auto-save keeps your work safe, and our checklist shows exactly what's left."
          />
          <FeatureCard
            icon={
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            title="PDF Generation"
            description="Generate court-ready PDFs for the questionnaire and all required affidavits with a single click. Perfectly formatted every time."
          />
        </div>

        {/* Trust indicators */}
        <div className="mt-20 flex flex-col items-center">
          <p className="text-sm text-slate-500">Trusted by associates at</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <img 
              src="/assets/kingWolack.png" 
              alt="King & Wolack" 
              className="h-36 w-auto opacity-80 grayscale brightness-[5] contrast-150"
            />
            <img 
              src="/assets/latham.png" 
              alt="Latham & Watkins" 
              className="h-6 w-auto opacity-80 grayscale brightness-[5] contrast-150"
            />
            <img 
              src="/assets/davis.png" 
              alt="Davis Polk" 
              className="h-8 w-auto opacity-60 grayscale brightness-[3] contrast-125"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 px-6 py-8 lg:px-12">
        <div className="mx-auto max-w-5xl flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-white text-slate-950">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm text-slate-500">BarSaas © 2025</span>
          </div>
          <p className="text-xs text-slate-600">
            Not affiliated with the NY State Board of Law Examiners
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm transition-all hover:border-slate-700 hover:bg-slate-900/80">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-white">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
