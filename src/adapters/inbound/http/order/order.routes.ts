import { Router } from 'express';
import { sendSuccess, sendError } from '../response.ts';
import { validateCreateOrderBody, validateFindOrderParams, validateUpdateOrderStatusBody } from './order.validation.ts';
import type { CreateOrderUseCase } from '../../../../application/order/create-order.use-case.ts';
import type { FindOrderUseCase } from '../../../../application/order/find-order.use-case.ts';
import type { UpdateOrderStatusUseCase } from '../../../../application/order/update-order-status.use-case.ts';

export function createOrderRoutes(
  createOrderUseCase: CreateOrderUseCase,
  findOrderUseCase: FindOrderUseCase,
  updateOrderStatusUseCase: UpdateOrderStatusUseCase
): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const validation = validateCreateOrderBody(req.body);
    if (!validation.valid) {
      sendError(res, 400, 'Dados inválidos', 'VALIDATION_ERROR', validation.errors);
      return;
    }
    const order = await createOrderUseCase.execute(validation.data);
    sendSuccess(res, 201, 'Pedido criado com sucesso', order);
  });

  router.get('/:orderNumber', async (req, res) => {
    const validation = validateFindOrderParams(req.params.orderNumber);
    if (!validation.valid) {
      sendError(res, 400, 'Parâmetros inválidos', 'VALIDATION_ERROR', validation.errors);
      return;
    }
    const order = await findOrderUseCase.execute(validation.data.orderNumber);
    sendSuccess(res, 200, 'Pedido encontrado com sucesso', order);
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
    const order = await updateOrderStatusUseCase.execute({
      orderNumber: paramsValidation.data.orderNumber,
      status: bodyValidation.data.status,
    });
    sendSuccess(res, 200, 'Status atualizado com sucesso', order);
  });

  return router;
}
