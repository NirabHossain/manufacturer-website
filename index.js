const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

// Middleware

app.use(cors());
app.use(express.json());


const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) return res.status(403).send({ message: "Forbidden Access" });
        console.log(decoded.foo) // bar
    })
    req.decoded = decoded;
    next();
}

// APIs



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qnrec.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const toolsCollection = client.db('tool-supplier').collection('user-info');
        const reviewsCollection = client.db('vehicles').collection('types');
        const usersCollection = client.db('tools-user').collection('product');
        const cartsCollection = client.db('user-interest').collection('added-product');

        // *************************************        
        // Getting tools
        // *************************************
        app.get('/tools', async (req, res) => {
            const query = {};
            const cursor = toolsCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })

        // Find a tool by its ID
        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolsCollection.findOne(query);
            res.send(tool);

        })

        // Delete a tool
        app.delete('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tool = await toolsCollection.deleteOne(query);
            res.send(tool);
        })

        // Post Tools
        app.post('/tools', async (req, res) => {
            const newTool = req.body;
            
            const query = { name: newTool.name };
            const exists = await toolsCollection.findOne(query);
            if(exists) return res.send({ success: false, newTool: exists });

            const result = await toolsCollection.insertOne(newTool);
            res.send({ success: true, result });
        })

        // Update tool quantity
        app.put('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const updatedTool = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: { quantity: updatedTool.quantity }
            };
            const result = await toolsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })






        // *************************************
        // Orders
        // *************************************

        // Admin: Getting all interested products

        // User: Getting user Interested products with specific email id query
        app.get('/products', async (req, res) => {
            const email = req.query.email;
            let query ={};
            if(email) query = { email: email };
            const cursor = cartsCollection.find(query);
            const cartProducts = await cursor.toArray();
            res.send(cartProducts);
        })

        // Product with id
        app.get('/products', async (req, res) => {
            const email = req.query.email;
            let query ={};
            if(email) query = { email: email };
            const cursor = cartsCollection.find(query);
            const cartProducts = await cursor.toArray();
            res.send(cartProducts);
        })

        // User: Post User's Orders from the purchase
        app.post('/products', async (req, res) => {
            const newUserProduct = req.body;

            const query = { cartId: newUserProduct.cartId, email: newUserProduct.email };
            const exists = await cartsCollection.findOne(query);
            if (exists) return res.send({ success: false, newUserProduct: exists });

            const result = await cartsCollection.insertOne(newUserProduct);
            res.send({ success: true, result });
        })

        // Update Product Status
        app.put('/products/:_id', async (req, res) => {
            const _id = req.params._id;
            const updatedProduct = req.body;
            const filter = {  _id: ObjectId(_id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: updatedProduct,
            };
            const result = await cartsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        // Cancel/Delete Product 
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await cartsCollection.deleteOne(query);
            res.send(product);
        })




  
        // *************************************
        // Users *******************************************
        // *************************************
        // Getting a user profile with particular email
        // Getting all users
 
        app.get('/users', async (req, res) => {
            let query = {};
            const email = req.query.email;
            if(email)query = { email: email };
            const cursor = usersCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        })


        // Post Users
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        })

        // Update User
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const updatedUser = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: updatedUser,
            };
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' })
            res.send({ result, token });
        })






        // *************************************
        // Admin: Updating user admin role
        // *************************************

        // Get all the admins with admin query
        app.get('/admins', async (req, res) => {
            const email=req.query.email;
            let query={};
            if(email)query = { email: email,role: 'admin' };
            const cursor = usersCollection.find(query);
            const admins = await cursor.toArray();
            res.send(admins);
        })



        app.put('/admins/:email', async (req, res) => {
            const email = req.params.email;

            const filter = { email: email };
            const updatedDoc = {
                $set: { role: 'admin' },
            };
            const result = await usersCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })





        // *************************************
        //  Reviews
        // *************************************


        // Post Reviews
        app.post('/reviews', async (req, res) => {
            const newReview = req.body;

            const query = {email: newReview.email };
            const exists = await reviewsCollection.findOne(query);
            if (exists) return res.send({ success: false, newUserProduct: exists });

            const result = await reviewsCollection.insertOne(newReview);
            res.send({ success: true, result });

        })


        // Getting all reviews
        app.get('/reviews', async (req, res) => {
            const email = req.query;
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Root folder is working");
})

app.listen(port, () => {
    console.log('All the services should be here');
})
// Heroku Problem