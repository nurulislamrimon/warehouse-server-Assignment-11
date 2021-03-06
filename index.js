const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
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

        const verifyJWT = (req, res, next) => {
            const token = req.headers?.token;
            if (!token) {
                return res.status(401).send({ message: 'Unauthorized access' })
            }
            jwt.verify(token, process.env.secret, function (err, decoded) {
                if (err) {
                    return res.status(403).send({ message: 'Forbidden' })
                }
                req.decoded = decoded;
                next();
            })
        }


        app.post('/login', (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.secret, { expiresIn: '1d' });
            res.send({ accessToken });
            console.log(user, "token sended");
        })
        // read all banners
        app.get('/banners', async (req, res) => {
            const query = {};
            const cursor = bannerCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
            console.log('banners responding');
        })
        // read inventory by query sort & limit
        app.get('/inventory', async (req, res) => {
            const limit = parseInt(req.query.limit);
            const sort = { sold: parseInt(req.query.sort) };
            const query = {};
            const cursor = inventoryCollection.find(query).sort(sort).limit(limit);
            const result = await cursor.toArray();
            res.send(result)
            console.log('inventory responding');
        })
        // page count
        app.get('/pagecount', async (req, res) => {
            const count = await inventoryCollection.estimatedDocumentCount();
            res.send({ count })
        })
        // read inventory by query sort & limit
        app.get('/allinventory', async (req, res) => {
            const limit = parseInt(req.query.limit);
            const page = parseInt(req.query.page);
            const skip = page * limit;
            const query = {};
            const cursor = inventoryCollection.find(query).skip(skip).limit(limit);
            const result = await cursor.toArray();
            res.send(result)
            console.log(skip, limit, 'All responding');
        })
        // read myitems by query email
        app.get('/myitems', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query?.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = inventoryCollection.find(query)
                const result = await cursor.toArray();
                res.send(result);
                console.log(result, ' items responding');
            } else {
                return res.status(403).send({ message: 'Access forbidden' })
            }
        })
        // read selected inventory
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await inventoryCollection.findOne(query);
            res.send(result);
            console.log(id, 'id selected');
        })
        // add inventory
        app.post('/add', async (req, res) => {
            const newProduct = req.body;
            const result = await inventoryCollection.insertOne(newProduct)
            res.send(result)
            console.log(newProduct, 'is added');
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
            console.log(id, "is updated");
        })
        // delete inventory
        app.delete('/manage/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
            console.log(id, 'is deleted');
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