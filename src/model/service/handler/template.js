export const compose = ({ network: { networkid, localhost } }, cxt) => {
  const {
    workspace,
    mode,
    services: {
      bootstrap: { port: localBootstrapPort },
      web: { port: localWebPort, version: webVersion },
      graph: { port: localGraphPort, version: graphVersion },
      remote: { host: remoteHost },
      worker: { version: workerVersion }
    },
    dev
  } = cxt;
  const localWorkspace = cxt.paths.inner.workspace;

  return `version: '3'

services:
  web:
    image: repoflow/linker-local-handler-web-container:${webVersion}
    environment:
      - NODE_ENV=${mode}
      - ENV_MODE=${mode}
      - LOCAL_HANDLER_WEB_PORT=${localWebPort}
      - LOCAL_HANDLER_GRAPH_PORT=${localGraphPort}
      - LOCAL_WORKSPACE=${localWorkspace}
    volumes:
      - ${workspace}:${localWorkspace}
      ${mode === "development" && dev ? `- ${dev.folder}/modules:/env` : ""}

    ${
      mode === "development"
        ? 'command: "node_modules/nodemon/bin/nodemon ./dist/index.js"'
        : ""
    }
    networks:
      - ${networkid}

  graph:
    image: repoflow/linker-local-handler-graph-container:${graphVersion}
    environment:
      - LOCALHOST=${localhost}
      - NODE_ENV=${mode}
      - ENV_MODE=${mode}
      - LOCAL_HANDLER_WEB_PORT=${localWebPort}
      - LOCAL_HANDLER_GRAPH_PORT=${localGraphPort}
      - LOCAL_WORKSPACE=${localWorkspace}
      - LOCAL_NETWORK=${networkid}
      - LOCAL_WORKER_VERSION=${workerVersion}
      - BOOTSTRAP_WORKSPACE=${cxt.workspace}
      - BOOTSTRAP_GRAPH_URL=http://${localhost}:${localBootstrapPort}/graphql
      - REMOTE_GRAPH_URL=https://${remoteHost}/backend/graphql
    volumes:
      - ${workspace}:${localWorkspace}
      ${mode === "development" && dev ? `- ${dev.folder}/modules:/env` : ""}
    ${
      mode === "development"
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

/*
- LOCAL_HANDLER_GRAPH_EXTERNAL_URL=http://${localGraphHost}:${localGraphPort}/graphql
- LOCAL_HANDLER_GRAPH_INTERNAL_URL=http://graph:${localGraphPort}/graphql
*/
