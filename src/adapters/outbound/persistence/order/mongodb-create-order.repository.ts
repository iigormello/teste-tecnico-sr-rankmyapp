import type { IOrderCreateRepository } from '../../../../ports/order/create-order.repository';
import type { OrderDto } from '../../../../domain/order/dto/order.dto';
import { Db } from 'mongodb';
import type { CreateOrderResponseDto } from '../../../../domain/order/dto/create-order-response.dto.ts';

const COLLECTION = process.env.MONGODB_COLLECTION ?? 'orders';

type OrderDocument = Omit<OrderDto, 'id'> & { _id: string; };

export class MongoDBCreateOrderRepository implements IOrderCreateRepository {
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  async save(order: OrderDto): Promise<CreateOrderResponseDto> {
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
    const result = await collection.insertOne(doc);

    //Depois que tiver o get order posso chamar o get order e retornar o orderNew
    const orderFind = await collection.findOne<CreateOrderResponseDto>({ _id: result.insertedId });
    if (!orderFind) {
      throw new Error('Order not found');
    }

    const { _id: _omit, ...orderNew } = orderFind as typeof orderFind & { _id: unknown };
    return orderNew as CreateOrderResponseDto;
  }
}
