import * as ProxyModel from "Model/viewer/proxy";

const schema = [
  `
  type LocalProxy {
    status: String!
  }

  type LocalProxyMutations {
    restart: LocalProxy!
    reload: LocalProxy!
  }

`
];

const resolvers = {
  LocalProxy: {},
  LocalProxyMutations: {
    restart: async (viewer, args, cxt) => await ProxyModel.restart(cxt)
  }
};

export { schema, resolvers };
