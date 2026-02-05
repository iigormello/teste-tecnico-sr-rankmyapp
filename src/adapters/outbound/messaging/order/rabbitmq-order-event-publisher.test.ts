import { describe, it, expect, vi } from 'vitest';
import { RabbitMQOrderEventPublisher } from './rabbitmq-order-event-publisher';

describe('RabbitMQOrderEventPublisher', () => {
  it('publica mensagem no canal com exchange, routing key e payload em JSON', async () => {
    const publish = vi.fn().mockReturnValue(true);
    const channel = { publish };
    const publisher = new RabbitMQOrderEventPublisher(channel as any, 'order_events');

    await publisher.publish('order.created', { orderNumber: 'ord-1', customerId: 'c1' });

    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(
      'order_events',
      'order.created',
      Buffer.from(JSON.stringify({ orderNumber: 'ord-1', customerId: 'c1' })),
      { persistent: true, contentType: 'application/json' }
    );
  });

  it('usa routing key como eventType', async () => {
    const publish = vi.fn().mockReturnValue(true);
    const channel = { publish };
    const publisher = new RabbitMQOrderEventPublisher(channel as any, 'my_exchange');

    await publisher.publish('order.status.updated', { status: 'DELIVERED' });

    expect(publish).toHaveBeenCalledWith('my_exchange', 'order.status.updated', expect.any(Buffer), expect.any(Object));
    expect(JSON.parse((publish.mock.calls[0][2] as Buffer).toString())).toEqual({ status: 'DELIVERED' });
  });
});
