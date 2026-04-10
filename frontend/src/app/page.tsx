"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, UploadCloud, Sparkles, Copy, Check, X, Loader2, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ tailored_resume: string; cold_email: string } | null>(null);
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      if (selected.type === "application/pdf") {
        setFile(selected);
        toast.success("Resume attached successfully");
      } else {
        toast.error("Please upload a PDF file");
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  const handleGenerate = async () => {
    if (!file) {
      toast.error("Please upload your resume PDF");
      return;
    }
    if (!jd.trim()) {
      toast.error("Please provide the job description");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jd", jd);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8006/api/optimize";

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Optimization failed");
      }

      const data = await response.json();
      setResults(data);
      toast.success("Optimization complete!");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: "resume" | "email") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "resume") {
        setCopiedResume(true);
        setTimeout(() => setCopiedResume(false), 2000);
      } else {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      }
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy text");
    }
  };

  const downloadPDF = async () => {
    if (!results) return;
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      doc.setFont("helvetica");
      doc.setFontSize(11);

      const padding = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const textLines = doc.splitTextToSize(results.tailored_resume, pageWidth - padding * 2);

      doc.text(textLines, padding, 20);
      doc.save("tailored_resume.pdf");
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] relative overflow-hidden flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full point-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full point-events-none" />

      <motion.div
        className="max-w-5xl w-full z-10 flex flex-col gap-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-neutral-300">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI-Powered Optimization</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
            Perfect your pitch.
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Upload your resume, paste the job description, and let our model seamlessly tailor your experience and craft the ultimate cold email.
          </p>
        </motion.div>

        {!results ? (
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-neutral-200 font-semibold">1. Upload Resume (PDF)</Label>
                <div
                  {...getRootProps()}
                  className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all cursor-pointer bg-white/[0.02] backdrop-blur-md overflow-hidden ${isDragActive ? "border-blue-500 bg-blue-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                    }`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="flex flex-col items-center gap-3 relative z-10">
                      <div className="p-3 bg-blue-500/20 text-blue-400 rounded-full">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-neutral-200">{file.name}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mt-2"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 relative z-10 opacity-70">
                      <div className="p-3 bg-white/5 rounded-full ring-1 ring-white/10">
                        <UploadCloud className="w-6 h-6 text-neutral-300" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-neutral-200">Drag & drop your PDF here</p>
                        <p className="text-xs text-neutral-500 mt-1">or click to browse</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 flex flex-col">
              <div className="space-y-2 flex-grow flex flex-col">
                <Label className="text-neutral-200 font-semibold">2. Job Description</Label>
                <Textarea
                  placeholder="Paste the target job description here..."
                  className="flex-grow min-h-[200px] resize-none bg-white/[0.02] border-white/10 text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-blue-500/50 rounded-xl"
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-center mt-4">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full sm:w-auto px-8 relative overflow-hidden group bg-white text-black hover:bg-neutral-200 rounded-full h-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    Generate Action Plan
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid md:grid-cols-2 gap-6 w-full"
          >
            {/* Tailored Resume Configurator */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl h-[600px]">
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <h3 className="font-semibold text-neutral-200">Tailored Resume</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(results.tailored_resume, "resume")}
                    className="h-8 text-neutral-400 hover:text-white hover:bg-white/10"
                  >
                    {copiedResume ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadPDF}
                    className="h-8 text-blue-400 hover:text-blue-300 hover:bg-white/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1 p-6">
                <div className="whitespace-pre-wrap text-sm text-neutral-300 font-mono leading-relaxed">
                  {results.tailored_resume}
                </div>
              </ScrollArea>
            </div>

            {/* Cold Email Configurator */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl h-[600px]">
              <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <h3 className="font-semibold text-neutral-200">Cold Email Strategy</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(results.cold_email, "email")}
                  className="h-8 text-neutral-400 hover:text-white hover:bg-white/10"
                >
                  {copiedEmail ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy
                </Button>
              </div>
              <ScrollArea className="flex-1 p-6">
                <div className="whitespace-pre-wrap text-sm text-neutral-300 font-sans leading-relaxed text-lg">
                  {results.cold_email}
                </div>
              </ScrollArea>
            </div>

            <div className="md:col-span-2 flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setResults(null);
                  setFile(null);
                  setJd("");
                }}
                className="rounded-full border-white/10 bg-transparent text-neutral-300 hover:bg-white/5 hover:text-white"
              >
                Start Over
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
