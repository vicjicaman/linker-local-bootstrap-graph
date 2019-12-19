import * as DevConfig from "PKG/linker-dev";

export const compose = ({ network: { networkid, localhost } }, cxt) => {
  const {
    workspace,
    mode,
    services: {
      bootstrap: { port: localBootstrapPort },
      web: { port: localWebPort, version: webVersion },
      graph: { port: localGraphPort, version: graphVersion },
      remote: { host: remoteHost },
      worker: { mode: workerMode, version: workerVersion }
    },
    dev
  } = cxt;
  const localWorkspace = cxt.paths.inner.workspace;

  const linkWeb = DevConfig.get("web.link", cxt);
  const linkGraph = DevConfig.get("graph.link", cxt);
  const devConfigEnv = `- DEV_CONFIG=${DevConfig.serialize(cxt)}`;

  return `version: '3'

services:
  web:
    image: repoflow/linker-local-handler-web-container:${DevConfig.get(
      "web.version",
      cxt
    ) || webVersion}
    environment:
      - NODE_ENV=${DevConfig.get("web.mode", cxt) || mode}
      - ENV_MODE=${DevConfig.get("web.mode", cxt) || mode}
      - LOCAL_HANDLER_WEB_PORT=${localWebPort}
      - LOCAL_HANDLER_GRAPH_PORT=${localGraphPort}
      - LOCAL_WORKSPACE=${localWorkspace}
      ${linkWeb ? devConfigEnv : ""}
    volumes:
      - ${workspace}:${localWorkspace}
      ${linkWeb ? `- ${DevConfig.get("web.folder", cxt)}/modules:/env` : ""}

    ${
      linkWeb
        ? 'command: "node_modules/nodemon/bin/nodemon ./dist/index.js"'
        : ""
    }
    networks:
      - ${networkid}

  graph:
    image: repoflow/linker-local-handler-graph-container:${DevConfig.get(
      "graph.version",
      cxt
    ) || graphVersion}
    environment:
      - LOCALHOST=${localhost}
      - NODE_ENV=${DevConfig.get("graph.mode", cxt) || mode}
      - ENV_MODE=${DevConfig.get("graph.mode", cxt) || mode}
      - LOCAL_HANDLER_WEB_PORT=${localWebPort}
      - LOCAL_HANDLER_GRAPH_PORT=${localGraphPort}
      - LOCAL_WORKSPACE=${localWorkspace}
      - LOCAL_NETWORK=${networkid}
      - LOCAL_WORKER_VERSION=${workerVersion}
      - BOOTSTRAP_WORKSPACE=${cxt.workspace}
      - BOOTSTRAP_GRAPH_URL=http://${localhost}:${localBootstrapPort}/graphql
      - REMOTE_GRAPH_URL=https://${remoteHost}/backend/graphql
      ${linkGraph ? devConfigEnv : ""}
    volumes:
      - ${workspace}:${localWorkspace}
      ${linkGraph ? `- ${DevConfig.get("graph.folder", cxt)}/modules:/env` : ""}
    ${
      linkGraph
        ? 'command: "node_modules/nodemon/bin/nodemon ./dist/index.js"'
        : ""
    }
    sysctls:
      net.ipv4.ip_unprivileged_port_start: 0
    networks:
      ${networkid}:
        aliases:
         - kubernetes.default

networks:
  ${networkid}:
    external: true

`;
};
