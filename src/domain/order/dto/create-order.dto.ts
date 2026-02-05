import type { OrderItemsDto } from './order-items.dto.ts';

export interface CreateOrderDto {
    customerId: string;
    items: OrderItemsDto[];
}