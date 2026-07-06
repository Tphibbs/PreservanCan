import type {
  CandidateScores,
  DiscoveryReadiness,
  OverallRecommendation,
  OwnerRolePreference,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Scorecard configuration + fit logic
// ---------------------------------------------------------------------------

export const SCORE_FIELDS = [
  { key: "financial_readiness_score", label: "Financial readiness" },
  { key: "owner_operator_fit_score", label: "Owner-operator fit" },
  { key: "coachability_score", label: "Coachability" },
  { key: "sales_comfort_score", label: "Sales comfort" },
  { key: "operations_fit_score", label: "Operations fit" },
  { key: "territory_fit_score", label: "Territory fit" },
  { key: "portal_engagement_score", label: "Portal engagement" },
  { key: "validation_maturity_score", label: "Validation maturity" },
] as const;

export type ScoreField = (typeof SCORE_FIELDS)[number]["key"];

export const RECOMMENDATION_OPTIONS: {
  value: OverallRecommendation;
  label: string;
}[] = [
  { value: "strong_fit", label: "Strong fit" },
  { value: "nurture", label: "Nurture" },
  { value: "needs_diligence", label: "Needs diligence" },
  { value: "pause", label: "Pause" },
  { value: "disqualify", label: "Disqualify" },
];

export const OWNER_ROLE_OPTIONS: {
  value: OwnerRolePreference;
  label: string;
}[] = [
  { value: "owner_operator", label: "Owner-operator" },
  { value: "semi_absentee", label: "Semi-absentee" },
  { value: "investor_only", label: "Investor only" },
  { value: "unsure", label: "Unsure" },
];

export function scoreTotals(scores: Partial<CandidateScores> | null | undefined) {
  if (!scores) return { total: 0, count: 0, average: 0, max: SCORE_FIELDS.length * 5 };
  let total = 0;
  let count = 0;
  for (const { key } of SCORE_FIELDS) {
    const value = scores[key];
    if (typeof value === "number" && value >= 1 && value <= 5) {
      total += value;
      count += 1;
    }
  }
  return {
    total,
    count,
    average: count ? total / count : 0,
    max: SCORE_FIELDS.length * 5,
  };
}

/** Suggested fit category derived from the scored average. Advisory only — the rep confirms. */
export function suggestedFitCategory(
  scores: Partial<CandidateScores> | null | undefined
): OverallRecommendation | null {
  const { count, average } = scoreTotals(scores);
  if (!count) return null;
  if (average >= 4.2) return "strong_fit";
  if (average >= 3.4) return "nurture";
  if (average >= 2.6) return "needs_diligence";
  if (average >= 1.8) return "pause";
  return "disqualify";
}

export const RECOMMENDED_ACTION_BY_CATEGORY: Record<
  OverallRecommendation,
  string
> = {
  strong_fit:
    "Advance toward Discovery Day. Confirm financial documentation and schedule the leadership call.",
  nurture:
    "Keep engaged. Address open concerns and reassess after the next preview module or call.",
  needs_diligence:
    "Gather more information before advancing. Verify financials, owner-role expectations, and market fit.",
  pause:
    "Hold. Document the specific gap and set a follow-up date to revisit readiness.",
  disqualify:
    "Do not advance. Send a respectful not-a-fit message and close out the record.",
};

export const RECOMMENDATION_BADGE: Record<OverallRecommendation, string> = {
  strong_fit: "bg-emerald-100 text-emerald-800",
  nurture: "bg-sky-100 text-sky-800",
  needs_diligence: "bg-amber-100 text-amber-800",
  pause: "bg-zinc-200 text-zinc-700",
  disqualify: "bg-red-100 text-red-800",
};

// ---------------------------------------------------------------------------
// Discovery Day readiness checklist
// ---------------------------------------------------------------------------

export const DISCOVERY_CHECKLIST_ITEMS = [
  { key: "initial_qualification_complete", label: "Initial qualification complete" },
  { key: "financial_screen_complete", label: "Financial screen complete" },
  { key: "owner_role_discussed", label: "Owner role discussed" },
  { key: "territory_review_complete", label: "Territory review complete" },
  { key: "fdd_sent_or_ready", label: "FDD sent or ready" },
  { key: "validation_prep_complete", label: "Validation prep complete" },
  { key: "key_concerns_documented", label: "Key concerns documented" },
  { key: "leadership_call_complete", label: "Leadership call complete" },
  { key: "award_recommendation_ready", label: "Award recommendation ready" },
] as const;

export type DiscoveryChecklistKey =
  (typeof DISCOVERY_CHECKLIST_ITEMS)[number]["key"];

export function discoveryReadinessPercent(
  readiness: Partial<DiscoveryReadiness> | null | undefined
): number {
  if (!readiness) return 0;
  const done = DISCOVERY_CHECKLIST_ITEMS.filter(
    (item) => readiness[item.key] === true
  ).length;
  return Math.round((done / DISCOVERY_CHECKLIST_ITEMS.length) * 100);
}

// ---------------------------------------------------------------------------
// CRM field option lists (kept simple; free text where appropriate)
// ---------------------------------------------------------------------------

export const LIQUID_CAPITAL_RANGES = [
  "Under $50k",
  "$50k–$100k",
  "$100k–$150k",
  "$150k–$250k",
  "$250k+",
  "Unsure",
];

export const TIMELINE_OPTIONS = [
  "0-3 months",
  "3-6 months",
  "6-12 months",
  "12+ months",
  "Unsure",
];

export const COMFORT_OPTIONS = ["High", "Medium", "Low", "Unknown"];

export const STAGE_OPTIONS = [
  "invited",
  "active",
  "questionnaire_started",
  "questionnaire_completed",
  "discovery_ready",
  "validation",
  "awarded",
  "paused",
  "disqualified",
] as const;

export const LEAD_SOURCES = [
  "Broker",
  "Referral",
  "Website",
  "Franchise portal",
  "Event",
  "Cold outreach",
  "Other",
];

// ---------------------------------------------------------------------------
// Follow-up draft generator (copy only — no email is sent)
// ---------------------------------------------------------------------------

const FDD_LINE =
  "Note: This message is informational only and does not modify or replace the Franchise Disclosure Document or Franchise Agreement.";

export interface FollowUpContext {
  fullName: string | null;
  territory: string | null;
  biggestConcern: string | null;
  whyPreservan: string | null;
  nextStep: string | null;
  rep: string | null;
}

function firstName(fullName: string | null): string {
  if (!fullName) return "there";
  return fullName.trim().split(/\s+/)[0] || "there";
}

function sign(rep: string | null): string {
  return rep?.trim() ? `Best,\n${rep.trim()}` : "Best,\nPreservan Franchise Development";
}

export interface FollowUpTemplate {
  key: string;
  label: string;
  build: (ctx: FollowUpContext) => string;
}

export const FOLLOW_UP_TEMPLATES: FollowUpTemplate[] = [
  {
    key: "intro_recap",
    label: "Post-intro-call recap",
    build: (c) =>
      `Hi ${firstName(c.fullName)},\n\n` +
      `Thanks for taking the time to talk today. It was great to learn more about what's drawing you to Preservan` +
      `${c.whyPreservan ? ` — especially ${c.whyPreservan.trim()}` : ""}.\n\n` +
      `A quick recap of where we are:\n` +
      `- We discussed the Preservan operating system and the owner's role in the business.\n` +
      `- ${c.territory ? `You're exploring the ${c.territory.trim()} area.` : "We touched on the market you're considering."}\n` +
      `${c.biggestConcern ? `- You raised a good question about ${c.biggestConcern.trim()}, and we'll keep working through that together.\n` : ""}` +
      `\nNext step: ${c.nextStep?.trim() || "I'll follow up with the materials we discussed and we'll set a time for the next conversation."}\n\n` +
      `${sign(c.rep)}\n\n${FDD_LINE}`,
  },
  {
    key: "owner_role",
    label: "Owner role follow-up",
    build: (c) =>
      `Hi ${firstName(c.fullName)},\n\n` +
      `Following up on the owner-role conversation. The strongest Preservan owners lead local sales, build and hold their team accountable, and drive the customer experience — with training, playbooks, and Connect Center support behind them.\n\n` +
      `As you think it through, it's worth being honest about how hands-on you want to be day to day. That clarity helps us make sure the fit is right for both sides.\n\n` +
      `${c.biggestConcern ? `You mentioned ${c.biggestConcern.trim()} — happy to walk through how other owners have approached that.\n\n` : ""}` +
      `Next step: ${c.nextStep?.trim() || "Let's set a short call to talk through any questions."}\n\n` +
      `${sign(c.rep)}\n\n${FDD_LINE}`,
  },
  {
    key: "discovery_prep",
    label: "Discovery Day prep",
    build: (c) =>
      `Hi ${firstName(c.fullName)},\n\n` +
      `Excited to help you prepare for Discovery Day. To get the most out of it, it helps to come ready to discuss:\n` +
      `- Your goals as an owner and how involved you want to be\n` +
      `- ${c.territory ? `The ${c.territory.trim()} market and territory questions` : "The market and territory you're considering"}\n` +
      `- Your questions on training, support, and the operating system\n` +
      `- Any financial or timeline questions you'd like addressed\n\n` +
      `Come with questions — Discovery Day works best as a two-way conversation.\n\n` +
      `${sign(c.rep)}\n\n${FDD_LINE}`,
  },
  {
    key: "validation_prep",
    label: "Validation prep",
    build: (c) =>
      `Hi ${firstName(c.fullName)},\n\n` +
      `As you move into validation, this is your chance to talk with existing owners and confirm the picture for yourself. A few suggestions:\n` +
      `- Ask owners about their day-to-day and how they spend their time\n` +
      `- Ask what surprised them and what they'd tell a new owner\n` +
      `- Ask about training, support, and how they use the system\n` +
      `- Ask the questions that matter most to your decision\n\n` +
      `We want you to do thorough diligence. Reach out anytime as questions come up.\n\n` +
      `${sign(c.rep)}\n\n${FDD_LINE}`,
  },
  {
    key: "not_a_fit",
    label: "Pause / not-a-fit message",
    build: (c) =>
      `Hi ${firstName(c.fullName)},\n\n` +
      `Thank you for the time and thought you've put into exploring Preservan. After our conversations, I don't think this is the right fit at this stage, and I'd rather be straightforward with you than have either of us move forward with uncertainty.\n\n` +
      `This isn't a reflection on you — timing, fit, and goals all have to line up. If circumstances change down the road, the door is open to reconnect.\n\n` +
      `Wishing you the best in whatever you decide next.\n\n` +
      `${sign(c.rep)}\n\n${FDD_LINE}`,
  },
  {
    key: "re_engagement",
    label: "Re-engagement message",
    build: (c) =>
      `Hi ${firstName(c.fullName)},\n\n` +
      `It's been a little while since we last connected, and I wanted to check in. A lot can change on timing and goals, and I didn't want to assume where things stand for you.\n\n` +
      `${c.territory ? `If the ${c.territory.trim()} area is still of interest, ` : "If franchise ownership is still on your radar, "}I'm happy to pick the conversation back up whenever the timing is right.\n\n` +
      `Would a short call in the next week or two be useful?\n\n` +
      `${sign(c.rep)}\n\n${FDD_LINE}`,
  },
];

// ---------------------------------------------------------------------------
// Sales conversation guide / playbook content
// ---------------------------------------------------------------------------

export interface PlaybookSection {
  id: string;
  title: string;
  points: string[];
}

export const PLAYBOOK_SECTIONS: PlaybookSection[] = [
  {
    id: "explain-preservancan",
    title: "How to explain PreservanCan",
    points: [
      "PreservanCan is our internal command center for qualifying franchise candidates and preparing better conversations.",
      "It helps us document fit, spot red flags early, and move strong candidates toward Discovery Day with confidence.",
      "It is separate from the operational Preservan Hub — it holds no live franchisee, customer, or performance data.",
    ],
  },
  {
    id: "operating-system",
    title: "How to explain the Preservan operating system",
    points: [
      "Frame it as a repeatable system: proven restoration processes, centralized support, training, and accountability.",
      "Owners focus on growth, local leadership, and customer experience while the system handles repeatable workflows.",
      "Emphasize structure and support over 'do it all yourself'. Avoid promising specific outcomes.",
    ],
  },
  {
    id: "owner-role",
    title: "How to explain the owner role",
    points: [
      "The owner leads local sales, builds and holds the team accountable, and owns the customer experience.",
      "They are supported by training, playbooks, dashboards, and the Connect Center — not left to figure it out alone.",
      "Be candid about how hands-on ownership is. This protects both the candidate and the brand.",
    ],
  },
  {
    id: "connect-center",
    title: "How to explain the Connect Center",
    points: [
      "Centralized call handling, appointment scheduling, and customer communication support for owners.",
      "It reduces owner overhead and drives a consistent customer experience across locations.",
      "Position it as leverage that lets owners spend more time on growth and leadership.",
    ],
  },
  {
    id: "training-support",
    title: "How to explain training and support",
    points: [
      "Onboarding covers owner ramp-up, sales fundamentals, operations workflows, and team management.",
      "Support continues after launch through ongoing coaching, playbooks, and the Connect Center.",
      "Describe the structure and commitment level honestly; avoid implying success is guaranteed.",
    ],
  },
  {
    id: "semi-absentee",
    title: "How to handle semi-absentee expectations",
    points: [
      "Ask directly how involved they intend to be, and listen for mismatches with the owner role.",
      "Be honest that early stages reward hands-on ownership, especially in sales and team-building.",
      "If they want investor-only involvement, document it and assess fit carefully rather than overselling.",
    ],
  },
  {
    id: "construction-experience",
    title: "How to handle construction experience concerns",
    points: [
      "Reassure that the system, training, and processes do not require prior construction expertise.",
      "Emphasize the transferable skills that matter: leadership, sales, accountability, and coachability.",
      "Do not overpromise; frame it as 'trainable with commitment', not 'anyone will succeed'.",
    ],
  },
  {
    id: "lead-generation",
    title: "How to handle lead generation concerns",
    points: [
      "Explain the marketing and Connect Center support that helps drive and handle demand.",
      "Set the expectation that local sales effort and follow-through still matter.",
      "Avoid quoting lead volumes, conversion rates, or revenue — those are performance representations.",
    ],
  },
  {
    id: "technician-hiring",
    title: "How to handle technician hiring concerns",
    points: [
      "Point to hiring playbooks, training, and onboarding support the system provides.",
      "Be honest that recruiting and retaining a team is a core owner responsibility.",
      "Frame it as a leadership skill we help develop, not a problem that solves itself.",
    ],
  },
  {
    id: "earnings-claims",
    title: "How to avoid earnings claims",
    points: [
      "Never state or imply specific revenue, profit, income, ROI, or performance figures.",
      "Do not share individual franchisee results or averages outside the FDD's Item 19 process.",
      "If asked about financial performance, direct the conversation to the FDD and franchise counsel.",
      "Keep all sample dashboards labeled as demo data only. When in doubt, say less and defer to the FDD.",
    ],
  },
];
