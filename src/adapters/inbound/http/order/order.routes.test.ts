import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createOrderRoutes } from './order.routes';
import type { IOrderCreateRepository } from '../../../../ports/order/create-order.repository';
import type { CreateOrderResponseDto } from '../../../../domain/order/dto/create-order-response.dto';

function createMockRepository(): IOrderCreateRepository {
  return {
    save: vi.fn().mockResolvedValue({
      orderNumber: 'ord-mock-123',
      customerId: 'cust-mock',
      items: [{ productId: 'p1', quantity: 1 }],
      status: 'CREATED',
      statusHistory: [{ status: 'CREATED', createdAt: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as CreateOrderResponseDto),
  };
}

describe('POST /orders', () => {
  let app: express.Express;
  let mockRepo: ReturnType<typeof createMockRepository>;

  beforeEach(() => {
    mockRepo = createMockRepository();
    app = express();
    app.use(express.json());
    app.use('/orders', createOrderRoutes(mockRepo));
  });

  it('Response é 201 e retorna message e order sem _id', async () => {
    const res = await request(app)
      .post('/orders')
      .send({
        customerId: '123',
        items: [{ productId: '123', quantity: 2 }],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Pedido criado com sucesso');
    expect(res.body).toHaveProperty('order');
    expect(res.body.order).not.toHaveProperty('_id');
    expect(res.body.order.orderNumber).toBe('ord-mock-123');
    expect(res.body.order.customerId).toBe('cust-mock');
    expect(res.body.order.status).toBe('CREATED');
  });

  it('chama repository.save uma vez com os dados do body', async () => {
    await request(app)
      .post('/orders')
      .send({
        customerId: 'c1',
        items: [{ productId: 'p1', quantity: 1 }],
      });

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    const orderPassed = (mockRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(orderPassed.customerId).toBe('c1');
    expect(orderPassed.items).toEqual([{ productId: 'p1', quantity: 1 }]);
    expect(orderPassed.status).toBe('CREATED');
  });
});
