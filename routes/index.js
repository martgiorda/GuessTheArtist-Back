var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.vue', { 
    title: 'Guess The Artist',
    image: "/images/miley.jpg",
    choices : [
      "Lady Gaga",
      "Madonna",
      "Miley Cyrus"
    ]
  }, );
});
module.exports = router;
