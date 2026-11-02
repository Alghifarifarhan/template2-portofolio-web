"use client";

import Link from "next/link";
import Image from "next/image";
import { useSiteData } from "@/context/SiteContext";
import ScrollReveal from "./ScrollReveal";

export default function Footer(): React.JSX.Element {
  const { siteData } = useSiteData();
  const footer = siteData.footer || {};
  const accentColor = siteData.theme?.accentColor || "#a855f7";

  const hasContact = footer.contactTitle || footer.contactDescription || footer.email;
  const hasSocials = 
    footer.instagramLink || 
    footer.githubLink || 
    footer.linkedinLink || 
    footer.pinterestLink || 
    footer.twitterLink;

  return (
    <footer id="footer" className="py-10 px-6 border-t border-white/10">
      <div className="container mx-auto max-w-6xl">
        {hasContact && (
          <ScrollReveal variant="text" className="text-center mb-12">
            {footer.contactTitle && (
              <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ color: siteData.theme?.textColor || "#000000" }}>
                {footer.contactTitle}
              </h2>
            )}
            {footer.contactDescription && (
              <p className="text-md opacity-80 max-w-2xl mx-auto mb-8">
                {footer.contactDescription}
              </p>
            )}
            {footer.email && (
              <a
                href={`mailto:${footer.email}`}
                className="text-md transition-all font-medium hover:opacity-80 active:scale-95 inline-block"
                style={{ color: accentColor }}
              >
                {footer.email}
              </a>
            )}
          </ScrollReveal>
        )}

        {/* Social Media Icons */}
        {hasSocials && (
          <ScrollReveal variant="box" delay={150}>
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              {footer.instagramLink && (
                <Link
                  href={footer.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-90 border border-purple-500/30 hover:border-purple-500/50 transition-all text-white"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Link>
              )}
              {footer.githubLink && (
                <Link
                  href={footer.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-90 border border-purple-500/30 hover:border-purple-500/50 transition-all"
                  aria-label="GitHub"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </Link>
              )}
              {footer.linkedinLink && (
                <Link
                  href={footer.linkedinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-90 border border-purple-500/30 hover:border-purple-500/50 transition-all"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </Link>
              )}
              {footer.pinterestLink && (
                <Link
                  href={footer.pinterestLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-90 border border-purple-500/30 hover:border-purple-500/50 transition-all text-white"
                  aria-label="Pinterest"
                >
                  <svg
                    className="w-5 h-5 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                  </svg>
                </Link>
              )}
              {footer.twitterLink && (
                <Link
                  href={footer.twitterLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-90 border border-purple-500/30 hover:border-purple-500/50 transition-all text-white"
                  aria-label="Twitter"
                >
                  <svg
                    className="w-4 h-4 fill-current"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
              )}
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal variant="fade" delay={200} className="text-center mt-12 pt-8 border-t border-white/10 space-y-4">
          <p className="opacity-60 text-sm">
            © 2026{" "}
            <a
              href="https://www.figma.com/@ibrahimmemon"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:opacity-100 transition-opacity underline-offset-4"
            >
              Ibrahim Memon
            </a>
            . All rights reserved.
          </p>

          {/* Icon Attribution Copyright Links in Sequential Order */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] opacity-40 hover:opacity-80 transition-opacity leading-relaxed max-w-4xl mx-auto">
            <a
              href="https://www.flaticon.com/free-icons/programming-language"
              title="programming language icons"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-purple-300 transition-colors"
            >
              Programming language icons created by Mayor Icons - Flaticon
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="https://www.flaticon.com/free-icons/graphic-design"
              title="graphic design icons"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-purple-300 transition-colors"
            >
              Graphic design icons created by Magnific - Flaticon
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="https://www.flaticon.com/free-icons/document"
              title="document icons"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-purple-300 transition-colors"
            >
              Document icons created by Magnific - Flaticon
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="https://www.flaticon.com/free-icons/search"
              title="search icons"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-purple-300 transition-colors"
            >
              Search icons created by Good Ware - Flaticon
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="https://www.flaticon.com/free-icons/user"
              title="user icons"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-purple-300 transition-colors"
            >
              User icons created by Magnific - Flaticon
            </a>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
