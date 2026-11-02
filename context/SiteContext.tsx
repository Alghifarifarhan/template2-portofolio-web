"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { doc, onSnapshot, setDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SiteData, NavLink, DEFAULT_NAV_LINKS } from "@/types/siteData";

export interface SiteStats {
  totalVisits: number;
  totalWrites: number;
  lastVisitAt?: string;
  lastSaveAt?: string;
}

const CACHE_KEY = "portfolio_site_data_cache";
const BROADCAST_CHANNEL_NAME = "portfolio_realtime_sync";

export function normalizeNavLinks(links?: NavLink[]): NavLink[] {
  if (!links || links.length === 0) {
    return DEFAULT_NAV_LINKS;
  }
  // Ensure exactly 5 items based on DEFAULT_NAV_LINKS
  return DEFAULT_NAV_LINKS.map((defaultLink, idx) => {
    const existing = links[idx];
    return {
      id: existing?.id || defaultLink.id,
      label: existing?.label !== undefined && existing?.label !== null ? existing.label : defaultLink.label,
      href: existing?.href || defaultLink.href,
    };
  });
}

// Clean Site Data Structure with empty values (Zero dummy text)
export const cleanSiteData: SiteData = {
  theme: {
    bgColor: "#110720",
    textColor: "#ffffff",
    accentColor: "#a855f7",
    cardBgColor: "#180a2e",
    cardBorderColor: "#7e22ce",
    cardTitleColor: "#ffffff",
    cardTextColor: "#e9d5ff",
  },
  header: {
    logoUrl: "",
    logoType: "text",
    logoText: "",
    navLinks: DEFAULT_NAV_LINKS,
  },
  banner: {
    helloText: "",
    name: "",
    typingSubtitles: [],
    designerLine1: "",
    designerLine2: "",
    quoteText: "",
    currentRoleText: "",
    companyName: "",
    companyLogoUrl: "",
    bioText: "",
    characterImage: "",
    characterGlowImage: "",
    showResumeBtn: false,
    resumeBtnText: "",
    resumeBtnLink: "",
    showCertBtn: false,
    certBtnText: "",
    certBtnLink: "",
  },
  about: {
    headingSpan: "",
    headingSubtext: "",
    illustrationUrl: "",
  },
  experienceTitle: "",
  experiences: [],
  projects: [],
  footer: {
    contactTitle: "",
    contactDescription: "",
    email: "",
    instagramLink: "",
    githubLink: "",
    linkedinLink: "",
    pinterestLink: "",
    twitterLink: "",
    copyrightText: "",
  },
  iframeUrl: "",
  showIframe: false,
  isSampleCleaned: true,
};

export const defaultSampleData: SiteData = cleanSiteData;
export const initialSiteData: SiteData = cleanSiteData;

export const initialSiteStats: SiteStats = {
  totalVisits: 0,
  totalWrites: 0,
};

interface SiteContextType {
  siteData: SiteData;
  stats: SiteStats;
  isLoading: boolean;
  isRealtimeConnected: boolean;
  saveSiteData: (newData: SiteData) => Promise<void>;
  broadcastLiveUpdate: (liveData: SiteData) => void;
  cleanAllSampleData: () => Promise<void>;
  recordVisit: () => Promise<void>;
  resetStats: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType>({
  siteData: cleanSiteData,
  stats: initialSiteStats,
  isLoading: true,
  isRealtimeConnected: false,
  saveSiteData: async () => {},
  broadcastLiveUpdate: () => {},
  cleanAllSampleData: async () => {},
  recordVisit: async () => {},
  resetStats: async () => {},
});

export function SiteProvider({ children }: { children: React.ReactNode }) {
  // Initialize state cleanly
  const [siteData, setSiteData] = useState<SiteData>(cleanSiteData);
  const [stats, setStats] = useState<SiteStats>(initialSiteStats);
  const [isLoading, setIsLoading] = useState(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  // Helper to post to BroadcastChannel safely
  const postBroadcast = useCallback((data: SiteData) => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        bc.postMessage({ type: "PORTFOLIO_UPDATE", data });
        bc.close();
      } catch (err) {
        console.debug("BroadcastChannel post error:", err);
      }
    }
  }, []);

  // Synchronously / immediately restore cached data on client mount if available
  useEffect(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setSiteData((prev) => ({
          ...prev,
          ...parsed,
          theme: { ...prev.theme, ...(parsed.theme || {}) },
          header: { 
            ...prev.header, 
            ...(parsed.header || {}),
            navLinks: normalizeNavLinks(parsed.header?.navLinks),
          },
          banner: { ...prev.banner, ...(parsed.banner || {}) },
          about: { ...prev.about, ...(parsed.about || {}) },
          footer: { ...prev.footer, ...(parsed.footer || {}) },
        }));
      }
    } catch {
      // Ignore cache read error
    }
  }, []);

  // Real-time CSS Custom Variables Injection & Body Color Sync
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const theme = siteData.theme || cleanSiteData.theme;
    const bg = theme.bgColor || "#110720";
    const text = theme.textColor || "#ffffff";
    const accent = theme.accentColor || "#a855f7";
    const cardBg = theme.cardBgColor || "#180a2e";
    const cardBorder = theme.cardBorderColor || "#7e22ce";
    const cardTitle = theme.cardTitleColor || "#ffffff";
    const cardText = theme.cardTextColor || "#e9d5ff";

    root.style.setProperty("--background", bg);
    root.style.setProperty("--foreground", text);
    root.style.setProperty("--accent-color", accent);
    root.style.setProperty("--card-bg", cardBg);
    root.style.setProperty("--card-border", cardBorder);
    root.style.setProperty("--card-title", cardTitle);
    root.style.setProperty("--card-text", cardText);

    document.body.style.backgroundColor = bg;
    document.body.style.color = text;

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement("meta");
      metaThemeColor.setAttribute("name", "theme-color");
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute("content", bg);
  }, [siteData.theme]);

  // Real-time Cross-Tab Sync via BroadcastChannel and Storage Events
  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;
    if ("BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event.data && event.data.type === "PORTFOLIO_UPDATE" && event.data.data) {
            const updated = event.data.data as SiteData;
            setSiteData(updated);
          }
        };
      } catch (err) {
        console.debug("BroadcastChannel init error:", err);
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CACHE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setSiteData((prev) => ({
            ...prev,
            ...parsed,
            theme: { ...prev.theme, ...(parsed.theme || {}) },
            header: {
              ...prev.header,
              ...(parsed.header || {}),
              navLinks: normalizeNavLinks(parsed.header?.navLinks),
            },
            banner: { ...prev.banner, ...(parsed.banner || {}) },
            about: { ...prev.about, ...(parsed.about || {}) },
            footer: { ...prev.footer, ...(parsed.footer || {}) },
          }));
        } catch {}
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Listen to Firestore site data in real-time
  useEffect(() => {
    try {
      const docRef = doc(db, "site_settings", "main");
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          setIsRealtimeConnected(true);
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<SiteData>;
            const finalData: SiteData = {
              ...cleanSiteData,
              ...data,
              isSampleCleaned: true,
              theme: { ...cleanSiteData.theme, ...(data.theme || {}) },
              header: { 
                ...cleanSiteData.header, 
                ...(data.header || {}),
                navLinks: normalizeNavLinks(data.header?.navLinks),
              },
              banner: { ...cleanSiteData.banner, ...(data.banner || {}) },
              about: { ...cleanSiteData.about, ...(data.about || {}) },
              footer: { ...cleanSiteData.footer, ...(data.footer || {}) },
              experienceTitle: data.experienceTitle !== undefined ? data.experienceTitle : "",
              experiences: data.experiences || [],
              projects: data.projects || [],
              showIframe: data.showIframe !== undefined ? data.showIframe : false,
            };

            setSiteData(finalData);

            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(CACHE_KEY, JSON.stringify(finalData));
              } catch {}
            }
          } else {
            setSiteData(cleanSiteData);
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(CACHE_KEY, JSON.stringify(cleanSiteData));
              } catch {}
            }
          }
          setIsLoading(false);
        },
        (error) => {
          console.warn("Firestore snapshot error (using cached/local sync):", error);
          setIsRealtimeConnected(false);
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn("Firestore initialization error (using cached/local sync):", err);
      setIsRealtimeConnected(false);
      setIsLoading(false);
    }
  }, []);

  // Listen to stats metrics in real-time
  useEffect(() => {
    try {
      const statsRef = doc(db, "site_stats", "metrics");
      const unsubscribeStats = onSnapshot(
        statsRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setStats(docSnap.data() as SiteStats);
          }
        },
        (error) => {
          console.warn("Stats snapshot error:", error);
        }
      );
      return () => unsubscribeStats();
    } catch (err) {
      console.warn("Stats listener error:", err);
    }
  }, []);

  const recordVisit = async () => {
    try {
      const statsRef = doc(db, "site_stats", "metrics");
      await setDoc(
        statsRef,
        {
          totalVisits: increment(1),
          lastVisitAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Could not record visit stat:", err);
    }
  };

  const resetStats = async () => {
    try {
      const statsRef = doc(db, "site_stats", "metrics");
      await setDoc(statsRef, {
        totalVisits: 0,
        totalWrites: 0,
        lastSaveAt: new Date().toISOString(),
      });
      setStats({ totalVisits: 0, totalWrites: 0 });
    } catch (err) {
      console.error("Could not reset stats:", err);
      throw err;
    }
  };

  // Broadcast live preview update instantly across tabs
  const broadcastLiveUpdate = useCallback((liveData: SiteData) => {
    const formattedData: SiteData = {
      ...liveData,
      header: {
        ...liveData.header,
        navLinks: normalizeNavLinks(liveData.header?.navLinks),
      },
    };
    setSiteData(formattedData);
    postBroadcast(formattedData);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(formattedData));
      } catch {}
    }
  }, [postBroadcast]);

  const cleanAllSampleData = async () => {
    try {
      const cleanedData: SiteData = {
        ...cleanSiteData,
        theme: { ...siteData.theme },
        isSampleCleaned: true,
      };

      setSiteData(cleanedData);
      postBroadcast(cleanedData);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(cleanedData));
        } catch {}
      }

      const docRef = doc(db, "site_settings", "main");
      await setDoc(docRef, cleanedData);

      // Track admin write count
      const statsRef = doc(db, "site_stats", "metrics");
      await setDoc(
        statsRef,
        {
          totalWrites: increment(1),
          lastSaveAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Error cleaning sample data in Firestore:", err);
      throw err;
    }
  };

  const saveSiteData = async (newData: SiteData) => {
    try {
      const dataToSave: SiteData = {
        ...newData,
        header: {
          ...newData.header,
          navLinks: normalizeNavLinks(newData.header?.navLinks),
        },
        isSampleCleaned: true,
      };

      // Optimistically update state and broadcast immediately across tabs
      setSiteData(dataToSave);
      postBroadcast(dataToSave);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(dataToSave));
        } catch {}
      }

      // Persist to Cloud Firestore
      const docRef = doc(db, "site_settings", "main");
      await setDoc(docRef, dataToSave);

      // Track admin write count
      const statsRef = doc(db, "site_stats", "metrics");
      await setDoc(
        statsRef,
        {
          totalWrites: increment(1),
          lastSaveAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Error saving site data to Firestore:", err);
      throw err;
    }
  };

  return (
    <SiteContext.Provider value={{ 
      siteData, 
      stats, 
      isLoading, 
      isRealtimeConnected, 
      saveSiteData, 
      broadcastLiveUpdate,
      cleanAllSampleData, 
      recordVisit, 
      resetStats 
    }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteData() {
  return useContext(SiteContext);
}
