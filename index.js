const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
// app.use(cors());
const corsConfig = {
    origin: ["http://localhost:5173", "http://localhost:5000/foods"],
    credentials: true,
  };
  app.use(cors(corsConfig));
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
        await client.connect();

        const foodCollection = client.db('restaurantManager').collection('foods');
        const newFoodCollection = client.db('restaurantManager').collection('addedFoods');
        const purchaseCollection = client.db('restaurantManager').collection('purchase');

        app.get('/foods', async (req, res) => {
            const cursor = foodCollection.find({ purchaseCount: { $exists: true } });
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/foods/:id', async (req, res) => {
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

        app.post('/purchase', async (req, res) => {
            const purchase = req.body;
            console.log(purchase);
            const result = await purchaseCollection.insertOne(purchase);
            res.send(result);
        })

        app.get('/purchase', async (req, res) => {
            const cursor = purchaseCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/purchase/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const result = await purchaseCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await purchaseCollection.findOne(query);
            res.send(result);
        })

        app.delete('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await purchaseCollection.deleteOne(query);
            res.send(result);
        })

        app.put('/foods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const updatedFood = req.body;
            const count = updatedFood.purchaseCount;
        
            const updateDoc = {
                $inc: { count: 1 }, 
                $set: {
                    food: updatedFood.food,
                    category: updatedFood.category,
                    quantity: updatedFood.quantity,
                    price: updatedFood.price,
                    country: updatedFood.country,
                    description: updatedFood.description,
                    photo: updatedFood.photo,
                    purchaseCount: count
                }
            };
        
            try {
                const result = await foodCollection.updateOne(query, updateDoc);
                console.log(result);
                res.send(result);
            } catch (error) {
                console.error('Error updating food:', error);
                res.status(500).send({ message: 'Failed to update food' });
            }
        });
        

        app.get('/addedFoods', async (req, res) => {
            const cursor = newFoodCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/addedFoods/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await newFoodCollection.findOne(query);
            res.send(result);
        })

        app.post('/addedFoods', async (req, res) => {
            const newFood = req.body;
            console.log(newFood);
            const result = await newFoodCollection.insertOne(newFood);
            res.send(result);
        })

        app.get('/foods', async (req, res) => {
            const search = req.query.search;
            let query = {};
        
            if (search) {
                query.name = { $regex: new RegExp(search, 'i') }; 
            }
        
            try {
                const result = await foodCollection.find(query).toArray();
                console.log(query);
                console.log(result);
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: 'Internal Server Error' });
            }
        });

        // app.get('/foods', async (req, res) => {
        //     const searchQuery = req.query.search || '';
        //     try {
        //         const foods = await foodCollection.find({ food: { $regex: searchQuery, $options: 'i' } });
        //         res.json(foods);
        //     } catch (error) {
        //         res.status(500).json({ error: 'Internal Server Error' });
        //     }
        // });

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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