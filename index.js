const express = require('express');
const cors = require('cors');
require('dotenv').config(); // create envirnment file .env in root directory
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER)
// console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vgnfmcl.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const run = async () => {
  try {
    await client.connect();

    // create database & collection [table]
    const coffeeCollection = client.db('coffeeDB').collection('coffee');

    // 1 receive data from client [C - Create POST]
    app.post('/coffee', async (req, res) => {
        // receive data from client
        const newCoffee = req.body;
        console.log(newCoffee)
        // add received data to MongoDB
        const result = await coffeeCollection.insertOne(newCoffee);
        res.send(result); // sent to client
    })

    // 2 show data on server [R - READ] http://localhost:5000/coffee
    app.get('/coffee', async (req, res) => {
        const result = await coffeeCollection.find().toArray()
        res.send(result);
    })

    // find id specific & redirect to update page for make  [U - Update] operation
    app.get('/coffee/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await coffeeCollection.findOne(query);
        res.send(result);
    })

    // [U - Update] mongodb via server
    app.put('/coffee/:id', async (req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const option = {upsert: true} 
        const updatedCoffee = req.body;
        const coffee = {
            $set: {
                name: updatedCoffee.name,
                quantity: updatedCoffee.quantity,
                supplier: updatedCoffee.supplier,
                taste: updatedCoffee.taste,
                category: updatedCoffee.category,
                detail: updatedCoffee.detail,
                photo: updatedCoffee.photo,
            }
        }
        const result = await coffeeCollection.updateOne(filter, coffee, option);
        res.send(result)
    })

    // [D - Delete]
    app.delete('/coffee/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await coffeeCollection.deleteOne(query)
        res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged [Coffee Store Server] successfully connected to MongoDB!");
    
  } finally {
    // await client.close();
  }
} 
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Coffee Store Server is Rinning...')
});

app.listen(port, () => {
    console.log(`Coffee Store Server is Running on Port: ${port}`)
})