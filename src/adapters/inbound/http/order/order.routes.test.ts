import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createOrderRoutes } from './order.routes';
import type { IOrderCreateRepository } from '../../../../ports/order/create-order.repository';
import type { OrderResponseDto } from '../../../../domain/order/dto/order-response.dto';
import { IOrderFindRepository } from '../../../../ports/order/find-order.repository';

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
    } as OrderResponseDto),
  };
}

function createMockFindRepository(): IOrderFindRepository {
  return {
    find: vi.fn().mockResolvedValue({ orderNumber: 'fake-order-number' } as OrderResponseDto)
  };
}

describe('POST /orders', () => {
  let app: express.Express;
  let mockRepo: ReturnType<typeof createMockRepository>;
  let mockFindRepo: ReturnType<typeof createMockFindRepository>;

  beforeEach(() => {
    mockRepo = createMockRepository();
    mockFindRepo = createMockFindRepository();
    app = express();
    app.use(express.json());
    app.use('/orders', createOrderRoutes(mockRepo, mockFindRepo));
  });

  it('Response é 201 e retorna message e order sem _id', async () => {
    const res = await request(app)
      .post('/orders')
      .send({
        customerId: '123',
        items: [{ productId: '123', quantity: 2 }],
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Pedido criado com sucesso',
      status: 201,
    });
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).not.toHaveProperty('_id');
    expect(res.body.data.orderNumber).toBe('ord-mock-123');
    expect(res.body.data.customerId).toBe('cust-mock');
    expect(res.body.data.status).toBe('CREATED');
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

  it('retorna 400 com VALIDATION_ERROR e details quando body inválido', async () => {
    const res = await request(app)
      .post('/orders')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      status: 400,
    });
    expect(res.body.details).toBeDefined();
    expect(Array.isArray(res.body.details)).toBe(true);
    expect(res.body.details.length).toBeGreaterThan(0);
    expect(res.body.details[0]).toHaveProperty('field');
    expect(res.body.details[0]).toHaveProperty('message');
  });
});

describe('GET /orders/:orderNumber', () => {
  let app: express.Express;
  let mockRepo: ReturnType<typeof createMockRepository>;
  let mockFindRepo: ReturnType<typeof createMockFindRepository>;

  beforeEach(() => {
    mockRepo = createMockRepository();
    mockFindRepo = createMockFindRepository();
    app = express();
    app.use(express.json());
    app.use('/orders', createOrderRoutes(mockRepo, mockFindRepo));
  });

  it('Response é 200 e retorna message e order', async () => {
    const res = await request(app)
      .get('/orders/fake-order-number')
      .send();

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      message: 'Pedido encontrado com sucesso',
      status: 200,
    });
    expect(res.body).toHaveProperty('data');
  });

  it('retorna 400 com VALIDATION_ERROR quando orderNumber é inválido', async () => {
    mockFindRepo.find.mockRejectedValueOnce(new Error('never called'));
    const res = await request(app)
      .get('/orders/%20%20')
      .send();

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      message: 'Parâmetros inválidos',
      code: 'VALIDATION_ERROR',
      status: 400,
    });
    expect(res.body.details).toBeDefined();
    expect(res.body.details.some((d: { field: string }) => d.field === 'orderNumber')).toBe(true);
  });
});
