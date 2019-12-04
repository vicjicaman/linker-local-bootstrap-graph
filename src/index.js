require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const graphqlHTTP = require("express-graphql");
const { makeExecutableSchema } = require("graphql-tools");
const { schema: rootSchema, resolvers: rootResolvers } = require("./schema");

import * as Utils from "@nebulario/linker-utils";
import * as Logger from "@nebulario/linker-logger";

import * as Service from "Model/service";

const ENV_MODE = process.env["ENV_MODE"];
const ENV_MODE_WORKER = process.env["ENV_MODE_WORKER"];
const REMOTE_SERVICE_HOST = process.env["REMOTE_SERVICE_HOST"];

const INNER_WORKSPACE = "/workspace";
const LOCAL_WORKSPACE = path.join(process.cwd(), "workspace");
const LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT =
  process.env["LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT"];

const LOCAL_VERSION_GRAPH = process.env["LOCAL_VERSION_GRAPH"];
const LOCAL_VERSION_WEB = process.env["LOCAL_VERSION_WEB"];
const LOCAL_VERSION_WORKER = process.env["LOCAL_VERSION_WORKER"];
const DEV_FOLDER = process.env["DEV_FOLDER"];

if (!fs.existsSync(LOCAL_WORKSPACE)) {
  fs.mkdirSync(LOCAL_WORKSPACE);
}

const logger = Logger.create({
  path: path.join(LOCAL_WORKSPACE, "logs", "bootstrap"),
  env: ENV_MODE
});
const cxt = {
  workspace: LOCAL_WORKSPACE,
  mode: ENV_MODE,
  paths: {
    inner: {
      workspace: INNER_WORKSPACE
    }
  },
  services: {
    bootstrap: { port: LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT },
    web: { port: 17007, version: LOCAL_VERSION_WEB },
    graph: { port: 17006, version: LOCAL_VERSION_GRAPH },
    remote: { host: REMOTE_SERVICE_HOST },
    worker: {
      mode: ENV_MODE_WORKER,
      version: LOCAL_VERSION_WORKER
    }
  },
  dev: {
    folder: DEV_FOLDER
  },
  logger,
  instance: null
};

(async () => {
  cxt.instance = await Service.start(cxt);

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

  console.log("-----------------------------------------------------------");
  console.log("Open the dashboard on:");
  console.log(`http://${cxt.instance.network.web.ip}:${cxt.services.web.port}`);
  console.log("-----------------------------------------------------------");

  app.listen(LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT, () => {
    cxt.logger.debug("service.bootstrap.running", {
      port: LOCAL_GRAPH_BOOTSTRAP_SERVICE_PORT
    });
  });
})().catch(e => cxt.logger.error("service.error", { error: e.toString() }));

Utils.Process.shutdown(signal =>
  cxt.logger.debug("service.shutdown", { signal })
);
