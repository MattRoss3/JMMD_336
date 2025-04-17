import bcrypt from 'bcrypt';
import {
  findUserByUsername,
  createUser
} from '../models/userModel.mjs';

export function getLogin(req, res) {
  res.render('login', { message: null });
}

export async function postLogin(req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await findUserByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('login', { message: 'Invalid credentials' });
    }
    req.session.authenticated = true;
    req.session.userId        = user.userId;
    req.session.firstName     = user.firstName;
    res.redirect('/dashboard');
  } catch (e) {
    next(e);
  }
}

export function getSignup(req, res) {
  res.render('signup', { message: null });
}

export async function postSignup(req, res, next) {
  try {
    const { username, fname, lname, password, repassword } = req.body;
    if ([username,fname,lname,password,repassword].includes('')) {
      return res.render('signup', { message: 'Please fill in all fields!' });
    }
    if (password !== repassword) {
      return res.render('signup', { message: 'Passwords do not match!' });
    }
    if (await findUserByUsername(username)) {
      return res.render('signup', { message: 'Username taken!' });
    }
    const hash = await bcrypt.hash(password, await bcrypt.genSalt(10));
    await createUser({ firstName: fname, lastName: lname, username, passwordHash: hash });
    res.render('signup', { message: 'User added! Please log in.' });
  } catch (e) {
    next(e);
  }
}

// logout
export function logout(req, res) {
  req.session.destroy(() => res.redirect('/login'));
}