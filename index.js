const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// Middelware
app.use(cors());
app.use(express.json());
require("dotenv").config();

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.SECRET_KEY}@cluster0.lh0lzsv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const database = client.db("EspressoEmporium");
    const CoffeeCollection = database.collection("Coffee");
    const userCollection = database.collection("UserCollection");

    app.get("/coffee", async (req, res) => {
      const cursor = CoffeeCollection.find();
      const allCoffee = await cursor.toArray();
      res.send(allCoffee);
    });

    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const movie = await CoffeeCollection.findOne(query);
      res.send(movie);
    });
    app.post("/coffee", async (req, res) => {
      const newCoffee = req.body;
      const result = await CoffeeCollection.insertOne(newCoffee);
      res.send(result);
      console.log(result);
    });

    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id, "Id commes in server");
      const query = { _id: new ObjectId(id) };
      const result = await CoffeeCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const updatedCoffee = req.body;
      console.log(id, updatedCoffee);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updatedCoffee.name,
          chef: updatedCoffee.chef,
          supplier: updatedCoffee.supplier,
          taste: updatedCoffee.taste,
          category: updatedCoffee.category,
          details: updatedCoffee.details,
          photoURL: updatedCoffee.photoURL,
        },
      };
      const result = await CoffeeCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // User Related APIS

    app.post("/user", async (req, res) => {
      const newUser = req.body;
      const result = userCollection.insertOne(newUser);
      res.send(result);
      console.log(newUser);
    });

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find();
      const allUsers = await cursor.toArray();
      res.send(allUsers);
    });

    app.delete("/users/:id", async (req, res) => {
      const newId = req.params.id;
      const query = { _id: new ObjectId(newId) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/users", async (req, res) => {
      const data = req.body;
      const email = data.emailInfo;

      console.log(email, "in Database");
      const filter = { email: email };
      const updateDoc = {
        $set: {
          LastLogInTime: data.userLastSign,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port);
