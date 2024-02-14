const express = require("express");
const path = require("path");
const db = require("./config/connection");
const { typeDefs, resolvers } = require("./schemas");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { authMiddleware } = require("./utils/auth");

const app = express();
const PORT = process.env.PORT || 3000;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const newApolloServer = async () => {
  await server.start();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  console.log("test");
  try {
    app.use(
      "/graphql",
      expressMiddleware(server, {
        context: authMiddleware,
      })
    );
  } catch (error) {
    console.log(error);
  }

  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../client/build/index.html"));
    });
  }

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`),
        console.log(`Use GraphQL at http://localhost:${PORT}`);
    });
  });
};

newApolloServer();
