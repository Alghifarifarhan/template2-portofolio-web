"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSiteData } from "@/context/SiteContext";
import { formatDriveImageUrl } from "@/lib/driveUtils";
import { ExperienceItem } from "@/types/siteData";
import ScrollReveal from "./ScrollReveal";

export default function Experience(): React.JSX.Element {
  const { siteData } = useSiteData();
  const experiences = siteData.experiences || [];
  const theme = siteData.theme || {};
  const accentColor = theme.accentColor || "#a855f7";
  const sectionTitle = siteData.experienceTitle !== undefined && siteData.experienceTitle.trim() !== "" 
    ? siteData.experienceTitle 
    : "What I Do";

  // Card color fallbacks
  const globalCardBg = theme.cardBgColor || "#ffffff";
  const globalCardBorder = theme.cardBorderColor || "#e5e7eb";
  const globalCardTitleColor = theme.cardTitleColor || "#000000";
  const globalCardTextColor = theme.cardTextColor || "#374151";

  // Modal State
  const [selectedCard, setSelectedCard] = useState<ExperienceItem | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const openModal = (card: ExperienceItem) => {
    setSelectedCard(card);
    setIsClosing(false);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedCard(null);
      setIsClosing(false);
    }, 220);
  };

  const getIconSrc = (iconValue?: string) => {
    if (!iconValue) return "/assets/icon_1.png";
    if (iconValue.startsWith("/assets/")) return iconValue;
    if (iconValue.startsWith("icon_")) return `/assets/${iconValue}.png`;
    if (iconValue.startsWith("http")) return formatDriveImageUrl(iconValue);
    return `/assets/${iconValue}`;
  };

  if (!experiences || experiences.length === 0) {
    return <></>;
  }

  return (
    <section id="experience" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal variant="text">
          <h2 
            className="text-4xl lg:text-5xl font-bold mb-12 text-center"
            style={{ color: theme.textColor || "#000000" }}
          >
            {sectionTitle}
          </h2>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiences.map((card, index) => {
            const iconSrc = getIconSrc(card.icon);
            const cardBg = card.bgColor || globalCardBg;
            const cardBorder = card.borderColor || globalCardBorder;

            return (
              <ScrollReveal key={card.id} variant="box" delay={(index % 4) * 120}>
                <div
                  onClick={() => openModal(card)}
                  className="backdrop-blur-md rounded-2xl p-6 border-t-4 hover:shadow-2xl flex items-center gap-5 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 active:scale-95 group shadow-lg h-full"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: cardBorder,
                    boxShadow: `0 10px 30px -10px ${cardBorder}40`,
                  }}
                >
                  {iconSrc ? (
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex items-center justify-center p-2 rounded-xl bg-white/50 border border-white/30 group-hover:scale-110 group-hover:rotate-3 transition-transform overflow-hidden shadow-sm">
                        <Image
                          src={iconSrc}
                          alt={card.title}
                          fill
                          sizes="80px"
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                    </div>
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-xl font-bold mb-2 group-hover:opacity-90 transition-opacity"
                      style={{ color: globalCardTitleColor }}
                    >
                      {card.title}
                    </h3>
                    <p 
                      className="text-sm mb-4 line-clamp-2 leading-relaxed"
                      style={{ color: globalCardTextColor }}
                    >
                      {card.description}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(card);
                      }}
                      className="font-semibold text-xs tracking-wider uppercase transition-all inline-flex items-center gap-1.5 hover:translate-x-1 active:scale-95"
                      style={{ color: accentColor }}
                    >
                      {card.buttonText || "VIEW DETAILS →"}
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* POPUP MODAL */}
      {selectedCard && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity ${
            isClosing ? "animate-fadeOut" : "animate-fadeIn"
          }`}
          onClick={closeModal}
        >
          <div 
            className={`relative w-full max-w-xl border rounded-2xl p-6 sm:p-8 text-white shadow-2xl space-y-6 ${
              isClosing ? "animate-scale-down-modal" : "animate-scale-up-modal"
            }`}
            style={{
              backgroundColor: selectedCard.bgColor || globalCardBg,
              borderColor: selectedCard.borderColor || globalCardBorder,
              boxShadow: `0 0 40px ${selectedCard.borderColor || globalCardBorder}60`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-gray-300 hover:text-white flex items-center justify-center transition-all text-lg"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Header & Icon */}
            <div className="flex items-center gap-4 border-b border-white/15 pb-4 pr-8">
              {selectedCard.icon && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 relative bg-white/50 rounded-xl p-2 border border-white/30 flex items-center justify-center overflow-hidden shadow-sm">
                  <Image
                    src={getIconSrc(selectedCard.icon)}
                    alt={selectedCard.title}
                    fill
                    sizes="80px"
                    className="object-contain p-1 animate-fadeIn"
                    unoptimized
                  />
                </div>
              )}
              <div>
                <h3 
                  className="text-2xl font-bold"
                  style={{ color: globalCardTitleColor }}
                >
                  {selectedCard.title}
                </h3>
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentColor }}>
                  What I Do Details
                </span>
              </div>
            </div>

            {/* Description Body */}
            <div className="space-y-3">
              <p 
                className="text-base leading-relaxed whitespace-pre-line"
                style={{ color: globalCardTextColor }}
              >
                {selectedCard.description}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/15">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-sm font-medium transition-all"
              >
                Close
              </button>
              {selectedCard.buttonLink && (
                <Link
                  href={selectedCard.buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: `0 4px 15px ${accentColor}50`,
                  }}
                >
                  Visit Link ↗
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
