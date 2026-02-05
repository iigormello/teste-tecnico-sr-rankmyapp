import type { OrderDto } from '../../domain/order/dto/order.dto.ts';
import type { CreateOrderResponseDto } from '../../domain/order/dto/create-order-response.dto.ts';

export interface IOrderCreateRepository {
  save(order: OrderDto): Promise<CreateOrderResponseDto>;
}
