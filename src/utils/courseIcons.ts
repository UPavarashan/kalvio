/** Material icon names grouped by broad course area */

const COMPUTING_ICONS = [
  "code",
  "terminal",
  "database",
  "hub",
  "lan",
  "storage",
  "memory",
  "developer_board",
  "touch_app",
  "functions",
  "language",
  "psychology",
] as const;

const MEDICINE_ICONS = [
  "local_hospital",
  "medical_services",
  "biotech",
  "medication",
  "monitor_heart",
  "health_and_safety",
  "science",
  "favorite",
  "accessibility_new",
  "healing",
  "bloodtype",
  "vital_signs",
] as const;

const BUSINESS_ICONS = [
  "business_center",
  "trending_up",
  "account_balance",
  "payments",
  "storefront",
  "bar_chart",
  "attach_money",
  "work",
  "leaderboard",
  "savings",
  "receipt_long",
  "corporate_fare",
] as const;

const LAW_ICONS = [
  "gavel",
  "balance",
  "policy",
  "menu_book",
  "article",
  "account_balance",
  "public",
  "shield",
  "description",
  "fact_check",
  "groups",
  "history_edu",
] as const;

const ENGINEERING_ICONS = [
  "engineering",
  "construction",
  "precision_manufacturing",
  "electrical_services",
  "architecture",
  "build",
  "settings",
  "factory",
  "handyman",
  "straighten",
  "water_drop",
  "bolt",
] as const;

const SCIENCE_ICONS = [
  "science",
  "biotech",
  "genetics",
  "eco",
  "waves",
  "thermostat",
  "visibility",
  "water",
  "opacity",
  "cyclone",
  "compost",
  "pest_control",
] as const;

const ARTS_ICONS = [
  "palette",
  "brush",
  "music_note",
  "theater_comedy",
  "auto_stories",
  "draw",
  "movie",
  "photo_camera",
  "interpreter_mode",
  "history_edu",
  "translate",
  "library_books",
] as const;

const EDUCATION_ICONS = [
  "school",
  "menu_book",
  "library_books",
  "history_edu",
  "edit_note",
  "lightbulb",
  "groups",
  "psychology",
  "category",
  "topic",
  "quiz",
  "co_present",
] as const;

const GENERAL_ICONS = [
  "menu_book",
  "school",
  "lightbulb",
  "edit_note",
  "category",
  "topic",
  "library_books",
  "auto_stories",
  "groups",
  "science",
  "calculate",
  "workspace_premium",
] as const;

type IconRule = {
  keywords: string[];
  icons: readonly string[];
};

const COURSE_ICON_RULES: IconRule[] = [
  {
    keywords: [
      "computer",
      "computing",
      "software",
      "information technology",
      "informatics",
      "data science",
      "cyber",
      "artificial intelligence",
      "machine learning",
      "csc",
      "it",
    ],
    icons: COMPUTING_ICONS,
  },
  {
    keywords: [
      "medicine",
      "medical",
      "nursing",
      "pharmacy",
      "dentistry",
      "physio",
      "health science",
      "biomedical",
      "midwifery",
      "veterinary",
    ],
    icons: MEDICINE_ICONS,
  },
  {
    keywords: [
      "business",
      "finance",
      "accounting",
      "economics",
      "commerce",
      "marketing",
      "management",
      "mba",
      "entrepreneur",
    ],
    icons: BUSINESS_ICONS,
  },
  {
    keywords: ["law", "legal", "llb", "juris"],
    icons: LAW_ICONS,
  },
  {
    keywords: [
      "engineering",
      "mechanical",
      "civil",
      "electrical",
      "electronic",
      "aerospace",
      "chemical engineering",
      "built environment",
    ],
    icons: ENGINEERING_ICONS,
  },
  {
    keywords: [
      "physics",
      "chemistry",
      "biology",
      "biochemistry",
      "mathematics",
      "math",
      "statistics",
      "geology",
      "environmental science",
      "natural science",
    ],
    icons: SCIENCE_ICONS,
  },
  {
    keywords: [
      "art",
      "design",
      "music",
      "drama",
      "theatre",
      "theater",
      "fine art",
      "media",
      "film",
      "creative",
      "humanities",
      "english",
      "literature",
      "history",
      "philosophy",
    ],
    icons: ARTS_ICONS,
  },
  {
    keywords: ["education", "teaching", "pedagogy", "primary education"],
    icons: EDUCATION_ICONS,
  },
  {
    keywords: ["psychology", "sociology", "social work", "anthropology"],
    icons: ["psychology", "groups", "diversity_3", "volunteer_activism", "forum", "handshake", "public", "family_restroom", "sentiment_satisfied", "self_improvement", "interpreter_mode", "history_edu"],
  },
];

function normalizeCourse(course: string): string {
  return course.toLowerCase().trim();
}

export function getSubjectIconsForCourse(course: string): readonly string[] {
  const normalized = normalizeCourse(course);
  if (!normalized) return GENERAL_ICONS;

  for (const rule of COURSE_ICON_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.icons;
    }
  }

  return GENERAL_ICONS;
}

export function getDefaultSubjectIcon(course: string): string {
  return getSubjectIconsForCourse(course)[0];
}

/** Legacy CS icon list — kept for modules that don't have course context */
export const SUBJECT_ICONS = COMPUTING_ICONS;
