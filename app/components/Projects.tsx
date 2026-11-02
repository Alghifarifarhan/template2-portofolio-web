"use client";

import Image from "next/image";
import { useSiteData } from "@/context/SiteContext";
import { formatDriveImageUrl } from "@/lib/driveUtils";
import ScrollReveal from "./ScrollReveal";

export default function Projects(): React.JSX.Element {
  const { siteData } = useSiteData();
  const projects = siteData.projects || [];
  const accentColor = siteData.theme?.accentColor || "#a855f7";

  if (!projects || projects.length === 0) {
    return <></>;
  }

  return (
    <section id="projects" className="py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        {projects.map((project, index) => {
          const isEven = index % 2 === 1;
          const imageSrc = project.image ? formatDriveImageUrl(project.image) : "";

          return (
            <div key={project.id} className="mb-20 last:mb-0">
              <div
                className={`relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                  isEven ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Text Content */}
                <ScrollReveal
                  variant={isEven ? "right" : "left"}
                  delay={100}
                  className={`${isEven ? "lg:col-start-2" : ""} space-y-4`}
                >
                  <p 
                    className="text-lg lg:text-xl font-medium"
                    style={{ color: accentColor }}
                  >
                    Featured Project
                  </p>
                  <h3 
                    className="text-3xl lg:text-4xl font-bold"
                    style={{ color: siteData.theme?.textColor || "#000000" }}
                  >
                    {project.title}
                  </h3>
                  {/* Description Card with Floating Overlap & Safe Text Spacing */}
                  <div className="relative z-20">
                    <div
                      className={`backdrop-blur-md rounded-2xl p-6 lg:p-8 shadow-2xl transition-all ${
                        isEven
                          ? "lg:ml-[-18%] lg:w-[calc(100%+18%)]"
                          : "lg:w-[calc(100%+18%)]"
                      }`}
                      style={{
                        backgroundColor: siteData.theme?.cardBgColor ? `${siteData.theme.cardBgColor}e6` : "rgba(20, 10, 35, 0.85)",
                      }}
                    >
                      <p 
                        className={`opacity-90 text-base lg:text-lg leading-relaxed break-words ${
                          isEven ? "lg:max-w-[80%] lg:pl-4 ml-auto" : "lg:max-w-[80%] lg:pr-4"
                        }`}
                        style={{ color: siteData.theme?.cardTextColor || siteData.theme?.textColor || "#d1d5db" }}
                      >
                        {project.description}
                      </p>
                    </div>
                  </div>
                  {/* Website link */}
                  {project.link && (
                    <div className="pt-2 flex gap-4">
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 active:scale-90 transition-all duration-200 inline-block p-1"
                        style={{ color: siteData.theme?.textColor || "#000000" }}
                        aria-label="Visit project website"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-6 h-6"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10z" />
                        </svg>
                      </a>
                    </div>
                  )}
                </ScrollReveal>

                {/* Image Content */}
                <ScrollReveal
                  variant={isEven ? "left" : "right"}
                  delay={200}
                  className={`${isEven ? "lg:col-start-1 lg:row-start-1" : ""}`}
                >
                  <div 
                    className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden p-2 lg:p-3 shadow-2xl transition-all"
                    style={{
                      backgroundColor: siteData.theme?.cardBgColor || "#020617",
                    }}
                  >
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={project.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover"
                          unoptimized
                        />
                      ) : null}
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
