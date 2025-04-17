import express from 'express';
import session from 'express-session';
import authRoutes      from './routes/authRoutes.mjs';
import challengeRoutes from './routes/challengeRoutes.mjs';
import userRoutes      from './routes/userRoutes.mjs';
import { SESSION_SECRET } from '../config/env.mjs';
import { getDashboard }   from './controllers/challengeController.mjs';
import translatorRoutes from './routes/translatorRoutes.mjs';
import errorHandler    from './middleware/errorHandler.mjs';

const app = express();

// EJS + static
app.set('view engine', 'ejs');
app.use(express.static('public'));

// body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// session
app.set('trust proxy', 1);
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true on HTTPS
}));

// make session available in all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// mount routes
app.use(authRoutes);
app.use('/challenges', challengeRoutes);
app.use(userRoutes);         
app.use(translatorRoutes);
app.get('/dashboard', getDashboard);
app.get('/', (_,res)=>res.redirect('/dashboard'));

// error handler
app.use(errorHandler);

export default app;