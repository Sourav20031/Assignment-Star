import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;

const getGenAI = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

// ─── Chat Assistant ─────────────────────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `You are EventGenius, a world-class expert AI event planning assistant with 15+ years of experience in planning weddings, corporate events, birthday parties, anniversaries, concerts, and all types of gatherings.

Your expertise includes:
- Event theme design and decoration
- Vendor recommendations and negotiations
- Budget planning and cost optimization
- Venue selection criteria
- Catering, entertainment, and logistics
- Timeline and project management
- Local market knowledge across Indian and international cities

Always be:
- Professional yet friendly and approachable
- Specific and actionable in your advice
- Cost-conscious and realistic with budgets
- Creative and inspiring with ideas
- Thorough in your recommendations

When users ask about events, always try to understand their budget, guest count, location, and preferences to give tailored advice.`;

/**
 * Send a message to the Gemini chat assistant
 * @param {Array} history - Array of {role, parts} messages
 * @param {string} userMessage - The new user message
 * @returns {string} - AI response text
 */
export const sendChatMessage = async (history, userMessage) => {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: CHAT_SYSTEM_PROMPT,
  });

  // Convert our DB format to Gemini format
  const formattedHistory = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history: formattedHistory,
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
    },
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
};

// ─── Event Plan Generator ────────────────────────────────────────────────────

/**
 * Generate a complete event plan as structured JSON
 */
export const generateEventPlan = async ({ eventType, budget, guestCount, city, preferredDate, additionalNotes }) => {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.8,
    },
  });

  const prompt = `You are an expert event planner. Generate a comprehensive, detailed, and realistic event plan for the following event:

Event Details:
- Event Type: ${eventType}
- Total Budget: ₹${budget.toLocaleString()} INR
- Guest Count: ${guestCount} guests
- City: ${city}
- Preferred Date: ${preferredDate}
- Additional Notes: ${additionalNotes || 'None'}

Generate a JSON response with EXACTLY this structure (no markdown, pure JSON):
{
  "overview": "A detailed 3-4 sentence overview of the event plan",
  "theme": "Suggested event theme name",
  "highlights": ["highlight 1", "highlight 2", "highlight 3", "highlight 4"],
  "budgetBreakdown": [
    { "category": "Venue", "amount": 50000, "percentage": 25, "notes": "Indoor/outdoor venue recommendation" },
    { "category": "Catering", "amount": 40000, "percentage": 20, "notes": "Per head cost details" },
    { "category": "Decoration", "amount": 30000, "percentage": 15, "notes": "Theme decor details" },
    { "category": "Photography & Videography", "amount": 25000, "percentage": 12.5, "notes": "Coverage details" },
    { "category": "Entertainment", "amount": 20000, "percentage": 10, "notes": "Music/DJ/performers" },
    { "category": "Invitations & Stationery", "amount": 5000, "percentage": 2.5, "notes": "Digital + physical" },
    { "category": "Transportation", "amount": 10000, "percentage": 5, "notes": "Guest transport" },
    { "category": "Miscellaneous & Contingency", "amount": 20000, "percentage": 10, "notes": "Buffer for unexpected costs" }
  ],
  "vendors": [
    { "category": "Venue", "name": "Specific venue name recommendation", "estimatedCost": "₹X,XXX", "notes": "Why this venue" },
    { "category": "Caterer", "name": "Caterer recommendation", "estimatedCost": "₹X per head", "notes": "Cuisine speciality" },
    { "category": "Decorator", "name": "Decorator recommendation", "estimatedCost": "₹X,XXX", "notes": "Style" },
    { "category": "Photographer", "name": "Photography studio", "estimatedCost": "₹X,XXX", "notes": "Package details" },
    { "category": "DJ/Entertainment", "name": "Entertainment provider", "estimatedCost": "₹X,XXX", "notes": "What they provide" },
    { "category": "Florist", "name": "Florist recommendation", "estimatedCost": "₹X,XXX", "notes": "Flower arrangements" }
  ],
  "timeline": [
    { "timeframe": "3 months before", "task": "Book venue and confirm date", "priority": "high" },
    { "timeframe": "2.5 months before", "task": "Finalize guest list and send save-the-dates", "priority": "high" },
    { "timeframe": "2 months before", "task": "Book caterer, decorator, photographer", "priority": "high" },
    { "timeframe": "6 weeks before", "task": "Send formal invitations", "priority": "high" },
    { "timeframe": "1 month before", "task": "Confirm all vendors and make deposits", "priority": "medium" },
    { "timeframe": "3 weeks before", "task": "Finalize menu and seating arrangements", "priority": "medium" },
    { "timeframe": "2 weeks before", "task": "Confirm guest RSVPs and final headcount", "priority": "medium" },
    { "timeframe": "1 week before", "task": "Final walkthrough with all vendors", "priority": "high" },
    { "timeframe": "2 days before", "task": "Setup decorations and venue preparation", "priority": "high" },
    { "timeframe": "Day of event", "task": "Execute event plan, manage vendors on-site", "priority": "high" }
  ],
  "checklist": [
    { "task": "Book and confirm venue", "category": "Venue", "completed": false },
    { "task": "Finalize guest list", "category": "Guests", "completed": false },
    { "task": "Send invitations", "category": "Guests", "completed": false },
    { "task": "Book caterer", "category": "Catering", "completed": false },
    { "task": "Plan menu", "category": "Catering", "completed": false },
    { "task": "Book photographer", "category": "Media", "completed": false },
    { "task": "Book videographer", "category": "Media", "completed": false },
    { "task": "Hire decorator", "category": "Decoration", "completed": false },
    { "task": "Book DJ/entertainment", "category": "Entertainment", "completed": false },
    { "task": "Arrange transportation", "category": "Logistics", "completed": false },
    { "task": "Confirm RSVPs", "category": "Guests", "completed": false },
    { "task": "Prepare final payments for vendors", "category": "Finance", "completed": false }
  ]
}

Make the budget breakdown amounts add up to exactly ₹${budget}. Tailor all recommendations to ${city} and Indian context. Be specific with vendor names that could exist in ${city}.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parse JSON response
  const parsed = JSON.parse(text);
  return parsed;
};

// ─── Invitation Message Generator ────────────────────────────────────────────

/**
 * Generate an AI invitation message
 */
export const generateInvitationMessage = async ({ eventType, city, preferredDate, guestCount, theme, hostName }) => {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0.9 },
  });

  const prompt = `Write a beautiful, warm, and engaging invitation message for the following event:
- Event Type: ${eventType}
- Theme: ${theme}
- City: ${city}
- Date: ${preferredDate}
- Host Name: ${hostName}
- Guest Count: approximately ${guestCount} guests

Write TWO versions:
1. A formal version (professional and elegant)
2. A casual/fun version (warm and friendly)

Format the response clearly with headers "FORMAL:" and "CASUAL:" followed by the respective messages. Make them memorable, specific to the event type, and include a call to action for RSVPs.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};

// ─── Event Image Prompt Generator ────────────────────────────────────────────

/**
 * Generate a detailed image prompt for event visualization
 */
export const generateEventImagePrompt = async ({ eventType, theme, city, guestCount }) => {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Create a detailed, vivid image generation prompt for an AI image generator to create a beautiful visualization of this event setup:
- Event Type: ${eventType}
- Theme: ${theme}
- City: ${city}
- Scale: ${guestCount} guests

The prompt should describe: lighting, decorations, color palette, table arrangements, ambiance, and overall aesthetic. 
Keep it under 100 words. Make it photorealistic and stunning.
Return ONLY the image prompt, no explanation.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
};
