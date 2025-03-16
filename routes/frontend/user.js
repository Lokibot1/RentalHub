const express = require("express");
const { checkAuth, checkUser, optionalAuth } = require("../../middlewares/auth");

const router = express.Router();


/**
 * User Listings
 *
 * @route GET /user/listing
 */
router.get("/listing", checkAuth, (req, res) => {
  res.render("user/listing", {
    layout: "layouts/user",
    title: "Add New Listing",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * User Dashboard
 *
 * @route GET /user/dashboard
 */
router.get("/dashboard", checkAuth, checkUser, async (req, res) => {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/user/dashboard/${req.user.id}`);
    const dashboard = await response.json();

    res.render("user/dashboard", {
      layout: "layouts/user",
      title: "User Dashboard",
      dashboard: dashboard.data,
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.render("user/dashboard", {
      layout: "layouts/user",
      title: "User Dashboard",
      dashboard: {},
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    });
  }
});


/**
 * Profile Page
 * @route GET /user/profile
 */
router.get("/profile", checkAuth, checkUser, async (req, res) => {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/user/profile/${req.user.id}`);
    const userProfile = await response.json();

    res.render("user/profile", {
      layout: "layouts/user",
      title: "User Profile",
      userProfile: userProfile.data,
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.render("user/profile", {
      layout: "layouts/user",
      title: "User Profile",
      userProfile: userProfile.data,
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    });
  }


});


/**
 * My Requests Page
 *
 * @route GET /user/my-requests
 */
router.get("/my-requests", checkAuth, checkUser, async (req, res) => {
  try {
    const rentRequestResponse = await fetch(`${process.env.BASE_URL}/api/user/rent/request/${req.user.id}`);
    const rentRequests = await rentRequestResponse.json();

    const ongoingRentResponse = await fetch(`${process.env.BASE_URL}/api/user/rent/ongoing/${req.user.id}`);
    const ongoingRentItems = await ongoingRentResponse.json();

    res.render("user/my-requests", {
      layout: "layouts/user",
      title: "My Rents",
      rentRequestItems: rentRequests.data,
      ongoingRentItems: ongoingRentItems.data,
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    });
  } catch (error) {
    console.error("Error fetching pending posts:", error);
    res.render("user/my-requests", {
      layout: "layouts/user",
      title: "My Rents",
      rentRequestItems: [],
      ongoingRentItems: [],
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    });
  }
});


/**
 * My Items Page
 *
 * @route GET /user/my-items
 */
router.get("/my-items", checkAuth, checkUser, async (req, res) => {
  try {
    const pendingResponse = await fetch(`${process.env.BASE_URL}/api/user/posts/pending/${req.user.id}`);
    const pendingPosts = await pendingResponse.json();

    const approvedResponse = await fetch(`${process.env.BASE_URL}/api/user/posts/approve/${req.user.id}`);
    const approvedPosts = await approvedResponse.json();

    const rentalRequestResponse = await fetch(`${process.env.BASE_URL}/api/user/listings/rental-requests/${req.user.id}`);
    const rentalRequests = await rentalRequestResponse.json();

    const ongoingTransactionResponse = await fetch(`${process.env.BASE_URL}/api/user/listings/ongoing-transactions/${req.user.id}`);
    const ongoingTransactions = await ongoingTransactionResponse.json();

    res.render("user/my-items", {
      layout: "layouts/user",
      title: "My Items",
      pendingPosts: pendingPosts.data,
      approvedPosts: approvedPosts.data,
      rentalRequests: rentalRequests.data,
      ongoingTransactions: ongoingTransactions.data,
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    });
  } catch (error) {
    console.error("Error fetching pending posts:", error);

    res.render("user/my-items", {
      layout: "layouts/user",
      title: "My Items",
      pendingPosts: [],
      approvedPosts: [],
      rentalRequests: [],
      ongoingTransactions: [],
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    });
  }
});


/**
 * Archives Page
 *
 * @route GET /user/archives
 */
router.get("/archives", checkAuth, checkUser, (req, res) => {
  res.render("user/archives", {
    layout: "layouts/user",
    title: "Archives",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * View Product Page
 * @route GET /user/view-product
 */
router.get("/view-product", optionalAuth, (req, res) => {
  // Set the user_id
  const renter_id = req.user.id

  res.render("user/view-product", {
    layout: "layouts/user",
    title: "View Product",
    isAuthenticated: req.isAuthenticated,
    renter_id,
    role: req.role,
  });
});


/**
 * View Product Page
 * @route GET /user/view-pending/:item_id
 */
router.get("/view-pending/:item_id", optionalAuth, async (req, res) => {
  const { item_id } = req.params

  try {
    const response = await fetch(`${process.env.BASE_URL}/api/user/posts/pending-item/${item_id}`);
    const pendingPost = await response.json();

    res.render("user/view-pending", {
      layout: "layouts/user",
      title: "View Pending",
      pendingPost: pendingPost.data,
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.render("user/view-pending", {
      layout: "layouts/user",
      title: "View Pending",
      pendingPost: {},
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    });
  }

});


/**
 * Update Listing Page
 * @route GET /user/update-listing/:item_id
 */
router.get("/update-listing/:item_id", optionalAuth, (req, res) => {
  res.render("user/update-listing", {
    layout: "layouts/user",
    title: "Update Listing",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * Setup Profile Page
 * @route GET /user/setup-profile
 */
router.get("/setup-profile", checkAuth, (req, res) => {
  // remove the otp from cookies
  res.clearCookie('otp');

  res.render("user/setup-profile", {
    layout: "layouts/user",
    title: "Setup Profile",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


module.exports = router;