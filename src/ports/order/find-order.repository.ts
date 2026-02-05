import type { OrderResponseDto } from '../../domain/order/dto/order-response.dto.ts';
import type { OrderFindDto } from '../../domain/order/dto/order-find.dto.ts';

export interface IOrderFindRepository {
  find(orderFindDto: OrderFindDto): Promise<OrderResponseDto | null>;
}