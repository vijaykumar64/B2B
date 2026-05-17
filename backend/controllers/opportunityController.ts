import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import Opportunity from '../models/Opportunity';

const toClient = (doc: any) => ({ id: doc._id.toString(), ...doc.toObject(), _id: undefined });

// GET /api/opportunities
export const getOpportunities = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    let query: any = {};

    if (!user || user.role === 'investor') {
      query.status = { $in: ['published', 'verified'] };
    } else if (user.role === 'brand_owner') {
      query.$or = [{ status: { $in: ['published', 'verified'] } }, { owner_uid: user._id.toString() }];
    }
    // admin sees all

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [opportunities, total] = await Promise.all([
      Opportunity.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Opportunity.countDocuments(query),
    ]);

    res.json({
      opportunities: opportunities.map((doc: any) => ({ id: doc._id.toString(), ...doc, _id: undefined })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/opportunities
export const createOpportunity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    const opp = await Opportunity.create({
      ...req.body,
      owner_uid: user._id.toString(),
      is_verified: user.is_verified || false,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    const io = (req as any).io;
    if (io) {
      const all = await Opportunity.find().lean();
      io.emit('opportunities:sync', all.map((doc: any) => ({ id: doc._id.toString(), ...doc, _id: undefined })));
    }

    res.status(201).json({ opportunity: toClient(opp) });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/opportunities/:id
export const updateOpportunity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.user;
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) {
      res.status(404).json({ error: 'Opportunity not found', code: 'NOT_FOUND' });
      return;
    }

    if (user.role !== 'admin' && opp.owner_uid !== user._id.toString()) {
      res.status(403).json({ error: 'Not authorized to update this opportunity', code: 'FORBIDDEN' });
      return;
    }

    req.body.updatedAt = new Date().toISOString();
    const updated = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true });

    const io = (req as any).io;
    if (io) {
      const all = await Opportunity.find().lean();
      io.emit('opportunities:sync', all.map((doc: any) => ({ id: doc._id.toString(), ...doc, _id: undefined })));
    }

    res.json({ opportunity: toClient(updated!) });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/opportunities/:id
export const deleteOpportunity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Opportunity.findByIdAndDelete(req.params.id);

    const io = (req as any).io;
    if (io) {
      const all = await Opportunity.find().lean();
      io.emit('opportunities:sync', all.map((doc: any) => ({ id: doc._id.toString(), ...doc, _id: undefined })));
    }

    res.json({ message: 'Opportunity deleted' });
  } catch (error) {
    next(error);
  }
};
