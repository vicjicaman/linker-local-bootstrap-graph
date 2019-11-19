import * as HostsModel from "Model/viewer/hosts";

const schema = [
  `
  type LocalHostsQueries {
    get(host: String!): String
  }

  type LocalHostsMutations {
    add(host: String!, ip: String!): Boolean!
    remove(host: String!): Boolean!
  }

`
];

const resolvers = {
  LocalHostsQueries: {
    get: async (viewer, { host }, cxt) => await HostsModel.get(host, cxt)
  },
  LocalHostsMutations: {
    add: async (viewer, args, cxt) => await HostsModel.add(args, cxt)
  }
};

export { schema, resolvers };
