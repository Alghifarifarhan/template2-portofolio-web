"use client";

import Image from "next/image";
import { useSiteData } from "@/context/SiteContext";
import { formatDriveImageUrl } from "@/lib/driveUtils";
import ScrollReveal from "./ScrollReveal";

export default function About(): React.JSX.Element {
  const { siteData } = useSiteData();
  const about = siteData.about || {};
  const accentColor = siteData.theme?.accentColor || "#a855f7";
  const illustrationSrc = about.illustrationUrl ? formatDriveImageUrl(about.illustrationUrl) : "";

  if (!about.headingSpan && !about.headingSubtext && !illustrationSrc) {
    return <></>;
  }

  return (
    <section id="about" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        {(about.headingSpan || about.headingSubtext) && (
          <ScrollReveal variant="text" className="text-center mb-16">
            <p className="text-2xl max-w-6xl mx-auto" style={{ color: siteData.theme?.textColor || "#000000" }}>
              {about.headingSpan && <span style={{ color: accentColor }}>{about.headingSpan}</span>}
              {about.headingSubtext && (
                <>
                  <br />
                  <span className="text-sm opacity-80">{about.headingSubtext}</span>
                </>
              )}
            </p>
          </ScrollReveal>
        )}
        {illustrationSrc ? (
          <ScrollReveal variant="image" delay={150}>
            <div 
              className="relative w-full max-w-4xl h-[260px] sm:h-[380px] lg:h-[480px] mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl p-2 sm:p-4 flex items-center justify-center backdrop-blur-md"
              style={{
                backgroundColor: siteData.theme?.cardBgColor || "rgba(255, 255, 255, 0.04)",
                boxShadow: `0 20px 50px -10px ${accentColor}25`,
              }}
            >
              <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center">
                <Image 
                  src={illustrationSrc}
                  alt="Skills & About Illustration"
                  fill
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="object-contain rounded-xl sm:rounded-2xl"
                  unoptimized
                />
              </div>
            </div>
          </ScrollReveal>
        ) : null}
      </div>
    </section>
  );
}
