import * as TunnelModel from "Model/viewer/tunnels";

const schema = [
  `

  input LocalTunnelEndpointInput {
    host: String!
    port: Int!
  }

  input LocalTunnelRemoteSSHInput {
    user: String!
    key: String!
    port: Int!
    host: String!
  }

  input LocalTunnelInput {
    tunnelid: ID!
    source: LocalTunnelEndpointInput!
    cluster: LocalTunnelEndpointInput!
    remote: LocalTunnelRemoteSSHInput!
  }


  type LocalTunnel {
    id: ID!
    tunnelid: ID!
    status: String!
  }

  type LocalTunnelQueries {
    list: [LocalTunnel]!
    tunnel(tunnelid: ID!): LocalTunnel
  }

  type LocalTunnelMutations {
    start(input: LocalTunnelInput!): LocalTunnel!
    tunnel(tunnelid: ID!): LocalTunnelEntityMutations
  }

  type LocalTunnelEntityMutations {
    stop: Boolean!
  }

`
];

const resolvers = {
  LocalTunnel: {},
  LocalTunnelQueries: {
    list: async (viewer, args, cxt) => await TunnelModel.list(args, cxt),
    tunnel: async (viewer, { tunnelid }, cxt) =>
      await TunnelModel.get(tunnelid, cxt)
  },
  LocalTunnelMutations: {
    start: async (tunnel, { input }, cxt) =>
      await TunnelModel.start(input, cxt),
    tunnel: async (viewer, { tunnelid }, cxt) =>
      await TunnelModel.get(tunnelid, cxt)
  },
  LocalTunnelEntityMutations: {
    stop: async (tunnel, args, cxt) => await TunnelModel.stop(tunnel, cxt)
  }
};

export { schema, resolvers };
