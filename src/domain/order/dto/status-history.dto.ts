import { OrderStatus } from "./order-status.type";

export interface StatusHistoryDto {
    status: OrderStatus;
    createdAt: Date;
}