const { graphqlHTTP } = require("express-graphql")
const { Mongoose, default: mongoose, Types: { ObjectId } } = require('mongoose');
const graphql = require('graphql');
const { buildSchema } = graphql;
const DataLoader = require('dataloader')

const detailes = require('./Detailes')





const schema = buildSchema(
    `

  type detailes
  {
      relase_year : String!
      release_country : String!
      cost : String!
      income : String!
  }


  type RootQuery 
  {
      data : [detailes!]!
  }

  schema 
  {
      query: RootQuery
  }
  
  `
)


const gqlHandler = graphqlHTTP({
    schema: schema,
    rootValue: {
        data: async () => {
            const newDetails = await detailes.find({}) ;
            return newDetails
        }
    },
    graphiql: false,
    
})

const config = {
    runtime: 'edge',
  };


module.exports = { gqlHandler, config };