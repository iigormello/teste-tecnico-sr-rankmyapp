import type { IOrderFindRepository } from '../../ports/order/find-order.repository.ts';
import type { OrderResponseDto } from '../../domain/order/dto/order-response.dto.ts';

export class FindOrderUseCase {
  private readonly findRepository: IOrderFindRepository;

  constructor(findRepository: IOrderFindRepository) {
    this.findRepository = findRepository;
  }

  async execute(orderNumber: string): Promise<OrderResponseDto> {
    const order = await this.findRepository.find({ orderNumber });
    return order as OrderResponseDto;
  }
}
