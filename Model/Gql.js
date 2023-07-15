const { graphqlHTTP } = require("express-graphql")
const { Mongoose, default: mongoose, Types: { ObjectId } } = require('mongoose');
const graphql = require('graphql');
const { buildSchema } = graphql;
const DataLoader = require('dataloader')

const detailes = require('./Detailes')


const detailsLoader = new DataLoader(async (ids) => {
    const objectIds = ids.map(id => new ObjectId(id));
    const details = await detailes.find({ _id: { $in: objectIds } });

    const detailsMap = {};
    details.forEach((detail) => {
        detailsMap[detail._id.toString()] = detail;
    });

    return ids.map((id) => detailsMap[id.toString()]);
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
      data(id: String!) : [detailes!]!
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
            const newDetails = await detailsLoader.load(id);
            return newDetails ? [newDetails] : [];
        }
    },
    graphiql: true
})

const config = {
    runtime: 'edge',
  };


module.exports = { gqlHandler, config };