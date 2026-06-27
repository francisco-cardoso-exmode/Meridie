import { MongoClient } from "mongodb";

const options = {};

// Ligação preguiçosa: só validamos a env e criamos o cliente quando
// `getDb()` é efetivamente chamado (em runtime), e não no momento do import.
// Isto permite que o `next build` recolha os dados das rotas sem exigir
// MONGODB_URI definido no ambiente de build.
function getClientPromise() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Define a variável de ambiente MONGODB_URI em .env.local");
  }

  // Em desenvolvimento reutilizamos a ligação entre hot-reloads
  // para não esgotar as ligações. Em produção criamos uma por instância.
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  const client = new MongoClient(uri, options);
  return client.connect();
}

export async function getDb() {
  const connectedClient = await getClientPromise();
  return connectedClient.db(process.env.MONGODB_DB || "meridie");
}
