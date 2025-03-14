const express = require("express");
const { checkAuth, checkUser, optionalAuth } = require("../../middlewares/auth");

const router = express.Router();


/**
 * Dashboard
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
 * @route GET /user/user-dashboard
 */
router.get("/user-dashboard", checkAuth, checkUser, async (req, res) => {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/user/dashboard`);
    const dashboard = await response.json();

    res.render("user/user-dashboard", {
      layout: "layouts/user",
      title: "User Dashboard",
      dashboard: dashboard.data,
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.render("user/user-dashboard", {
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
router.get("/profile", checkAuth, checkUser, (req, res) => {
  res.render("user/profile", {
    layout: "layouts/user",
    title: "User Profile",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * Rents Page
 * @route GET /user/rents
 */
router.get("/rents", checkAuth, checkUser, (req, res) => {
  res.render("user/rents", {
    layout: "layouts/user",
    title: "My Rents",
    isAuthenticated: req.isAuthenticated,
    role: req.role,
  });
});


/**
 * My Listing Page
 * @route GET /user/my-listing
 */
router.get("/my-listing", checkAuth, checkUser, async (req, res) => {
  try {
    const pendingResponse = await fetch(`${process.env.BASE_URL}/api/user/posts/pending/${req.user.id}`);
    const pendingPosts = await pendingResponse.json();

    const approvedResponse = await fetch(`${process.env.BASE_URL}/api/user/posts/approve/${req.user.id}`);
    const approvedPosts = await approvedResponse.json();

    res.render("user/my-listing", {
      layout: "layouts/user",
      title: "My Listings",
      pendingPosts: pendingPosts.data, // Pass the retrieved pending posts
      approvedPosts: approvedPosts.data, // Pass the retrieved pending posts
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    });
  } catch (error) {
    console.error("Error fetching pending posts:", error);

    res.render("user/my-listing", {
      layout: "layouts/user",
      title: "My Listings",
      pendingPosts: [],
      approvedPosts: [],
      isAuthenticated: req.isAuthenticated,
      role: req.role,
    });
  }
});


/**
 * Archives Page
 * @route GET /dashboard/archives
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
  res.render("user/view-product", {
    layout: "layouts/user",
    title: "View Product",
    isAuthenticated: req.isAuthenticated,
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
    console.log('pendingPost: ', pendingPost.data)

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