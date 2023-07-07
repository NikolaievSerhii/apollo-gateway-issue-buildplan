import { Express } from "express";
import bodyParser from "body-parser";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "@apollo/server-plugin-landing-page-graphql-playground";
import { ApolloGateway } from "@apollo/gateway";
import { ApolloServer } from "@apollo/server";
import { createSuperGraphSdl } from "./schema-factory";
import cors from "cors";
import { Server } from "http";
import {expressMiddleware} from "@apollo/server/express4";


export function createApolloGateway(): ApolloGateway {
  return new ApolloGateway({
    //little modified backing services schemas used to build FE supergraphqlSdl
    supergraphSdl: createSuperGraphSdl()
  });
}

export function createApolloServer(gateway: ApolloGateway): ApolloServer {
  return new ApolloServer({
    gateway: gateway,
    introspection: true,
    includeStacktraceInErrorResponses: process.env.NODE_ENV !== "production",
    plugins: [
      process.env.PLAYGROUND === "enabled"
        ? ApolloServerPluginLandingPageGraphQLPlayground()
        : ApolloServerPluginLandingPageDisabled(),
    ],
  });
}

export async function startServer(apolloServer: ApolloServer, app: Express): Promise<Array<Server>> {
  const monitorServer = app.listen(8081, () => {
    console.log({
      action: "apiMetricsStarted",
      message: "🚀 API Metrics ready at http://localhost:8081/metrics",
    });
  });

  await apolloServer.start();

  app.use(
      //apollo server is middleware of express
      cors(),
      //body parser has to be set manually, otherwise tracing propagated via CLSContext async hooks won't work.
      bodyParser.json(),
      expressMiddleware(apolloServer)
  );

  const server = app.listen(8080, () => {
    console.log({
      action: "apiGatewayRunning",
      message: "🚀 API Gateway ready at http://localhost:8080",
    });
  });

  return [monitorServer, server];
}