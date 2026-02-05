/**
 * Especificação OpenAPI 3.0 para documentação da API (Swagger UI).
 * Use com: swaggerUi.setup(swaggerSpec)
 */
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API Pedidos',
    version: '1.0.0',
    description: 'API de pedidos – criar, consultar e atualizar status.',
  },
  servers: [
    { url: 'http://localhost:3005', description: 'Local' },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['Health'],
        responses: {
          200: {
            description: 'Aplicação saudável',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/orders': {
      post: {
        summary: 'Criar pedido',
        tags: ['Orders'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['customerId', 'items'],
                properties: {
                  customerId: { type: 'string', description: 'ID do cliente' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['productId', 'quantity'],
                      properties: {
                        productId: { type: 'string' },
                        quantity: { type: 'integer', minimum: 1 },
                        price: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Pedido criado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    order: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        customerId: { type: 'string' },
                        items: { type: 'array', items: { type: 'object' } },
                        status: { type: 'string', example: 'PENDING' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/orders/{id}': {
      get: {
        summary: 'Consultar status do pedido',
        tags: ['Orders'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do pedido' },
        ],
        responses: {
          200: { description: 'Pedido encontrado' },
          404: { description: 'Pedido não encontrado' },
        },
      },
    },
    '/orders/{id}/status': {
      patch: {
        summary: 'Atualizar status do pedido',
        tags: ['Orders'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID do pedido' },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Status atualizado' },
          400: { description: 'Status inválido ou transição não permitida' },
          404: { description: 'Pedido não encontrado' },
        },
      },
    },
  },
};
