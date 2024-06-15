const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const url = 'mongodb+srv://sahildhande987:1111111111@cluster0.skfj2pc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'money_tracker';

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine to EJS
app.set('view engine', 'ejs');



// Connect to MongoDB
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    const expensesCollection = db.collection('expenses');

    // Route to render index.ejs
    app.get('/', (req, res) => {
      res.render('index');
    });

    // Route to handle form submission
    app.post('/add', (req, res) => {
      const expense = {
        category: req.body.category_select,
        amount: req.body.amount_input,
        date: req.body.date_input,
        other_reason: req.body.other_reason || null
      };
      
      expensesCollection.insertOne(expense)
        .then(result => {
          console.log('Expense added:', result);
          res.status(200).json({ message: 'Expense added successfully' });
        })
        .catch(error => {
          console.error('Error adding expense:', error);
          res.status(500).json({ message: 'Error adding expense' });
        });
    });

    // Route to view all expenses
    app.get('/expenses', (req, res) => {
      expensesCollection.find().toArray()
        .then(results => {
          res.render('expenses', { expenses: results });
        })
        .catch(error => console.error('Error fetching expenses:', error));
    });

    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  })
  .catch(error => console.error('Failed to connect to MongoDB:', error));
