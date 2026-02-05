import { Db } from "mongodb";
import type { OrderResponseDto } from "../../../../domain/order/dto/order-response.dto";
import { OrderNotFoundError } from "../../../../domain/order/errors.ts";
import type { UpdateOrderStatusDto } from "../../../../domain/order/dto/update-order-status.dto";
import type { IUpdateStatusOrderRepository } from "../../../../ports/order/update-status-order.repository.ts";

const COLLECTION = process.env.MONGODB_COLLECTION ?? 'orders';

export class MongoDBUpdateOrderStatusRepository implements IUpdateStatusOrderRepository {
    private readonly db: Db;

    constructor(db: Db) {
      this.db = db;
    }

    async updateStatus(updateOrderStatusDto: UpdateOrderStatusDto): Promise<OrderResponseDto> {
        const collection = this.db.collection<OrderResponseDto>(COLLECTION);
        collection.createIndex({ orderNumber: 1 }, { unique: true });

        const order = await collection.findOne<OrderResponseDto>({ orderNumber: updateOrderStatusDto.orderNumber });

        if (!order) {
            throw new OrderNotFoundError({ orderNumber: updateOrderStatusDto.orderNumber });
        }

        await collection.updateOne({ 
            orderNumber: updateOrderStatusDto.orderNumber 
        }, { 
            $set: { status: updateOrderStatusDto.status, updatedAt: new Date() }, 
            $push: { statusHistory: { status: updateOrderStatusDto.status, createdAt: new Date() } } 
        });

        const orderUpdated = await collection.findOne<OrderResponseDto>({ orderNumber: updateOrderStatusDto.orderNumber });

        if (!orderUpdated) {
            throw new OrderNotFoundError({ orderNumber: updateOrderStatusDto.orderNumber });
        }

        const { _id: _omit, ...orderNew } = orderUpdated as typeof orderUpdated & { _id: unknown };
        return orderNew as OrderResponseDto;
    }
}   