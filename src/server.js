const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const bodyParser = require('body-parser');

const { Users } = require('./data');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    userInfo(email: String): User
    getAllUsers: [User!]!
  }
  type Material {
      title: String
      data: String
  }
  type User {
      email: String,
      password: String,
      firstName: String,
      lastName: String,
      city: String,
      state: String,
      subjects: [String!]!
      materials: [Material!]!
  }
  input MaterialMetadata {
      title: String,
      data: String
  }
  input MaterialInput {
      email: String
      material: MaterialMetadata
  }
  input userInput {
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    city: String,
    state: String,
    subjects: [String!]!
  }
  input deleteMaterialInput {
      email: String
      name: String
  }
  type Mutation {
      signUp(user: userInput): Boolean
      signIn(email: String, password: String): Boolean
      addMaterial(material: MaterialInput): Boolean
      deleteMaterial(input: deleteMaterialInput): Boolean
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    getAllUsers: () => {
        return Users.users;
    },
    userInfo: (_, {email}) => {
        const thisUser = Users.users.find((user) => {
            return user.email === email;
        });
        if (thisUser === undefined) {
            return undefined;
        }
        else {
            return thisUser;
        }
    },
    
  },
  Mutation: {
      signUp: (_, user) => {
          if (Users.users.find((thisUser) => {
            return thisUser.email === user.user.email;
          }) === undefined) {
              user.user.materials = [];
              Users.users.push(user.user);
              return true;
          }
          return false;
      },
      signIn: (_, {email, password}) => {
        const thisUser = Users.users.find((user) => {
            return user.email === email && user.password === password;
        });
        if (thisUser === undefined) {
            return false;
        }
        else {
            return true;
        }
    },
    addMaterial: (_, {material}) => {
        const thisUser = Users.users.find((user) => {
            return user.email === material.email;
        });
        if (thisUser) {
            thisUser.materials.push(material.material);
            return true;
        }
        return false;
    },
    deleteMaterial: (_, {input}) => {
        const thisUser = Users.users.find((user) => {
            return user.email === input.email;
        });
        let ind = -1;
        thisUser.materials.forEach((mat, i) => {
            if (mat.title === input.name) {
                ind = i;
            }
        });
        if (ind === -1) {
            return false;
        }
        thisUser.materials.splice(ind, 1);
        return true;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
app.use(bodyParser.json({ limit: "50mb" }))
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
);