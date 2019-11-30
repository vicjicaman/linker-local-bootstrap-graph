import * as ProxySchema from "Schema/viewer/proxy";
import * as TunnelSchema from "Schema/viewer/tunnel";
import * as HostsSchema from "Schema/viewer/hosts";
import * as ProxyModel from "Model/viewer/proxy";
import * as WorkersSchema from "Schema/viewer/workers";

const schema = [
  ...TunnelSchema.schema,
  ...HostsSchema.schema,
  ...ProxySchema.schema,
  ...WorkersSchema.schema,
  `
  type Viewer {
    id: ID
    username: String
    proxy: LocalProxy,
    hosts: LocalHostsQueries
    workers: LocalWorkerQueries
    tunnels: LocalTunnelQueries
  }

  type ViewerMutations {
    id: ID
    proxy: LocalProxyMutations
    hosts: LocalHostsMutations
    workers: LocalWorkerMutations
    tunnels: LocalTunnelMutations
  }

`
];

const resolvers = {
  ...TunnelSchema.resolvers,
  ...HostsSchema.resolvers,
  ...ProxySchema.resolvers,
  ...WorkersSchema.resolvers,
  Viewer: {
    tunnels: viewer => viewer,
    hosts: viewer => viewer,
    proxy: async (viewer, args, cxt) => await ProxyModel.get(cxt),
    workers: viewer => viewer
  },
  ViewerMutations: {
    tunnels: viewer => viewer,
    hosts: viewer => viewer,
    proxy: viewer => viewer,
    workers: viewer => viewer
  }
};

export { schema, resolvers };
