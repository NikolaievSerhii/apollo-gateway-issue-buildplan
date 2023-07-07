import express from "express";
import { createApolloGateway, createApolloServer, startServer } from "./server-setup";

async function run(): Promise<number> {
  const isDryRun = process.env.DRY_RUN === "true";

  if (isDryRun) {
    const gateway = createApolloGateway();
    await gateway.load();
    await gateway.stop();

    return 0;
  }

  const app = express();
  const gateway = createApolloGateway();
  const apolloServer = createApolloServer(gateway);
  await startServer(apolloServer, app);


  return 0;
}

run().catch(err => {
  console.log({ action: "startGraphQlGateway" }, err);
  if (process.env.NODE_ENV !== "test") {
    process.exit(1);
  }
});
