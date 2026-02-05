import crypto from 'crypto';
import type { IOrderCreateRepository } from '../../../../ports/order/create-order.repository.ts';
import type { IOrderFindRepository } from '../../../../ports/order/find-order.repository.ts';
import { ObjectId } from 'bson';
import { Router } from 'express';
import { sendSuccess, sendError } from '../response.ts';
import { validateCreateOrderBody, validateFindOrderParams } from './order.validation.ts';

export function createOrderRoutes(createRepository: IOrderCreateRepository, findRepository: IOrderFindRepository): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const validation = validateCreateOrderBody(req.body);
    if (!validation.valid) {
      sendError(res, 400, 'Dados inválidos', 'VALIDATION_ERROR', validation.errors);
      return;
    }
    const { customerId, items } = validation.data;
    const order = await createRepository.save({
      _id: new ObjectId().toString(),
      orderNumber: crypto.randomUUID(),
      customerId,
      items,
      status: 'CREATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    sendSuccess(res, 201, 'Pedido criado com sucesso', order);
  });

  router.get('/:orderNumber', async (req, res) => {
    const validation = validateFindOrderParams(req.params.orderNumber);
    if (!validation.valid) {
      sendError(res, 400, 'Parâmetros inválidos', 'VALIDATION_ERROR', validation.errors);
      return;
    }
    const order = await findRepository.find({ orderNumber: validation.data.orderNumber });
    sendSuccess(res, 200, 'Pedido encontrado com sucesso', order as NonNullable<typeof order>);
  });

  router.patch('/:id/status', (_req, res) => {
    res.status(501).json({ message: 'Not implemented: atualizar status do pedido' });
  });

  return router;
}
