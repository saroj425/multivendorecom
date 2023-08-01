const mongoose = require("mongoose");


const connectDatabase = ()=>{
    mongoose.connect(process.env.DB_URL,{
        useNewUrlParser : true,
       // useUnifieldTopology :true
    }).then((data)=>{
        console.log(`Mongodb connected with seerver: ${data.connection.host}`)
    })
}

module.exports = connectDatabase;