export const hofMonths = [
  "November, 2025",
  "October, 2025",
  "September, 2025",
  "August, 2025",
  "July, 2025",
  "June, 2025",
  "May, 2025",
];


export const hofCategories = [
  "All",
  "Written content",
  "Visual & Art content",
  "Meme content",
  "Other Creative Content",
];


export const normalizeCategory = (cat = "") => {
  const s = cat.toLowerCase();
  if (s.includes("written")) return "written";
  if (s.includes("visual") || s.includes("art")) return "visual";
  if (s.includes("meme")) return "meme";
  if (s.includes("other")) return "other";
  return "overall";
};

export const hofEntries = [];
