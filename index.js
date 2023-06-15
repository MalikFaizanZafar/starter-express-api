const express = require('express');
const app = express();
const mongoose = require('mongoose');

const PORT = 4000;
// Middlewares
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


// Connecting to MongoDB
mongoose.connect('mongodb+srv://malikfaizanzafar1993:wzfnT7rJCcNRDEnt@cluster0.utfa8cz.mongodb.net/?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});



// Defining Todo schema, model
const todoSchema = new mongoose.Schema({ title: String, description: String, status: String }, { timestamps: true });
const Todo = mongoose.model('Todo', todoSchema);

// Adding Todo
app.post("/todos", async(req, res) => {
    try{
        const { body: { title, description, status} } = req;
        const newTodo = new Todo({ title, description, status });
        const savedTodo = await newTodo.save();
        return res.status(200).json({
            id: savedTodo.id,
            title: savedTodo.title, 
            description: savedTodo.description, 
            status: savedTodo.status,
            createdAt: savedTodo.createdAt,
            updatedAt: savedTodo.updatedAt,
        })
    }catch(err){
        res.status(500).json(err);
    }
})


// Getting list of Todos
app.get("/todos",async(req, res) => {
    try{
        const pageOptions = {
            page: parseInt(req.query.page, 10) || 0,
            limit: parseInt(req.query.limit, 10) || 10
        }
        const todos = await Todo.find()
        .skip(pageOptions.page * pageOptions.limit)
        .limit(pageOptions.limit)
        .exec();

        res.status(200).json(todos);
    }catch(err){
        res.status(500).json(err);
    }
})

// Deleting Todo
app.delete("/todos/:id",async(req, res) => {
    try{
        const { id } = req.params
        const todo = await Todo.findByIdAndDelete(id);
        if (!todo) {
            res.status(400).send('Todo was not found');
        }
        res.status(200).send('Todo was deleted.');
    }catch(err){
        res.status(500).json(err);
    }
})


// Updating Todo
app.put("/todos/:id", async(req, res) => {
    try{
        const { id } = req.params;
        const { body: { title, description, status} } = req;
        const todo = await Todo.findOne({_id: id});
        if (!todo) {
            res.status(400).send('Todo was not found');
        }
        await Todo.updateOne({_id: id}, {
            title,
            description,
            status
        }, { upsert: true});
        const updatedTodo = await Todo.findOne({_id: id});
        res.status(200).json(updatedTodo)
    }catch(err){
        res.status(500).json(err);
    }
})
app.listen(process.env.PORT || 3000)