const express = require('express');
const {connectToDb, getDb} = require('./db');
const { ObjectId } = require('mongodb');

//~ init app & middlewares

const app = express();

//~ db connection

let db;
connectToDb((err) => {
    if(!err){
        app.listen(3000, () => {
            console.log('listening on port 3000');
        });

        db = getDb();
    }
    else{
        console.log(err);
    }
})

//~ routes

app.get('/books', (req, res) => {
    // res.json({mssg: "Welcome to the api"});

    let books = [];

    db.collection('books')
        .find()
        .sort({author: 1})
        .forEach(book => books.push(book))
        .then(() => {
            res.status(200).send(books)
        })
        .catch(() => {
            res.status(500).json({err: 'Could not fetch the books'}); 
        })
});


app.get('/books/:id', (req, res) => {

    const id = req.params.id;

    if(ObjectId.isValid(id)){
        db.collection('books')
        .findOne({_id: new ObjectId(id)})
        .then((book) => {
            res.status(200).send(book);
        })
        .catch((err) => {
            res.status(500).json({
                error: "Book was not found, check book ID!",
            });
        })
    }
    else{
        res.status(500).json({error:'Invalid book ID'})
    }
    

});
