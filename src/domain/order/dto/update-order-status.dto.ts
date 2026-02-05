import { OrderStatus } from "./order-status.type";

export interface UpdateOrderStatusDto {
    orderNumber: string;
    status: OrderStatus;
}