const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/hello', function(req, res, next) {
  res.json( { message: 'Expr1s111sssess' });
});

module.exports = router;
