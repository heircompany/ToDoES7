require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');
var { authenticate } = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

// CREATE TO DO
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

// ALL TO DO'S
app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({ todos });
  }, (e) => {
    res.status(400).send(e);
  });
});

// READ TO DO
app.get('/todos/:id', authenticate, (req, res) => {
  // check ID validity
       // 404 if not
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  // find ID
  // success
       // if todo - send it back
       // if no todo - send back 404 with empty body
  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({ todo });
    // error
       // 400 - send empty body back
  }).catch((e) => {
    res.status(400).send();
  });
});

// DELETE TO DO
app.delete('/todos/:id', authenticate, async (req, res) => {
     // check ID validity
          // 404 if not
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  // find ID
  // success
       // if todo - send it back with 200
       // if no todo - send back 404 with empty body
  try {
    const todo = await Todo.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    });
    if (!todo) {
      return res.status(404).send();
    }

    res.send({ todo });
  } catch (e) {
    // error
        // 400 - send empty body back
    res.status(400).send();
  }
});

// UPDATE TO DO
app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  // pick values user can edit
  var body = _.pick(req.body, [ 'text', 'completed' ]);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  //check if values are Boolean and get Date/Time stamps
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    // set completed to false
    body.completed = false;
    //set completed at to blank value
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({ _id: id, _creator: req.user._id }, { $set: body }, { new: true }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({ todo });
  }).catch((e) => {
    res.status(400).send();
  })
});

// CREATE NEW USER
app.post('/users', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);
    await user.save();
     //instance method on user - user.generateAuthToken
    const token = await user.generateAuthToken();
    //custom header for JWT schema
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// READ CURRENT USER
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// USER LOGIN
app.post('/users/login', async (req, res) => {
  try {
    const body = _.pick(req.body, [ 'email', 'password' ]);
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send();
  }
});

// DELETE USER TOKEN BEFORE LOGOUT
app.delete('/users/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

// START SERVER
app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = { app };
