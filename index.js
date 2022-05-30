const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();


// Middleware

app.use(cors());
app.use(express.json());


// APIs



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qnrec.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const toolsCollection = client.db('tool-supplier').collection('user-info');
        const reviewsCollection = client.db('vehicles').collection('types');
        const usersCollection = client.db('tools-user').collection('product');
        const cartsCollection = client.db('tools-user').collection('cart-product');

        // Getting tools
        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })
        // Getting vehicles
        app.get('/reviews', async (req, res) => {
            const email = req.query;
            console.log(email);
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        // Getting vehicles
        app.get('/users', async (req, res) => {
            const email = req.query;
            console.log(email);
            const query = {};
            const cursor = usersCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        })

        
        // Update bike users
        app.put('/tools/:id', async(req, res)=>{
            const id = req.params.id;
            const updatedTool = req.body;
            const filter = {_id:ObjectId(id)};
            const options = {upsert: true};
            const updatedDoc = {
                $set:{quantity: updatedTool.quantity}
            };
            const result =await toolsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
        
        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const tool = await toolsCollection.findOne(query);
            res.send(tool);

        })
        
        app.delete('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const tool = await toolsCollection.deleteOne(query);
            res.send(tool);
        })

        // Post Tools
        app.post('/tools', async(req, res)=>{
            const newTool = req.body;
            const result = await toolsCollection.insertOne(newTool);
            res.send(result);
        })

        // Post Users
        app.post('/users', async(req, res)=>{
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        })
        
        // Post User's product
        app.post('/products', async(req, res)=>{
            const newUserProduct = req.body;
            const result = await cartsCollection.insertOne(newUserProduct);
            res.send(result);
        })

// Post Reviews
        app.post('/reviews', async(req, res)=>{
            const newReview = req.body;
            const result = await reviewsCollection.insertOne(newReview);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send("Root folder is working");
})

app.listen(port, () => {
    console.log('All the services should be here');
})
// Heroku Problem