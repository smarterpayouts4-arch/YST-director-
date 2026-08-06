export const contractorFixture = {
  id: "eval-contractor",
  industry: "local contractor",
  companyName: "ClearFlow Plumbing",
  requiredCategories: [
    "customer_moment",
    "geography_capacity",
    "trust_boundaries",
    "production_capacity",
  ],
  prohibitedGenericQuestions: ["Describe your brand voice."],
  requiredFinalPromptClauses: ["service area", "competitor", "risk"],
};
