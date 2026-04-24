'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePdfUpload } from '@/hooks/usePdfUpload';
import { Upload, FileText, Loader2, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

export function ProfileInputForm() {
  const router = useRouter();
  const [profileText, setProfileText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [showJD, setShowJD] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { status: pdfStatus, uploadPdf, error: pdfError } = usePdfUpload();

  const handleSubmit = () => {
    if (!profileText.trim()) return;
    sessionStorage.setItem('profileText', profileText);
    sessionStorage.setItem('targetRole', targetRole);
    sessionStorage.setItem('jobDescription', jobDescription);
    router.push('/audit');
  };

  const handleFile = useCallback(
    async (file: File) => {
      const text = await uploadPdf(file);
      if (text) setProfileText(text);
    },
    [uploadPdf]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type === 'application/pdf') handleFile(file);
    },
    [handleFile]
  );

  const charCount = profileText.length;
  const isReady = profileText.trim().length > 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 w-full max-w-2xl mx-auto"
    >
      <Tabs defaultValue="paste">
        <TabsList className="w-full mb-6 bg-zinc-800">
          <TabsTrigger value="paste" className="flex-1">
            <FileText className="w-4 h-4 mr-2" />
            Paste Profile
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Upload PDF
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste">
          <div className="space-y-2">
            <Label className="text-zinc-400 text-sm">
              Paste your LinkedIn profile sections below
            </Label>
            <Textarea
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              placeholder={`Copy everything from your LinkedIn profile and paste it here:

HEADLINE: Senior Software Engineer | React, Node.js | Building products used by 10M+ users

ABOUT:
I've spent 8 years shipping products that...

EXPERIENCE:
Software Engineer @ Google (2020–Present)
• Led the redesign of...`}
              className="min-h-[240px] bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none font-mono text-sm"
            />
            <div className="flex justify-between text-xs text-zinc-600">
              <span>Include: Headline, About, Experience, Skills, Education</span>
              <span className={charCount > 100 ? 'text-green-500' : ''}>{charCount} chars</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pdf">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            {pdfStatus === 'uploading' ? (
              <div className="flex flex-col items-center gap-3 text-zinc-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span>Extracting profile text...</span>
              </div>
            ) : pdfStatus === 'done' ? (
              <div className="flex flex-col items-center gap-3 text-green-400">
                <FileText className="w-8 h-8" />
                <span>PDF parsed — {charCount.toLocaleString()} characters extracted</span>
                <span className="text-zinc-500 text-sm">Click to replace</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-zinc-500">
                <Upload className="w-8 h-8" />
                <div>
                  <p className="text-zinc-300 font-medium">Drop your LinkedIn PDF here</p>
                  <p className="text-sm mt-1">or click to browse</p>
                </div>
                <p className="text-xs text-zinc-600 max-w-xs">
                  Export: LinkedIn → Me → Settings → Data Privacy → Get a copy of your data
                </p>
              </div>
            )}
          </div>
          {pdfError && <p className="text-red-400 text-sm mt-2">{pdfError}</p>}
        </TabsContent>
      </Tabs>

      <div className="mt-5 space-y-3">
        <div>
          <Label className="text-zinc-400 text-sm mb-1.5 block">
            Target Role{' '}
            <span className="text-zinc-600">(optional — improves accuracy)</span>
          </Label>
          <Input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Product Manager at a Series B startup"
            className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
          />
        </div>

        {/* JD toggle */}
        <button
          type="button"
          onClick={() => setShowJD((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-full"
        >
          {showJD ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showJD ? 'Hide job description' : 'Paste a job description for exact keyword matching'}
          <span className="ml-1 text-blue-500 font-medium">Recommended ↑ accuracy</span>
        </button>

        {showJD && (
          <div>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here. ALEX will do exact keyword gap analysis between your profile and the JD..."
              className="min-h-[140px] bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 resize-none text-sm"
            />
            <p className="text-xs text-zinc-600 mt-1">
              {jobDescription.length} chars · ALEX will compare your Skills and Headline against the JD keywords
            </p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!isReady}
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Audit My Profile
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>

        {!isReady && profileText.length > 0 && (
          <p className="text-center text-zinc-600 text-xs">
            Add more profile content to get started ({100 - profileText.trim().length} more chars needed)
          </p>
        )}
      </div>
    </motion.div>
  );
}
