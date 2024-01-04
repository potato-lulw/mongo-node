const express = require('express');
const {connectToDb, getDb} = require('./db');
const { ObjectId } = require('mongodb');

//~ init app & middlewares

const app = express();
app.use(express.json());
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
    let page = req.query.p || 0;
    let booksPerPage = 3;

    db.collection('books')
        .find()
        .sort({author: 1})
        .skip(page * booksPerPage)
        .limit(booksPerPage)
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

app.post('/books', (req, res) => {

    const body = req.body;
    db.collection('books')
        .insertOne(body)
        .then((result) =>{
            res.status(201).send(result);
        })
        .catch((err) => {
            res.status(500).json({error: 'Could not insert book'});
        })
});

app.delete('/books/:id', (req, res) => {
    const id = req.params.id;

    if(ObjectId.isValid(id)){
        db.collection('books')
        .deleteOne({_id: new ObjectId(id)})
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((err) => {
            res.status(500).json({
                error: "Book was not deleted",
            });
        });
    }else{
        res.status(500).json({error:'Invalid book ID'})
    }


})

app.patch('/books/:id', (req, res) => {
    const id = req.params.id;
    const body = req.body;

    if(ObjectId.isValid(id)){
        db.collection('books')
            .updateOne({_id: new ObjectId(id)}, {$set: body})
            .then(result => {
                res.status(200).json(result);
            })
            .catch(()=>{
                res.status(400).json({error: "Update failed"});
            })
    }else{
        res.status(400).json({error: 'Invalid book ID'});
    }
})