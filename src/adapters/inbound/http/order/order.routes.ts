import { Router } from 'express';
import type { IOrderCreateRepository } from '../../../../ports/order/create-order.repository.ts';
import crypto from 'crypto';
import { ObjectId } from 'bson';

export function createOrderRoutes(repository: IOrderCreateRepository): Router {
  const router = Router();

  router.post('/', async (_req, res) => {
    const order = await repository.save({
      _id: new ObjectId().toString(),
      orderNumber: crypto.randomUUID(),
      customerId: _req.body.customerId,
      items: _req.body.items,
      status: 'CREATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.status(201).json({ message: 'Pedido criado com sucesso', order });
  });

  router.get('/:id', (_req, res) => {
    res.status(501).json({ message: 'Not implemented: consultar status do pedido' });
  });

  router.patch('/:id/status', (_req, res) => {
    res.status(501).json({ message: 'Not implemented: atualizar status do pedido' });
  });

  return router;
}
