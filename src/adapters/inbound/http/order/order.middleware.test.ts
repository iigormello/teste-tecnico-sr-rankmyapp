import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from './order.middleware';
import type { Request, Response, NextFunction } from 'express';

describe('errorHandler', () => {
  it('responde 500 e message Internal server error', () => {
    const err = new Error('erro de teste');
    const req = {} as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;
    vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
