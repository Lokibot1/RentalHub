const express = require('express')

const router = express.Router()

router.use('/posts', require('./posts'))
router.use('/view-product', require('./view-product'))

// Route Prefix: /api/user
router.use('/dashboard', require('./dashboard'))
router.use('/profile', require('./profile'))
router.use('/my-requests', require('./my-requests'))
router.use('/my-items', require('./my-items'))
router.use('/archives', require('./archives'))


module.exports = router
