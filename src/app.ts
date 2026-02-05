import express from 'express';
import { Db } from 'mongodb';
import { createOrderRoutes } from './adapters/inbound/http/order/order.routes.ts';
import { errorHandler } from './adapters/inbound/http/order/order.middleware.ts';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.ts';
import { MongoDBCreateOrderRepository } from './adapters/outbound/persistence/order/mongodb-create-order.repository.ts';
import { MongoDBFindOrderRepository } from './adapters/outbound/persistence/order/mongodb-find-order.repository.ts';
import { MongoDBUpdateOrderStatusRepository } from './adapters/outbound/persistence/order/mongodb-update-order-status.repository.ts';

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

  const orderRepository = new MongoDBCreateOrderRepository(db);
  const orderFindRepository = new MongoDBFindOrderRepository(db);
  const updateStatusRepository = new MongoDBUpdateOrderStatusRepository(db);
  app.use('/orders', createOrderRoutes(orderRepository, orderFindRepository, updateStatusRepository));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(errorHandler);

  return app;
}
