const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require("express-graphql")
const graphql = require('graphql');

const { Mongoose, default: mongoose } = require('mongoose');

const { GraphQLObjectType, GraphQLString, GraphQLSchema, buildSchema } = graphql
 



require('dotenv').config();

const app = express();


const port = process.env.PORT || 8000;

app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dbobibq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {



        const moviesCollection = client.db("Movie-Mania").collection("Moies");
        const trailerCollection = client.db("Movie-Mania").collection("trailer");

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


        app.get('/trailer/:id', async(req,res)=>
        {
            const id = req.params.id;

            const query = {movieID : id};

            const cursor = trailerCollection.find(query);
            const item = await cursor.toArray();

            res.send(item)
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

    client.connect((err) => {
        if (err) console.log(err);
        else console.log("Database Connected Successfully");
    });
    console.log("Movie-Mania-server is runnig in port : ", port);
})