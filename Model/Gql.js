const { graphqlHTTP } = require("express-graphql")
const { Mongoose, default: mongoose, Types: { ObjectId } } = require('mongoose');
const graphql = require('graphql');
const { buildSchema } = graphql;
const DataLoader = require('dataloader')

const detailes = require('./Detailes')


const detailsLoader = new DataLoader(async (ids) => {
    const details = await detailes.find({ _id: { $in: ids } });
    return ids.map((id) => details.find((detail) => detail._id.toString() === id.toString()));
});



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
        data: async ({ id }) => {
            if (id) {
              const detail = await detailsLoader.load(id);
              return detail ? [detail] : [];
            }
            return await detailsLoader.loadMany((await detailes.find({})).map((doc) => doc._id.toString()));
          },
        },
    graphiql: false
})

const config = {
    runtime: 'edge',
    regions: ['bom1'],
};


module.exports = { gqlHandler, config };