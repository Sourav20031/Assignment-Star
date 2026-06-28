import EventPlan from '../models/EventPlan.model.js';
import {
  generateEventPlan,
  generateInvitationMessage,
  generateEventImagePrompt,
} from '../services/gemini.service.js';

// @desc    Generate and save a new event plan
// @route   POST /api/events/generate
// @access  Private
export const generatePlan = async (req, res, next) => {
  try {
    const { eventType, budget, guestCount, city, preferredDate, additionalNotes } = req.body;

    // Validate required fields
    if (!eventType || !budget || !guestCount || !city || !preferredDate) {
      return res.status(400).json({ success: false, message: 'All event details are required.' });
    }

    const budgetNum = Number(budget);
    const guestNum = Number(guestCount);

    if (isNaN(budgetNum) || budgetNum < 1000) {
      return res.status(400).json({ success: false, message: 'Budget must be at least ₹1,000.' });
    }
    if (isNaN(guestNum) || guestNum < 1) {
      return res.status(400).json({ success: false, message: 'Guest count must be at least 1.' });
    }

    // Generate plan with Gemini
    const plan = await generateEventPlan({ eventType, budget: budgetNum, guestCount: guestNum, city, preferredDate, additionalNotes });

    // Create title
    const title = `${eventType} in ${city} - ${preferredDate}`;

    // Save to DB
    const eventPlan = await EventPlan.create({
      userId: req.user._id,
      title,
      eventType,
      budget: budgetNum,
      guestCount: guestNum,
      city,
      preferredDate,
      additionalNotes: additionalNotes || '',
      plan,
    });

    res.status(201).json({ success: true, eventPlan });
  } catch (error) {
    if (error.message?.includes('API_KEY') || error.message?.includes('quota')) {
      return res.status(503).json({
        success: false,
        message: 'AI service temporarily unavailable. Please check your API key.',
      });
    }
    // JSON parse error from Gemini
    if (error instanceof SyntaxError) {
      return res.status(500).json({ success: false, message: 'Failed to parse AI response. Please try again.' });
    }
    next(error);
  }
};

// @desc    Get all event plans for user
// @route   GET /api/events
// @access  Private
export const getPlans = async (req, res, next) => {
  try {
    const plans = await EventPlan.find({ userId: req.user._id })
      .select('title eventType budget guestCount city preferredDate isFavorite createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, plans });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event plan
// @route   GET /api/events/:id
// @access  Private
export const getPlan = async (req, res, next) => {
  try {
    const eventPlan = await EventPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!eventPlan) {
      return res.status(404).json({ success: false, message: 'Event plan not found.' });
    }
    res.json({ success: true, eventPlan });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event plan
// @route   DELETE /api/events/:id
// @access  Private
export const deletePlan = async (req, res, next) => {
  try {
    const eventPlan = await EventPlan.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!eventPlan) {
      return res.status(404).json({ success: false, message: 'Event plan not found.' });
    }
    res.json({ success: true, message: 'Event plan deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite status
// @route   PUT /api/events/:id/favorite
// @access  Private
export const toggleFavorite = async (req, res, next) => {
  try {
    const eventPlan = await EventPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!eventPlan) {
      return res.status(404).json({ success: false, message: 'Event plan not found.' });
    }
    eventPlan.isFavorite = !eventPlan.isFavorite;
    await eventPlan.save();
    res.json({ success: true, isFavorite: eventPlan.isFavorite });
  } catch (error) {
    next(error);
  }
};

// @desc    Update checklist item
// @route   PUT /api/events/:id/checklist/:itemIndex
// @access  Private
export const updateChecklist = async (req, res, next) => {
  try {
    const { completed } = req.body;
    const { id, itemIndex } = req.params;

    const eventPlan = await EventPlan.findOne({ _id: id, userId: req.user._id });
    if (!eventPlan) {
      return res.status(404).json({ success: false, message: 'Event plan not found.' });
    }

    const idx = parseInt(itemIndex);
    if (idx < 0 || idx >= eventPlan.plan.checklist.length) {
      return res.status(400).json({ success: false, message: 'Invalid checklist item index.' });
    }

    eventPlan.plan.checklist[idx].completed = completed;
    eventPlan.markModified('plan');
    await eventPlan.save();

    res.json({ success: true, checklist: eventPlan.plan.checklist });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate invitation message for an event plan
// @route   POST /api/events/:id/invitation
// @access  Private
export const generateInvitation = async (req, res, next) => {
  try {
    const eventPlan = await EventPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!eventPlan) {
      return res.status(404).json({ success: false, message: 'Event plan not found.' });
    }

    const invitation = await generateInvitationMessage({
      eventType: eventPlan.eventType,
      city: eventPlan.city,
      preferredDate: eventPlan.preferredDate,
      guestCount: eventPlan.guestCount,
      theme: eventPlan.plan?.theme || eventPlan.eventType,
      hostName: req.user.name,
    });

    eventPlan.invitationMessage = invitation;
    await eventPlan.save();

    res.json({ success: true, invitationMessage: invitation });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate event image prompt
// @route   POST /api/events/:id/image-prompt
// @access  Private
export const generateImagePrompt = async (req, res, next) => {
  try {
    const eventPlan = await EventPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!eventPlan) {
      return res.status(404).json({ success: false, message: 'Event plan not found.' });
    }

    const imagePrompt = await generateEventImagePrompt({
      eventType: eventPlan.eventType,
      theme: eventPlan.plan?.theme || eventPlan.eventType,
      city: eventPlan.city,
      guestCount: eventPlan.guestCount,
    });

    eventPlan.imagePrompt = imagePrompt;
    await eventPlan.save();

    res.json({ success: true, imagePrompt });
  } catch (error) {
    next(error);
  }
};
