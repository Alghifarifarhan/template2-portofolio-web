export interface ThemeSettings {
  bgColor: string;
  textColor: string;
  accentColor: string;
  cardBgColor?: string;
  cardBorderColor?: string;
  cardTitleColor?: string;
  cardTextColor?: string;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface HeaderData {
  logoUrl: string;
  logoType?: "image" | "text";
  logoText?: string;
  navLinks: NavLink[];
}

export interface BannerData {
  helloText: string;
  name: string;
  typingSubtitles: string[];
  designerLine1: string;
  designerLine2: string;
  quoteText: string;
  currentRoleText: string;
  companyName?: string;
  companyLogoUrl?: string;
  bioText: string;
  characterImage: string;
  characterGlowImage: string;
  showResumeBtn?: boolean;
  resumeBtnText?: string;
  resumeBtnLink?: string;
  showCertBtn?: boolean;
  certBtnText?: string;
  certBtnLink?: string;
}

export interface AboutData {
  headingSpan: string;
  headingSubtext: string;
  illustrationUrl: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  buttonLink: string;
  bgColor?: string;
  borderColor?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

export interface FooterData {
  contactTitle: string;
  contactDescription: string;
  email: string;
  instagramLink: string;
  githubLink: string;
  linkedinLink: string;
  pinterestLink?: string;
  twitterLink?: string;
  copyrightText: string;
}

export interface SiteData {
  theme: ThemeSettings;
  header: HeaderData;
  banner: BannerData;
  about: AboutData;
  experienceTitle?: string;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  footer: FooterData;
  iframeUrl: string;
  showIframe?: boolean;
  isSampleCleaned?: boolean;
}

export const WHAT_I_DO_ICONS = [
  {
    id: "icon_1",
    path: "/assets/icon_1.png",
    name: "Programming & Code",
    creditText: "Programming language icons created by Mayor Icons - Flaticon",
    creditUrl: "https://www.flaticon.com/free-icons/programming-language",
    creditTitle: "programming language icons",
    author: "Mayor Icons",
  },
  {
    id: "icon_2",
    path: "/assets/icon_2.png",
    name: "Graphic Design",
    creditText: "Graphic design icons created by Magnific - Flaticon",
    creditUrl: "https://www.flaticon.com/free-icons/graphic-design",
    creditTitle: "graphic design icons",
    author: "Magnific",
  },
  {
    id: "icon_3",
    path: "/assets/icon_3.png",
    name: "Document & Content",
    creditText: "Document icons created by Magnific - Flaticon",
    creditUrl: "https://www.flaticon.com/free-icons/document",
    creditTitle: "document icons",
    author: "Magnific",
  },
  {
    id: "icon_4",
    path: "/assets/icon_4.png",
    name: "Search & Research",
    creditText: "Search icons created by Good Ware - Flaticon",
    creditUrl: "https://www.flaticon.com/free-icons/search",
    creditTitle: "search icons",
    author: "Good Ware",
  },
  {
    id: "icon_5",
    path: "/assets/icon_5.png",
    name: "User & Profile",
    creditText: "User icons created by Magnific - Flaticon",
    creditUrl: "https://www.flaticon.com/free-icons/user",
    creditTitle: "user icons",
    author: "Magnific",
  },
] as const;

export const SECTION_TARGETS = [
  { value: "#hero", label: "Hero & Actions Button (#hero)" },
  { value: "#about", label: "About Section (#about)" },
  { value: "#experience", label: "What I Do (#experience)" },
  { value: "#projects", label: "Featured Projects (#projects)" },
  { value: "#footer", label: "Footer & Widgets (#footer)" },
] as const;

export const DEFAULT_NAV_LINKS: NavLink[] = [
  { id: "nav-hero", label: "Home", href: "#hero" },
  { id: "nav-about", label: "About", href: "#about" },
  { id: "nav-experience", label: "What I Do", href: "#experience" },
  { id: "nav-projects", label: "Projects", href: "#projects" },
  { id: "nav-footer", label: "Contact", href: "#footer" },
];

