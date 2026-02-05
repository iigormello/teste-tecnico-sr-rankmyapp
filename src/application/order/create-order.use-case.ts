import crypto from 'crypto';
import { ObjectId } from 'bson';
import type { IOrderCreateRepository } from '../../ports/order/create-order.repository.ts';
import type { IOrderEventPublisher } from '../../ports/order/order-event-publisher.ts';
import type { OrderResponseDto } from '../../domain/order/dto/order-response.dto.ts';
import type { CreateOrderDto } from '../../domain/order/dto/create-order.dto.ts';

export class CreateOrderUseCase {
  private readonly createRepository: IOrderCreateRepository;
  private readonly eventPublisher: IOrderEventPublisher | undefined;

  constructor(
    createRepository: IOrderCreateRepository,
    eventPublisher?: IOrderEventPublisher
  ) {
    this.createRepository = createRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute(input: CreateOrderDto): Promise<OrderResponseDto> {
    const now = new Date();
    const order = {
      _id: new ObjectId().toString(),
      orderNumber: crypto.randomUUID(),
      customerId: input.customerId,
      items: input.items,
      status: 'CREATED' as const,
      createdAt: now,
      updatedAt: now,
    };
    const result = await this.createRepository.save({
      ...order,
      statusHistory: [{ status: 'CREATED', createdAt: now }],
    });
    await this.eventPublisher?.publish('order.created', { orderNumber: result.orderNumber });
    
    return result;
  }
}
