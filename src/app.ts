import express from 'express';
import { Db } from 'mongodb';
import { createOrderRoutes } from './adapters/inbound/http/order/order.routes.ts';
import { errorHandler } from './adapters/inbound/http/order/order.middleware.ts';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.ts';
import { MongoDBCreateOrderRepository } from './adapters/outbound/persistence/order/mongodb-create-order.repository.ts';
import { MongoDBFindOrderRepository } from './adapters/outbound/persistence/order/mongodb-find-order.repository.ts';
import { MongoDBUpdateOrderStatusRepository } from './adapters/outbound/persistence/order/mongodb-update-order-status.repository.ts';
import { CreateOrderUseCase } from './application/order/create-order.use-case.ts';
import { FindOrderUseCase } from './application/order/find-order.use-case.ts';
import { UpdateOrderStatusUseCase } from './application/order/update-order-status.use-case.ts';
import { getRabbitMQChannel, getRabbitMQExchange } from './infrastructure/messaging/rabbitmq.connection.ts';
import { RabbitMQOrderEventPublisher } from './adapters/outbound/messaging/order/rabbitmq-order-event-publisher.ts';

export function createApp(db: Db): express.Express {
  const app = express();

  app.use(express.json());

  app.get('/', (_req, res) => {
    res.status(200).json({ message: 'aplicativo iniciado com sucesso' });
  });

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  const createOrderRepository = new MongoDBCreateOrderRepository(db);
  const findOrderRepository = new MongoDBFindOrderRepository(db);
  const updateOrderStatusRepository = new MongoDBUpdateOrderStatusRepository(db);
  const eventPublisher = new RabbitMQOrderEventPublisher(getRabbitMQChannel(), getRabbitMQExchange());
  const createOrderUseCase = new CreateOrderUseCase(createOrderRepository, eventPublisher);
  const findOrderUseCase = new FindOrderUseCase(findOrderRepository);
  const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(updateOrderStatusRepository, eventPublisher);
  app.use('/orders', createOrderRoutes(createOrderUseCase, findOrderUseCase, updateOrderStatusUseCase));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(errorHandler);

  return app;
}
