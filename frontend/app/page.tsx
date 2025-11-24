'use client';

import React from 'react';
import AuthPanel from '../components/auth/AuthPanel';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <AuthPanel />
    </main>
  );
}

