import { describe, it, expect, vi } from 'vitest';
import { MongoDBUpdateOrderStatusRepository } from './mongodb-update-order-status.repository';
import type { OrderResponseDto } from '../../../../domain/order/dto/order-response.dto';
import type { UpdateOrderStatusDto } from '../../../../domain/order/dto/update-order-status.dto';
import { OrderNotFoundError } from '../../../../domain/order/errors';

function createMockDb() {
  const mockFindOneAndUpdate = vi.fn();
  const mockCollection = {
    findOneAndUpdate: mockFindOneAndUpdate,
  };
  const mockDb = {
    collection: vi.fn().mockReturnValue(mockCollection),
  };
  return { mockDb, mockFindOneAndUpdate };
}

describe('MongoDBUpdateOrderStatusRepository', () => {
  it('chama findOneAndUpdate e retorna o pedido atualizado sem _id', async () => {
    const docAfterUpdate = {
      _id: 'some-id',
      orderNumber: 'ord-123',
      customerId: 'cust-1',
      items: [{ productId: 'p1', quantity: 2 }],
      status: 'IN_PROCESSING',
      statusHistory: [
        { status: 'CREATED', createdAt: new Date() },
        { status: 'IN_PROCESSING', createdAt: new Date() },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const { mockDb, mockFindOneAndUpdate } = createMockDb();
    mockFindOneAndUpdate.mockResolvedValueOnce(docAfterUpdate);
    const repo = new MongoDBUpdateOrderStatusRepository(mockDb as any);

    const dto: UpdateOrderStatusDto = { orderNumber: 'ord-123', status: 'IN_PROCESSING' };
    const result = await repo.updateStatus(dto);

    expect(mockFindOneAndUpdate).toHaveBeenCalledTimes(1);
    expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
      { orderNumber: 'ord-123' },
      expect.objectContaining({
        $set: expect.objectContaining({ status: 'IN_PROCESSING' }),
        $push: expect.objectContaining({
          statusHistory: expect.objectContaining({ status: 'IN_PROCESSING' }),
        }),
      }),
      { returnDocument: 'after' }
    );
    expect(result).not.toHaveProperty('_id');
    expect((result as OrderResponseDto).orderNumber).toBe('ord-123');
    expect((result as OrderResponseDto).status).toBe('IN_PROCESSING');
  });

  it('lança OrderNotFoundError quando findOneAndUpdate retorna null', async () => {
    const { mockDb, mockFindOneAndUpdate } = createMockDb();
    mockFindOneAndUpdate.mockResolvedValueOnce(null);
    const repo = new MongoDBUpdateOrderStatusRepository(mockDb as any);

    const dto: UpdateOrderStatusDto = { orderNumber: 'inexistente', status: 'SENT' };

    await expect(repo.updateStatus(dto)).rejects.toThrow(OrderNotFoundError);
  });
});
