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
router.get("/admin-profile", checkAuth, checkAdmin, async (req, res) => {
    try {
        const response = await fetch(`${process.env.BASE_URL}/api/admin/profile`);
        const adminProfile = await response.json();
    
        res.render("admin/admin-profile", {
            layout: "layouts/dashboard",
            title: "Admin Profile",
            adminProfile: adminProfile.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        res.render("admin/admin-profile", {
            layout: "layouts/dashboard",
            title: "Admin Profile",
            adminProfile: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
        });
      }
});


/**
 * TODO: Refactor this one
 * My Rents
 *
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
 * My Items
 *
 * @route GET /admin/my-items
 */
router.get("/my-items", checkAuth, checkAdmin, async (req, res) => {
    try {
        const response = await fetch(`${process.env.BASE_URL}/api/admin/my-items/posted-items`);
        const adminItems = await response.json();

        const responseRentalRequests = await fetch(`${process.env.BASE_URL}/api/admin/my-items/rental-requests`);
        const adminRentalRequests = await responseRentalRequests.json();

        res.render("admin/my-items", {
            layout: "layouts/dashboard",
            title: "Admin - My Items",
            adminItems: adminItems.data,
            adminRentalRequests: adminRentalRequests.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
        });
    } catch (error) {
        console.error("Error fetching pending posts:", error);

        res.render("admin/my-items", {
            layout: "layouts/dashboard",
            title: "Admin - My Items",
            adminItems: [],
            adminRentalRequests: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
        });
    }
});


/**
 * TODO: Refactor this to add item
 * Page for adding new post
 *
 * @route GET /admin/listing
 */
router.get("/listing", checkAuth, checkAdmin, (req, res) => {
    res.render("admin/listing", {
        layout: "layouts/dashboard",
        title: "Add New Listing",
        isAuthenticated: req.isAuthenticated,
        role: req.role,
    });
});

/**
 * Manager Users
 * @route GET /admin/manage-users
 */
router.get("/manage-users", checkAuth, checkAdmin, async (req, res) => {
    try {
        const response = await fetch(`${process.env.BASE_URL}/api/admin/manage-users`);
        const users = await response.json();


        res.render("admin/manage-users", {
            layout: "layouts/dashboard",
            title: "Manage Users",
            users: users.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
        });
    } catch (error) {
        console.error("Error fetching pending posts:", error);

        res.render("admin/manage-users", {
            layout: "layouts/dashboard",
            title: "Manage Users",
            users: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
        });
    }
});


/**
 * Manage Listings
 * @route GET /admin/manage-listing
 */
router.get("/manage-listings", checkAuth, checkAdmin, async (req, res) => {
    try {
        const pendingResponse = await fetch(`${process.env.BASE_URL}/api/admin/posts/pending`);
        const pendingPosts = await pendingResponse.json();

        const approvedResponse = await fetch(`${process.env.BASE_URL}/api/admin/posts`);
        const approvedPosts = await approvedResponse.json();
        console.log('approvedPosts', approvedPosts.data)

        res.render("admin/manage-listings", {
            layout: "layouts/dashboard",
            title: "Manage Listings",
            pendingPosts: pendingPosts.data, // Pass the retrieved pending posts
            approvedPosts: approvedPosts.data,
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
 *
 * @route GET /admin/transactions
 */
router.get("/transactions", checkAuth, checkAdmin, async (req, res) => {
    try {
        const response = await fetch(`${process.env.BASE_URL}/api/admin/transactions`);
        const transactions = await response.json();

        res.render("admin/transactions", {
            layout: "layouts/dashboard",
            title: "Transactions",
            transactions: transactions.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
        });
    } catch (error) {
        console.error("Error fetching data:", error);

        res.render("admin/transactions", {
            layout: "layouts/dashboard",
            title: "Transactions",
            transactions: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
        });
    }
})


module.exports = router;