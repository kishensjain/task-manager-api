import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js'; // Import the database connection

// Load environment variables
dotenv.config();

//Initialize express
const app = express();
const port = process.env.PORT || 5000;

//Enable Middleware
app.use(cors());
app.use(express.json());

//Test route
app.get('/', (req, res) => {
    res.send('ToDo List API is running!');
});

//Create a new task
app.post('/tasks', (req, res) => {
  const { title} = req.body;
  if(!title) {
    res.status(400).send('Title is required!');
    return;
  }
  const sql = 'INSERT INTO tasks (title) VALUES (?)';
  db.query(sql, [title], (err, result) => {
    if(err) {
      console.error(err);
      res.status(500).send('Failed to create task!');
      return;
    }
    res.status(201).json({ message : 'Task created successfully!', id:result.insertId});
  });
});

//Read all tasks
app.get('/tasks', (req, res) => {
  const sql = 'SELECT * FROM tasks';
  db.query(sql, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).send('Failed to fetch tasks!');
      return;
    }
    const tasks = result.map(task => ({
      id: task.id,
      title: task.title,
      completed: Boolean(task.completed)  // Converts 1 → true, 0 → false
  }));

  res.json(tasks)
  });
});
//Update a task
app.put('/tasks/:id', (req, res) => {
  const {id} = req.params;
  const { completed } = req.body;
  const sql = 'UPDATE tasks SET completed = ? WHERE id = ?'; 
  db.query(sql, [completed,id], (err,result)=>{
    if (err) return res.status(500).json({error: err.message});
    if(res.affectedRows === 0) return res.status(404).json({message: 'Task not found'});
    res.json({message:'Task updated successfully!'});
  });
});

//Delete a task
app.delete('/tasks/:id', (req, res) => {
  const {id} = req.params;
  const sql = 'DELETE FROM tasks WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if(err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete task!'});
      return;
    }
    if(result.affectedRows === 0) {
      res.status(404).send('Task not found!');
      return;
    }
    res.json({ message: 'Task deleted successfully!'});
  });
});

//Start the server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});