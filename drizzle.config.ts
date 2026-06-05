import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({
path: ".env.local",
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
throw new Error(
"DATABASE_URL não encontrada. Verifique o arquivo .env.local"
);
}

export default defineConfig({
schema: "./drizzle/schema.ts",
out: "./drizzle",
dialect: "mysql",
dbCredentials: {
url: connectionString,
},
});
