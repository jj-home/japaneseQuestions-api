//.env for storing things that should be secret, like API keys
require("dotenv").config();

//basic 3 needed in every project
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");


//mongoose for database stuff
const mongoose = require("mongoose");
const req = require("express/lib/request");

const app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));

//change this connection string for particular database
//mongoose.connect(process.env.CONNECT_URI);
mongoose.connect(process.env.CONNECT_URI, {user: process.env.USER, pass: process.env.PASSWORD},function(err){
    if(err){
        console.log("database connection error" + err);
    }
});

const questionSchema = new mongoose.Schema({
    eng: String,
    jpn: String,
    level: Number
});

const Question = module.exports = mongoose.model("Question",questionSchema);


//////////////////////All Questions //////////////////////////////
app.route("/questions")

.get(function(req,res){

    if(verifyUser(req.body.api_key)){
        Question.find({},function(err,result){
            if(err){
                res.send(err);
            }else{
                res.send(result);
            }
        });
    }else{
        res.send("Not authorized");
    }


})

.post(function(req,res){

    if(verifyUser(req.body.api_key)){
        const newQuestion = new Question({
            eng: req.body.eng,
            jpn: req.body.jpn
        });
        newQuestion.save(function(err){
            if(err){
                res.send(err);
            }else{
                res.send("Successfully added a new question.");
            }
        });
    }else{
        res.send("Not authorized");
    }

});



//////////////////////One Random Question //////////////////////////////

//for now, open this one up to the world without authenticaiton

app.get("/questions/random",function(req,res){
        Question.find({},function(err,results){
            if(err){
                res.send(err);
            }else if(results.length <= 0){
                res.send("There are no quesitons in the collection");
            }else{
                const randIndex = Math.floor(Math.random()*results.length);
                //res.send(results[randIndex]);
                res.send("<h1 style='text-align:center;width:70%;margin:8% auto auto auto;'>" + results[randIndex].jpn + "</h1><hr>");

            }
        });
    
});

app.get("/questions/randomDual",function(req,res){
    Question.find({},function(err,results){
        if(err){
            res.send(err);
        }else if(results.length <= 0){
            res.send("There are no quesitons in the collection");
        }else{
            const randIndex = Math.floor(Math.random()*results.length);
            //res.send(results[randIndex]);
            const message = "<h1 style='text-align:center;width:70%;margin:8% auto auto auto;'>" + results[randIndex].jpn + "</h1><hr>" +
                            "<h1 style='text-align:center;width:70%;margin:0 auto auto auto;'>" + results[randIndex].eng + "</h1>";
            res.send(message);

        }
    });

});



//////////////////////Quesiton by ID //////////////////////////////

/*
there isn't really a good way of getting one record since we only have the whole quesiton
*/
app.route("/questions/:id")

.get(function(req,res){
    if(verifyUser(req.body.api_key)){
        Question.find({_id: req.params.id},function(err,result){
            if(err || result.length <= 0){
                res.send("No question with that id or the id was not in the correct format");
            }else{
                res.send(result);
            }
        })
    }else{
        res.send("Not authorized");
    }
})

.put(function(req,res){
    Question.replaceOne(
        {_id: req.params.id},
        {eng: req.body.eng, jpn: req.body.jpn},
        function(err,results){
            if(err){
                res.send(err);
            }else
                res.send("Quesiton updated");
        }
    );
})

.patch(function(req,res){
    Question.updateOne(
        {_id: req.params.id},
        {$set: req.body},
        function(err,results){
            if(err){
                res.send(err);
            }else
                res.send("Quesiton updated");
        }
    );
})

.delete(function(req,res){
    Question.deleteOne({_id: req.params.id},function(err,results){
        if(err){
            res.send(err);
        }else if(results.deletedCount <= 0){
            res.send("No questions with that id");
        }else{
            res.send("Deleted question");
        }
    })
});

//TODO - add fields for level, add routes to get by level

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function(){
    console.log("server started");
});

function verifyUser(api_key){
    return api_key === process.env.API_KEY;
}