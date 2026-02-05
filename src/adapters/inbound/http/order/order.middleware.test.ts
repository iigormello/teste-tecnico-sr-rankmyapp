import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from './order.middleware';
import type { Request, Response, NextFunction } from 'express';
import { OrderNotFoundError } from '../../../../domain/order/errors';
import { CreateOrderFailedError } from '../../../../domain/order/errors';

function createMockRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

describe('errorHandler', () => {
  it('responde 404 com ORDER_NOT_FOUND para OrderNotFoundError', () => {
    const err = new OrderNotFoundError({ orderNumber: 'ord-123' });
    const req = {} as Request;
    const res = createMockRes();
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Pedido não encontrado',
      code: 'ORDER_NOT_FOUND',
      status: 404,
    });
  });

  it('responde 422 com CREATE_ORDER_FAILED para CreateOrderFailedError', () => {
    const err = new CreateOrderFailedError();
    const req = {} as Request;
    const res = createMockRes();
    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Não foi possível criar o pedido',
      code: 'CREATE_ORDER_FAILED',
      status: 422,
    });
  });

  it('responde 500 para erro genérico', () => {
    const err = new Error('erro de teste');
    const req = {} as Request;
    const res = createMockRes();
    const next = vi.fn() as NextFunction;
    vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR',
      status: 500,
    });
  });
});
