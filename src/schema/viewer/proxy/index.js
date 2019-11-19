import * as ProxyModel from "Model/viewer/proxy";

const schema = [
  `
  type LocalProxy {
    status: String!
  }

  type LocalProxyMutations {
    restart: LocalProxy!
    reload: LocalProxy!
    stop: LocalProxy!
  }

`
];

const resolvers = {
  LocalProxy: {},
  LocalProxyMutations: {
    restart: async (viewer, args, cxt) => await ProxyModel.restart(cxt),
    reload: async (viewer, args, cxt) => await ProxyModel.reload(cxt),
    stop: async (viewer, args, cxt) => await ProxyModel.stop(cxt)
  }
};

export { schema, resolvers };
