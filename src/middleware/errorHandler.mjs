export default function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).send('Something went wrong. Please try again later.');
}
