'use client';

import React from 'react';
import { 
  HiOutlineCheckCircle, 
  HiOutlineDocumentText, 
  HiOutlineClipboardCheck, 
  HiOutlineDownload,
  HiOutlineMail,
  HiOutlineVideoCamera
} from 'react-icons/hi';

export default function Group0Overview() {
  return (
    <div className="space-y-8 text-slate-300">
      <div className="rounded-lg bg-slate-800/50 p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Welcome to the New York Bar Admission Application</h3>
        <p className="mb-4">
          This tool is designed to guide you through the complex process of applying for admission to the New York State Bar. 
          It breaks down the requirements into manageable sections, auto-fills repetitive information, and generates the official PDF forms for you.
        </p>
        <p>
          Your progress is saved automatically as you go. You can return at any time to continue where you left off.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3 mb-3 text-white font-medium">
            <HiOutlineDocumentText className="h-6 w-6 text-blue-400" />
            <h4>1. Basic Information</h4>
          </div>
          <p className="text-sm text-slate-400">
            Complete the standard questionnaire sections (Identity, Education, Employment, etc.). 
            This information populates the main Application Questionnaire and helps pre-fill other forms.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3 mb-3 text-white font-medium">
            <HiOutlineClipboardCheck className="h-6 w-6 text-green-400" />
            <h4>2. Supporting Documents</h4>
          </div>
          <p className="text-sm text-slate-400">
            Manage your required affidavits (Good Moral Character, Employment, Pro Bono, Skills Competency). 
            Enter the details once, and we'll generate the specific PDF forms for each affirmant to sign.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3 mb-3 text-white font-medium">
            <HiOutlineCheckCircle className="h-6 w-6 text-purple-400" />
            <h4>3. Review & Export</h4>
          </div>
          <p className="text-sm text-slate-400">
            Review your completion status and download all generated PDFs in one place. 
            We'll provide instructions on how to assemble and submit your final packet to your specific Judicial Department.
          </p>
        </div>
        
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
           <div className="flex items-center gap-3 mb-3 text-white font-medium">
            <HiOutlineDownload className="h-6 w-6 text-amber-400" />
            <h4>Auto-Save & Resume</h4>
          </div>
          <p className="text-sm text-slate-400">
            Your session is tied to your account. All data is securely stored, allowing you to complete the application over multiple sessions.
          </p>
        </div>

        {/* New Section: Affirmant Automation */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3 mb-3 text-white font-medium">
            <HiOutlineMail className="h-6 w-6 text-pink-400" />
            <h4>Automated Affirmant Emails</h4>
          </div>
          <p className="text-sm text-slate-400">
            (Coming Soon) We can automatically email the generated PDF forms to your affirmants (Employers, Character References, etc.) 
            with instructions on how to sign and return them to you.
          </p>
        </div>

        {/* New Section: Remote Notarization */}
        <div className="rounded-lg border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-3 mb-3 text-white font-medium">
            <HiOutlineVideoCamera className="h-6 w-6 text-cyan-400" />
            <h4>Remote Notarization Integration</h4>
          </div>
          <p className="text-sm text-slate-400">
            (Coming Soon) Schedule a remote online notarization appointment directly through our platform via Notarize. 
            This allows you to get your affidavits sworn and signed from the comfort of your home.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-blue-900/50 bg-blue-900/10 p-4 text-sm text-blue-200">
        <p className="font-semibold mb-1">Important Note:</p>
        <p>
          Always verify the generated forms against the official instructions for your specific Department (1st, 2nd, 3rd, or 4th). 
          While this tool automates the form filling, you are responsible for the accuracy and completeness of your application.
        </p>
      </div>
    </div>
  );
}
