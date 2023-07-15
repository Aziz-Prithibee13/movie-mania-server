const express = require('express');
const cors = require('cors');
const teachableMachine = require("@sashido/teachablemachine-node");

const { Mongoose, default: mongoose, Types: { ObjectId } } = require('mongoose');

const { gqlHandler } = require('./Model/Gql')



require('dotenv').config();

const app = express();


const port = process.env.PORT || 8000;

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dbobibq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const model = new teachableMachine({
            modelUrl: "https://teachablemachine.withgoogle.com/models/V2vfM0Dv-/",
        });


        const moviesCollection = client.db("Movie-Mania").collection("movies");
        const trailerCollection = client.db("Movie-Mania").collection("trailer");
        const reviewCollection = client.db("Movie-Mania").collection("reviews");
        const reactsCollection = client.db("Movie-Mania").collection("reacts");


        app.use('/graphql', gqlHandler)

        app.get("/movies", async (req, res) => {
            const query = {};
            const cursor = moviesCollection.find(query);


            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            let items;

            if (page || size) {

                items = await cursor.skip(page * size).limit(size).toArray();
            }

            else {
                items = await cursor.toArray();
            }
            res.send(items);
        })


        app.get('/itemsCount', async (req, res) => {
            const query = {};
            const cursor = moviesCollection.find(query);

            const count = await moviesCollection.estimatedDocumentCount();
            res.send({ count })
        })


        app.get('/trailer/:id', async (req, res) => {
            const id = req.params.id;

            const query = { movieID: id };

            const cursor = trailerCollection.find(query);
            const item = await cursor.toArray();

            res.send(item)
        })

        app.post("/classification", async (req, res) => {
            const url = req.body.url;

            console.log(url);

            return await model
                .classify({
                    imageUrl: url,
                })
                .then((predictions) => {
                    console.log(predictions);
                    return res.send(predictions);
                })
                .catch((e) => {
                    console.error(e);
                    res.status(500).send("Something went wrong!");
                });
        });


        app.post("/review", async (req, res) => {

            const reviewDetailes = req.body;

            const result = await reviewCollection.insertOne(reviewDetailes)

            res.send(result);


        })

        app.get("/review", async (req, res) => {
            const email = req.query.email

            let items;
      
      
            if (email) {
              const query = { email: email };
      
              const cursor = reviewCollection.find(query);
      
              items = await cursor.toArray();
            }
            else {
              const query = {};
      
              const cursor = reviewCollection.find(query);
      
              items = await cursor.toArray();
            }
      
      
      
      
            console.log(items);
            res.send(items);
        })

    } finally {
        /* await client.close(); */
    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("movie-mania-server is running")
})

app.listen(port, () => {
    mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dbobibq.mongodb.net/Movie-Mania?retryWrites=true&w=majority`).catch((err) => {
        console.log(err);
    })
    client.connect((err) => {
        if (err) console.log(err);
        else console.log("Database Connected Successfully");
    });
    console.log("Movie-Mania-server is runnig in port : ", port);
})