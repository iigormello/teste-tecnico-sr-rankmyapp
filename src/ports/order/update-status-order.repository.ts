import { OrderResponseDto } from "../../domain/order/dto/order-response.dto";
import { UpdateOrderStatusDto } from "../../domain/order/dto/update-order-status.dto";

export interface IUpdateStatusOrderRepository {
  updateStatus(updateOrderStatusDto: UpdateOrderStatusDto): Promise<OrderResponseDto>;
}