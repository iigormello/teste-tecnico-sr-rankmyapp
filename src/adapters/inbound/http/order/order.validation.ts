export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  valid: true;
  data: T;
}

export interface ValidationFailure {
  valid: false;
  errors: ValidationError[];
}

export type ValidateResult<T> = ValidationResult<T> | ValidationFailure;

const CREATE_ORDER = 'createOrder';

function invalid(field: string, message: string): ValidationFailure {
  return { valid: false, errors: [{ field, message }] };
}

export function validateCreateOrderBody(body: unknown): ValidateResult<{ customerId: string; items: Array<{ productId: string; quantity: number; price?: number }> }> {
  if (body === null || typeof body !== 'object') {
    return invalid(CREATE_ORDER, 'Body deve ser um objeto JSON');
  }

  const b = body as Record<string, unknown>;
  const errors: ValidationError[] = [];

  if (b.customerId === undefined || b.customerId === null) {
    errors.push({ field: 'customerId', message: 'customerId é obrigatório' });
  } else if (typeof b.customerId !== 'string' || b.customerId.trim() === '') {
    errors.push({ field: 'customerId', message: 'customerId deve ser uma string não vazia' });
  }

  if (b.items === undefined || b.items === null) {
    errors.push({ field: 'items', message: 'items é obrigatório' });
  } else if (!Array.isArray(b.items)) {
    errors.push({ field: 'items', message: 'items deve ser um array' });
  } else {
    b.items.forEach((item: unknown, index: number) => {
      if (item === null || typeof item !== 'object') {
        errors.push({ field: `items[${index}]`, message: 'Item deve ser um objeto' });
        return;
      }
      const it = item as Record<string, unknown>;
      if (typeof it.productId !== 'string' || it.productId.trim() === '') {
        errors.push({ field: `items[${index}].productId`, message: 'productId é obrigatório e deve ser string' });
      }
      if (typeof it.quantity !== 'number' || it.quantity < 1 || !Number.isInteger(it.quantity)) {
        errors.push({ field: `items[${index}].quantity`, message: 'quantity deve ser um número inteiro maior que 0' });
      }
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      customerId: (b.customerId as string).trim(),
      items: (b.items as Array<Record<string, unknown>>).map((it) => ({
        productId: String(it.productId).trim(),
        quantity: Number(it.quantity),
        price: it.price !== undefined && it.price !== null ? Number(it.price) : undefined,
      })),
    },
  };
}

const ORDER_NUMBER_PARAM = 'orderNumber';

export function validateFindOrderParams(orderNumber: string | undefined): ValidateResult<{ orderNumber: string }> {
  if (orderNumber === undefined || orderNumber === null) {
    return invalid(ORDER_NUMBER_PARAM, 'orderNumber é obrigatório');
  }
  if (typeof orderNumber !== 'string') {
    return invalid(ORDER_NUMBER_PARAM, 'orderNumber deve ser uma string');
  }
  const trimmed = orderNumber.trim();
  if (trimmed === '') {
    return invalid(ORDER_NUMBER_PARAM, 'orderNumber não pode ser vazio');
  }
  return { valid: true, data: { orderNumber: trimmed } };
}

const VALID_STATUSES = ['CREATED', 'IN_PROCESSING', 'SENT', 'DELIVERED'] as const;
export type OrderStatus = (typeof VALID_STATUSES)[number];

const STATUS_FIELD = 'status';

export function validateUpdateOrderStatusBody(body: unknown): ValidateResult<{ status: OrderStatus }> {
  if (body === null || typeof body !== 'object') {
    return invalid(STATUS_FIELD, 'Body deve ser um objeto JSON');
  }
  const b = body as Record<string, unknown>;
  if (b.status === undefined || b.status === null) {
    return invalid(STATUS_FIELD, 'status é obrigatório');
  }
  if (typeof b.status !== 'string') {
    return invalid(STATUS_FIELD, 'status deve ser uma string');
  }
  const status = (b.status as string).toUpperCase();
  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    return invalid(STATUS_FIELD, `status deve ser um dos valores: ${VALID_STATUSES.join(', ')}`);
  }
  return { valid: true, data: { status: status as OrderStatus } };
}
