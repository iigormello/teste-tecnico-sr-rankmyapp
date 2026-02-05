import { Db } from 'mongodb';
import type { IOrderFindRepository } from '../../../../ports/order/find-order.repository.ts';
import type { OrderFindDto } from '../../../../domain/order/dto/order-find.dto.ts';
import type { OrderResponseDto } from '../../../../domain/order/dto/order-response.dto.ts';
import { OrderNotFoundError } from '../../../../domain/order/errors.ts';

const COLLECTION = process.env.MONGODB_COLLECTION ?? 'orders';

export class MongoDBFindOrderRepository implements IOrderFindRepository {
    private readonly db: Db;

    constructor(db: Db) {
      this.db = db;
    }

    async find(orderFindDto: OrderFindDto): Promise<OrderResponseDto | null> {
        const collection = this.db.collection<OrderResponseDto>(COLLECTION);
        const order = await collection.findOne<OrderResponseDto>({ orderNumber: orderFindDto.orderNumber });

        if (!order) {
            throw new OrderNotFoundError({ orderNumber: orderFindDto.orderNumber });
        }

        const { _id: _omit, ...orderNew } = order as typeof order & { _id: unknown };
        return orderNew as OrderResponseDto;
    }
}