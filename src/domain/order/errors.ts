export class OrderNotFoundError extends Error {
  readonly orderNumber?: string;

  constructor(options?: { orderNumber?: string; }) {
    const message = 'Pedido não encontrado';
    super(message);
    this.name = 'OrderNotFoundError';
    this.orderNumber = options?.orderNumber;
    Object.setPrototypeOf(this, OrderNotFoundError.prototype);
  }
}

export class CreateOrderFailedError extends Error {
  readonly cause?: unknown;

  constructor(cause?: unknown) {
    const message = 'Não foi possível criar o pedido';
    super(message);
    this.name = 'CreateOrderFailedError';
    this.cause = cause;
    Object.setPrototypeOf(this, CreateOrderFailedError.prototype);
  }
}
