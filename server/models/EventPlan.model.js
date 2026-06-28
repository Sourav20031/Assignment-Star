import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  category: String,
  name: String,
  estimatedCost: String,
  notes: String,
});

const timelineItemSchema = new mongoose.Schema({
  timeframe: String,
  task: String,
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
});

const budgetItemSchema = new mongoose.Schema({
  category: String,
  amount: Number,
  percentage: Number,
  notes: String,
});

const checklistItemSchema = new mongoose.Schema({
  task: String,
  category: String,
  completed: { type: Boolean, default: false },
});

const eventPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    // Input details
    eventType: { type: String, required: true },
    budget: { type: Number, required: true },
    guestCount: { type: Number, required: true },
    city: { type: String, required: true },
    preferredDate: { type: String, required: true },
    additionalNotes: { type: String, default: '' },
    // AI generated plan
    plan: {
      overview: String,
      theme: String,
      highlights: [String],
      budgetBreakdown: [budgetItemSchema],
      vendors: [vendorSchema],
      timeline: [timelineItemSchema],
      checklist: [checklistItemSchema],
    },
    // Bonus features
    invitationMessage: { type: String, default: '' },
    imagePrompt: { type: String, default: '' },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const EventPlan = mongoose.model('EventPlan', eventPlanSchema);
export default EventPlan;
