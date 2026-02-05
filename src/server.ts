import 'dotenv/config';
import { connectMongo, getDb } from './infrastructure/database/mongodb.connection.ts';
import { createApp } from './app.ts';

const PORT = Number(process.env.PORT) || 3000;

async function main(): Promise<void> {
  await connectMongo();
  const db = getDb();
  const app = createApp(db);
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
