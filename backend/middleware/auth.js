const jwt = require('jsonwebtoken');
module.exports = (req,res,next) => {
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).end();
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.uid;
    next();
  } catch (e) {
    return res.status(401).json({ error:'invalid token' });
  }
};
