"use client";

import { useEffect } from "react";
import Header from "./components/Header";
import Banner from "./components/Banner";
import Experience from "./components/Experience";
import About from "./components/About";
import Projects from "./components/Projects";
import Footer from "./components/Footer";
import ScrollReveal from "./components/ScrollReveal";
import { useSiteData } from "@/context/SiteContext";

export default function Home(): React.JSX.Element {
  const { siteData, recordVisit } = useSiteData();

  useEffect(() => {
    // Record visit once per session
    if (typeof window !== "undefined" && !sessionStorage.getItem("visited_session")) {
      recordVisit();
      sessionStorage.setItem("visited_session", "true");
    }
  }, [recordVisit]);

  return (
    <main
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: siteData.theme?.bgColor || "#ffffff",
        color: siteData.theme?.textColor || "#000000",
      }}
    >
      <Header />
      <Banner />
      <Experience />
      <About />
      <Projects />
      {siteData.showIframe !== false && siteData.iframeUrl && (
        <section id="booking" className="py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal variant="box">
              <div 
                className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 no-scrollbar backdrop-blur-md relative"
                style={{
                  backgroundColor: siteData.theme?.cardBgColor ? `${siteData.theme.cardBgColor}80` : "rgba(255, 255, 255, 0.02)",
                  boxShadow: `0 20px 50px -10px ${siteData.theme?.accentColor || "#a855f7"}20`,
                }}
              >
                <iframe
                  src={siteData.iframeUrl}
                  width="100%"
                  height="780"
                  className="w-full h-[650px] sm:h-[750px] lg:h-[800px] border-0 rounded-3xl no-scrollbar overflow-hidden"
                  style={{
                    border: "none",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                  title="Booking Calendar Widget"
                  loading="lazy"
                />
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}
      <Footer />
    </main>
  );
}
