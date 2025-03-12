const express = require("express");
const { checkAuth, checkAdmin } = require("../../middlewares/auth");

const router = express.Router();

/**
 * Admin Dashboard
 * @route GET /admin/admin-dashboard
 */
router.get("/admin-dashboard", checkAuth, checkAdmin, async (req, res) => {
    try {
        const response = await fetch(`${process.env.BASE_URL}/api/admin/dashboard`);
        const dashboard = await response.json();

        console.log('dashboard data', dashboard.data)

        res.render("admin/admin-dashboard", {
            layout: "layouts/dashboard",
            title: "Admin Dashboard",
            dashboard: dashboard.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
        });
    } catch (error) {
        console.error("Error fetching pending posts:", error);
        res.render("admin/admin-dashboard", {
            layout: "layouts/dashboard",
            title: "Admin Dashboard",
            dashboard: {},
            isAuthenticated: req.isAuthenticated,
            role: req.role,
        });
    }
});


/**
 * Profile Page
 * @route GET /admin/admin-profile
 */
router.get("/admin-profile", checkAuth, checkAdmin, (req, res) => {
    res.render("admin/admin-profile", {
        layout: "layouts/dashboard",
        title: "Admin Profile",
        isAuthenticated: req.isAuthenticated,
        role: req.role,
    });
});


/**
 * My Rents
 * @route GET /admin/admin-rents
 */
router.get("/admin-rents", checkAuth, checkAdmin, (req, res) => {
    res.render("admin/admin-rents", {
        layout: "layouts/dashboard",
        title: "Manage Users",
        isAuthenticated: req.isAuthenticated,
        role: req.role,
    });
});


/**
 * My Rents
 * @route GET /admin/admin-listing
 */
router.get("/admin-listings", checkAuth, checkAdmin, (req, res) => {
    res.render("admin/admin-listings", {
        layout: "layouts/dashboard",
        title: "My Listings",
        isAuthenticated: req.isAuthenticated,
        role: req.role,
    });
});

/**
 * Manager Users
 * @route GET /admin/manage-users
 */
router.get("/manage-users", checkAuth, checkAdmin, (req, res) => {
    res.render("admin/manage-users", {
        layout: "layouts/dashboard",
        title: "Manage Users",
        isAuthenticated: req.isAuthenticated,
        role: req.role,
    });
});


/**
 * Manage Listings
 * @route GET /admin/manage-listing
 */
router.get("/manage-listings", checkAuth, checkAdmin, async (req, res) => {
    try {
        const response = await fetch(`${process.env.BASE_URL}/api/admin/posts/pending`);
        const pendingPosts = await response.json();

        res.render("admin/manage-listings", {
            layout: "layouts/dashboard",
            title: "Manage Listings",
            pendingPosts: pendingPosts.data, // Pass the retrieved pending posts
            isAuthenticated: req.isAuthenticated,
            role: req.role,
        });
    } catch (error) {
        console.error("Error fetching pending posts:", error);
        res.render("admin/manage-listings", {
            layout: "layouts/dashboard",
            title: "Manage Listings",
            pendingPosts: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
        });
    }
});


/**
 * View Product
 * @route GET /admin/admin-view-product/:item_id
 */
router.get("/admin-view-product/:item_id", checkAuth, checkAdmin, async (req, res) => {
    const { item_id } = req.params

    try {
        const response = await fetch(`${process.env.BASE_URL}/api/admin/posts/pending/${item_id}`); // Adjust the URL if necessary
        const pendingPost = await response.json();

        res.render("admin/admin-viewprod", {
            layout: "layouts/dashboard",
            title: "View Product",
            pendingPost: pendingPost.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
        });
    } catch (error) {
        console.error("Error fetching pending posts:", error);
        res.render("admin/admin-viewprod", {
            layout: "layouts/dashboard",
            title: "View Product",
            pendingPost: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
        });
    }
});


/**
 * Transactions
 * @route GET /admin/transactions
 */
router.get("/transactions", checkAuth, checkAdmin, (req, res) => {
    res.render("admin/transactions", {
        layout: "layouts/dashboard",
        title: "Transactions",
        isAuthenticated: req.isAuthenticated,
        role: req.role,
    });
});


module.exports = router;