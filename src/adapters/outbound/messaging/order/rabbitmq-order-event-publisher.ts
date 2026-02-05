import type { IOrderEventPublisher } from '../../../../ports/order/order-event-publisher.ts';

export interface RabbitMQPublishChannel {
  publish(exchange: string, routingKey: string, content: Buffer, options?: { persistent?: boolean; contentType?: string }): boolean;
}

export class RabbitMQOrderEventPublisher implements IOrderEventPublisher {
  private readonly channel: RabbitMQPublishChannel;
  private readonly exchange: string;

  constructor(channel: RabbitMQPublishChannel, exchange: string) {
    this.channel = channel;
    this.exchange = exchange;
  }

  async publish(eventType: string, payload: unknown): Promise<void> {
    const content = Buffer.from(JSON.stringify(payload));
    this.channel.publish(this.exchange, eventType, content, {
      persistent: true,
      contentType: 'application/json',
    });
  }
}
