import express from 'express'
import { checkAuth, checkUser, optionalAuth } from '../../middlewares/auth.js'

const router = express.Router()


/**
 * User Dashboard
 *
 * @route GET /user/dashboard
 */
router.get('/dashboard', checkAuth, checkUser, async (req, res) => {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/user/dashboard/${req.user.id}`)
    const dashboard = await response.json()

    res.render('user/dashboard', {
      layout: 'layouts/user',
      title: 'User Dashboard',
      dashboard: dashboard.data,
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    res.render('user/dashboard', {
      layout: 'layouts/user',
      title: 'User Dashboard',
      dashboard: {},
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    })
  }
})


/**
 * Profile Page
 *
 * @route GET /user/profile
 */
router.get('/profile', checkAuth, checkUser, async (req, res) => {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/user/profile/${req.user.id}`)
    const userProfile = await response.json()

    res.render('user/profile', {
      layout: 'layouts/user',
      title: 'User Profile',
      userProfile: userProfile.data,
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    res.render('user/profile', {
      layout: 'layouts/user',
      title: 'User Profile',
      userProfile: userProfile.data,
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    })
  }
})


/**
 * My Requests Page
 *
 * @route GET /user/my-requests
 */
router.get('/my-requests', checkAuth, checkUser, async (req, res) => {
  try {
    const rentRequestResponse = await fetch(`${process.env.BASE_URL}/api/user/my-requests/requests/${req.user.id}`)
    const rentRequests = await rentRequestResponse.json()

    const ongoingRentResponse = await fetch(`${process.env.BASE_URL}/api/user/my-requests/ongoing/${req.user.id}`)
    const ongoingRentItems = await ongoingRentResponse.json()

    res.render('user/my-requests', {
      layout: 'layouts/user',
      title: 'My Rents',
      rentRequestItems: rentRequests.data,
      ongoingRentItems: ongoingRentItems.data,
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    })
  } catch (error) {
    console.error('Error fetching pending posts:', error)
    res.render('user/my-requests', {
      layout: 'layouts/user',
      title: 'My Rents',
      rentRequestItems: [],
      ongoingRentItems: [],
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    })
  }
})


/**
 * My Items Page
 *
 * @route GET /user/my-items
 */
router.get('/my-items', checkAuth, checkUser, async (req, res) => {
  try {
    const pendingResponse = await fetch(`${process.env.BASE_URL}/api/user/my-items/pending/${req.user.id}`)
    const pendingPosts = await pendingResponse.json()

    const approvedResponse = await fetch(`${process.env.BASE_URL}/api/user/my-items/approved/${req.user.id}`)
    const approvedPosts = await approvedResponse.json()

    const rentalRequestResponse = await fetch(`${process.env.BASE_URL}/api/user/my-items/rental-requests/${req.user.id}`)
    const rentalRequests = await rentalRequestResponse.json()

    const ongoingTransactionResponse = await fetch(`${process.env.BASE_URL}/api/user/my-items/ongoing-transactions/${req.user.id}`)
    const ongoingTransactions = await ongoingTransactionResponse.json()

    res.render('user/my-items', {
      layout: 'layouts/user',
      title: 'My Items',
      pendingPosts: pendingPosts.data,
      approvedPosts: approvedPosts.data,
      rentalRequests: rentalRequests.data,
      ongoingTransactions: ongoingTransactions.data,
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    })
  } catch (error) {
    console.error('Error fetching pending posts:', error)

    res.render('user/my-items', {
      layout: 'layouts/user',
      title: 'My Items',
      pendingPosts: [],
      approvedPosts: [],
      rentalRequests: [],
      ongoingTransactions: [],
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    })
  }
})


/**
 * Archives Page
 *
 * @route GET /user/archives
 */
router.get('/archives', checkAuth, checkUser, async (req, res) => {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/user/archives/${req.user.id}`)
    const archivedItems = await response.json()

    res.render('user/archives', {
      layout: 'layouts/user',
      title: 'Archives',
      archivedItems: archivedItems.data,
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    res.render('user/archives', {
      layout: 'layouts/user',
      title: 'Archives',
      archivedItems: [],
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    })
  }
})


/**
 * TODO: Find this page and organize it
 * User Listings
 *
 * @route GET /user/listing
 */
router.get('/listing', checkAuth, (req, res) => {
  res.render('user/listing', {
    layout: 'layouts/user',
    title: 'Add New Listing',
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  })
})


/**
 * TODO: Find this page and organize it
 * View Product Page
 *
 * @route GET /user/view-product
 */
router.get('/view-product', optionalAuth, (req, res) => {
  // Set the user_id
  let renter_id = ''
  if (req.user !== undefined) {
    renter_id = req.user.id
  }

  res.render('user/view-product', {
    layout: 'layouts/user',
    title: 'View Product',
    isAuthenticated: req.isAuthenticated,
    renter_id,
    role: req.role,
  })
})


/**
 * Update Listing Page
 *
 * @route GET /user/update-listing/:item_id
 */
router.get('/update-listing/:item_id', optionalAuth, (req, res) => {
  res.render('user/update-listing', {
    layout: 'layouts/user',
    title: 'Update Listing',
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  })
})


/**
 * Setup Profile Page
 *
 * @route GET /user/setup-profile
 */
router.get('/setup-profile', checkAuth, (req, res) => {
  // remove the otp from cookies
  res.clearCookie('otp')

  res.render('user/setup-profile', {
    layout: 'layouts/user',
    title: 'Setup Profile',
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  })
})


export default router