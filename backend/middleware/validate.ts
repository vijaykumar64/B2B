import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Creates a validation middleware for the specified request target.
 * On success, replaces the raw input with Zod's parsed (coerced + stripped) version.
 * On failure, passes the ZodError to the global error handler which formats it.
 */
export const validate = (schema: ZodSchema, target: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(result.error);
      return;
    }
    req[target] = result.data;
    next();
  };
