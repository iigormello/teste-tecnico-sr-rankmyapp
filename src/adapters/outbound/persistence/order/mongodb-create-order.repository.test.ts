import { describe, it, expect, vi } from 'vitest';
import { MongoDBCreateOrderRepository } from './mongodb-create-order.repository';
import type { OrderDto } from '../../../../domain/order/dto/order.dto';
import type { OrderResponseDto } from '../../../../domain/order/dto/order-response.dto';
import { CreateOrderFailedError } from '../../../../domain/order/errors';

function createMockDb() {
  const mockInsertOne = vi.fn().mockResolvedValue({ insertedId: '507f1f77bcf86cd799439011' });
  const mockCollection = {
    insertOne: mockInsertOne,
  };
  const mockDb = {
    collection: vi.fn().mockReturnValue(mockCollection),
  };
  return { mockDb, mockInsertOne, mockCollection };
}

describe('MongoDBCreateOrderRepository', () => {
  it('chama insertOne com o documento esperado (incluindo statusHistory quando não enviado)', async () => {
    const { mockDb, mockInsertOne } = createMockDb();
    const repo = new MongoDBCreateOrderRepository(mockDb as any);

    const order: OrderDto = {
      _id: '105h1f55bcf86cd4566efv6285',
      orderNumber: '123',
      customerId: '321',
      items: [{ productId: 'p2', quantity: 1 }],
      status: 'CREATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repo.save(order);

    expect(mockInsertOne).toHaveBeenCalledTimes(1);
    const doc = mockInsertOne.mock.calls[0][0];
    expect(doc._id).toBe('105h1f55bcf86cd4566efv6285');
    expect(doc.orderNumber).toBe('123');
    expect(doc.customerId).toBe('321');
    expect(doc.items).toEqual([{ productId: 'p2', quantity: 1 }]);
    expect(doc.status).toBe('CREATED');
    expect(doc.statusHistory).toBeDefined();
    expect(doc.statusHistory).toHaveLength(1);
    expect(doc.statusHistory[0].status).toBe('CREATED');
  });

  it('retorna o pedido sem o campo _id (OrderResponseDto)', async () => {
    const { mockDb } = createMockDb();
    const repo = new MongoDBCreateOrderRepository(mockDb as any);

    const order: OrderDto = {
      _id: 'abc123',
      orderNumber: 'ord-123',
      customerId: '123',
      items: [],
      status: 'CREATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await repo.save(order);
    
    expect(result).not.toHaveProperty('_id');
    expect((result as OrderResponseDto).orderNumber).toBe('ord-123');
    expect((result as OrderResponseDto).customerId).toBe('123');
    expect((result as OrderResponseDto).status).toBe('CREATED');
  });

  it('lança CreateOrderFailedError quando insertOne falha', async () => {
    const { mockDb, mockInsertOne } = createMockDb();
    mockInsertOne.mockRejectedValueOnce(new Error('DB error'));
    const repo = new MongoDBCreateOrderRepository(mockDb as any);

    const order: OrderDto = {
      _id: 'id',
      orderNumber: 'n',
      customerId: 'c',
      items: [],
      status: 'CREATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await expect(repo.save(order)).rejects.toThrow(CreateOrderFailedError);
  });
});
