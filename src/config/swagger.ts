/**
 * Especificação OpenAPI 3.0 para documentação da API (Swagger UI).
 * Alinhado com: rotas, formato de resposta (success, message, status, data) e OrderStatus do domínio.
 */
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API Pedidos',
    version: '1.0.0',
    description: 'API de pedidos – criar, consultar e atualizar status.',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local' },
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
                  required: ['success', 'message', 'status', 'data'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Pedido criado com sucesso' },
                    status: { type: 'integer', example: 201 },
                    data: { $ref: '#/components/schemas/OrderData' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Dados inválidos (validação)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          404: {
            description: 'Pedido não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiOrderNotFoundError' },
              },
            },
          },
        },
      },
    },
    '/orders/{orderNumber}': {
      get: {
        summary: 'Consultar pedido por orderNumber',
        tags: ['Orders'],
        parameters: [
          { name: 'orderNumber', in: 'path', required: true, schema: { type: 'string' }, description: 'Número do pedido' },
        ],
        responses: {
          200: {
            description: 'Pedido encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'message', 'status', 'data'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Pedido encontrado com sucesso' },
                    status: { type: 'integer', example: 200 },
                    data: { $ref: '#/components/schemas/OrderData' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Parâmetros inválidos (ex.: orderNumber vazio)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          404: {
            description: 'Pedido não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiOrderNotFoundError' },
              },
            },
          },
        },
      },
    },
    '/orders/{orderNumber}/status': {
      patch: {
        summary: 'Atualizar status do pedido',
        tags: ['Orders'],
        parameters: [
          { name: 'orderNumber', in: 'path', required: true, schema: { type: 'string' }, description: 'Número do pedido' },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['CREATED', 'IN_PROCESSING', 'SENT', 'DELIVERED'],
                    description: 'Novo status do pedido',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Status atualizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'message', 'status', 'data'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Status atualizado com sucesso' },
                    status: { type: 'integer', example: 200 },
                    data: { $ref: '#/components/schemas/OrderData' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Parâmetros ou body inválidos (validação)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
          404: {
            description: 'Pedido não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiOrderNotFoundError' },
              },
            },
          },
          422: {
            description: 'Erro ao processar (ex.: falha ao criar/atualizar)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      OrderData: {
        type: 'object',
        properties: {
          orderNumber: { type: 'string' },
          customerId: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                quantity: { type: 'integer' },
                price: { type: 'number' },
              },
            },
          },
          status: { type: 'string', enum: ['CREATED', 'IN_PROCESSING', 'SENT', 'DELIVERED'] },
          statusHistory: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          status: { type: 'integer' },
          details: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      ApiOrderNotFoundError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          code: { type: 'string', example: 'ORDER_NOT_FOUND' },
          status: { type: 'integer' },
        },
      },
    },
  },
};
