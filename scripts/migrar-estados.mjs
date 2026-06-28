import pkg from "@next/env";
import { MongoClient } from "mongodb";

const { loadEnvConfig } = pkg;
loadEnvConfig(process.cwd());

const c = new MongoClient(process.env.MONGODB_URI);
await c.connect();
const db = c.db(process.env.MONGODB_DB || "meridie");
const col = db.collection("empreendimentos");

const antes = await col.distinct("estado");
console.log("Estados no Mongo antes:", antes);

const r = await col.updateMany({ estado: "Em planta" }, { $set: { estado: "Planta" } });
console.log(`"Em planta" → "Planta": ${r.modifiedCount} atualizados`);

console.log("Estados no Mongo depois:", await col.distinct("estado"));
await c.close();
