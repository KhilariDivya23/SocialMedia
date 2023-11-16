import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import {fileURLToPath} from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import {verifyToken} from './middleware/auth.js';
import {createPost} from './controllers/posts.js';
import {register} from './controllers/auth.js';
import User from './models/User.js';
import Post from './models/Post.js';
import {users, posts} from './data/index.js';

// CONFIGURATIONS

// taking the URL of the current module (import.meta.url), which might look like "file:///path/to/your/module.js", and using fileURLToPath() to convert it into a file path like "/path/to/your/module.js".
const __filename = fileURLToPath (import.meta.url);
const __dirname = path.dirname (__filename);
dotenv.config ();
const app = express ();
app.use (express.json ());
app.use (helmet ());
app.use (helmet.crossOriginResourcePolicy ({policy: 'cross-origin'}));
app.use (morgan ('common'));
app.use (bodyParser.json ({limit: '30mb', extended: true}));
app.use (bodyParser.urlencoded ({limit: '30mb', extended: true}));
app.use (cors ());
// When request is made to certain files which are in assets, express.static() is inbuilt middleware which going to
// search in provided dirname/public/assets for that file
app.use ('/assets', express.static (path.join (__dirname, 'public/assets')));

// FILE STORAGE

const storage = multer.diskStorage ({
	// When anyone uploads file, it's goona store it at path provided in destination
	destination: function (req, file, callback) {
		callback (null, 'public/assets');
	},
	filename: function (req, file, callback) {
		callback (null, file.originalname);
	}
});

// Here we are telling multer where to store the uploaded files. Using upload we can upload files now whihc will be stored
// in specified storage
const upload = multer ({storage});


// ROUTES WITH FILES
app.post ('/auth/register', upload.single ('picture'), register);
app.post ('/posts', verifyToken, upload.single ('picture'), createPost);


// ROUTES
app.use ('/auth', authRoutes);
app.use ('/users', userRoutes);
app.use ('/posts', postRoutes);

// MONGOOSE SETUP

const PORT = process.env.PORT || 6001;

mongoose
	.connect (process.env.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then (() => {
		app.listen (PORT, () => console.log (`Server running at ${PORT}.`))
		
		// User.insertMany(users);
		// Post.insertMany(posts);
		
	})
	.catch ((error) => console.log (`${error} cannot connect.`));