import type { Request, Response, NextFunction } from 'express';
import { OrderNotFoundError, CreateOrderFailedError } from '../../../../domain/order/errors.ts';
import { sendError } from '../response.ts';

const ERROR_CODES = {
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  CREATE_ORDER_FAILED: 'CREATE_ORDER_FAILED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof OrderNotFoundError) {
    sendError(res, 404, err.message, ERROR_CODES.ORDER_NOT_FOUND);
    return;
  }

  if (err instanceof CreateOrderFailedError) {
    sendError(res, 422, err.message, ERROR_CODES.CREATE_ORDER_FAILED);
    return;
  }

  console.error(err);
  sendError(res, 500, 'Erro interno do servidor', ERROR_CODES.INTERNAL_ERROR);
}
