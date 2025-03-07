const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('partials/forbidden', {
    layout: 'layouts/forbidden',
    title: 'Forbidden',
  });
});

module.exports = router;