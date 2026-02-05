import type { OrderItemsDto } from './order-items.dto.ts';
import type { OrderStatus } from './order-status.type.ts';
import type { StatusHistoryDto } from './status-history.dto.ts';

export interface CreateOrderResponseDto {
    orderNumber: string;
    customerId: string;
    items: OrderItemsDto[];
    status: OrderStatus;
    statusHistory?: StatusHistoryDto[];
    createdAt: Date;
    updatedAt: Date;
  }