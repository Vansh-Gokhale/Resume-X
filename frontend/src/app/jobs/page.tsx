"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  UploadCloud,
  MapPin,
  X,
  Loader2,
  Search,
  ExternalLink,
  Clock,
  Building2,
  Briefcase,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { toast } from "sonner";

/* ───────── Types ───────── */

interface CandidateProfile {
  name: string;
  top_skills: string[];
  experience_level: string;
  suggested_title: string;
}

interface Job {
  title: string;
  company: string;
  location: string;
  type: string;
  salary_range: string;
  description: string;
  requirements: string[];
  match_score: number;
  match_reason: string;
  posted_days_ago: number;
  linkedin_search_url: string;
}

interface SearchResults {
  candidate_profile: CandidateProfile;
  jobs: Job[];
}

/* ───────── Animations ───────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

/* ───────── Helpers ───────── */

function getScoreColor(score: number) {
  if (score >= 85)
    return {
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
    };
  if (score >= 70)
    return {
      bg: "bg-blue-500/20",
      text: "text-blue-400",
      border: "border-blue-500/30",
    };
  if (score >= 60)
    return {
      bg: "bg-amber-500/20",
      text: "text-amber-400",
      border: "border-amber-500/30",
    };
  return {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
  };
}

/* ───────── Page ───────── */

export default function JobsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [expandedJob, setExpandedJob] = useState<number | null>(null);

  /* Dropzone */
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

  /* Search handler */
  const handleSearch = async () => {
    if (!file) {
      toast.error("Please upload your resume PDF");
      return;
    }
    if (!location.trim()) {
      toast.error("Please enter your preferred job location");
      return;
    }

    setLoading(true);
    setResults(null);
    setExpandedJob(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("location", location);

      const apiUrl = "http://localhost:8006/api/search-jobs";

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Job search failed");
      }

      const data: SearchResults = await response.json();
      setResults(data);
      toast.success(`Found ${data.jobs?.length || 0} matching jobs!`);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* ─── Render ─── */
  return (
    <AuroraBackground className="py-12 px-4 sm:px-6 lg:px-8">

      <motion.div
        className="max-w-6xl w-full z-10 flex flex-col gap-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ─── Hero ─── */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-neutral-300">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>AI-Powered Job Matching</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
            Find your perfect match.
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Upload your resume and preferred location — our AI analyzes your
            skills and experience to surface the most relevant job opportunities
            on LinkedIn.
          </p>
        </motion.div>

        {/* ─── Search Form ─── */}
        {!results ? (
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Resume Upload */}
              <div className="space-y-2">
                <Label className="text-neutral-200 font-semibold">
                  1. Upload Resume (PDF)
                </Label>
                <div
                  {...getRootProps()}
                  className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all cursor-pointer bg-white/[0.02] backdrop-blur-md overflow-hidden min-h-[180px] ${
                    isDragActive
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div className="flex flex-col items-center gap-3 relative z-10">
                      <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-full">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-medium text-neutral-200">
                        {file.name}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 mt-1"
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
                        <p className="text-sm font-medium text-neutral-200">
                          Drag &amp; drop your PDF here
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          or click to browse
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Input */}
              <div className="space-y-2">
                <Label className="text-neutral-200 font-semibold">
                  2. Preferred Location
                </Label>
                <div className="space-y-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <Input
                      placeholder="e.g. San Francisco, Remote, London, Bangalore..."
                      className="pl-10 h-12 bg-white/[0.02] border-white/10 text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-emerald-500/50 rounded-xl"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500">
                    Enter a city, country, or &ldquo;Remote&rdquo; to find
                    matching opportunities
                  </p>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleSearch}
                disabled={loading}
                className="w-full sm:w-auto px-10 relative overflow-hidden group bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white rounded-full h-12 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing &amp; Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search Matching Jobs
                  </>
                )}
              </Button>
            </div>

            {/* Loading State */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-3">
                    <p className="text-neutral-400 text-sm">
                      Our AI is analyzing your resume and searching for the best
                      matches…
                    </p>
                    <div className="flex justify-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-emerald-500"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Skeleton Cards */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4 animate-pulse"
                      >
                        <div className="flex justify-between">
                          <div className="space-y-2">
                            <div className="h-5 w-48 bg-white/[0.06] rounded" />
                            <div className="h-4 w-32 bg-white/[0.06] rounded" />
                          </div>
                          <div className="h-11 w-11 bg-white/[0.06] rounded-full" />
                        </div>
                        <div className="h-3 w-full bg-white/[0.06] rounded" />
                        <div className="h-3 w-3/4 bg-white/[0.06] rounded" />
                        <div className="flex gap-2">
                          <div className="h-6 w-20 bg-white/[0.06] rounded-full" />
                          <div className="h-6 w-24 bg-white/[0.06] rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* ─── Results ─── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Candidate Profile Summary */}
            {results.candidate_profile && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 rounded-full">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {results.candidate_profile.name || "Your Profile"}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      {results.candidate_profile.experience_level} · Best match:{" "}
                      <span className="text-emerald-400 font-medium">
                        {results.candidate_profile.suggested_title}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.candidate_profile.top_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.06] border border-white/10 text-neutral-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-white">
                <Sparkles className="w-5 h-5 inline-block text-emerald-400 mr-2 -mt-1" />
                {results.jobs.length} Jobs Found
                <span className="text-neutral-500 font-normal text-lg ml-2">
                  in {location}
                </span>
              </h2>
              <Button
                variant="outline"
                onClick={() => {
                  setResults(null);
                  setExpandedJob(null);
                }}
                className="rounded-full border-white/10 bg-transparent text-neutral-300 hover:bg-white/5 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                New Search
              </Button>
            </div>

            {/* Job Cards Grid */}
            <motion.div
              className="grid md:grid-cols-2 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {results.jobs.map((job, index) => {
                const scoreColor = getScoreColor(job.match_score);
                const isExpanded = expandedJob === index;

                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    layout
                    className={`group rounded-2xl border bg-white/[0.02] backdrop-blur-xl overflow-hidden transition-all duration-300 hover:bg-white/[0.04] ${
                      isExpanded
                        ? "border-white/20 shadow-xl shadow-white/[0.02]"
                        : "border-white/[0.06] hover:border-white/15"
                    }`}
                  >
                    <div className="p-5 space-y-4">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-white truncate">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{job.company}</span>
                          </div>
                        </div>
                        <div
                          className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${scoreColor.bg} border ${scoreColor.border}`}
                        >
                          <span
                            className={`text-sm font-bold ${scoreColor.text}`}
                          >
                            {job.match_score}%
                          </span>
                        </div>
                      </div>

                      {/* Meta Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] text-neutral-300">
                          <MapPin className="w-3 h-3" /> {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] text-neutral-300">
                          <Briefcase className="w-3 h-3" /> {job.type}
                        </span>
                        {job.salary_range && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <DollarSign className="w-3 h-3" />{" "}
                            {job.salary_range}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.06] text-neutral-500">
                          <Clock className="w-3 h-3" /> {job.posted_days_ago}d
                          ago
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2">
                        {job.description}
                      </p>

                      {/* Match Reason */}
                      <div
                        className={`text-xs px-3 py-2 rounded-lg ${scoreColor.bg} border ${scoreColor.border}`}
                      >
                        <span className={`font-medium ${scoreColor.text}`}>
                          Why it matches:{" "}
                        </span>
                        <span className="text-neutral-300">
                          {job.match_reason}
                        </span>
                      </div>

                      {/* Expanded — Requirements */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-2 space-y-2">
                              <p className="text-xs font-medium text-neutral-300">
                                Requirements:
                              </p>
                              <ul className="space-y-1.5">
                                {job.requirements.map((req, i) => (
                                  <li
                                    key={i}
                                    className="text-xs text-neutral-400 flex items-start gap-2"
                                  >
                                    <span className="w-1 h-1 rounded-full bg-neutral-500 mt-1.5 flex-shrink-0" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={job.linkedin_search_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                        >
                          <Button
                            size="sm"
                            className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg h-9 text-xs font-medium transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                            Apply on LinkedIn
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedJob(isExpanded ? null : index)
                          }
                          className="h-9 px-3 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AuroraBackground>
  );
}
