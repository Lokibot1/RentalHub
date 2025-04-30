import express from "express"
import { checkAuth, checkAdmin } from "../../middlewares/auth.js"
import { getUserBannedStatus } from "../../helpers/userStatus.js";

const router = express.Router();

/**
 * Admin Dashboard
 * @route GET /admin/admin-dashboard
 */
router.get("/admin-dashboard", checkAuth, checkAdmin, async (req, res) => {
    try {
        const response = await fetch(`${process.env.BASE_URL}/api/admin/dashboard`);
        const dashboard = await response.json();

        const isBanned = await getUserBannedStatus(req.user.id);

        console.log('dashboard data', dashboard.data)

        res.render("admin/admin-dashboard", {
            layout: "layouts/dashboard",
            title: "Admin Dashboard",
            dashboard: dashboard.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned,
        });
    } catch (error) {
        console.error("Error fetching pending posts:", error);
        res.render("admin/admin-dashboard", {
            layout: "layouts/dashboard",
            title: "Admin Dashboard",
            dashboard: {},
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned: false,
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

        const isBanned = await getUserBannedStatus(req.user.id);
    
        res.render("admin/admin-profile", {
            layout: "layouts/dashboard",
            title: "Admin Profile",
            adminProfile: adminProfile.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        res.render("admin/admin-profile", {
            layout: "layouts/dashboard",
            title: "Admin Profile",
            adminProfile: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned: false,
        });
      }
});


/**
 * My Rents
 *
 * @route GET /admin/my-rents
 */
router.get("/admin-rents", checkAuth, checkAdmin, async (req, res) => {
    try {
        const rentRequestResponse = await fetch(`${process.env.BASE_URL}/api/admin/my-rents/requests/${req.user.id}`);
        const rentRequests = await rentRequestResponse.json();
    
        const ongoingRentResponse = await fetch(`${process.env.BASE_URL}/api/admin/my-rents/ongoing/${req.user.id}`);
        const ongoingRentItems = await ongoingRentResponse.json();

        const isBanned = await getUserBannedStatus(req.user.id);
    
        res.render("admin/admin-rents", {
            layout: "layouts/dashboard",
            title: "My Request",
            rentRequestItems: rentRequests.data,
            ongoingRentItems: ongoingRentItems.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            currentUserId: req.user.id,
            isBanned,
        });
      } catch (error) {
        console.error("Error fetching pending posts:", error);
        res.render("admin/admint-rents", {
            layout: "layouts/dashboard",
            title: "My Request",
            rentRequestItems: [],
            ongoingRentItems: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            currentUserId: req.user.id,
            isBanned: false,
        });
      }
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

        console.log('adminRentalRequests:', adminRentalRequests)

        const adminOngoingTransactionsResponse = await fetch(`${process.env.BASE_URL}/api/admin/my-items/ongoing-transactions/${req.user.id}`);
        const adminOngoingTransactions = await adminOngoingTransactionsResponse.json();

        console.log('adminOngoingTransactions:', adminOngoingTransactions);

        const isBanned = await getUserBannedStatus(req.user.id);

        res.render("admin/my-items", {
            layout: "layouts/dashboard",
            title: "Admin - My Items",
            adminItems: adminItems.data,
            adminRentalRequests: adminRentalRequests.data,
            adminOngoingTransactions: adminOngoingTransactions.data,
            isAuthenticated: req.isAuthenticated,
            user_id: req.user.id,
            role: req.role,
            currentUserId: req.user.id,
            isBanned,
        });
    } catch (error) {
        console.error("Error fetching pending posts:", error);

        res.render("admin/my-items", {
            layout: "layouts/dashboard",
            title: "Admin - My Items",
            adminItems: [],
            adminRentalRequests: [],
            adminOngoingTransactions: [],
            user_id: 0,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            currentUserId: req.user.id,
            isBanned: false,
        });
    }
});


/**
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
        isBanned,
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
        
        const isBanned = await getUserBannedStatus(req.user.id);

        res.render("admin/manage-users", {
            layout: "layouts/dashboard",
            title: "Manage Users",
            users: users.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned,
        });
    } catch (error) {
        console.error("Error fetching pending posts:", error);

        res.render("admin/manage-users", {
            layout: "layouts/dashboard",
            title: "Manage Users",
            users: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned: false,
        });
    }
});


/**
 * Manage Listings
 * @route GET /admin/manage-listing
 */
router.get("/manage-listings", checkAuth, checkAdmin, async (req, res) => {
    try {
        const pendingResponse = await fetch(`${process.env.BASE_URL}/api/admin/manage-listings/pending`);
        const pendingPosts = await pendingResponse.json();

        const approvedResponse = await fetch(`${process.env.BASE_URL}/api/admin/manage-listings`);
        const approvedPosts = await approvedResponse.json();

        const declinedRequestResponse = await fetch(`${process.env.BASE_URL}/api/admin/manage-listings/decline-requests`);
        const declinedRequests = await declinedRequestResponse.json();

        const isBanned = await getUserBannedStatus(req.user.id);

        res.render("admin/manage-listings", {
            layout: "layouts/dashboard",
            title: "Manage Listings",
            pendingPosts: pendingPosts.data, // Pass the retrieved pending posts
            approvedPosts: approvedPosts.data,
            declinedRequests: declinedRequests.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned,
        });
    } catch (error) {
        console.error("Error fetching pending posts:", error);
        res.render("admin/manage-listings", {
            layout: "layouts/dashboard",
            title: "Manage Listings",
            pendingPosts: [],
            approvedPosts: [],
            declinedRequests: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned: false,
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
        const response = await fetch(`${process.env.BASE_URL}/api/admin/manage-listings/pending/${item_id}`); // Adjust the URL if necessary
        const pendingPost = await response.json();

        const isBanned = await getUserBannedStatus(req.user.id);

        res.render("admin/admin-viewprod", {
            layout: "layouts/dashboard",
            title: "View Product",
            pendingPost: pendingPost.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned,
        });
    } catch (error) {
        console.error("Error fetching pending posts:", error);
        res.render("admin/admin-viewprod", {
            layout: "layouts/dashboard",
            title: "View Product",
            pendingPost: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned: false,
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
        
        const isBanned = await getUserBannedStatus(req.user.id);

        res.render("admin/transactions", {
            layout: "layouts/dashboard",
            title: "Transactions",
            transactions: transactions.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned,
        });
    } catch (error) {
        console.error("Error fetching data:", error);

        res.render("admin/transactions", {
            layout: "layouts/dashboard",
            title: "Transactions",
            transactions: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned: false,
        });
    }
})


/**
 * Archives Page
 *
 * @route GET /admin/archives
 */
router.get('/archive', checkAuth, async (req, res) => {
    try {
        const response = await fetch(`${process.env.BASE_URL}/api/admin/archive/${req.user.id}`)
        const archivedItems = await response.json()

        const isBanned = await getUserBannedStatus(req.user.id);

        res.render('admin/archive', {
            layout: 'layouts/user',
            title: 'Archives',
            archivedItems: archivedItems.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned, // ✅ pass this
        })
    } catch (error) {
        console.error('Error fetching data:', error)
        res.render('admin/archive', {
            layout: 'layouts/user',
            title: 'Archives',
            archivedItems: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned: false, // default to false in error case
        })
    }
})


export default router