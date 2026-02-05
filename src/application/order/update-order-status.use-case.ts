import type { IUpdateStatusOrderRepository } from '../../ports/order/update-status-order.repository.ts';
import type { IOrderEventPublisher } from '../../ports/order/order-event-publisher.ts';
import type { OrderResponseDto } from '../../domain/order/dto/order-response.dto.ts';
import type { UpdateOrderStatusDto } from '../../domain/order/dto/update-order-status.dto.ts';

export class UpdateOrderStatusUseCase {
  private readonly updateStatusRepository: IUpdateStatusOrderRepository;
  private readonly eventPublisher: IOrderEventPublisher | undefined;

  constructor(
    updateStatusRepository: IUpdateStatusOrderRepository,
    eventPublisher?: IOrderEventPublisher
  ) {
    this.updateStatusRepository = updateStatusRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute(dto: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    const result = await this.updateStatusRepository.updateStatus(dto);
    
    await this.eventPublisher?.publish('order.status.updated', { orderNumber: result.orderNumber });
    return result;
  }
}
