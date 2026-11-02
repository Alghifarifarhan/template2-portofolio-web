"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSiteData } from "@/context/SiteContext";
import { formatDriveImageUrl } from "@/lib/driveUtils";

export default function Header(): React.JSX.Element {
  const { siteData } = useSiteData();
  const rawLogo = siteData.header?.logoUrl || "";
  const logoSrc = rawLogo ? formatDriveImageUrl(rawLogo) : "";
  const logoType = siteData.header?.logoType || (logoSrc ? "image" : "text");
  const logoText = siteData.header?.logoText || "";
  const navLinks = siteData.header?.navLinks || [];
  const bgColor = siteData.theme?.bgColor || "#ffffff";
  const textColor = siteData.theme?.textColor || "#000000";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTextLogo = logoType === "text" || !logoSrc;
  const displayLogoText = logoText || siteData.banner?.name || "";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-white/10"
      style={{ backgroundColor: `${bgColor}e6` }}
    >
      <nav className="px-6 py-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between h-full">
          <Link
            href="/"
            className="hover:opacity-80 transition-opacity flex items-center"
            onClick={() => setMobileMenuOpen(false)}
          >
            {!isTextLogo && logoSrc ? (
              <div className="relative h-10 w-36 sm:w-44 flex items-center">
                <Image
                  src={logoSrc}
                  alt="Logo"
                  fill
                  sizes="176px"
                  className="object-contain object-left"
                  unoptimized
                />
              </div>
            ) : displayLogoText ? (
              <span className="font-bold text-xl sm:text-2xl tracking-tight" style={{ color: textColor }}>
                {displayLogoText}
              </span>
            ) : null}
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            {navLinks.map((link) => (
              <li key={link.id} className="m-0 p-0">
                <Link
                  href={link.href}
                  className="hover:opacity-80 transition-colors text-base font-medium"
                  style={{ color: textColor }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Hamburger Toggle Button */}
          {navLinks.length > 0 && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2.5 rounded-xl border border-white/20 hover:bg-white/10 active:scale-90 transition-all duration-300 flex items-center justify-center text-lg ${
                mobileMenuOpen ? "rotate-90 bg-white/10" : "rotate-0"
              }`}
              style={{ color: textColor }}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          )}
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {mobileMenuOpen && navLinks.length > 0 && (
          <div
            className="md:hidden mt-4 pt-4 border-t border-white/10 space-y-3 pb-2 animate-slide-down-nav"
            style={{ color: textColor }}
          >
            {navLinks.map((link, index) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-base font-medium hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all animate-nav-item"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
