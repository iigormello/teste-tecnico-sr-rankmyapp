import type { IOrderCreateRepository } from '../../../../ports/order/create-order.repository';
import type { OrderDto } from '../../../../domain/order/dto/order.dto';
import { Db } from 'mongodb';
import type { OrderResponseDto } from '../../../../domain/order/dto/order-response.dto.ts';
import { CreateOrderFailedError } from '../../../../domain/order/errors.ts';

const COLLECTION = process.env.MONGODB_COLLECTION ?? 'orders';

type OrderDocument = Omit<OrderDto, 'id'> & { _id: string; };

export class MongoDBCreateOrderRepository implements IOrderCreateRepository {
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  async save(order: OrderDto): Promise<OrderResponseDto> {
    const collection = this.db.collection<OrderDocument>(COLLECTION);
    const doc: OrderDocument = {
      _id: order._id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      items: order.items,
      status: order.status,
      statusHistory: order.statusHistory || [
        {
          status: order.status,
          createdAt: order.createdAt,
        },
      ],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
    try {
      await collection.insertOne(doc);
      const { _id: _omit, ...orderNew } = doc;
      return orderNew as OrderResponseDto;
    } catch (err) {
      throw new CreateOrderFailedError(err);
    }
  }
}
