import { Router } from 'express';
import { getConversations, createConversation, getMessages, sendMessage, updateConversation, updateMessage } from '../controllers/conversationController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getConversations);
router.post('/', protect, createConversation);
router.get('/:id/messages', protect, getMessages);
router.post('/:id/messages', protect, sendMessage);
router.patch('/:id', protect, updateConversation);
router.patch('/:id/messages/:msgId', protect, updateMessage);

export default router;
