import type { IOrderCreateRepository } from '../../../../../ports/order/create-order.repository.ts';
import type { OrderDto } from '../../../../../domain/order/dto/order.dto.ts';
import { Db } from 'mongodb';

const COLLECTION = 'orders';

type OrderDocument = Omit<OrderDto, 'id'> & { _id: string; };

export class MongoDBCreateOrderRepository implements IOrderCreateRepository {
  constructor(private readonly db: Db) {}

  async save(order: OrderDto): Promise<OrderDto> {
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
    await collection.insertOne(doc as OrderDocument);
    return order;
  }
}
