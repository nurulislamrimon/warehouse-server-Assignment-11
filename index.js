const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_mail}:${process.env.DB_pass}@cluster0.2whs9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function run() {
    try {
        client.connect();
        // inventory collection
        const inventoryCollection = client.db('inventoryCollection').collection('inventory');
        // banner collection
        const bannerCollection = client.db('bannerCollection').collection('banner')

        // read all banners
        app.get('/banners', async (req, res) => {
            const query = {};
            const cursor = bannerCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
            console.log('banners responding');
        })
        // read all inventory
        app.get('/inventory', async (req, res) => {
            const limit = parseInt(req.query.limit);
            const sort = { sold: parseInt(req.query.sort) };
            const query = {};
            const cursor = inventoryCollection.find(query).sort(sort).limit(limit);
            const result = await cursor.toArray();
            res.send(result)
            console.log(req.query, 'inventory responding');
        })
        // read the inventory selected for update 
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await inventoryCollection.findOne(query);
            res.send(result);
            console.log(id, 'id selected');
        })
        // update inventory
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const newDatas = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: newDatas.name,
                    picture: newDatas.picture,
                    price: newDatas.price,
                    quantity: newDatas.quantity,
                    description: newDatas.description,
                    supplier: newDatas.supplier,
                    sold: newDatas.sold
                }
            }
            const result = await inventoryCollection.updateOne(query, updateDoc, options);
            res.send(result)
            console.log(newDatas);
        })


    } finally {
        // client.close()
    }
}
run()



app.get('/', (req, res) => {
    res.send('Server is responding')
})
app.listen(port, () => {
    console.log(port, 'is running');
})