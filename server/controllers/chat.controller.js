import Conversation from '../models/Conversation.model.js';
import { sendChatMessage } from '../services/ai.service.js';

// @desc    Send a message in a conversation
// @route   POST /api/chat/message
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    let conversation;

    if (conversationId) {
      // Continue existing conversation
      conversation = await Conversation.findOne({ _id: conversationId, userId: req.user._id });
      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found.' });
      }
    } else {
      // Start a new conversation — title from first 60 chars of message
      const title = message.trim().slice(0, 60) + (message.length > 60 ? '...' : '');
      conversation = new Conversation({ userId: req.user._id, title, messages: [] });
    }

    // Build history for Gemini (exclude the new message)
    const history = conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Get AI response
    const aiResponse = await sendChatMessage(history, message.trim());

    // Add both messages to conversation
    conversation.messages.push({ role: 'user', content: message.trim() });
    conversation.messages.push({ role: 'model', content: aiResponse });

    await conversation.save();

    res.json({
      success: true,
      conversationId: conversation._id,
      userMessage: message.trim(),
      aiResponse,
    });
  } catch (error) {
    // Handle Gemini API errors gracefully
    if (error.message?.includes('API_KEY') || error.message?.includes('quota')) {
      return res.status(503).json({
        success: false,
        message: 'AI service temporarily unavailable. Please check your API key or try again later.',
      });
    }
    next(error);
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .select('title createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .limit(50);

    // Return conversations with message count and last message preview
    const data = conversations.map((c) => ({
      _id: c._id,
      title: c.title,
      messageCount: c.messages.length,
      lastMessage: c.messages[c.messages.length - 1]?.content?.slice(0, 100) || '',
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    res.json({ success: true, conversations: data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single conversation with full messages
// @route   GET /api/chat/conversations/:id
// @access  Private
export const getConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user._id });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }
    res.json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a conversation
// @route   DELETE /api/chat/conversations/:id
// @access  Private
export const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }
    res.json({ success: true, message: 'Conversation deleted.' });
  } catch (error) {
    next(error);
  }
};
