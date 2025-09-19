require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const contactsRouter = require('./routes/contacts');
const uploadRouter = require('./routes/upload');
const authRouter = require('./routes/auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/upload', uploadRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('Backend running on', PORT));
