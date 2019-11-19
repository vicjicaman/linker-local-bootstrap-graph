import * as ProxySchema from "Schema/viewer/proxy";
import * as HostsSchema from "Schema/viewer/hosts";
import * as ProxyModel from "Model/viewer/proxy";

const schema = [
  ...HostsSchema.schema,
  ...ProxySchema.schema,
  `
  type Viewer {
    id: ID
    username: String
    proxy: LocalProxy,
    hosts: LocalHostsQueries
  }

  type ViewerMutations {
    id: ID
    proxy: LocalProxyMutations
    hosts: LocalHostsMutations
  }

`
];

const resolvers = {
  ...HostsSchema.resolvers,
  ...ProxySchema.resolvers,
  Viewer: {
    hosts: viewer => viewer,
    proxy: async (viewer, args, cxt) => await ProxyModel.get(cxt)
  },
  ViewerMutations: {
    hosts: viewer => viewer,
    proxy: viewer => viewer
  }
};

export { schema, resolvers };
