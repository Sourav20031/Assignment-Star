import EventPlan from '../models/EventPlan.model.js';
import Conversation from '../models/Conversation.model.js';

// @desc    Get dashboard analytics
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Run queries in parallel
    const [totalPlans, totalConversations, favoritePlans, plans] = await Promise.all([
      EventPlan.countDocuments({ userId }),
      Conversation.countDocuments({ userId }),
      EventPlan.countDocuments({ userId, isFavorite: true }),
      EventPlan.find({ userId }).select('budget eventType createdAt plan').sort({ createdAt: -1 }).limit(20),
    ]);

    // Total budget across all plans
    const totalBudget = plans.reduce((sum, p) => sum + (p.budget || 0), 0);

    // Total messages across all conversations
    const conversations = await Conversation.find({ userId }).select('messages');
    const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);

    // Event type distribution
    const eventTypeMap = {};
    plans.forEach((p) => {
      eventTypeMap[p.eventType] = (eventTypeMap[p.eventType] || 0) + 1;
    });
    const eventTypeDistribution = Object.entries(eventTypeMap).map(([type, count]) => ({ type, count }));

    // Monthly plan creation (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyPlans = await EventPlan.aggregate([
      { $match: { userId, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Recent plans for dashboard
    const recentPlans = await EventPlan.find({ userId })
      .select('title eventType budget guestCount city preferredDate isFavorite createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent conversations for dashboard
    const recentConversations = await Conversation.find({ userId })
      .select('title messages createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentConversationData = recentConversations.map((c) => ({
      _id: c._id,
      title: c.title,
      messageCount: c.messages.length,
      lastMessage: c.messages[c.messages.length - 1]?.content?.slice(0, 100) || '',
      updatedAt: c.updatedAt,
    }));

    res.json({
      success: true,
      analytics: {
        overview: {
          totalPlans,
          totalConversations,
          totalMessages,
          totalBudget,
          favoritePlans,
        },
        eventTypeDistribution,
        monthlyPlans,
        recentPlans,
        recentConversations: recentConversationData,
      },
    });
  } catch (error) {
    next(error);
  }
};
