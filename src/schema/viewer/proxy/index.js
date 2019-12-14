import * as ProxyModel from "Model/viewer/proxy";

const schema = [
  `
  type LocalProxy {
    id: String!
    proxyid: String!
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
    restart: async (proxy, args, cxt) => await ProxyModel.restart(proxy, cxt),
    reload: async (proxy, args, cxt) => await ProxyModel.reload(proxy, cxt),
    stop: async (proxy, args, cxt) => await ProxyModel.stop(proxy, cxt)
  }
};

export { schema, resolvers };
