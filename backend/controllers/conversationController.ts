import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Application from '../models/Application';
import Notification from '../models/Notification';

const toClient = (doc: any) => ({ id: doc._id.toString(), ...doc.toObject(), _id: undefined });

// GET /api/conversations
export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    const field = user.role === 'brand_owner' ? 'brand_uid' : 'investor_uid';
    const convs = await Conversation.find({ [field]: user._id.toString() }).sort({ lastMessageTimestamp: -1 });
    res.json({ conversations: convs.map(toClient) });
  } catch (error) {
    next(error);
  }
};

// POST /api/conversations
export const createConversation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    const { brand_uid, brandName, opportunityId, opportunityName, owner_uid } = req.body;

    // Check if conversation already exists
    const existing = await Conversation.findOne({ investor_uid: user._id.toString(), brand_uid, opportunityId });
    if (existing) {
      res.json({ conversation: toClient(existing), isNew: false });
      return;
    }

    // Check investor profile completeness
    if (!user.investment_range || !user.state || !user.district) {
      res.status(400).json({ error: 'INCOMPLETE_PROFILE', message: 'Please complete your investor profile first.' });
      return;
    }

    // Create conversation
    const conv = await Conversation.create({
      investor_uid: user._id.toString(),
      investorName: user.name,
      brand_uid,
      brandName,
      opportunityId,
      opportunityName,
      status: 'new',
      lastMessage: 'Enquiry started',
      lastMessageTimestamp: new Date().toISOString(),
      unreadCount: { [brand_uid]: 1 },
      lead_quality_score: 'Verified Lead',
      message_history: [`Enquiry started by ${user.name} for ${brandName}`]
    });

    // Create application record
    await Application.create({
      opportunityId,
      opportunityName,
      owner_uid: owner_uid || brand_uid,
      type: req.body.opportunityType || 'brand',
      userId: user._id.toString(),
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone || '',
      status: 'viewed',
      responses: [
        { questionId: 'investment', question: 'Budget', answer: user.investment_range },
        { questionId: 'state', question: 'State', answer: user.state },
        { questionId: 'district', question: 'City', answer: user.district }
      ]
    });

    // Notify brand owner
    const notif = await Notification.create({
      userId: brand_uid,
      title: 'New Lead Generated',
      message: `${user.name} is interested in ${brandName}. View details in Messages.`,
      type: 'application',
      read: false,
      actionRequired: true,
      link: 'messages'
    });

    // Initial message
    await Message.create({
      chatId: conv._id.toString(),
      senderId: user._id.toString(),
      senderName: user.name,
      text: `I am interested in ${brandName}. Can we discuss the details?`,
      type: 'text'
    });

    const io = (req as any).io;
    if (io) {
      io.to(`user:${brand_uid}`).emit('notifications:new', { id: notif._id.toString(), ...notif.toObject() });
      io.to(`user:${brand_uid}`).emit('conversations:updated', toClient(conv));
      io.to(`user:${user._id.toString()}`).emit('conversations:updated', toClient(conv));
    }

    res.status(201).json({ conversation: toClient(conv), isNew: true });
  } catch (error) {
    next(error);
  }
};

// GET /api/conversations/:id/messages
export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const messages = await Message.find({ chatId: req.params.id }).sort({ timestamp: 1 });
    res.json({ messages: messages.map(m => ({ id: m._id.toString(), ...m.toObject(), _id: undefined })) });
  } catch (error) {
    next(error);
  }
};

// POST /api/conversations/:id/messages
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    const chatId = req.params.id;
    const { text, type = 'text', meetingDetails } = req.body;

    const conv = await Conversation.findById(chatId);
    if (!conv) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const msg = await Message.create({ chatId, senderId: user._id.toString(), senderName: user.name, text, type, meetingDetails });

    const otherPartyId = user._id.toString() === conv.investor_uid ? conv.brand_uid : conv.investor_uid;
    const unreadKey = `unreadCount.${otherPartyId}`;
    const currentUnread = (conv.unreadCount as any)?.get ? (conv.unreadCount as any).get(otherPartyId) || 0 : ((conv.unreadCount as any)?.[otherPartyId] || 0);

    await Conversation.findByIdAndUpdate(chatId, {
      lastMessage: text,
      lastMessageTimestamp: msg.timestamp,
      [`unreadCount.${otherPartyId}`]: currentUnread + 1
    });

    const msgClient = { id: msg._id.toString(), ...msg.toObject(), _id: undefined };
    const io = (req as any).io;
    if (io) {
      io.to(`chat:${chatId}`).emit('messages:new', msgClient);
      const updatedConv = await Conversation.findById(chatId);
      if (updatedConv) {
        io.to(`user:${conv.brand_uid}`).emit('conversations:updated', toClient(updatedConv));
        io.to(`user:${conv.investor_uid}`).emit('conversations:updated', toClient(updatedConv));
      }
    }

    res.status(201).json({ message: msgClient });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/conversations/:id
export const updateConversation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conv = await Conversation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!conv) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }
    res.json({ conversation: toClient(conv) });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/conversations/:id/messages/:msgId
export const updateMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.msgId, req.body, { new: true });
    if (!msg) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    const msgClient = { id: msg._id.toString(), ...msg.toObject(), _id: undefined };
    const io = (req as any).io;
    if (io) io.to(`chat:${req.params.id}`).emit('messages:updated', msgClient);

    res.json({ message: msgClient });
  } catch (error) {
    next(error);
  }
};
