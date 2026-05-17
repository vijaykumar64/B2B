import { z } from 'zod';

export const aiChatSchema = z.object({
  message: z.string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message too long — keep it under 1000 characters')
    .trim(),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().max(2000),
    })
  ).max(20, 'Too many messages in history').optional().default([]),
});
