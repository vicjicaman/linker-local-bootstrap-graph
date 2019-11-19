require("dotenv").config();
const path = require("path");
const express = require("express");
const graphqlHTTP = require("express-graphql");
const { makeExecutableSchema } = require("graphql-tools");
const { schema: rootSchema, resolvers: rootResolvers } = require("./schema");

import * as Utils from "@nebulario/linker-utils";
import * as Logger from "@nebulario/linker-logger";

const ENV_MODE = process.env["ENV_MODE"];
const LOCAL_TOKEN = process.env["LOCAL_TOKEN"];
const LOCAL_WORKSPACE = process.env["LOCAL_WORKSPACE"];
const LOCAL_BOOTSTRAP_GRAPH_PORT = process.env["LOCAL_BOOTSTRAP_GRAPH_PORT"];

const logger = Logger.create({
  path: path.join(LOCAL_WORKSPACE, "logs", "bootstrap"),
  env: ENV_MODE
});
const cxt = {
  workspace: LOCAL_WORKSPACE,
  host: {
    server: {
      host: "linker.repoflow.com"
    }
  },
  secrets: {
    token: LOCAL_TOKEN
  },
  logger
};

(async () => {
  var app = express();
  Logger.Service.use(app, cxt);

  const schema = makeExecutableSchema({
    typeDefs: rootSchema,
    resolvers: rootResolvers
  });

  app.use(
    "/graphql",
    graphqlHTTP(request => ({
      schema: schema,
      graphiql: true,
      context: {
        request,
        ...cxt
      }
    }))
  );
  app.listen(LOCAL_BOOTSTRAP_GRAPH_PORT, () => {
    cxt.logger.info("service.running", { port: LOCAL_BOOTSTRAP_GRAPH_PORT });
  });
})().catch(e => cxt.logger.error("service.error", { error: e.toString() }));

Utils.Process.shutdown(signal =>
  cxt.logger.info("service.shutdown", { signal })
);
