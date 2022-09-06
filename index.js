const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

// Database Connection API


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rp3w7qx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT (req, res, next) {
        const authHeader = req.headers.authorization;
        if(!authHeader){
          return res.status(401).send({message: 'UnAuthorized access'});
        }
        const token = authHeader.split(' ')[1];
        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
          if (err) {
            return res.status(403).send({message: 'Forbidden access'})
          }
          req.decoded = decoded;
          next();
        });
}



async function run(){
  try {

      await client.connect();
      const productCollection = client.db('Dream-motors').collection('products');
      const ordersCollection = client.db('Dream-motors').collection('orders');
      const reviewCollection = client.db('Dream-motors').collection('reviews');
      const usersCollection = client.db('Dream-motors').collection('users');


      // Products API-----------------------------
      app.get('/products', async(req,res)=>{
        const query = {};
        const cursor = productCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      })

      app.post('/products', async(req,res) =>{
        const products = req.body;
        const storeProduct = await productCollection.insertOne(products);
        res.send(storeProduct);
      })

      app.get('/products/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const getProduct = await productCollection.findOne(query);
        res.send(getProduct);
      })

      app.put('/products/:id', async (req,res)=>{
        const id = req.params.id;
          const updatedProductInfo = req.body;
          const filter = {_id: ObjectId(id)};
          const options={upsert: true};
          const updateDoc = {
            $set: updatedProductInfo,
          };
          const result = await productCollection.updateOne(filter, updateDoc, options);
          res.send(result);
      })

      app.delete('/products/:id', async(req,res) =>{
          const id = req.params.id;
          const filter = {_id : ObjectId(id)};
          const result = await productCollection.deleteOne(filter);
          res.send(result);
      })



      // Orders Collection
      app.get('/orders', async(req,res)=>{
        const query = {};
        const cursor = ordersCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      })
      app.post('/orders', async(req,res) =>{
        const orders = req.body;
        const setOrder = await ordersCollection.insertOne(orders);
        res.send(setOrder);
      })

      app.get('/bookingOrders',verifyJWT, async(req,res) => {
        const bookingEmail = req.query.userMail;
        const decodedEmail = req.decoded.email;
        if (bookingEmail === decodedEmail) {
          const query = {email : bookingEmail};
          const result = await ordersCollection.find(query).toArray();
          res.send(result);
        }
        else{
          return res.status(403).send({message: 'forbidden access'})
        }
      })

      // Review Collection


      app.get('/reviews', async(req,res) =>{
        const review ={};
        const result = await reviewCollection.find(review).toArray();
        res.send(result);
      })

      app.post('/reviews', async (req,res) =>{
        const review = req.body;
        const setReview = await reviewCollection.insertOne(review);
        res.send(setReview);
      })

      // Users Collection system
      app.get('/user', verifyJWT, async(req,res) =>{
        const users = await usersCollection.find().toArray();
        res.send(users);
      })

      app.get('/admin/:email', async(req,res)=>{
        const email = req.params.email;
        const user = await usersCollection.findOne({email: email});
        const isAdmin = user.role === 'admin';
        res.send({admin: isAdmin});
      })



      app.put('/user/admin/:email',verifyJWT, async (req,res) =>{
        const email = req.params.email;
        const requester = req.decoded.email;
        const requesterAccount = await usersCollection.findOne({email: requester});
        if (requesterAccount.role === 'admin') {
          const filter = {email : email};
          const options={upsert: true};
          const updateDoc = {
            $set: {role : 'admin'}
          };
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          
          res.send(result);
        }
        else{
          res.status(403).send({message: 'forbidden'});
        }
        
      })
      app.put('/user/:email', async (req,res) =>{
        const email = req.params.email;
        const user = req.body;
        const filter = {email : email};
        const options={upsert: true};
        const updateDoc = {
          $set: user
        };
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        const token = jwt.sign({email : email}, process.env.ACCESS_TOKEN_SECRET)
        res.send({result,token});
      })

    




  } finally {
    
  }
}
run().catch(console.dir);








app.get('/', (req, res) => {
  res.send('Dream Motors Server Running....')
})

app.listen(port, () => {
  console.log(`Dream Motors Garage site open at: ${port}`)
})