import amqp from 'amqplib';

const EXCHANGE = process.env.RABBITMQ_EXCHANGE ?? 'order_events';
const QUEUE = process.env.RABBITMQ_QUEUE ?? 'order_events_queue';
const ROUTING_PATTERN = process.env.RABBITMQ_QUEUE_BINDING_PATTERN ?? 'order.#';

function getRabbitMQUri(): string {
  if (process.env.RABBITMQ_URI) return process.env.RABBITMQ_URI;
  const host = process.env.RABBITMQ_HOST ?? 'localhost';
  const port = process.env.RABBITMQ_PORT ?? '5672';
  const user = process.env.RABBITMQ_USER ?? 'guest';
  const password = process.env.RABBITMQ_PASSWORD ?? 'guest';
  const vhost = (process.env.RABBITMQ_VHOST ?? '').replace(/^\/+/, '').replace(/\/+$/, '');
  const path = vhost ? `/${encodeURIComponent(vhost)}` : '';
  return `amqp://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}${path}`;
}

let connection: Awaited<ReturnType<typeof amqp.connect>> | null = null;
let channel: Awaited<ReturnType<Awaited<ReturnType<typeof amqp.connect>>['createChannel']>> | null = null;

const CONNECT_RETRIES = Number(process.env.RABBITMQ_CONNECT_RETRIES ?? 10);
const CONNECT_RETRY_DELAY_MS = Number(process.env.RABBITMQ_CONNECT_RETRY_DELAY_MS ?? 2000);

export async function connectRabbitMQ(): Promise<void> {
  const uri = getRabbitMQUri();
  const safeUri = uri.replace(/:([^:@]+)@/, ':****@');
  let lastErr: Error | null = null;
  for (let attempt = 1; attempt <= CONNECT_RETRIES; attempt++) {
    try {
      const conn = await amqp.connect(uri);
      const ch = await conn.createChannel();
      await ch.assertExchange(EXCHANGE, 'topic', { durable: true });
      await ch.assertQueue(QUEUE, { durable: true });
      await ch.bindQueue(QUEUE, EXCHANGE, ROUTING_PATTERN);
      connection = conn;
      channel = ch;
      console.log('RabbitMQ connected successfully');
      return;
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (attempt < CONNECT_RETRIES) {
        console.warn(`RabbitMQ connection attempt ${attempt}/${CONNECT_RETRIES} failed (${safeUri}), retrying in ${CONNECT_RETRY_DELAY_MS}ms...`);
        await new Promise((r) => setTimeout(r, CONNECT_RETRY_DELAY_MS));
      }
    }
  }
  throw lastErr ?? new Error('RabbitMQ connection failed');
}

export function getRabbitMQChannel(): NonNullable<typeof channel> {
  if (!channel) {
    throw new Error('RabbitMQ not connected. Call connectRabbitMQ() first.');
  }
  return channel;
}

export function getRabbitMQExchange(): string {
  return EXCHANGE;
}

export async function closeRabbitMQ(): Promise<void> {
  if (channel) {
    await channel.close();
    channel = null;
  }
  if (connection) {
    await connection.close();
    connection = null;
  }
}
