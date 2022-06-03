const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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
        // get all inventories
        app.get('/inventories', async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
            console.log('inventories responding');
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