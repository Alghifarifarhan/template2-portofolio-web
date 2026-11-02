"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSiteData } from "@/context/SiteContext";
import { formatDriveImageUrl } from "@/lib/driveUtils";
import ScrollReveal from "./ScrollReveal";

export default function Banner(): React.JSX.Element {
  const { siteData } = useSiteData();
  const banner = siteData.banner || {};
  const accentColor = siteData.theme?.accentColor || "#a855f7";

  const texts = banner.typingSubtitles && banner.typingSubtitles.length > 0 
    ? banner.typingSubtitles 
    : [];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    if (!texts.length) {
      setDisplayedText("");
      return;
    }
    const currentText = texts[currentTextIndex % texts.length] || "";
    
    if (!isDeleting) {
      if (displayedText.length < currentText.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setIsDeleting(true);
          setTypingSpeed(50);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    } else {
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length - 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        setIsDeleting(false);
        setTypingSpeed(100);
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
      }
    }
  }, [displayedText, isDeleting, currentTextIndex, texts, typingSpeed]);

  const charImg = banner.characterImage ? formatDriveImageUrl(banner.characterImage) : "";
  const charGlowImg = banner.characterGlowImage ? formatDriveImageUrl(banner.characterGlowImage) : "";
  const companyLogo = banner.companyLogoUrl ? formatDriveImageUrl(banner.companyLogoUrl) : "";

  const hasActionBtns = (banner.showResumeBtn && banner.resumeBtnLink) || (banner.showCertBtn && banner.certBtnLink);
  const hasGreeting = banner.helloText || banner.name;
  const hasHeroImages = charImg || charGlowImg;
  const hasContent =
    hasHeroImages ||
    hasGreeting ||
    banner.designerLine1 ||
    banner.designerLine2 ||
    banner.quoteText ||
    hasActionBtns ||
    displayedText ||
    banner.currentRoleText ||
    banner.bioText;

  if (!hasContent) {
    return <></>;
  }

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center pt-36 sm:pt-40 lg:pt-28 pb-12 px-6"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Character image side with standardized responsive dimensions */}
          {hasHeroImages && (
            <div className="flex justify-center lg:justify-end relative w-full lg:w-auto flex-shrink-0">
              <ScrollReveal variant="image" delay={100}>
                <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] lg:w-[420px] lg:h-[420px] flex items-center justify-center mt-8 sm:mt-6 lg:mt-0">
                  {/* Mobile: Hello text */}
                  {hasGreeting && (
                    <div className="lg:hidden absolute -top-10 sm:-top-12 z-20">
                      <div className="relative inline-block">
                        <Image
                          src="/assets/arrow.png"
                          alt="Arrow pointer"
                          width={32}
                          height={32}
                          className="absolute -top-5 -left-4 sm:-top-6 sm:-left-5 w-7 h-7 sm:w-8 sm:h-8 object-contain -rotate-45 pointer-events-none"
                        />
                        <div className="relative bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/10 shadow-lg">
                          <p className="text-sm font-medium whitespace-nowrap" style={{ color: siteData.theme?.textColor || "#000000" }}>
                            {banner.helloText}{" "}
                            <span style={{ color: accentColor }}>{banner.name}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {charImg ? (
                    <Image
                      src={charImg}
                      alt={banner.name || "Character"}
                      fill
                      sizes="(max-width: 768px) 280px, (max-width: 1024px) 360px, 420px"
                      className="object-contain z-10"
                      priority
                      unoptimized
                    />
                  ) : null}
                  {charGlowImg ? (
                    <Image
                      src={charGlowImg}
                      alt={banner.name || "Character Glow"}
                      fill
                      sizes="(max-width: 768px) 280px, (max-width: 1024px) 360px, 420px"
                      className="object-contain z-0"
                      priority
                      unoptimized
                    />
                  ) : null}
                </div>
              </ScrollReveal>
            </div>
          )}

          <div className="flex-1 space-y-6 text-center lg:text-left">
            {/* Desktop: Hello text */}
            {hasGreeting && (
              <ScrollReveal variant="text" delay={50}>
                <div className="hidden lg:inline-block relative">
                  <Image
                    src="/assets/arrow.png"
                    alt="Arrow pointer"
                    width={100}
                    height={100}
                    className="absolute"
                    style={{ left: "-100px", top: "-50px", width: "auto", height: "auto" }}
                  />
                  <div style={{ bottom: 40, position: "relative" }}>
                    <p className="text-lg" style={{ color: siteData.theme?.textColor || "#000000" }}>
                      {banner.helloText}{" "}
                      <span style={{ color: accentColor }}>{banner.name}</span>
                    </p>
                  </div>
                  <div className="absolute -bottom-2 left-8 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white/10"></div>
                </div>
              </ScrollReveal>
            )}
            <div>
              {banner.designerLine1 && (
                <ScrollReveal variant="text" delay={120}>
                  <p className="text-2xl">{banner.designerLine1}</p>
                </ScrollReveal>
              )}
              {banner.designerLine2 && (
                <ScrollReveal variant="text" delay={180}>
                  <h1 className="text-5xl tracking-tight lg:text-7xl font-semibold leading-tight mt-1" style={{ color: siteData.theme?.textColor || "#000000" }}>
                    {banner.designerLine2}
                  </h1>
                </ScrollReveal>
              )}
              {banner.quoteText && (
                <ScrollReveal variant="text" delay={240}>
                  <p className="text-md opacity-80 mt-3">
                    {banner.quoteText}
                  </p>
                </ScrollReveal>
              )}

              {/* Optional Resume & Certificate Buttons */}
              {hasActionBtns && (
                <ScrollReveal variant="box" delay={300}>
                  <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                    {banner.showResumeBtn && banner.resumeBtnLink && (
                      <Link
                        href={banner.resumeBtnLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 border border-purple-500/40 bg-purple-600/30 text-white hover:bg-purple-600/50 hover:shadow-purple-500/25"
                      >
                        {banner.resumeBtnText || "View Resume 📄"}
                      </Link>
                    )}
                    {banner.showCertBtn && banner.certBtnLink && (
                      <Link
                        href={banner.certBtnLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2 border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/40"
                      >
                        {banner.certBtnText || "Certificates 📜"}
                      </Link>
                    )}
                  </div>
                </ScrollReveal>
              )}
            </div>
          </div>
        </div>

        {(displayedText || banner.currentRoleText || banner.bioText) && (
          <ScrollReveal variant="text" delay={200} className="space-y-3 pt-15 text-center lg:text-left">
            {displayedText && (
              <p className="text-5xl font-bold" style={{ color: siteData.theme?.textColor || "#000000" }}>
                I&apos;m a {displayedText}
                <span className="animate-pulse">|</span>
              </p>
            )}
            {banner.currentRoleText && (
              <div className="text-lg lg:text-xl opacity-90 tracking-wide flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span>{banner.currentRoleText}</span>
                {(banner.companyName || companyLogo) && (
                  <span className="flex items-center gap-2">
                    {companyLogo ? (
                      <div className="relative w-5 h-5 flex-shrink-0">
                        <Image 
                          src={companyLogo} 
                          alt={banner.companyName || "Company Logo"} 
                          fill
                          sizes="20px"
                          className="object-contain" 
                          unoptimized
                        />
                      </div>
                    ) : null}
                    {banner.companyName ? (
                      <span className="text-blue-400 font-semibold">{banner.companyName}</span>
                    ) : null}
                  </span>
                )}
              </div>
            )}
            {banner.bioText && (
              <p className="text-lg opacity-80 max-w-2xl mt-15 mx-auto lg:mx-0">
                {banner.bioText}
              </p>
            )}
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
