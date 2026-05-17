import { Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthRequest } from '../middleware/auth';
import { getBusinessConsultantResponse } from '../services/aiService';
import Opportunity from '../models/Opportunity';
import { AppError, ErrorCode } from '../utils/AppError';
import { logger } from '../config/logger';

// AI calls are expensive — strict per-IP limit
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many AI requests. Please wait before asking again.', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/ai/chat
export const chat = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message, conversationHistory } = req.body; // pre-validated by Zod middleware

    // Fetch opportunity context server-side — never trust client-provided context
    const opportunities = await Opportunity
      .find({ status: { $in: ['published', 'verified'] } })
      .select('brand_name type category investment_range location trustScore')
      .limit(50)
      .lean();

    const reply = await getBusinessConsultantResponse(message, opportunities, conversationHistory);

    res.json({ reply });
  } catch (error: any) {
    // Surface quota/key errors as service unavailable, not 500
    if (
      error.message?.includes('API key') ||
      error.message?.includes('quota') ||
      error.message?.includes('RESOURCE_EXHAUSTED')
    ) {
      logger.warn('ai_service_unavailable', { message: error.message });
      next(new AppError('AI service temporarily unavailable. Please try again shortly.', 503, ErrorCode.AI_UNAVAILABLE));
    } else {
      next(error);
    }
  }
};
