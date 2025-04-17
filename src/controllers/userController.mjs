import bcrypt from 'bcrypt';
import {
  findUserById,
  updateUserInfo,
  updateUserPassword
} from '../models/userModel.mjs';

export async function getUpdate(req, res, next) {
  try {
    const u = await findUserById(req.session.userId);
    res.render('update', { message: null, info: [u.username, u.firstName, u.lastName] });
  } catch (e) { next(e); }
}

export async function postUpdate(req, res, next) {
  try {
    const { fname, lname, username } = req.body;
    const u = await findUserById(req.session.userId);
    const newUser = username || u.username;
    const newF    = fname    || u.firstName;
    const newL    = lname    || u.lastName;
    await updateUserInfo(req.session.userId, newUser, newF, newL);
    res.render('update', {
      message: 'User Updated!',
      info: [newUser, newF, newL]
    });
  } catch (e) { next(e); }
}

export async function postUpdatePassword(req, res, next) {
  try {
    const { password, newpassword, repassword } = req.body;
    if (newpassword !== repassword) {
      return res.render('update', { message: 'Passwords do not match', info: req.body.info });
    }
    const u = await findUserById(req.session.userId);
    if (!(await bcrypt.compare(password, u.password))) {
      return res.render('update', { message: 'Incorrect current password', info: req.body.info });
    }
    const hash = await bcrypt.hash(newpassword, await bcrypt.genSalt(10));
    await updateUserPassword(req.session.userId, hash);
    res.render('update', { message: 'Password Updated!', info: req.body.info });
  } catch (e) { next(e); }
}