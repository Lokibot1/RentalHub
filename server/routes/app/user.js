import express from 'express'
import {checkAuth, checkUser, optionalAuth} from '../../middlewares/auth.js'
import { db } from "../../configs/db.js"
import { getUserBannedStatus } from '../../helpers/userStatus.js';

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

        const isBanned = await getUserBannedStatus(req.user.id); // ✅ Use it here

        res.render('user/dashboard', {
            layout: 'layouts/user',
            title: 'User Dashboard',
            dashboard: dashboard.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned, // ✅ pass this
        })
    } catch (error) {
        console.error('Error fetching data:', error)
        res.render('user/dashboard', {
            layout: 'layouts/user',
            title: 'User Dashboard',
            dashboard: {},
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned: false,
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

        const isBanned = await getUserBannedStatus(req.user.id); // ✅ Use it here

        res.render('user/profile', {
            layout: 'layouts/user',
            title: 'User Profile',
            userProfile: userProfile.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned, // ✅ pass this
        })
    } catch (error) {
        console.error('Error fetching data:', error)
        res.render('user/profile', {
            layout: 'layouts/user',
            title: 'User Profile',
            userProfile: userProfile.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned: false, // default to false in error case
        })
    }
})


// router.get('/profile', checkAuth, checkUser, async (req, res) => {
//     try {
//         // Fetch user profile
//         const response = await fetch(`${process.env.BASE_URL}/api/user/profile/${req.user.id}`);
//         const userProfile = await response.json();

//         // Check if user is banned
//         const sql = "SELECT status FROM users WHERE id = ?";
//         db.query(sql, [req.user.id], (err, results) => {
//             if (err || results.length === 0) {
//                 return res.status(500).send("Error checking user status.");
//             }

//             const isBanned = results[0].status === 'banned';

//             // Render the profile page and pass isBanned
//             res.render('user/profile', {
//                 layout: 'layouts/user',
//                 title: 'User Profile',
//                 userProfile: userProfile.data,
//                 isAuthenticated: req.isAuthenticated,
//                 role: req.role,
//                 isBanned, // ✅ make it available in the view
//             });
//         });
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         res.status(500).render('user/profile', {
//             layout: 'layouts/user',
//             title: 'User Profile',
//             userProfile: {}, // fallback in case userProfile fails
//             isAuthenticated: req.isAuthenticated,
//             role: req.role,
//             isBanned: false, // default to false in error case
//         });
//     }
// });



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

        const isBanned = await getUserBannedStatus(req.user.id); // ✅ Use it here

        res.render('user/my-requests', {
            layout: 'layouts/user',
            title: 'My Rents',
            user_id: req.user.id,
            rentRequestItems: rentRequests.data,
            ongoingRentItems: ongoingRentItems.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned, // ✅ pass this
        })
    } catch (error) {
        console.error('Error fetching pending posts:', error)
        res.render('user/my-requests', {
            layout: 'layouts/user',
            title: 'My Rents',
            user_id: 0,
            rentRequestItems: [],
            ongoingRentItems: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned: false, // default to false in error case
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

        const isBanned = await getUserBannedStatus(req.user.id); // ✅ Use it here

        res.render('user/my-items', {
            layout: 'layouts/user',
            title: 'My Items',
            pendingPosts: pendingPosts.data,
            approvedPosts: approvedPosts.data,
            rentalRequests: rentalRequests.data,
            ongoingTransactions: ongoingTransactions.data,
            user_id: req.user.id,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned, // ✅ pass this
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
            user_id: 0,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned: false, // default to false in error case
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

        const isBanned = await getUserBannedStatus(req.user.id); // ✅ Use it here

        res.render('user/archives', {
            layout: 'layouts/user',
            title: 'Archives',
            archivedItems: archivedItems.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned, // ✅ pass this
        })
    } catch (error) {
        console.error('Error fetching data:', error)
        res.render('user/archives', {
            layout: 'layouts/user',
            title: 'Archives',
            archivedItems: [],
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned: false, // default to false in error case
        })
    }
})


/**
 * User Listings
 *
 * @route GET /user/listing
 */
router.get('/listing', checkAuth, async (req, res) => {
    try {
        const isBanned = await getUserBannedStatus(req.user.id)

        res.render('user/listing', {
            layout: 'layouts/user',
            title: 'Add New Listing',
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned, // ✅ Now defined in the view
        })
    } catch (error) {
        console.error('Error checking banned status:', error)
        res.render('user/listing', {
            layout: 'layouts/user',
            title: 'Add New Listing',
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned: false, // fallback default
        })
    }
})


// /**
//  * View Product Page
//  *
//  * @route GET /user/view-product/:item_id
//  */
// router.get('/view-product/:item_id', optionalAuth, async (req, res) => {
//     // Set the user_id
//     let renter_id = 0
//     if (req.user !== undefined) {
//         renter_id = req.user.id
//     }

//     const response = await fetch(`${process.env.BASE_URL}/api/user/is-owner/${renter_id}/item-id/${req.params.item_id}`)
//     const user = await response.json()

//     res.render('user/view-product', {
//         layout: 'layouts/user',
//         title: 'View Product',
//         isAuthenticated: req.isAuthenticated,
//         is_owner: user.data.is_owner === 1,
//         item_id: req.params.item_id,
//         renter_id,
//         role: req.role,
//     })
// })

/**
 * View Product Page
 *
 * @route GET /user/view-product/:item_id
 */
router.get('/view-product/:item_id', optionalAuth, async (req, res) => {
    let renter_id = 0;

    // Set renter_id if logged in
    if (req.user !== undefined) {
        renter_id = req.user.id;

        // Fetch user status from DB
        const sql = "SELECT status FROM users WHERE id = ?";
        db.query(sql, [renter_id], async (err, results) => {
            if (err || results.length === 0) {
                return res.status(500).send("Error checking user status.");
            }

            const userStatus = results[0].status;

            const isBanned = userStatus === 'banned';

            // Proceed if not banned
            const response = await fetch(`${process.env.BASE_URL}/api/user/is-owner/${renter_id}/item-id/${req.params.item_id}`);
            const user = await response.json();

            res.render('user/view-product', {
                layout: 'layouts/user',
                title: 'View Product',
                isAuthenticated: req.isAuthenticated,
                is_owner: user.data.is_owner === 1,
                item_id: req.params.item_id,
                renter_id,
                role: req.role,
                isBanned
            });
        });

    } else {
        // If user is not logged in, skip status check
        const response = await fetch(`${process.env.BASE_URL}/api/user/is-owner/${renter_id}/item-id/${req.params.item_id}`);
        const user = await response.json();

        res.render('user/view-product', {
            layout: 'layouts/user',
            title: 'View Product',
            isAuthenticated: false,
            is_owner: false,
            item_id: req.params.item_id,
            renter_id: 0,
            role: null,
        });
    }
});


/**
 * Update Listing Page
 *
 * @route GET /user/update-listing/:item_id
 */
router.get('/update-listing/:item_id', optionalAuth, async (req, res) => {
    try {
    const response = await fetch(`${process.env.BASE_URL}/api/user/get-item/${req.params.item_id}`)
    const item = await response.json()

    const isBanned = await getUserBannedStatus(req.user.id); // ✅ Use it here

    res.render('user/update-listing', {
        layout: 'layouts/user',
        title: 'Update Listing',
        item: item.data,
        isAuthenticated: req.isAuthenticated,
        role: req.role,
        isBanned, // ✅ pass this
    })
    } catch (error) {
        console.error('Error fetching data:', error)
        res.render('user/archives', {
            layout: 'layouts/user',
            title: 'Update Listing',
            item: item.data,
            isAuthenticated: req.isAuthenticated,
            role: req.role,
            isBanned: false, // default to false in error case
        })
    }
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

/**
 * View Pending Item Page
 *
 * @route GET /user/view-pending/:item_id
 */
router.get('/view-pending/:item_id', optionalAuth, async (req, res) => {
    // Set the user_id
    let renter_id = 0
    if (req.user !== undefined) {
        renter_id = req.user.id
    }

    const response = await fetch(`${process.env.BASE_URL}/api/user/my-items/pending-item/${req.params.item_id}`)
    const results = await response.json()

    console.log('results', results)

    res.render('user/view-pending', {
        layout: 'layouts/user',
        title: 'View Pending Item',
        pendingPost: results.data,
        isAuthenticated: req.isAuthenticated,
        item_id: req.params.item_id,
        role: req.role,
    })
})

/**
 * Inquiry Form Page
 *
 * @route GET /user/inquire/:item_id
 */
router.get('/inquire/:item_id', optionalAuth, async (req, res) => {
    const { item_id } = req.params;

    let renter_id = 0;
    if (!item_id) {
        return res.status(400).send("Missing item_id");
    }

    if (req.user !== undefined) {
        renter_id = req.user.id;
    }

    try {
        const response = await fetch(`${process.env.BASE_URL}/api/user/is-owner/${renter_id}/item-id/${item_id}`);
        const user = await response.json();

        const isOwner = user?.data?.is_owner === 1;

        res.render('user/inquire', {
            layout: 'layouts/user',
            title: 'Inquiry Form',
            isAuthenticated: req.isAuthenticated,
            is_owner: isOwner,
            item_id,
            renter_id,
            role: req.role,
        });
    } catch (error) {
        console.error("Error fetching ownership status:", error);
        res.status(500).send("Server Error");
    }
});



export default router