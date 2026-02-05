import crypto from 'crypto';
import type { IOrderCreateRepository } from '../../../../ports/order/create-order.repository.ts';
import type { IOrderFindRepository } from '../../../../ports/order/find-order.repository.ts';
import type { IUpdateStatusOrderRepository } from '../../../../ports/order/update-status-order.repository.ts';
import { ObjectId } from 'bson';
import { Router } from 'express';
import { sendSuccess, sendError } from '../response.ts';
import { validateCreateOrderBody, validateFindOrderParams, validateUpdateOrderStatusBody } from './order.validation.ts';

export function createOrderRoutes(createRepository: IOrderCreateRepository, findRepository: IOrderFindRepository, updateStatusRepository: IUpdateStatusOrderRepository): Router {
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

  router.patch('/:orderNumber/status', async (req, res) => {
    const paramsValidation = validateFindOrderParams(req.params.orderNumber);
    if (!paramsValidation.valid) {
      sendError(res, 400, 'Parâmetros inválidos', 'VALIDATION_ERROR', paramsValidation.errors);
      return;
    }
    const bodyValidation = validateUpdateOrderStatusBody(req.body);
    if (!bodyValidation.valid) {
      sendError(res, 400, 'Dados inválidos', 'VALIDATION_ERROR', bodyValidation.errors);
      return;
    }
    const order = await updateStatusRepository.updateStatus({
      orderNumber: paramsValidation.data.orderNumber,
      status: bodyValidation.data.status,
    });
    sendSuccess(res, 200, 'Status atualizado com sucesso', order);
  });

  return router;
}
