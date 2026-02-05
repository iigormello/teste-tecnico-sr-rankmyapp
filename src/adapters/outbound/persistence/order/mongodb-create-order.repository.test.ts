import { describe, it, expect, vi } from 'vitest';
import { MongoDBCreateOrderRepository } from './mongodb-create-order.repository';
import type { OrderDto } from '../../../../domain/order/dto/order.dto';
import type { CreateOrderResponseDto } from '../../../../domain/order/dto/create-order-response.dto';

const fakeInsertedId = '507f1f77bcf86cd799439011';

function createMockDb() {
  const mockInsertOne = vi.fn().mockResolvedValue({ insertedId: fakeInsertedId });
  const mockFindOne = vi.fn().mockResolvedValue({
    _id: fakeInsertedId,
    orderNumber: 'ord-123',
    customerId: '123',
    items: [{ productId: 'p1', quantity: 2 }],
    status: 'CREATED',
    statusHistory: [{ status: 'CREATED', createdAt: new Date() }],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const mockCollection = {
    insertOne: mockInsertOne,
    findOne: mockFindOne,
  };
  const mockDb = {
    collection: vi.fn().mockReturnValue(mockCollection),
  };
  return { mockDb, mockInsertOne, mockFindOne, mockCollection };
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

  it('retorna o pedido sem o campo _id (CreateOrderResponseDto)', async () => {
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
    expect((result as CreateOrderResponseDto).orderNumber).toBe('ord-123');
    expect((result as CreateOrderResponseDto).customerId).toBe('123');
    expect((result as CreateOrderResponseDto).status).toBe('CREATED');
  });

  it('lança erro quando findOne retorna null', async () => {
    const { mockDb, mockFindOne } = createMockDb();
    mockFindOne.mockResolvedValueOnce(null);
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

    await expect(repo.save(order)).rejects.toThrow('Order not found');
  });
});
