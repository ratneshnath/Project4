const express = require ('express');
const app = express();

const route = require('./routes/route.js');
app.use('/',route);
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');

app.use (bodyParser.json());
app.use (bodyParser.urlencoded({extended:true}));
mongoose.connect('mongodb+srv://ratneshnath:RATNESh99@cluster0.x9keh.mongodb.net/Project_4_UrlShortner-DB?retryWrites=true&w=majority',{useNewUrlParser : true,useUnifiedTopology: true})
.then(function(){ return console.log("mongoDB is running on port 3000")})
.catch(function(err){return console.log(err)})

app.listen(process.env.PORT || 3000, function(){
    console.log('express app running on port'+(process.env.PORT || 3000))
});