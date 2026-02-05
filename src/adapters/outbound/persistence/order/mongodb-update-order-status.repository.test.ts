import { describe, it, expect, vi } from 'vitest';
import { MongoDBUpdateOrderStatusRepository } from './mongodb-update-order-status.repository';
import type { OrderResponseDto } from '../../../../domain/order/dto/order-response.dto';
import type { UpdateOrderStatusDto } from '../../../../domain/order/dto/update-order-status.dto';
import { OrderNotFoundError } from '../../../../domain/order/errors';

function createMockDb() {
  const mockFindOne = vi.fn();
  const mockUpdateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });
  const mockCreateIndex = vi.fn().mockResolvedValue(undefined);
  const mockCollection = {
    findOne: mockFindOne,
    updateOne: mockUpdateOne,
    createIndex: mockCreateIndex,
  };
  const mockDb = {
    collection: vi.fn().mockReturnValue(mockCollection),
  };
  return { mockDb, mockFindOne, mockUpdateOne, mockCreateIndex };
}

describe('MongoDBUpdateOrderStatusRepository', () => {
  it('chama findOne e updateOne e retorna o pedido sem _id', async () => {
    const doc = {
      _id: 'some-id',
      orderNumber: 'ord-123',
      customerId: 'cust-1',
      items: [{ productId: 'p1', quantity: 2 }],
      status: 'CREATED',
      statusHistory: [{ status: 'CREATED', createdAt: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const { mockDb, mockFindOne, mockUpdateOne } = createMockDb();
    mockFindOne.mockResolvedValueOnce(doc);
    const repo = new MongoDBUpdateOrderStatusRepository(mockDb as any);

    const dto: UpdateOrderStatusDto = { orderNumber: 'ord-123', status: 'IN_PROCESSING' };
    const result = await repo.updateStatus(dto);

    expect(mockFindOne).toHaveBeenCalledTimes(1);
    expect(mockFindOne).toHaveBeenCalledWith({ orderNumber: 'ord-123' });
    expect(mockUpdateOne).toHaveBeenCalledTimes(1);
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { orderNumber: 'ord-123' },
      expect.objectContaining({
        $set: expect.objectContaining({ status: 'IN_PROCESSING' }),
        $push: expect.objectContaining({
          statusHistory: expect.objectContaining({ status: 'IN_PROCESSING' }),
        }),
      })
    );
    expect(result).not.toHaveProperty('_id');
    expect((result as OrderResponseDto).orderNumber).toBe('ord-123');
    expect((result as OrderResponseDto).status).toBe('CREATED');
  });

  it('lança OrderNotFoundError quando findOne retorna null', async () => {
    const { mockDb, mockFindOne } = createMockDb();
    mockFindOne.mockResolvedValueOnce(null);
    const repo = new MongoDBUpdateOrderStatusRepository(mockDb as any);

    const dto: UpdateOrderStatusDto = { orderNumber: 'inexistente', status: 'SENT' };

    await expect(repo.updateStatus(dto)).rejects.toThrow(OrderNotFoundError);
  });
});
