import * as ViewerSchema from "Schema/viewer";
import * as ViewerModel from "Model/viewer";
const { GraphQLDate, GraphQLDateTime } = require("graphql-iso-date");

const schema = [
  ...ViewerSchema.schema,
  `
  scalar DateTime
  scalar Date

  type Query {
    viewer: Viewer
  }

  type Mutation {
    viewer: ViewerMutations
  }
`
];

const resolvers = {
  ...ViewerSchema.resolvers,
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  Query: {
    viewer: (parent, args, cxt) => ViewerModel.get(cxt)
  },
  Mutation: {
    viewer: (parent, args, cxt) => ViewerModel.get(cxt)
  }
};

export { schema, resolvers };
