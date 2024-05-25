const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middlewaare
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hsfxbe1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const foodCollection = client.db('restaurantManager').collection('foods');
        const newFoodCollection = client.db('restaurantManager').collection('addedFoods');

        app.get('/foods', async (req, res) => {
            const cursor = foodCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/foods/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await foodCollection.findOne(query);
            res.send(result);
        })

        app.post('/foods', async (req, res) => {
            const newFood = req.body;
            console.log(newFood);
            const result = await foodCollection.insertOne(newFood);
            res.send(result);
        })

        app.put('/foods/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedFood = req.body;

            const food = {
                $set: {
                    food: updatedFood.food,
                    category: updatedFood.category,
                    quantity: updatedFood.quantity,
                    price: updatedFood.price,
                    country: updatedFood.country,
                    description: updatedFood.description,
                    photo: updatedFood.photo
                }
            }

            const result = await foodCollection.updateOne(filter, food, options);
            res.send(result);
        });

        app.delete('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await foodCollection.deleteOne(query);
            res.send(result);
        })

        // app.get('/foods', async (req, res) => {
        //     console.log(req.query.email);
        //     let query = {};
        //     if (req.query?.email) {
        //         query = { email: req.query.email }
        //     }
        //     const result = await foodCollection.find(query).toArray();
        //     res.send(result);
        // })

        // app.get('/foods', async (req, res) => {
        //     const query = req.query.q;
        //     const results = await foodCollection.find({ food_Name: new RegExp(query, 'i') }).toArray();
        //     res.json(results);
        //   });

        app.get('/addedFoods', async (req, res) => {
            const cursor = newFoodCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/addedFoods/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await newFoodCollection.findOne(query);
            res.send(result);
        })

        app.get('/foods', (req, res) => {
            const query = req.query.q.toLowerCase();
            const results = foodCollection.filter(item =>
              item.foodCollection.toLowerCase().includes(query)
            );
            res.json(results);
          });

          app.post('/addedFoods', async (req, res) => {
            const newFood = req.body;
            console.log(newFood);
            const result = await newFoodCollection.insertOne(newFood);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () => {
    console.log(`Restaurant Management server is running on port ${port}`);
})