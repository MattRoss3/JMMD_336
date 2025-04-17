export default function authenticated(req, res, next) {
  if (!req.session?.authenticated) {
    return res.redirect('/login');
  }
  next();
}
