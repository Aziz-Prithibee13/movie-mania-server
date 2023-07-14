const mongoose = require('mongoose');

const schema = mongoose.Schema;


const detailesSchema = new schema(
    {
        
        relase_year : 
        {
            type : String,
            required : true

        },
        release_country :
        {
            type : String,
            required : true
        },
        cost : 
        {
            type : String,
            required : true
        },
        income : 
        {   
            type : String,
            required : true
        }
    }
)

module.exports = mongoose.model('movies' , detailesSchema)