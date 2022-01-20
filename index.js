const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require("dotenv").config();
const port = process.env.PORT || 5000

// middleWare
app.use(cors())
// for the access userData body data
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.poyqe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect()
        const database = client.db('mobile_dokan');
        const cartsCollection = database.collection('carts');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');
        const productsCollection = database.collection('products');





        console.log('your mobile_dokan database running')


        // GET API
        //get all the product 
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            // console.log(comments)
            res.json(products);
        })
        // get single product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })
        //get all the reviews 
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const comments = await cursor.toArray();
            // console.log(comments)
            res.json(comments);
        })
        // get all user product
        app.get('/carts', async (req, res) => {
            const cursor = cartsCollection.find({});
            const carts = await cursor.toArray();
            res.json(carts);
        })
        //get current user product list 
        app.get('/userProducts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = await cartsCollection.find(query);
            const products = await cursor.toArray();
            // console.log(query)
            res.json(products);
        })
        // check user admin or not
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ isAdmin: isAdmin })
        })
        // check the current filter phone here or not
        app.get('/status/:type', async (req, res) => {
            const type = req.params.type;
            const cursor = await productsCollection.find({});
            const allProduct = await cursor.toArray();

            let filterModel = [];

            allProduct.map(product => {
                const found = product.status?.find(element => element.toLowerCase() === type.toLowerCase());
                // console.log(found,product.status)
                if(found){
                    filterModel.push(product)
                }
            })
            // console.log(filterModel)
            res.json(filterModel)
        })



        // POST API
        // whenever our customer buy anything it added to the cart
        app.post('/carts', async (req, res) => {
            const cart = req.body;
            const result = await cartsCollection.insertOne(cart);
            res.json(result)
            // res.json({message:'sakilhere'})
        })
        // upload a new product
        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result)
            // res.json({message:'sakilhere'})
        })
        // add new review
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result)
        })

        // 
        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log(user)
            const result = await usersCollection.insertOne(user);
            res.json(result)
        })

        // PUT Api
        // if user exist update user else insertUser// this is only for the firebase work
        app.put('/users', async (req, res) => {
            const user = req.body;
            // console.log(user)
            const filer = { email: user.email };
            const option = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filer, updateDoc, option);
            res.json(result)
        })
        // make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            // console.log('in server',result,req.body)
            res.json(result);

        })
        //  changeAction according to need
        app.put('/carts/action', async (req, res) => {
            const user = req.body;
            // console.log(user)
            const filter = { _id: ObjectId(user.id) };
            const updateDoc = { $set: { action: user.action } };
            const result = await cartsCollection.updateOne(filter, updateDoc);
            res.json(result);
            // res.json({message:'sakilhere'})

        })

    } finally {
        // await client.close()
    }
}

run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('Hello freaking mobile dokan!')
})

app.listen(port, () => {
    console.log(`this freaking app listening http://localhost:${port}`)
})

