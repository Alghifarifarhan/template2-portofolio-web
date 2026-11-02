"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updatePassword,
  User 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useSiteData, cleanSiteData, normalizeNavLinks } from "@/context/SiteContext";
import { SiteData, ExperienceItem, ProjectItem, SECTION_TARGETS, DEFAULT_NAV_LINKS, WHAT_I_DO_ICONS } from "@/types/siteData";
import { formatDriveImageUrl } from "@/lib/driveUtils";
import Image from "next/image";
import Link from "next/link";

interface ThemeStyles {
  bgColor: string;
  textColor: string;
  accentColor: string;
  cardBgColor: string;
  cardBorderColor: string;
  cardTitleColor: string;
  cardTextColor: string;
}

// Reusable Image Field Component with Live Preview & Drive Instructions
function DriveImageInput({
  label,
  value,
  onChange,
  placeholder = "https://drive.google.com/file/d/...",
  recommendedSize,
  previewAspect = "square",
  themeStyles,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  recommendedSize?: string;
  previewAspect?: "square" | "landscape" | "logo";
  themeStyles?: ThemeStyles;
}) {
  const formattedUrl = value ? formatDriveImageUrl(value) : "";

  const containerStyle: React.CSSProperties = {
    backgroundColor: themeStyles?.cardBgColor || "rgba(255, 255, 255, 0.05)",
  };

  const labelStyle: React.CSSProperties = {
    color: themeStyles?.cardTitleColor || themeStyles?.textColor || "#d1d5db",
  };

  const badgeStyle: React.CSSProperties = {
    backgroundColor: themeStyles?.accentColor ? themeStyles.accentColor + "20" : "rgba(168, 85, 247, 0.1)",
    color: themeStyles?.accentColor || "#c084fc",
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: themeStyles?.bgColor || "rgba(0, 0, 0, 0.4)",
    color: themeStyles?.textColor || "#ffffff",
  };

  const helperTitleStyle: React.CSSProperties = {
    color: themeStyles?.accentColor || "#d8b4fe",
  };

  return (
    <div className="space-y-3 p-4 rounded-xl transition-colors" style={containerStyle}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <label className="block text-xs uppercase font-semibold tracking-wider" style={labelStyle}>
          {label}
        </label>
        {recommendedSize && (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded self-start sm:self-auto" style={badgeStyle}>
            {recommendedSize}
          </span>
        )}
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        className="w-full px-4 py-2.5 rounded-xl placeholder-gray-500 text-sm focus:outline-none transition-colors"
      />

      {/* Instructions Helper */}
      <div className="text-[11px] p-3 rounded-lg space-y-1" style={{ backgroundColor: themeStyles?.cardBgColor || "rgba(255,255,255,0.05)" }}>
        <p className="font-semibold flex items-center gap-1" style={helperTitleStyle}>
          💡 Cara Mengisi Link Google Drive:
        </p>
        <ol className="list-decimal list-inside space-y-0.5 opacity-80 pl-1" style={{ color: themeStyles?.cardTextColor || themeStyles?.textColor || "#9ca3af" }}>
          <li>Klik kanan file di Drive → Pilih <strong>Bagikan (Share)</strong>.</li>
          <li>Ubah Akses Umum ke <strong>Siapa saja yang memiliki link (Anyone with the link)</strong>.</li>
          <li>Klik <strong>Salin link (Copy link)</strong> lalu tempelkan pada kolom di atas.</li>
        </ol>
      </div>

      {/* Live Image Preview */}
      {formattedUrl ? (
        <div className="mt-2 p-3 rounded-xl space-y-2" style={{ backgroundColor: themeStyles?.bgColor || "rgba(0,0,0,0.5)" }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-green-400 flex items-center gap-1">
              <span>✓</span> Live Image Preview
            </span>
            <span className="text-[10px] opacity-70" style={{ color: themeStyles?.cardTextColor || themeStyles?.textColor || "#9ca3af" }}>Google Drive Direct Link</span>
          </div>

          <div
            className={`relative rounded-xl overflow-hidden flex items-center justify-center ${
              previewAspect === "logo"
                ? "h-12 w-44"
                : previewAspect === "landscape"
                ? "w-full h-48 rounded-2xl"
                : "w-28 h-28"
            }`}
            style={{ backgroundColor: themeStyles?.bgColor || "rgba(0,0,0,0.4)" }}
          >
            <Image
              src={formattedUrl}
              alt={label}
              fill
              sizes="300px"
              className={previewAspect === "landscape" ? "object-contain p-2 rounded-2xl" : "object-contain p-1"}
              unoptimized
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminPage() {
  const { siteData, stats, isRealtimeConnected, saveSiteData, broadcastLiveUpdate, cleanAllSampleData, resetStats } = useSiteData();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [liveSync, setLiveSync] = useState(true);

  // Clean White Refresh Flash State
  const [isReady, setIsReady] = useState(false);

  // Clean sample data modal state
  const [showCleanModal, setShowCleanModal] = useState(false);
  const [cleanSubmitting, setCleanSubmitting] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [passwordMessage, setPasswordMessage] = useState("");

  // Form edit state (cloned from siteData)
  const [formData, setFormData] = useState<SiteData>(siteData);
  const [activeTab, setActiveTab] = useState<
    "stats" | "theme" | "header" | "banner" | "about" | "experience" | "projects" | "footer" | "database" | "security"
  >("stats");

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  // Database Backup / Import state
  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);
  const [importPendingData, setImportPendingData] = useState<SiteData | null>(null);
  const [importSubmitting, setImportSubmitting] = useState(false);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial clean white flash timer on page refresh / load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Sync form data when siteData finishes loading initially
  useEffect(() => {
    setFormData(siteData);
  }, [siteData]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Compute Active Theme colors dynamically
  const currentTheme = (user ? formData?.theme : siteData?.theme) || {
    bgColor: "#ffffff",
    textColor: "#000000",
    accentColor: "#a855f7",
    cardBgColor: "#ffffff",
    cardBorderColor: "#e5e7eb",
    cardTitleColor: "#000000",
    cardTextColor: "#374151",
  };

  const bgColor = currentTheme.bgColor || "#110720";
  const textColor = currentTheme.textColor || "#ffffff";
  const accentColor = currentTheme.accentColor || "#a855f7";
  const cardBgColor = currentTheme.cardBgColor || "#160b2b";
  const cardBorderColor = currentTheme.cardBorderColor || "#3b1f64";
  const cardTitleColor = currentTheme.cardTitleColor || "#ffffff";
  const cardTextColor = currentTheme.cardTextColor || "#d1d5db";

  const themeStyles: ThemeStyles = {
    bgColor,
    textColor,
    accentColor,
    cardBgColor,
    cardBorderColor,
    cardTitleColor,
    cardTextColor,
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    color: textColor,
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: cardBgColor,
    color: cardTextColor,
  };

  const primaryBtnStyle: React.CSSProperties = {
    backgroundColor: accentColor,
    color: "#ffffff",
  };

  const subHeadingStyle: React.CSSProperties = {
    color: accentColor,
  };

  const titleStyle: React.CSSProperties = {
    color: cardTitleColor,
  };

  const labelStyle: React.CSSProperties = {
    color: cardTitleColor,
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await signOut(auth);
  };

  // Clean all sample data handler
  const handleCleanSampleData = async () => {
    setCleanSubmitting(true);
    try {
      await cleanAllSampleData();
      setFormData({
        ...cleanSiteData,
        theme: { ...(formData.theme || siteData.theme) },
        isSampleCleaned: true,
      });
      setShowCleanModal(false);
      setSaveStatus("success");
      setSaveMessage("Semua data contoh bawaan berhasil dibersihkan! Website kini bersih dan siap diisi konten Anda.");
      setTimeout(() => setSaveStatus("idle"), 5000);
    } catch (err: any) {
      setSaveStatus("error");
      setSaveMessage(`Gagal membersihkan data contoh: ${err.message || "Unknown error"}`);
    } finally {
      setCleanSubmitting(false);
    }
  };

  // Save changes handler
  const handleSave = async () => {
    setSaveStatus("saving");
    setSaveMessage("Saving changes to Firestore...");
    try {
      const dataToSave: SiteData = {
        ...formData,
        isSampleCleaned: true,
      };
      await saveSiteData(dataToSave);
      setSaveStatus("success");
      setSaveMessage("All changes saved successfully!");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      setSaveStatus("error");
      setSaveMessage(`Failed to save: ${err.message || "Unknown error"}`);
    }
  };

  // Export database.json from Firestore / current state
  const handleExportDatabase = () => {
    try {
      const dataToExport = {
        _meta: {
          title: "Figma-Portfolio Cloud Firestore Database Backup",
          exportedAt: new Date().toISOString(),
          version: "1.0",
          schema: "portfolio_full_backup",
        },
        site_settings: {
          main: {
            ...formData,
            isSampleCleaned: true,
          },
        },
        site_stats: {
          metrics: stats || { totalVisits: 0, totalWrites: 0 },
        },
      };

      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "database.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setSaveStatus("success");
      setSaveMessage("File database.json berhasil di-download!");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch (err: any) {
      setSaveStatus("error");
      setSaveMessage(`Gagal mendownload database: ${err.message || "Unknown error"}`);
    }
  };

  // Handle selected JSON file for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input value so user can re-select the same file if needed
    e.target.value = "";
    setImportError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let targetData: any = null;

        if (parsed?.site_settings?.main) {
          targetData = parsed.site_settings.main;
        } else if (parsed?.theme || parsed?.banner || parsed?.header || parsed?.experiences || parsed?.projects) {
          targetData = parsed;
        }

        if (!targetData) {
          throw new Error("Format file JSON tidak valid. Pastikan file berisi data backup portfolio yang benar.");
        }

        const normalizedData: SiteData = {
          ...cleanSiteData,
          ...targetData,
          theme: { ...cleanSiteData.theme, ...(targetData.theme || {}) },
          header: {
            ...cleanSiteData.header,
            ...(targetData.header || {}),
            navLinks: normalizeNavLinks(targetData.header?.navLinks),
          },
          banner: { ...cleanSiteData.banner, ...(targetData.banner || {}) },
          about: { ...cleanSiteData.about, ...(targetData.about || {}) },
          footer: { ...cleanSiteData.footer, ...(targetData.footer || {}) },
          experienceTitle: targetData.experienceTitle !== undefined ? targetData.experienceTitle : "",
          experiences: Array.isArray(targetData.experiences) ? targetData.experiences : [],
          projects: Array.isArray(targetData.projects) ? targetData.projects : [],
          iframeUrl: targetData.iframeUrl || "",
          showIframe: targetData.showIframe !== undefined ? targetData.showIframe : false,
          isSampleCleaned: true,
        };

        setImportPendingData(normalizedData);
        setShowImportConfirmModal(true);
      } catch (err: any) {
        setImportError(err.message || "Gagal membaca file JSON. Pastikan format file valid.");
      }
    };
    reader.onerror = () => {
      setImportError("Gagal membaca file dari perangkat.");
    };
    reader.readAsText(file);
  };

  // Confirm Import & Save to Firestore
  const handleConfirmImport = async () => {
    if (!importPendingData) return;
    setImportSubmitting(true);
    try {
      await saveSiteData(importPendingData);
      setFormData(importPendingData);
      setShowImportConfirmModal(false);
      setImportPendingData(null);
      setSaveStatus("success");
      setSaveMessage("Database berhasil diimport dan disimpan ke Firestore!");
      setTimeout(() => setSaveStatus("idle"), 5000);
    } catch (err: any) {
      setSaveStatus("error");
      setSaveMessage(`Gagal mengimport database: ${err.message || "Unknown error"}`);
    } finally {
      setImportSubmitting(false);
    }
  };

  // Password change handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword.length < 6) {
      setPasswordStatus("error");
      setPasswordMessage("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus("error");
      setPasswordMessage("New password and confirm password do not match.");
      return;
    }

    setPasswordStatus("loading");
    setPasswordMessage("Updating password...");
    try {
      await updatePassword(user, newPassword);
      setPasswordStatus("success");
      setPasswordMessage("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordStatus("error");
      if (err.code === "auth/requires-recent-login") {
        setPasswordMessage("For security reasons, please log out and log in again before changing your password.");
      } else {
        setPasswordMessage(err.message || "Failed to update password.");
      }
    }
  };

  // Helper updates with real-time live sync broadcasting
  const updateNestedField = (section: keyof SiteData, key: string, value: any) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [section]: {
          ...(prev[section] as Record<string, any>),
          [key]: value,
        },
      };
      if (liveSync || section === "theme") {
        broadcastLiveUpdate(updated);
      }
      return updated;
    });
  };

  const updateExperiences = (updater: (prev: ExperienceItem[]) => ExperienceItem[]) => {
    setFormData((prev) => {
      const updatedList = updater(prev.experiences || []);
      const updated = { ...prev, experiences: updatedList };
      if (liveSync) {
        broadcastLiveUpdate(updated);
      }
      return updated;
    });
  };

  const updateProjects = (updater: (prev: ProjectItem[]) => ProjectItem[]) => {
    setFormData((prev) => {
      const updatedList = updater(prev.projects || []);
      const updated = { ...prev, projects: updatedList };
      if (liveSync) {
        broadcastLiveUpdate(updated);
      }
      return updated;
    });
  };

  // Formatting helpers for statistics
  const visits = stats?.totalVisits || 0;
  const writes = stats?.totalWrites || 0;
  const estBandwidthKB = visits * 400; // ~400 KB per page view
  const estBandwidthMB = (estBandwidthKB / 1024).toFixed(2);
  const estBandwidthGB = (estBandwidthKB / (1024 * 1024)).toFixed(3);

  // Free quota percentages (Firebase Spark Plan)
  const dailyBandwidthLimitMB = 360; // 360 MB / day
  const dailyReadsLimit = 50000;     // 50,000 reads / day
  const dailyWritesLimit = 20000;    // 20,000 writes / day

  const bandwidthUsagePct = Math.min(100, (parseFloat(estBandwidthMB) / dailyBandwidthLimitMB) * 100).toFixed(1);
  const readsUsagePct = Math.min(100, (visits / dailyReadsLimit) * 100).toFixed(1);
  const writesUsagePct = Math.min(100, (writes / dailyWritesLimit) * 100).toFixed(1);

  // Clean default white screen during initial mount / refresh flash / auth loading
  if (!isReady || authLoading) {
    return <div className="min-h-screen bg-white" />;
  }

  // Render Login Form if user is not authenticated
  if (!user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <div 
          className="w-full max-w-md backdrop-blur-xl p-8 rounded-2xl shadow-2xl transition-colors"
          style={cardStyle}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={titleStyle}>Admin Portal</h1>
            <p className="text-sm opacity-80" style={{ color: cardTextColor }}>Sign in to manage your portfolio content</p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-300 text-sm">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={labelStyle}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                style={inputStyle}
                className="w-full px-4 py-3 rounded-xl placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={labelStyle}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  className="w-full px-4 py-3 pr-12 rounded-xl placeholder-gray-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 p-1 text-base transition-opacity"
                  aria-label="Toggle password visibility"
                  style={{ color: textColor }}
                >
                  {showLoginPassword ? "👁️‍🗨️" : "👁️"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              style={primaryBtnStyle}
              className="w-full py-3.5 px-6 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing In...
                </>
              ) : (
                "Sign In to Dashboard"
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-4">
            <Link href="/" className="text-xs hover:underline font-medium" style={{ color: accentColor }}>
              ← Return to Main Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Authenticated Admin Dashboard
  return (
    <div 
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Top Navbar */}
      <header 
        className="sticky top-0 z-40 backdrop-blur-md px-6 py-4 shadow-md transition-colors"
        style={{ backgroundColor: cardBgColor }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center flex-wrap gap-2.5">
            <h1 className="text-xl font-bold" style={titleStyle}>Portfolio Admin Dashboard</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Real-Time Sync</span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            {/* Real-time Live Sync Toggle */}
            <label 
              className={`flex items-center gap-2 cursor-pointer text-xs font-medium px-3 py-1.5 rounded-xl border transition-all select-none ${
                liveSync ? "bg-purple-500/20 border-purple-400 text-purple-200 shadow-sm" : "bg-white/5 border-white/10 text-gray-400 opacity-75"
              }`}
              title="Jika aktif, perubahan warna tema dan teks otomatis tersinkronisasi langsung ke web secara real-time"
            >
              <input 
                type="checkbox"
                checked={liveSync}
                onChange={(e) => setLiveSync(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-purple-500 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <span>⚡</span>
                <span>Live Sync: <strong>{liveSync ? "ON" : "OFF"}</strong></span>
              </span>
            </label>
            {/* Save All Changes Button in Top Bar */}
            <button
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              style={primaryBtnStyle}
              className="text-xs font-semibold px-4 py-2 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
              title="Simpan seluruh perubahan ke Cloud Firestore"
            >
              {saveStatus === "saving" ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Menyimpan...</span>
                </>
              ) : saveStatus === "success" ? (
                <>
                  <span>✓</span>
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save All Changes</span>
                </>
              )}
            </button>

            {/* Bersihkan Data Contoh Button */}
            <button
              onClick={() => setShowCleanModal(true)}
              className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all flex items-center gap-1.5 active:scale-95 shadow"
              title="Bersihkan semua teks contoh, navbar bawaan, dan aset gambar demo"
            >
              <span>🗑️</span>
              <span>Bersihkan Data Contoh</span>
            </button>

            <span className="text-xs opacity-80 hidden lg:inline" style={{ color: cardTextColor }}>
              Logged in as <strong style={{ color: titleStyle.color }}>{user.email}</strong>
            </span>
            <Link
              href="/"
              target="_blank"
              style={{ backgroundColor: bgColor, color: textColor }}
              className="text-xs px-3.5 py-2 rounded-xl hover:opacity-80 transition-opacity"
            >
              View Live Site ↗
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Left Sidebar Navigation Tabs (Sticky) */}
        <aside className="w-full md:w-64 flex-shrink-0 md:sticky md:top-24 max-h-[calc(100vh-7rem)] md:overflow-y-auto z-30 pr-1">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            {[
              { id: "stats", label: "📊 Website Statistics" },
              { id: "theme", label: "🎨 Theme & Colors" },
              { id: "header", label: "📌 Header & Navigation" },
              { id: "banner", label: "🚀 Hero & Action Buttons" },
              { id: "about", label: "💡 About Section" },
              { id: "experience", label: "💼 What I Do" },
              { id: "projects", label: "🎨 Featured Projects" },
              { id: "footer", label: "🔗 Footer & Widgets" },
              { id: "database", label: "🗄️ Database & Backup" },
              { id: "security", label: "🔑 Account & Security" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    backgroundColor: isActive ? accentColor : cardBgColor,
                    color: isActive ? "#ffffff" : cardTextColor,
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center justify-between ${
                    isActive ? "shadow-lg font-semibold" : "hover:opacity-90"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Section Content Editor */}
        <section 
          className="flex-1 backdrop-blur-xl p-6 sm:p-8 rounded-2xl space-y-8 shadow-xl transition-colors w-full min-w-0"
          style={cardStyle}
        >
          {/* Action Bar (Save Button - shown for settings tabs) */}
          {activeTab !== "security" && activeTab !== "stats" && activeTab !== "database" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold capitalize" style={titleStyle}>
                  {activeTab.replace("-", " ")} Settings
                </h2>
                <p className="text-xs opacity-80" style={{ color: cardTextColor }}>
                  Manage and update your website content in real time.
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saveStatus === "saving"}
                style={primaryBtnStyle}
                className="px-6 py-3 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 self-start sm:self-auto"
              >
                {saveStatus === "saving" ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  "Save All Changes"
                )}
              </button>
            </div>
          )}

          {/* Feedback Status Alert */}
          {saveStatus !== "idle" && activeTab !== "security" && activeTab !== "stats" && activeTab !== "database" && (
            <div
              className={`p-4 rounded-xl text-sm font-medium ${
                saveStatus === "success"
                  ? "bg-green-500/10 text-green-300"
                  : saveStatus === "error"
                  ? "bg-red-500/10 text-red-300"
                  : "bg-blue-500/10 text-blue-300"
              }`}
            >
              {saveMessage}
            </div>
          )}

          {/* TAB 0: WEBSITE STATISTICS */}
          {activeTab === "stats" && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
                <div>
                  <h3 className="text-2xl font-bold mb-1" style={titleStyle}>Website Analytics & Firebase Quota</h3>
                  <p className="text-xs opacity-80" style={{ color: cardTextColor }}>Real-time visitor counts, data bandwidth usage, and Firebase Free Tier status.</p>
                </div>
                <button
                  onClick={async () => {
                    if (confirm("Reset statistics counter back to zero?")) {
                      await resetStats();
                    }
                  }}
                  className="text-xs px-4 py-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 self-start sm:self-auto"
                >
                  Reset Counter
                </button>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl space-y-2 shadow-sm" style={{ backgroundColor: bgColor }}>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider" style={subHeadingStyle}>
                    <span>Total Visits</span>
                    <span className="text-xl">👁️</span>
                  </div>
                  <p className="text-4xl font-extrabold" style={titleStyle}>{visits.toLocaleString()}</p>
                  <p className="text-[11px] opacity-70" style={{ color: cardTextColor }}>Total website page views</p>
                </div>

                <div className="p-6 rounded-2xl space-y-2 shadow-sm" style={{ backgroundColor: bgColor }}>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider" style={subHeadingStyle}>
                    <span>Est. Download Data</span>
                    <span className="text-xl">🚀</span>
                  </div>
                  <p className="text-4xl font-extrabold" style={titleStyle}>{estBandwidthMB} MB</p>
                  <p className="text-[11px] opacity-70" style={{ color: cardTextColor }}>({estBandwidthGB} GB total transfer)</p>
                </div>

                <div className="p-6 rounded-2xl space-y-2 shadow-sm" style={{ backgroundColor: bgColor }}>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider" style={subHeadingStyle}>
                    <span>Admin Data Uploads</span>
                    <span className="text-xl">💾</span>
                  </div>
                  <p className="text-4xl font-extrabold" style={titleStyle}>{writes.toLocaleString()}</p>
                  <p className="text-[11px] opacity-70" style={{ color: cardTextColor }}>Total Admin save operations</p>
                </div>
              </div>

              {/* Firebase Spark Plan Free Quota Tracker */}
              <div className="p-6 rounded-2xl space-y-6 shadow-sm" style={{ backgroundColor: bgColor }}>
                <div className="flex items-center justify-between pb-3">
                  <h4 className="text-md font-bold flex items-center gap-2" style={subHeadingStyle}>
                    <span>🔥</span> Firebase Plan (Spark Tier) Daily Quotas
                  </h4>
                  <span className="text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                    Active & Safe
                  </span>
                </div>

                {/* Hosting Bandwidth Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span style={{ color: cardTextColor }}>Hosting Bandwidth (Daily Limit: 360 MB)</span>
                    <span style={subHeadingStyle}>{estBandwidthMB} MB / 360 MB ({bandwidthUsagePct}%)</span>
                  </div>
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ backgroundColor: accentColor, width: `${bandwidthUsagePct}%` }}
                    />
                  </div>
                  <p className="text-[11px] opacity-70" style={{ color: cardTextColor }}>Quota resets automatically every 24 hours at 14:00 WIB.</p>
                </div>

                {/* Firestore Reads Progress */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span style={{ color: cardTextColor }}>Firestore Document Reads (Daily Limit: 50,000 Reads)</span>
                    <span style={subHeadingStyle}>{visits.toLocaleString()} / 50,000 ({readsUsagePct}%)</span>
                  </div>
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ backgroundColor: accentColor, width: `${readsUsagePct}%` }}
                    />
                  </div>
                  <p className="text-[11px] opacity-70" style={{ color: cardTextColor }}>1 visit = 1 Firestore Document Read.</p>
                </div>

                {/* Firestore Writes Progress */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span style={{ color: cardTextColor }}>Firestore Document Writes (Daily Limit: 20,000 Writes)</span>
                    <span style={subHeadingStyle}>{writes.toLocaleString()} / 20,000 ({writesUsagePct}%)</span>
                  </div>
                  <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ backgroundColor: accentColor, width: `${writesUsagePct}%` }}
                    />
                  </div>
                  <p className="text-[11px] opacity-70" style={{ color: cardTextColor }}>1 Save in Admin = 1 Firestore Document Write.</p>
                </div>
              </div>

              {/* Timestamp Info */}
              <div className="p-4 rounded-xl flex flex-col sm:flex-row justify-between text-xs gap-2" style={{ backgroundColor: bgColor, color: cardTextColor }}>
                <span>Latest Visitor Activity: <strong style={titleStyle}>{stats?.lastVisitAt ? new Date(stats.lastVisitAt).toLocaleString() : "No visits recorded yet"}</strong></span>
                <span>Latest Admin Save: <strong style={titleStyle}>{stats?.lastSaveAt ? new Date(stats.lastSaveAt).toLocaleString() : "No saves recorded yet"}</strong></span>
              </div>
            </div>
          )}

          {/* TAB 1: THEME & COLORS */}
          {activeTab === "theme" && (
            <div className="space-y-8">
              {/* Preset Palette Warna Section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2" style={subHeadingStyle}>
                      <span>⚡</span> Preset Palette Warna
                    </h3>
                    <p className="text-xs opacity-80" style={{ color: cardTextColor }}>
                      Klik salah satu preset di bawah untuk menerapkan skema warna tema secara instan:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                  {[
                    {
                      id: "preset-1",
                      name: "Violet Glow",
                      subtitle: "Dark Violet & Purple",
                      theme: {
                        bgColor: "#110720",
                        textColor: "#ffffff",
                        accentColor: "#c084fc",
                        cardBgColor: "#1d0b37",
                        cardBorderColor: "#a148f9",
                        cardTitleColor: "#ffffff",
                        cardTextColor: "#ffffff",
                      },
                    },
                    {
                      id: "preset-2",
                      name: "Ocean Emerald",
                      subtitle: "Deep Cyan & Emerald",
                      theme: {
                        bgColor: "#06131e",
                        textColor: "#f8fafc",
                        accentColor: "#06b6d4",
                        cardBgColor: "#0c1e2e",
                        cardBorderColor: "#10b981",
                        cardTitleColor: "#ffffff",
                        cardTextColor: "#94a3b8",
                      },
                    },
                    {
                      id: "preset-3",
                      name: "Sunset Rose",
                      subtitle: "Crimson & Amber",
                      theme: {
                        bgColor: "#1a0f1a",
                        textColor: "#fff7ed",
                        accentColor: "#f43f5e",
                        cardBgColor: "#261424",
                        cardBorderColor: "#f59e0b",
                        cardTitleColor: "#ffffff",
                        cardTextColor: "#fde68a",
                      },
                    },
                    {
                      id: "preset-4",
                      name: "Clean Light",
                      subtitle: "Crisp White & Indigo",
                      theme: {
                        bgColor: "#ffffff",
                        textColor: "#0f172a",
                        accentColor: "#6366f1",
                        cardBgColor: "#f8fafc",
                        cardBorderColor: "#cbd5e1",
                        cardTitleColor: "#0f172a",
                        cardTextColor: "#475569",
                      },
                    },
                    {
                      id: "preset-5",
                      name: "Midnight Gold",
                      subtitle: "OLED Black & Gold",
                      theme: {
                        bgColor: "#0a0a0a",
                        textColor: "#fafafa",
                        accentColor: "#eab308",
                        cardBgColor: "#171717",
                        cardBorderColor: "#ca8a04",
                        cardTitleColor: "#ffffff",
                        cardTextColor: "#d4d4d4",
                      },
                    },
                  ].map((preset) => {
                    const isSelected =
                      formData.theme.bgColor?.toLowerCase() === preset.theme.bgColor.toLowerCase() &&
                      formData.theme.accentColor?.toLowerCase() === preset.theme.accentColor.toLowerCase();

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => {
                            const updated = {
                              ...prev,
                              theme: {
                                ...prev.theme,
                                ...preset.theme,
                              },
                            };
                            broadcastLiveUpdate(updated);
                            return updated;
                          });
                        }}
                        className={`p-3.5 rounded-xl text-left transition-all duration-200 hover:-translate-y-1 active:scale-95 group relative flex flex-col justify-between ${
                          isSelected
                            ? "ring-2 ring-purple-500 shadow-xl"
                            : "hover:shadow-lg opacity-90 hover:opacity-100 shadow"
                        }`}
                        style={{
                          backgroundColor: preset.theme.cardBgColor,
                        }}
                      >
                        {isSelected && (
                          <span
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow z-10"
                            style={{
                              backgroundColor: preset.theme.accentColor,
                              color: preset.theme.bgColor === "#ffffff" ? "#000000" : "#ffffff",
                            }}
                          >
                            ✓
                          </span>
                        )}

                        <div className="space-y-1 mb-3">
                          <div className="font-bold text-sm flex items-center justify-between" style={{ color: preset.theme.cardTitleColor }}>
                            <span>{preset.name}</span>
                          </div>
                          <p className="text-[11px] line-clamp-1 opacity-80" style={{ color: preset.theme.cardTextColor }}>
                            {preset.subtitle}
                          </p>
                        </div>

                        {/* Swatches preview */}
                        <div className="flex items-center gap-1.5 pt-2">
                          <span
                            className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                            style={{ backgroundColor: preset.theme.bgColor }}
                            title={`Background: ${preset.theme.bgColor}`}
                          />
                          <span
                            className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                            style={{ backgroundColor: preset.theme.accentColor }}
                            title={`Accent: ${preset.theme.accentColor}`}
                          />
                          <span
                            className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                            style={{ backgroundColor: preset.theme.cardBgColor }}
                            title={`Card Bg: ${preset.theme.cardBgColor}`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold" style={subHeadingStyle}>Global Website Colors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl space-y-2" style={{ backgroundColor: bgColor }}>
                    <label className="block text-xs uppercase font-medium" style={labelStyle}>
                      Background Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.theme.bgColor || "#110720"}
                        onChange={(e) => updateNestedField("theme", "bgColor", e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={formData.theme.bgColor}
                        placeholder="#110720"
                        onChange={(e) => updateNestedField("theme", "bgColor", e.target.value)}
                        style={inputStyle}
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl space-y-2" style={{ backgroundColor: bgColor }}>
                    <label className="block text-xs uppercase font-medium" style={labelStyle}>
                      Main Text Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.theme.textColor || "#ffffff"}
                        onChange={(e) => updateNestedField("theme", "textColor", e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={formData.theme.textColor}
                        placeholder="#ffffff"
                        onChange={(e) => updateNestedField("theme", "textColor", e.target.value)}
                        style={inputStyle}
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl space-y-2" style={{ backgroundColor: bgColor }}>
                    <label className="block text-xs uppercase font-medium" style={labelStyle}>
                      Primary Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.theme.accentColor || "#c084fc"}
                        onChange={(e) => updateNestedField("theme", "accentColor", e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={formData.theme.accentColor}
                        placeholder="#a855f7"
                        onChange={(e) => updateNestedField("theme", "accentColor", e.target.value)}
                        style={inputStyle}
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* What I Do Card Color Customization */}
              <div className="pt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold" style={subHeadingStyle}>What I Do Card Box Colors</h3>
                  <p className="text-xs opacity-80" style={{ color: cardTextColor }}>Customize the background, border, title, and text colors for What I Do cards.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl space-y-2" style={{ backgroundColor: bgColor }}>
                    <label className="block text-xs uppercase font-medium" style={labelStyle}>
                      Card Background
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.theme.cardBgColor || "#160b2b"}
                        onChange={(e) => updateNestedField("theme", "cardBgColor", e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={formData.theme.cardBgColor || "#160b2b"}
                        placeholder="#160b2b"
                        onChange={(e) => updateNestedField("theme", "cardBgColor", e.target.value)}
                        style={inputStyle}
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl space-y-2" style={{ backgroundColor: bgColor }}>
                    <label className="block text-xs uppercase font-medium" style={labelStyle}>
                      Card Border Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.theme.cardBorderColor || "#9333ea"}
                        onChange={(e) => updateNestedField("theme", "cardBorderColor", e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={formData.theme.cardBorderColor || "#9333ea"}
                        placeholder="#7e22ce"
                        onChange={(e) => updateNestedField("theme", "cardBorderColor", e.target.value)}
                        style={inputStyle}
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl space-y-2" style={{ backgroundColor: bgColor }}>
                    <label className="block text-xs uppercase font-medium" style={labelStyle}>
                      Card Title Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.theme.cardTitleColor || "#ffffff"}
                        onChange={(e) => updateNestedField("theme", "cardTitleColor", e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={formData.theme.cardTitleColor || "#ffffff"}
                        placeholder="#ffffff"
                        onChange={(e) => updateNestedField("theme", "cardTitleColor", e.target.value)}
                        style={inputStyle}
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl space-y-2" style={{ backgroundColor: bgColor }}>
                    <label className="block text-xs uppercase font-medium" style={labelStyle}>
                      Card Text Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.theme.cardTextColor || "#e9d5ff"}
                        onChange={(e) => updateNestedField("theme", "cardTextColor", e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={formData.theme.cardTextColor || "#e9d5ff"}
                        placeholder="#e9d5ff"
                        onChange={(e) => updateNestedField("theme", "cardTextColor", e.target.value)}
                        style={inputStyle}
                        className="flex-1 min-w-0 px-3 py-2 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HEADER & NAVIGATION */}
          {activeTab === "header" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={subHeadingStyle}>Header & Nav Links</h3>

              <div className="space-y-4 p-4 rounded-xl" style={{ backgroundColor: bgColor }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-xs uppercase font-semibold tracking-wider" style={labelStyle}>
                    Header Logo Format
                  </label>
                  <span className="text-[11px] opacity-70" style={{ color: cardTextColor }}>Pilih logo berupa Gambar atau Teks Custom</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateNestedField("header", "logoType", "image")}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                      (formData.header.logoType || "image") === "image"
                        ? "shadow-md"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    style={{
                      backgroundColor: (formData.header.logoType || "image") === "image" ? accentColor : cardBgColor,
                      color: (formData.header.logoType || "image") === "image" ? "#ffffff" : cardTextColor,
                    }}
                  >
                    <span>🖼️</span> Image Logo (URL)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateNestedField("header", "logoType", "text")}
                    className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                      formData.header.logoType === "text"
                        ? "shadow-md"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    style={{
                      backgroundColor: formData.header.logoType === "text" ? accentColor : cardBgColor,
                      color: formData.header.logoType === "text" ? "#ffffff" : cardTextColor,
                    }}
                  >
                    <span>✍️</span> Custom Text Logo
                  </button>
                </div>

                {formData.header.logoType === "text" ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs uppercase font-medium mb-1" style={labelStyle}>
                        Custom Logo Text
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ibrahim Memon / DevPortfolio"
                        value={formData.header.logoText || ""}
                        onChange={(e) => updateNestedField("header", "logoText", e.target.value)}
                        style={inputStyle}
                        className="w-full px-4 py-2.5 rounded-xl"
                      />
                    </div>
                    {/* Live Text Logo Preview */}
                    <div className="p-4 rounded-xl space-y-2" style={{ backgroundColor: cardBgColor }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-green-400 flex items-center gap-1">
                          <span>✓</span> Live Text Logo Preview
                        </span>
                        <span className="text-[10px] opacity-70" style={{ color: cardTextColor }}>Tampilan di Header</span>
                      </div>
                      <div className="p-3 rounded-lg flex items-center" style={{ backgroundColor: bgColor }}>
                        <span className="font-bold text-xl sm:text-2xl tracking-tight" style={{ color: textColor }}>
                          {formData.header.logoText || formData.banner.name || "Portfolio"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <DriveImageInput
                    label="Header Logo URL"
                    value={formData.header.logoUrl}
                    onChange={(val) => updateNestedField("header", "logoUrl", val)}
                    recommendedSize="Rasio disarankan: ~200 x 60 px"
                    previewAspect="logo"
                    themeStyles={themeStyles}
                  />
                )}
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                  <label className="block text-xs uppercase font-semibold tracking-wider" style={labelStyle}>
                    Navigation Menu (Maksimal 5 Bagian Website)
                  </label>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full opacity-90 self-start sm:self-auto" style={{ backgroundColor: accentColor + "20", color: accentColor }}>
                    5 Section Terhubung
                  </span>
                </div>

                {/* Information Card */}
                <div className="mb-4 p-3.5 rounded-xl border border-white/10 text-xs space-y-1" style={{ backgroundColor: bgColor }}>
                  <p className="font-semibold flex items-center gap-1.5" style={{ color: accentColor }}>
                    <span>🔗</span> 5 Bagian Navigasi Website:
                  </p>
                  <p className="opacity-85 text-[11px]" style={{ color: cardTextColor }}>
                    Menu navigasi otomatis disesuaikan dengan 5 bagian website: <strong>Hero</strong>, <strong>About</strong>, <strong>What I Do</strong>, <strong>Featured Projects</strong>, dan <strong>Footer & Widgets</strong>. Anda dapat mengubah teks label menu dan menentukan target hashtag section yang dituju.
                  </p>
                </div>

                <div className="space-y-3">
                  {(() => {
                    const currentNavs = normalizeNavLinks(formData.header?.navLinks);
                    const navPlaceholders = [
                      "cth. Home / Hero",
                      "cth. About Me",
                      "cth. What I Do",
                      "cth. Featured Projects",
                      "cth. Contact / Footer",
                    ];

                    return currentNavs.map((nav, index) => (
                      <div 
                        key={nav.id || `nav-${index}`} 
                        className="p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-3 md:items-center transition-all shadow-sm"
                        style={{ backgroundColor: bgColor }}
                      >
                        <div className="flex items-center gap-2.5 md:w-36 flex-shrink-0">
                          <span 
                            className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: accentColor }}
                          >
                            {index + 1}
                          </span>
                          <span className="text-xs font-semibold" style={{ color: cardTitleColor }}>
                            Menu #{index + 1}
                          </span>
                        </div>

                        {/* Label Input */}
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase font-semibold opacity-75 mb-1" style={{ color: cardTextColor }}>
                            Teks Label Menu
                          </label>
                          <input
                            type="text"
                            placeholder={navPlaceholders[index] || "cth. Menu Label"}
                            value={nav.label}
                            onChange={(e) => {
                              const updated = [...currentNavs];
                              updated[index] = { ...updated[index], label: e.target.value };
                              updateNestedField("header", "navLinks", updated);
                            }}
                            style={inputStyle}
                            className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-white/10 focus:outline-none transition-colors"
                          />
                        </div>

                        {/* Section Target Dropdown */}
                        <div className="flex-1">
                          <label className="block text-[10px] uppercase font-semibold opacity-75 mb-1" style={{ color: cardTextColor }}>
                            Target Bagian Website (Hashtag)
                          </label>
                          <select
                            value={nav.href}
                            onChange={(e) => {
                              const updated = [...currentNavs];
                              updated[index] = { ...updated[index], href: e.target.value };
                              updateNestedField("header", "navLinks", updated);
                            }}
                            style={inputStyle}
                            className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border border-white/10 focus:outline-none cursor-pointer transition-colors"
                          >
                            {SECTION_TARGETS.map((target) => (
                              <option 
                                key={target.value} 
                                value={target.value}
                                style={{ backgroundColor: cardBgColor, color: textColor }}
                              >
                                {target.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BANNER / HERO */}
          {activeTab === "banner" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={subHeadingStyle}>Hero & Banner Content</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                    Greeting Prefix (e.g. Hello! I Am)
                  </label>
                  <input
                    type="text"
                    value={formData.banner?.helloText || ""}
                    placeholder="cth. Hello! I Am"
                    onChange={(e) => updateNestedField("banner", "helloText", e.target.value)}
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                    Your Name (e.g. Ibrahim Memon)
                  </label>
                  <input
                    type="text"
                    value={formData.banner?.name || ""}
                    placeholder="cth. Ibrahim Memon"
                    onChange={(e) => updateNestedField("banner", "name", e.target.value)}
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                  Animated Subtitle Typing List (e.g. Software Engineer, UI/UX Designer)
                </label>
                <div className="space-y-2">
                  {(formData.banner?.typingSubtitles || []).map((sub, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={sub}
                        placeholder="cth. Software Engineer / UI UX Designer"
                        onChange={(e) => {
                          const updated = [...(formData.banner?.typingSubtitles || [])];
                          updated[idx] = e.target.value;
                          updateNestedField("banner", "typingSubtitles", updated);
                        }}
                        style={inputStyle}
                        className="flex-1 px-4 py-2.5 rounded-xl"
                      />
                      <button
                        onClick={() => {
                          const updated = (formData.banner?.typingSubtitles || []).filter((_, i) => i !== idx);
                          updateNestedField("banner", "typingSubtitles", updated);
                        }}
                        className="px-3 py-2.5 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updated = [...(formData.banner?.typingSubtitles || []), "New Role"];
                      updateNestedField("banner", "typingSubtitles", updated);
                    }}
                    style={primaryBtnStyle}
                    className="mt-2 text-xs font-semibold px-4 py-2 rounded-xl shadow"
                  >
                    + Add Typing Subtitle
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                    Title Line 1 (e.g. A Designer who)
                  </label>
                  <input
                    type="text"
                    value={formData.banner.designerLine1}
                    placeholder="cth. A Designer who"
                    onChange={(e) => updateNestedField("banner", "designerLine1", e.target.value)}
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                    Title Line 2 (e.g. Judges a book by its cover...)
                  </label>
                  <input
                    type="text"
                    value={formData.banner.designerLine2}
                    placeholder="cth. Judges a book by its cover..."
                    onChange={(e) => updateNestedField("banner", "designerLine2", e.target.value)}
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                  Quote Subtext
                </label>
                <textarea
                  rows={2}
                  value={formData.banner.quoteText}
                  placeholder="cth. Because if the cover does not catch your attention, what will?"
                  onChange={(e) => updateNestedField("banner", "quoteText", e.target.value)}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl"
                />
              </div>

              {/* Action Buttons Settings (Resume & Certificates) */}
              <div className="pt-4 space-y-6">
                <h4 className="text-md font-bold" style={subHeadingStyle}>Banner Action Buttons (Optional)</h4>
                
                {/* Resume Button Controls */}
                <div className="p-4 rounded-xl space-y-4" style={{ backgroundColor: bgColor }}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm" style={labelStyle}>Resume Button</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!formData.banner.showResumeBtn}
                        onChange={(e) => updateNestedField("banner", "showResumeBtn", e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-xs opacity-80" style={{ color: cardTextColor }}>Show on Banner</span>
                    </label>
                  </div>
                  {formData.banner.showResumeBtn && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs mb-1 opacity-80" style={{ color: cardTextColor }}>Button Text</label>
                        <input
                          type="text"
                          value={formData.banner.resumeBtnText || ""}
                          placeholder="cth. View Resume 📄"
                          onChange={(e) => updateNestedField("banner", "resumeBtnText", e.target.value)}
                          style={inputStyle}
                          className="w-full px-4 py-2.5 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 opacity-80" style={{ color: cardTextColor }}>Target Link URL</label>
                        <input
                          type="text"
                          value={formData.banner.resumeBtnLink || ""}
                          onChange={(e) => updateNestedField("banner", "resumeBtnLink", e.target.value)}
                          placeholder="https://drive.google.com/... atau link PDF"
                          style={inputStyle}
                          className="w-full px-4 py-2.5 rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Certificate Button Controls */}
                <div className="p-4 rounded-xl space-y-4" style={{ backgroundColor: bgColor }}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm" style={labelStyle}>Certificate Button</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!formData.banner.showCertBtn}
                        onChange={(e) => updateNestedField("banner", "showCertBtn", e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-xs opacity-80" style={{ color: cardTextColor }}>Show on Banner</span>
                    </label>
                  </div>
                  {formData.banner.showCertBtn && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs mb-1 opacity-80" style={{ color: cardTextColor }}>Button Text</label>
                        <input
                          type="text"
                          value={formData.banner.certBtnText || ""}
                          placeholder="cth. Certificates 📜"
                          onChange={(e) => updateNestedField("banner", "certBtnText", e.target.value)}
                          style={inputStyle}
                          className="w-full px-4 py-2.5 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 opacity-80" style={{ color: cardTextColor }}>Target Link URL</label>
                        <input
                          type="text"
                          value={formData.banner.certBtnLink || ""}
                          onChange={(e) => updateNestedField("banner", "certBtnLink", e.target.value)}
                          placeholder="https://example.com/certificates atau link Google Drive"
                          style={inputStyle}
                          className="w-full px-4 py-2.5 rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                    Current Role Text Prefix
                  </label>
                  <input
                    type="text"
                    value={formData.banner.currentRoleText}
                    placeholder="cth. Currently specializing in"
                    onChange={(e) => updateNestedField("banner", "currentRoleText", e.target.value)}
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-xl"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs uppercase font-medium" style={labelStyle}>
                      Company Name
                    </label>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded opacity-80" style={{ backgroundColor: bgColor, color: cardTextColor }}>
                      Optional
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.banner.companyName || ""}
                    placeholder="cth. Google / Freelance (Opsional)"
                    onChange={(e) => updateNestedField("banner", "companyName", e.target.value)}
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-xl"
                  />
                </div>
              </div>

              <DriveImageInput
                label="Company Logo Image URL (Optional)"
                value={formData.banner.companyLogoUrl || ""}
                onChange={(val) => updateNestedField("banner", "companyLogoUrl", val)}
                recommendedSize="Rasio disarankan: ~100 x 100 px (Opsional)"
                previewAspect="square"
                themeStyles={themeStyles}
              />

              <div>
                <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                  Bio / Overview Paragraph
                </label>
                <textarea
                  rows={3}
                  value={formData.banner.bioText}
                  placeholder="cth. A self-taught designer with a passion for designing beautiful user interfaces and scalable web applications..."
                  onChange={(e) => updateNestedField("banner", "bioText", e.target.value)}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DriveImageInput
                  label="Hero Character Image URL"
                  value={formData.banner.characterImage}
                  onChange={(val) => updateNestedField("banner", "characterImage", val)}
                  recommendedSize="Rasio: ~400 x 400 px"
                  previewAspect="square"
                  themeStyles={themeStyles}
                />

                <DriveImageInput
                  label="Hero Character Glow Image URL"
                  value={formData.banner.characterGlowImage}
                  onChange={(val) => updateNestedField("banner", "characterGlowImage", val)}
                  recommendedSize="Rasio: ~400 x 400 px"
                  previewAspect="square"
                  themeStyles={themeStyles}
                />
              </div>
            </div>
          )}

          {/* TAB 4: ABOUT SECTION */}
          {activeTab === "about" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={subHeadingStyle}>About Section Content</h3>

              <div>
                <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                  Highlighted Team Span Text
                </label>
                <input
                  type="text"
                  value={formData.about.headingSpan}
                  placeholder="cth. I'm a software engineer specializing in frontend & UI/UX design"
                  onChange={(e) => updateNestedField("about", "headingSpan", e.target.value)}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                  Subtext Description
                </label>
                <textarea
                  rows={2}
                  value={formData.about.headingSubtext}
                  placeholder="cth. Currently, I'm focused on building accessible, human-centered products for clients worldwide."
                  onChange={(e) => updateNestedField("about", "headingSubtext", e.target.value)}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl"
                />
              </div>

              <DriveImageInput
                label="Skills Illustration Image URL (Otomatis Sudut Melengkung / Rounded)"
                value={formData.about.illustrationUrl}
                onChange={(val) => updateNestedField("about", "illustrationUrl", val)}
                recommendedSize="Rasio: ~800 x 500 px (Otomatis Rounded)"
                previewAspect="landscape"
                themeStyles={themeStyles}
              />
            </div>
          )}

          {/* TAB 5: WHAT I DO */}
          {activeTab === "experience" && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                  What I Do Section Title
                </label>
                <input
                  type="text"
                  value={formData.experienceTitle !== undefined ? formData.experienceTitle : "What I Do"}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => {
                      const updated = { ...prev, experienceTitle: val };
                      if (liveSync) broadcastLiveUpdate(updated);
                      return updated;
                    });
                  }}
                  placeholder="cth. What I Do"
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <h3 className="text-lg font-semibold" style={subHeadingStyle}>Manage What I Do Cards</h3>
                <button
                  onClick={() => {
                    const defaultIcon = WHAT_I_DO_ICONS[(formData.experiences || []).length % WHAT_I_DO_ICONS.length].path;
                    const newCard: ExperienceItem = {
                      id: Date.now().toString(),
                      title: "New Service / Activity",
                      description: "Enter role or service overview details here...",
                      icon: defaultIcon,
                      buttonText: "VIEW DETAILS →",
                      buttonLink: "https://example.com",
                    };
                    updateExperiences((prev) => [newCard, ...prev]);
                  }}
                  style={primaryBtnStyle}
                  className="text-xs font-semibold px-4 py-2 rounded-xl shadow"
                >
                  + Add What I Do Card
                </button>
              </div>

              <div className="space-y-6">
                {(formData.experiences || []).map((exp, idx) => (
                  <div key={exp.id || idx} className="p-6 rounded-2xl space-y-4 shadow-sm" style={{ backgroundColor: bgColor }}>
                    <div className="flex justify-between items-center pb-2">
                      <h4 className="font-bold text-base" style={subHeadingStyle}>Card #{idx + 1}</h4>
                      <button
                        onClick={() => {
                          updateExperiences((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="text-xs px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30"
                      >
                        Delete Card
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-medium mb-1" style={labelStyle}>
                        Card Title
                      </label>
                      <input
                        type="text"
                        value={exp.title}
                        placeholder="cth. UI/UX Design & Prototyping"
                        onChange={(e) => {
                          const val = e.target.value;
                          updateExperiences((prev) => {
                            const copy = [...prev];
                            copy[idx] = { ...copy[idx], title: val };
                            return copy;
                          });
                        }}
                        style={inputStyle}
                        className="w-full px-4 py-2.5 rounded-xl"
                      />
                    </div>

                    {/* 5-Preset Icon Selector Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs uppercase font-medium" style={labelStyle}>
                          Pilih Icon Kartu (5 Preset Tersedia)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const randomIcon = WHAT_I_DO_ICONS[Math.floor(Math.random() * WHAT_I_DO_ICONS.length)].path;
                            updateExperiences((prev) => {
                              const copy = [...prev];
                              copy[idx] = { ...copy[idx], icon: randomIcon };
                              return copy;
                            });
                          }}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <span>🎲</span>
                          <span>Pilih Acak (Random)</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {WHAT_I_DO_ICONS.map((iconOption) => {
                          const isSelected = (exp.icon || "/assets/icon_1.png") === iconOption.path || exp.icon === iconOption.id;
                          return (
                            <button
                              key={iconOption.id}
                              type="button"
                              onClick={() => {
                                updateExperiences((prev) => {
                                  const copy = [...prev];
                                  copy[idx] = { ...copy[idx], icon: iconOption.path };
                                  return copy;
                                });
                              }}
                              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                                isSelected
                                  ? "ring-2 ring-purple-500 bg-purple-500/20 border-purple-400 font-bold shadow-lg"
                                  : "border-white/10 hover:border-white/30 bg-black/20 opacity-80 hover:opacity-100"
                              }`}
                            >
                              <div className="w-12 h-12 relative flex items-center justify-center p-1 rounded-lg bg-white/50 border border-white/30 shadow-sm">
                                <Image
                                  src={iconOption.path}
                                  alt={iconOption.name}
                                  fill
                                  sizes="48px"
                                  className="object-contain p-1"
                                  unoptimized
                                />
                              </div>
                              <span className="text-[11px] leading-tight" style={{ color: cardTextColor }}>
                                {iconOption.name}
                              </span>
                              {isSelected && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500 text-white font-semibold">
                                  Terpilih
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-medium mb-1" style={labelStyle}>
                        Detailed Description (Shown in Popup Modal)
                      </label>
                      <textarea
                        rows={3}
                        value={exp.description}
                        placeholder="cth. Creating responsive, intuitive, and modern digital interfaces tailored for your business needs..."
                        onChange={(e) => {
                          const val = e.target.value;
                          updateExperiences((prev) => {
                            const copy = [...prev];
                            copy[idx] = { ...copy[idx], description: val };
                            return copy;
                          });
                        }}
                        style={inputStyle}
                        className="w-full px-4 py-2.5 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase font-medium mb-1" style={labelStyle}>
                          Card Button Label
                        </label>
                        <input
                          type="text"
                          value={exp.buttonText}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateExperiences((prev) => {
                              const copy = [...prev];
                              copy[idx] = { ...copy[idx], buttonText: val };
                              return copy;
                            });
                          }}
                          placeholder="cth. VIEW DETAILS →"
                          style={inputStyle}
                          className="w-full px-4 py-2.5 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase font-medium mb-1" style={labelStyle}>
                          External Link URL (Optional in Modal)
                        </label>
                        <input
                          type="text"
                          value={exp.buttonLink}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateExperiences((prev) => {
                              const copy = [...prev];
                              copy[idx] = { ...copy[idx], buttonLink: val };
                              return copy;
                            });
                          }}
                          placeholder="https://example.com/project-case-study"
                          style={inputStyle}
                          className="w-full px-4 py-2.5 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Flaticon Attribution Info Box in Admin */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: cardTitleColor }}>
                  <span>ℹ️</span>
                  <span>Legalitas & Hak Cipta Icon (Flaticon Attribution)</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] opacity-70">
                  {WHAT_I_DO_ICONS.map((icon, i) => (
                    <a
                      key={icon.id}
                      href={icon.creditUrl}
                      title={icon.creditTitle}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline hover:text-purple-300 transition-colors"
                    >
                      Icon {i + 1}: {icon.creditText}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FEATURED PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold" style={subHeadingStyle}>Manage Featured Projects</h3>
                <button
                  onClick={() => {
                    const newProj: ProjectItem = {
                      id: Date.now().toString(),
                      title: "New Project Title",
                      description: "Project description and overview details...",
                      image: "",
                      link: "https://figma.com/community/file/...",
                    };
                    updateProjects((prev) => [newProj, ...prev]);
                  }}
                  style={primaryBtnStyle}
                  className="text-xs font-semibold px-4 py-2 rounded-xl shadow"
                >
                  + Add New Project
                </button>
              </div>

              <div className="space-y-6">
                {(formData.projects || []).map((proj, idx) => (
                  <div key={proj.id || idx} className="p-6 rounded-2xl space-y-4 shadow-sm" style={{ backgroundColor: bgColor }}>
                    <div className="flex justify-between items-center pb-2">
                      <h4 className="font-bold text-base" style={subHeadingStyle}>Project #{idx + 1}</h4>
                      <button
                        onClick={() => {
                          updateProjects((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="text-xs px-3 py-1.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30"
                      >
                        Delete Project
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-medium mb-1" style={labelStyle}>
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={proj.title}
                        placeholder="cth. Example Project / Figma Design System"
                        onChange={(e) => {
                          const val = e.target.value;
                          updateProjects((prev) => {
                            const copy = [...prev];
                            copy[idx] = { ...copy[idx], title: val };
                            return copy;
                          });
                        }}
                        style={inputStyle}
                        className="w-full px-4 py-2.5 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-medium mb-1" style={labelStyle}>
                        Project Description
                      </label>
                      <textarea
                        rows={3}
                        value={proj.description}
                        placeholder="cth. An extensive design system and web application built with modern architecture and high-performance UI components."
                        onChange={(e) => {
                          const val = e.target.value;
                          updateProjects((prev) => {
                            const copy = [...prev];
                            copy[idx] = { ...copy[idx], description: val };
                            return copy;
                          });
                        }}
                        style={inputStyle}
                        className="w-full px-4 py-2.5 rounded-xl"
                      />
                    </div>

                    <div className="space-y-4">
                      <DriveImageInput
                        label="Project Image URL"
                        value={proj.image}
                        onChange={(val) => {
                          updateProjects((prev) => {
                            const copy = [...prev];
                            copy[idx] = { ...copy[idx], image: val };
                            return copy;
                          });
                        }}
                        recommendedSize="Rasio: ~800 x 600 px (4:3)"
                        previewAspect="landscape"
                        themeStyles={themeStyles}
                      />

                      <div>
                        <label className="block text-xs uppercase font-medium mb-1" style={labelStyle}>
                          Project Link URL (Figma / Web)
                        </label>
                        <input
                          type="text"
                          value={proj.link}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateProjects((prev) => {
                              const copy = [...prev];
                              copy[idx] = { ...copy[idx], link: val };
                              return copy;
                            });
                          }}
                          placeholder="https://figma.com/@username atau https://example.com"
                          style={inputStyle}
                          className="w-full px-4 py-2.5 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: FOOTER & WIDGETS */}
          {activeTab === "footer" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={subHeadingStyle}>Footer & Contact Settings</h3>

              <div>
                <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                  Contact Section Heading
                </label>
                <input
                  type="text"
                  value={formData.footer.contactTitle}
                  placeholder="cth. Contact"
                  onChange={(e) => updateNestedField("footer", "contactTitle", e.target.value)}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                  Contact Description Subtext
                </label>
                <textarea
                  rows={2}
                  value={formData.footer.contactDescription}
                  placeholder="cth. I'm currently looking to join a cross-functional team that values design, innovation and high-impact engineering."
                  onChange={(e) => updateNestedField("footer", "contactDescription", e.target.value)}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                  Contact Email Address
                </label>
                <input
                  type="email"
                  value={formData.footer.email}
                  placeholder="cth. ibrahim@example.com"
                  onChange={(e) => updateNestedField("footer", "email", e.target.value)}
                  style={inputStyle}
                  className="w-full px-4 py-3 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                    Instagram URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/username"
                    value={formData.footer.instagramLink || ""}
                    onChange={(e) => updateNestedField("footer", "instagramLink", e.target.value)}
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                    GitHub URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://github.com/username"
                    value={formData.footer.githubLink || ""}
                    onChange={(e) => updateNestedField("footer", "githubLink", e.target.value)}
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                    LinkedIn URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.footer.linkedinLink || ""}
                    onChange={(e) => updateNestedField("footer", "linkedinLink", e.target.value)}
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                    Pinterest URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://pinterest.com/username"
                    value={formData.footer.pinterestLink || ""}
                    onChange={(e) => updateNestedField("footer", "pinterestLink", e.target.value)}
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                    Twitter / X URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://twitter.com/username atau https://x.com/username"
                    value={formData.footer.twitterLink || ""}
                    onChange={(e) => updateNestedField("footer", "twitterLink", e.target.value)}
                    style={inputStyle}
                    className="w-full px-4 py-3 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                <div>
                  <label className="block text-xs uppercase font-medium mb-1" style={labelStyle}>
                    Copyright Footer
                  </label>
                  <p className="text-sm font-medium" style={{ color: cardTextColor }}>
                    © 2026 <a href="https://www.figma.com/@ibrahimmemon" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80">Ibrahim Memon</a>. All rights reserved.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 opacity-75 font-medium">
                  🔒 Permanen (Locked)
                </span>
              </div>

              {/* BookClipy / Calendar Widget Controls */}
              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-md font-bold" style={subHeadingStyle}>BookClipy / Calendar Widget</h4>
                    <p className="text-xs opacity-80" style={{ color: cardTextColor }}>Toggle whether the embedded booking calendar displays on the main page</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl" style={{ backgroundColor: bgColor }}>
                    <input
                      type="checkbox"
                      checked={formData.showIframe !== false}
                      onChange={(e) => setFormData((prev) => ({ ...prev, showIframe: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm" style={{ color: cardTextColor }}>Show Widget on Page</span>
                  </label>
                </div>

                {formData.showIframe !== false && (
                  <div>
                    <label className="block text-xs uppercase font-medium mb-2" style={labelStyle}>
                      Widget iFrame URL
                    </label>
                    <input
                      type="text"
                      value={formData.iframeUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, iframeUrl: e.target.value }))}
                      placeholder="https://www.bookclipy.com/book/your-username atau link Google Calendar / Calendly"
                      style={inputStyle}
                      className="w-full px-4 py-3 rounded-xl"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: DATABASE & BACKUP (JSON EXPORT & IMPORT) */}
          {activeTab === "database" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-1" style={titleStyle}>
                  🗄️ Firestore Database Backup & Restore
                </h3>
                <p className="text-xs opacity-80" style={{ color: cardTextColor }}>
                  Download seluruh database website Anda ke dalam file <strong>database.json</strong> atau import/upload file database.json untuk sinkronisasi instan ke Cloud Firestore.
                </p>
              </div>

              {/* Status or Error Notice */}
              {importError && (
                <div className="p-4 rounded-xl bg-red-500/10 text-red-300 text-sm font-medium border border-red-500/20">
                  {importError}
                </div>
              )}

              {saveStatus !== "idle" && (
                <div
                  className={`p-4 rounded-xl text-sm font-medium ${
                    saveStatus === "success"
                      ? "bg-green-500/10 text-green-300 border border-green-500/20"
                      : saveStatus === "error"
                      ? "bg-red-500/10 text-red-300 border border-red-500/20"
                      : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                  }`}
                >
                  {saveMessage}
                </div>
              )}

              {/* Database Overview Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. EXPORT / DOWNLOAD CARD */}
                <div className="p-6 rounded-2xl space-y-5 border border-white/10 flex flex-col justify-between shadow-sm" style={{ backgroundColor: bgColor }}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-2xl">
                        📥
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300">
                        Export JSON
                      </span>
                    </div>

                    <h4 className="text-lg font-bold" style={titleStyle}>
                      Download database.json
                    </h4>

                    <p className="text-xs leading-relaxed opacity-85" style={{ color: cardTextColor }}>
                      Ekspor seluruh data website dari Cloud Firestore ke dalam satu file format JSON. File ini mencakup pengaturan tema, navigasi, greeting banner, keahlian, seluruh kartu What I Do, Featured Projects, informasi kontak, dan metrik statistik.
                    </p>

                    {/* Data Summary Pill Info */}
                    <div className="pt-2 flex flex-wrap gap-2 text-[11px]" style={{ color: cardTextColor }}>
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                        💼 <strong>{(formData.experiences || []).length}</strong> What I Do Cards
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                        🎨 <strong>{(formData.projects || []).length}</strong> Featured Projects
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                        👁️ <strong>{(stats?.totalVisits || 0).toLocaleString()}</strong> Total Visits
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleExportDatabase}
                      style={primaryBtnStyle}
                      className="w-full py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span>📥</span>
                      <span>Download database.json</span>
                    </button>
                  </div>
                </div>

                {/* 2. IMPORT / UPLOAD CARD */}
                <div className="p-6 rounded-2xl space-y-5 border border-white/10 flex flex-col justify-between shadow-sm" style={{ backgroundColor: bgColor }}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-2xl">
                        📤
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300">
                        Import JSON
                      </span>
                    </div>

                    <h4 className="text-lg font-bold" style={titleStyle}>
                      Upload & Restore database.json
                    </h4>

                    <p className="text-xs leading-relaxed opacity-85" style={{ color: cardTextColor }}>
                      Unggah file <strong>database.json</strong> yang sudah pernah diekspor sebelumnya untuk memulihkan atau menyalin data website secara instan ke Cloud Firestore.
                    </p>

                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Drag & Drop / Click Zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 p-4 rounded-xl border-2 border-dashed border-white/20 hover:border-cyan-400/60 bg-white/5 cursor-pointer text-center space-y-1 transition-all duration-200 group"
                    >
                      <p className="text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                        Klik di sini untuk memilih file .json
                      </p>
                      <p className="text-[10px] opacity-70" style={{ color: cardTextColor }}>
                        Mendukung file backup database.json
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3.5 px-6 rounded-xl font-semibold shadow-lg bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white transition-all flex items-center justify-center gap-2"
                    >
                      <span>📤</span>
                      <span>Pilih & Upload File JSON</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Information Notice Box */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2 text-xs" style={{ color: cardTextColor }}>
                <p className="font-semibold flex items-center gap-1.5" style={{ color: accentColor }}>
                  <span>💡</span> Panduan Backup & Migrasi Database:
                </p>
                <ol className="list-decimal list-inside space-y-1 pl-1 opacity-90 text-[11px] leading-relaxed">
                  <li>Disarankan untuk melakukan <strong>Download database.json</strong> secara berkala sebelum melakukan perubahan besar pada website.</li>
                  <li>File <strong>database.json</strong> dapat digunakan untuk memigrasi konten dari satu project Firebase ke project Firebase lainnya secara instan.</li>
                  <li>Saat Anda mengupload file, sistem akan menampilkan jendela konfirmasi pratinjau sebelum menyimpan data ke database.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 9: ACCOUNT & SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-1" style={titleStyle}>Account & Password Security</h3>
                <p className="text-xs opacity-80" style={{ color: cardTextColor }}>Change your Firebase Admin account password.</p>
              </div>

              {passwordStatus !== "idle" && (
                <div
                  className={`p-4 rounded-xl text-sm font-medium ${
                    passwordStatus === "success"
                      ? "bg-green-500/10 text-green-300"
                      : passwordStatus === "error"
                      ? "bg-red-500/10 text-red-300"
                      : "bg-blue-500/10 text-blue-300"
                  }`}
                >
                  {passwordMessage}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-xs uppercase font-semibold tracking-wider mb-2" style={labelStyle}>
                    Current Admin Account
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.email || ""}
                    style={{ ...inputStyle, opacity: 0.6 }}
                    className="w-full px-4 py-3 rounded-xl cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold tracking-wider mb-2" style={labelStyle}>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan kata sandi baru (min. 6 karakter)"
                      style={inputStyle}
                      className="w-full px-4 py-3 pr-12 rounded-xl placeholder-gray-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 p-1 text-base transition-opacity"
                      aria-label="Toggle password visibility"
                      style={{ color: textColor }}
                    >
                      {showNewPassword ? "👁️‍🗨️" : "👁️"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold tracking-wider mb-2" style={labelStyle}>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang kata sandi baru"
                      style={inputStyle}
                      className="w-full px-4 py-3 pr-12 rounded-xl placeholder-gray-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 p-1 text-base transition-opacity"
                      aria-label="Toggle password visibility"
                      style={{ color: textColor }}
                    >
                      {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordStatus === "loading"}
                  style={primaryBtnStyle}
                  className="px-6 py-3.5 rounded-xl font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {passwordStatus === "loading" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Updating Password...
                    </>
                  ) : (
                    "Update Admin Password"
                  )}
                </button>
              </form>
            </div>
          )}
        </section>
      </main>

      {/* MODAL KONFIRMASI BERSIHKAN DATA CONTOH */}
      {showCleanModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => !cleanSubmitting && setShowCleanModal(false)}
        >
          <div 
            className="relative w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border space-y-6 animate-scale-up-modal"
            style={{
              backgroundColor: cardBgColor,
              borderColor: cardBorderColor,
              color: textColor,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-2xl flex-shrink-0">
                🗑️
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold" style={{ color: cardTitleColor }}>
                  Bersihkan Semua Data Contoh?
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  Aksi ini akan menghapus data demo awal template
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-relaxed" style={{ color: cardTextColor }}>
              <p>
                Tindakan ini akan mengosongkan <strong>seluruh data contoh bawaan hosting</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-xs opacity-90">
                <li>Seluruh teks & greeting pada Hero Banner</li>
                <li>Teks keahlian & ilustrasi pada About section</li>
                <li>Seluruh kartu sampel What I Do</li>
                <li>Seluruh sampel Featured Projects</li>
                <li>Teks kontak & deskripsi pada Footer</li>
                <li>Seluruh referensi gambar aset bawaan template</li>
                <li>Item menu navigasi Header di-reset ke 5 section default</li>
              </ul>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                <span className="font-semibold text-purple-300">ℹ️ Catatan Penting:</span>{" "}
                Seluruh kolom input tetap dilengkapi <strong>placeholder pemandu</strong> agar Anda mudah mengisi kembali konten website. Teks <strong>Copyright ber-hyperlink</strong> dan warna tema yang sudah Anda atur juga tetap dipertahankan.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={cleanSubmitting}
                onClick={() => setShowCleanModal(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={cleanSubmitting}
                onClick={handleCleanSampleData}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-sm font-semibold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {cleanSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Membersihkan...</span>
                  </>
                ) : (
                  <>
                    <span>Ya, Bersihkan Semua Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI IMPORT DATABASE */}
      {showImportConfirmModal && importPendingData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => !importSubmitting && setShowImportConfirmModal(false)}
        >
          <div 
            className="relative w-full max-w-lg rounded-2xl p-6 sm:p-8 shadow-2xl border space-y-6 animate-scale-up-modal"
            style={{
              backgroundColor: cardBgColor,
              borderColor: cardBorderColor,
              color: textColor,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center text-2xl flex-shrink-0">
                📤
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold" style={{ color: cardTitleColor }}>
                  Import & Pulihkan Database?
                </h3>
                <p className="text-xs text-cyan-400 font-medium">
                  Konfirmasi pemulihan data dari file JSON
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-relaxed" style={{ color: cardTextColor }}>
              <p>
                File backup valid berhasil dibaca. Apakah Anda ingin menimpa data website saat ini dan menyimpannya langsung ke <strong>Cloud Firestore</strong>?
              </p>

              {/* Ringkasan Data yang Diimport */}
              <div className="p-3.5 rounded-xl border border-white/10 space-y-1.5 text-xs" style={{ backgroundColor: bgColor }}>
                <p className="font-semibold" style={{ color: accentColor }}>📋 Ringkasan Konten Backup:</p>
                <ul className="space-y-1 opacity-90 text-[11px] pl-1">
                  <li>• Nama: <strong>{importPendingData.banner?.name || "(Kosong)"}</strong></li>
                  <li>• Kartu What I Do: <strong>{(importPendingData.experiences || []).length} Kartu</strong></li>
                  <li>• Featured Projects: <strong>{(importPendingData.projects || []).length} Projects</strong></li>
                  <li>• Warna Tema: <span className="inline-block w-2.5 h-2.5 rounded-full ml-1 align-middle" style={{ backgroundColor: importPendingData.theme?.accentColor || "#a855f7" }}></span> {importPendingData.theme?.accentColor || "#a855f7"}</li>
                  <li>• Navigasi Menu: <strong>{(importPendingData.header?.navLinks || []).length} Menu Links</strong></li>
                </ul>
              </div>

              <p className="text-xs opacity-75 text-amber-300">
                ⚠️ Catatan: Aksi ini akan mengganti data yang ada saat ini dengan data dari file yang diupload.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={importSubmitting}
                onClick={() => {
                  setShowImportConfirmModal(false);
                  setImportPendingData(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={importSubmitting}
                onClick={handleConfirmImport}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-sm font-semibold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {importSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Menyimpan ke Firestore...</span>
                  </>
                ) : (
                  <>
                    <span>Ya, Import & Simpan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
