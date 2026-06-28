/**
 * AI Service — Powered by OpenRouter
 * Default Model: nvidia/nemotron-3-ultra-550b-a55b:free
 */

async function callOpenRouter(messages, { json = false, temperature = 0.7 } = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your_openrouter_key_here') {
    throw new Error('OPENROUTER_API_KEY is not set. Get a free key at https://openrouter.ai/keys');
  }

  const model = process.env.OPENROUTER_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free';

  const body = {
    model,
    messages,
    temperature,
    max_tokens: 4096,
  };

  if (json) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
      'X-Title': 'EventGenius AI Planner',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `OpenRouter API error (${response.status}): ${errorData?.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

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
 * Send a message to the AI chat assistant
 */
export const sendChatMessage = async (history, userMessage) => {
  const messages = [
    { role: 'system', content: CHAT_SYSTEM_PROMPT },
    ...history.map((msg) => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  return callOpenRouter(messages, { temperature: 0.7 });
};

/**
 * Generate a complete event plan as structured JSON
 */
export const generateEventPlan = async ({ eventType, budget, guestCount, city, preferredDate, additionalNotes }) => {
  const prompt = `You are an expert event planner. Generate a comprehensive, detailed, and realistic event plan.

Event Details:
- Event Type: ${eventType}
- Total Budget: ₹${budget.toLocaleString()} INR
- Guest Count: ${guestCount} guests
- City: ${city}
- Preferred Date: ${preferredDate}
- Additional Notes: ${additionalNotes || 'None'}

You MUST respond with ONLY valid JSON (no markdown, no explanation, no code blocks). Use EXACTLY this structure:
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
    { "category": "Venue", "name": "Specific venue name", "estimatedCost": "₹X,XXX", "notes": "Why this venue" },
    { "category": "Caterer", "name": "Caterer name", "estimatedCost": "₹X per head", "notes": "Cuisine speciality" },
    { "category": "Decorator", "name": "Decorator name", "estimatedCost": "₹X,XXX", "notes": "Style" },
    { "category": "Photographer", "name": "Studio name", "estimatedCost": "₹X,XXX", "notes": "Package" },
    { "category": "DJ/Entertainment", "name": "Provider name", "estimatedCost": "₹X,XXX", "notes": "What they provide" },
    { "category": "Florist", "name": "Florist name", "estimatedCost": "₹X,XXX", "notes": "Arrangements" }
  ],
  "timeline": [
    { "timeframe": "3 months before", "task": "Book venue and confirm date", "priority": "high" },
    { "timeframe": "2.5 months before", "task": "Finalize guest list", "priority": "high" },
    { "timeframe": "2 months before", "task": "Book caterer, decorator, photographer", "priority": "high" },
    { "timeframe": "6 weeks before", "task": "Send formal invitations", "priority": "high" },
    { "timeframe": "1 month before", "task": "Confirm all vendors", "priority": "medium" },
    { "timeframe": "3 weeks before", "task": "Finalize menu and seating", "priority": "medium" },
    { "timeframe": "2 weeks before", "task": "Confirm RSVPs", "priority": "medium" },
    { "timeframe": "1 week before", "task": "Final vendor walkthrough", "priority": "high" },
    { "timeframe": "2 days before", "task": "Venue setup", "priority": "high" },
    { "timeframe": "Day of event", "task": "Execute plan and manage vendors", "priority": "high" }
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
    { "task": "Prepare final vendor payments", "category": "Finance", "completed": false }
  ]
}

IMPORTANT: Budget breakdown amounts MUST add up to exactly ₹${budget}. Tailor all recommendations to ${city} and Indian context. Be specific with realistic vendor names for ${city}. Respond with ONLY the JSON object, nothing else.`;

  const messages = [
    { role: 'system', content: 'You are an expert event planner. You always respond with valid JSON only. No markdown, no code blocks, no explanation — only the JSON object.' },
    { role: 'user', content: prompt },
  ];

  const text = await callOpenRouter(messages, { json: true, temperature: 0.8 });

  // Clean up potential markdown wrapping from some models
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
  if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
  if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
  cleanText = cleanText.trim();

  return JSON.parse(cleanText);
};

/**
 * Generate an AI invitation message
 */
export const generateInvitationMessage = async ({ eventType, city, preferredDate, guestCount, theme, hostName }) => {
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

  const messages = [
    { role: 'system', content: 'You are a professional event invitation writer.' },
    { role: 'user', content: prompt },
  ];

  return callOpenRouter(messages, { temperature: 0.9 });
};

/**
 * Generate a detailed image prompt for event visualization
 */
export const generateEventImagePrompt = async ({ eventType, theme, city, guestCount }) => {
  const prompt = `Create a detailed, vivid image generation prompt for an AI image generator to create a beautiful visualization of this event setup:
- Event Type: ${eventType}
- Theme: ${theme}
- City: ${city}
- Scale: ${guestCount} guests

The prompt should describe: lighting, decorations, color palette, table arrangements, ambiance, and overall aesthetic.
Keep it under 100 words. Make it photorealistic and stunning.
Return ONLY the image prompt, no explanation.`;

  const messages = [
    { role: 'system', content: 'You generate image prompts. Return only the prompt text.' },
    { role: 'user', content: prompt },
  ];

  return callOpenRouter(messages, { temperature: 0.8 });
};
