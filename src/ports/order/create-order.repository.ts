import type { OrderDto } from '../../domain/order/dto/order.dto.ts';
import type { OrderResponseDto } from '../../domain/order/dto/order-response.dto.ts';

export interface IOrderCreateRepository {
  save(order: OrderDto): Promise<OrderResponseDto>;
}
