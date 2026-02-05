import { describe, it, expect, vi } from 'vitest';
import { MongoDBFindOrderRepository } from './mongodb-find-order.repository';
import type { OrderFindDto } from '../../../../domain/order/dto/order-find.dto';
import type { OrderResponseDto } from '../../../../domain/order/dto/order-response.dto';
import { OrderNotFoundError } from '../../../../domain/order/errors';

function createMockDb() {
  const mockFindOne = vi.fn();
  const mockCreateIndex = vi.fn().mockResolvedValue(undefined);
  const mockCollection = {
    findOne: mockFindOne,
    createIndex: mockCreateIndex,
  };
  const mockDb = {
    collection: vi.fn().mockReturnValue(mockCollection),
  };
  return { mockDb, mockFindOne, mockCreateIndex };
}

describe('MongoDBFindOrderRepository', () => {
  it('retorna o pedido quando findOne encontra', async () => {
    const doc: OrderResponseDto = {
      orderNumber: 'ord-123',
      customerId: 'cust-1',
      items: [{ productId: 'p1', quantity: 2 }],
      status: 'CREATED',
      statusHistory: [{ status: 'CREATED', createdAt: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const { mockDb, mockFindOne } = createMockDb();
    mockFindOne.mockResolvedValueOnce(doc);
    const repo = new MongoDBFindOrderRepository(mockDb as any);

    const orderFindDto: OrderFindDto = { orderNumber: 'ord-123' };
    const result = await repo.find(orderFindDto);

    expect(mockFindOne).toHaveBeenCalledTimes(1);
    expect(mockFindOne).toHaveBeenCalledWith({ orderNumber: 'ord-123' });
    expect(result).toEqual(doc);
  });

  it('lança OrderNotFoundError quando findOne retorna null', async () => {
    const { mockDb, mockFindOne } = createMockDb();
    mockFindOne.mockResolvedValueOnce(null);
    const repo = new MongoDBFindOrderRepository(mockDb as any);

    const orderFindDto: OrderFindDto = { orderNumber: 'inexistente' };

    await expect(repo.find(orderFindDto)).rejects.toThrow(OrderNotFoundError);
  });
});
