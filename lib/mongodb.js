import { MongoClient } from "mongodb";

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 8000,
};

// Ligação preguiçosa E reutilizada (singleton). Cria o cliente apenas quando
// `getDb()` é chamado e reutiliza a MESMA ligação em todos os ambientes —
// incluindo produção e `next build` — para não esgotar ligações nem abrir
// uma nova a cada pedido (causa de lentidão e erros de ligação).
let cachedPromise = global._mongoClientPromise || null;

function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Define a variável de ambiente MONGODB_URI em .env.local");
  }
  if (!cachedPromise) {
    cachedPromise = new MongoClient(uri, options).connect();
    // Em desenvolvimento guardamos no global para sobreviver ao hot-reload.
    if (process.env.NODE_ENV === "development") {
      global._mongoClientPromise = cachedPromise;
    }
  }
  return cachedPromise;
}

export async function getDb() {
  const connectedClient = await getClientPromise();
  return connectedClient.db(process.env.MONGODB_DB || "meridie");
}
