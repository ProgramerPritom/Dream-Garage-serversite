const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

// Database Connection API


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rp3w7qx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try {

      await client.connect();
      const productCollection = client.db('Dream-motors').collection('products');


      // Products API-----------------------------
      app.get('/products', async(req,res)=>{
        const query = {};
        const cursor = productCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      });

      app.get('/products/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const getProduct = await productCollection.findOne(query);
        res.send(getProduct);
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