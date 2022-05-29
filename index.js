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
        // const vehiclesCollection = client.db('vehicles').collection('types');

        // Getting tools
        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })

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

        app.post('/tools', async(req, res)=>{
            const newTool = req.body;
            const result = await toolsCollection.insertOne(newTool);
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