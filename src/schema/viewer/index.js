
const schema = [
  `
  type Viewer {
    id: ID
    username: String

  }

  type ViewerMutations {
    id: ID
  }

`
];

const resolvers = {
  Viewer: {

  },
  ViewerMutations: {

  }
};

export { schema, resolvers };
