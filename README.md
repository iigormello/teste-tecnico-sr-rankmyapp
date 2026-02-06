# Serviço de Pedidos (Order API)

Implementação do teste técnico para desenvolvedor sênior na empresa RankMyApp. API REST para criação, consulta e atualização de status de pedidos, com arquitetura hexagonal, persistência em MongoDB e publicação de eventos no RabbitMQ.

---

## Instruções de execução

### Com Docker (recomendado)

1. Clone o repositório e entre na pasta do projeto.
2. Crie um arquivo `.env` na raiz (use `.env.example` como base) e defina pelo menos:
   - `MONGODB_PASSWORD` (obrigatório para o Mongo)
   - Opcional: `RABBITMQ_USER`, `RABBITMQ_PASSWORD` se não usar o padrão `guest`.
3. Suba os serviços:

```bash
docker-compose up --build
```

A API ficará em **http://localhost:3000**. MongoDB em `localhost:27017` e RabbitMQ (AMQP em `5672`, Management UI em **http://localhost:15672**). A documentação de uso da API ficará em `http://localhost:3000/api-docs`

Para rodar em segundo plano:

```bash
docker-compose up -d --build
```

### Sem Docker (local)

1. Tenha Node.js 18+, MongoDB e RabbitMQ rodando localmente.
2. Instale dependências e configure o `.env` (ex.: `MONGODB_URI`, `RABBITMQ_URI` ou `RABBITMQ_HOST=localhost`).

```bash
npm install
npm start
```

---

## Stack utilizada

| Camada        | Tecnologia |
|---------------|------------|
| Runtime       | Node.js (ESM, `--experimental-strip-types`) |
| API           | Express 5 |
| Persistência  | MongoDB 7 |
| Mensageria    | RabbitMQ 3 (AMQP, amqplib) |
| Testes        | Vitest, Supertest |
| Documentação  | Swagger (OpenAPI 3), swagger-ui-express |
| Container     | Docker, Docker Compose |

---

## Cobertura de testes e principais decisões técnicas

### Cobertura de testes

- **Vitest** para testes unitários; **Supertest** para rotas HTTP.
- **6 arquivos de teste**, cobrindo:
  - **Repositórios (MongoDB):** create, find e update status.
  - **Rotas:** POST /orders, GET /:orderNumber.
  - **Middleware de erro:** 404, 422, 500 genérico.
  - **Adapter RabbitMQ:** publicação com exchange, routing key e payload JSON.

Para rodar os testes:

```bash
npm run test:run
```

Para relatório de cobertura (requer `@vitest/coverage-v8`):

```bash
npm run test:run -- --coverage
```

### Principais decisões técnicas

- **Arquitetura hexagonal (Ports & Adapters):** domínio e use cases no centro; adapters inbound (HTTP) e outbound (MongoDB, RabbitMQ) trocáveis e testáveis por mocks.
- **Use cases:** orquestração em `CreateOrderUseCase`, `FindOrderUseCase`, `UpdateOrderStatusUseCase`; rotas apenas validam e delegam.
- **Performance:** índice único em `orderNumber` criado uma vez na conexão; create com um round-trip (`insertOne` + retorno em memória); update com `findOneAndUpdate` em um round-trip.
- **Eventos:** exchange topic `order_events`, eventos `order.created`, `order.status.changed`, `order.status.updated` para integração assíncrona (ex.: serviço de notificação).
- **Respostas padronizadas:** `{ success, message, status, data }` em sucesso; `{ success, message, code, status, details? }` em erro.
- **Erros de domínio:** `OrderNotFoundError` (404), `CreateOrderFailedError` (422); tratamento central no middleware.

---

## Endpoints

| Método | Rota                      | Descrição                |
|--------|---------------------------|--------------------------|
| GET    | /health                   | Health check             |
| GET    | /api-docs                 | Swagger UI               |
| POST   | /orders                   | Criar pedido             |
| GET    | /orders/:orderNumber      | Buscar pedido            |
| PATCH  | /orders/:orderNumber/status | Atualizar status do pedido |

Status de pedido: `CREATED` → `IN_PROCESSING` → `SENT` → `DELIVERED`.
