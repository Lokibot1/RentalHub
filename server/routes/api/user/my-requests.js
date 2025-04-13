import express from "express"
import { db } from "../../../configs/db.js"
import jwt from "jsonwebtoken";
import { sendNotification } from '../../../helpers/send-notification.js'; // Import your mailer utility

const router = express.Router();


/**
 * Rent item
 *
 * @route POST /api/user/my-requests
 */
router.post("/", async (req, res) => {
    const {
        renter_id,
        id: item_id,
        start_date,
        end_date,
        price,
        rental_quantity,
        mode_of_delivery
    } = req.body;

    console.log("Request:",req.body)

    const total_price = parseFloat(price) * parseInt(rental_quantity, 10);

    const insertSql = `
        INSERT INTO rental_transactions (renter_id, item_id, start_date, end_date, total_price, rental_quantity,
                                         mode_of_delivery)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertSql, [
        renter_id,
        item_id,
        start_date,
        end_date,
        total_price,
        rental_quantity,
        mode_of_delivery,
    ], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Insert query failed." });
        }

        const rental_transaction_id = results.insertId; // This is the rental_transactions.id

        const selectSql = `
            SELECT rt.item_id, rt.rental_quantity, i.user_id AS item_owner_id, rt.renter_id,
                   rt.start_date, rt.end_date,
				   i.name   AS item_name,
                   renter.email AS renter_email,
                   owner.email  AS owner_email,
                   renter.contact_number,
                   renter.social_media
            FROM rental_transactions rt
                   JOIN items i ON rt.item_id = i.id
                   JOIN users AS renter ON renter.id = rt.renter_id
                   JOIN users AS owner ON owner.id = i.user_id
            WHERE rt.id = ? FOR UPDATE;
        `

        db.query(selectSql, [rental_transaction_id], (err, results) => {
            if (err || results.length === 0) {
                return rollback(res, "Transaction details not found.")
            }


            const { item_id, start_date, end_date, item_name, rental_quantity, renter_email, contact_number, owner_email, social_media } = results[0];

            const renterContact = {
                contact_number,
                email: renter_email,
                social_media
            };

            const formattedStart = new Date(start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const formattedEnd = new Date(end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            const subject = 'New Rental Request';
            const html = `
                                <p>Your item <strong>${item_name}</strong> has a new rental request.</p>
                                <p>Rental Quantity: ${rental_quantity}</p>
                                <p>Rental Period: ${formattedStart} to ${formattedEnd}</p>
                                <p>Rental Transaction ID: ${rental_transaction_id}</p>
                                <p>Please contact the renter using the information below for further details regarding the transaction:</p>
                                <ul>
                                <li><strong>Phone Number:</strong> ${renterContact.contact_number}</li>
                                <li><strong>Email:</strong> ${renterContact.email}</li>
                                <li><strong>Social Media:</strong> ${renterContact.social_media}</li>
                                </ul>
                            `

            const template = { subject, html }

            // Send approval notification email to item owner
            sendNotification(owner_email, template);

            // Send response only once after both queries are successful
            res.status(200).json({
                success: true,
                message: "Item rental transaction saved"
            });

        })


    });
});


/**
 * Get rent request items
 *
 * @route GET /api/user/my-requests/requests/:user_id
 */
router.get("/requests/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT rental_transactions.id                         AS id,
               CONCAT(users.first_name, ' ', users.last_name) AS owner_name,
               items.file_path                                AS item_image,
               items.name                                     AS item_name
        FROM rental_transactions
                 JOIN items ON items.id = rental_transactions.item_id
                 JOIN users ON users.id = items.user_id
        WHERE rental_transactions.is_approved = 0
          AND rental_transactions.status != 'declined'
          AND rental_transactions.renter_id = ?
    `

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
});


/**
 * Cancel (delete) a rent request
 *
 * @route DELETE /api/user/my-requests/cancel/:request_id
 */
router.delete("/cancel/:request_id", (req, res) => {
    const { request_id } = req.params;

    const deleteSql = `
        DELETE
        FROM rental_transactions
        WHERE id = ?
    `;

    db.query(deleteSql, [request_id], (err, results) => {
        if (err) {
            console.error("Database error during deletion:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to delete the request."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Request successfully canceled."
        });
    });
});


/**
 * Get RENTER ongoing transactions
 *
 * @route GET /api/user/my-requests/ongoing/:user_id
 */
router.get("/ongoing/:user_id", async (req, res) => {
    const { user_id } = req.params

    const sql = `
        SELECT rental_transactions.id                         AS id,
               CONCAT(users.first_name, ' ', users.last_name) AS owner_name,
               items.file_path                                AS item_image,
               items.name                                     AS item_name,
               start_date,
               end_date,
               mode_of_delivery
        FROM rental_transactions
                 JOIN items ON items.id = rental_transactions.item_id
                 JOIN users ON users.id = items.user_id
        WHERE rental_transactions.is_approved = 1
          AND rental_transactions.status = 'ongoing'
          AND rental_transactions.is_renter_submit_review = 0
          AND rental_transactions.renter_id = ?
    `

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
});


// Helper function to rollback transaction
function rollback(res, message) {
    db.rollback(() => res.status(400).json({ success: false, message }));
}

/**
 * Return ongoing items to shop including their quantity
 *
 * @route PATCH /api/user/my-requests/return-items/:rent_transaction_id
 */
router.patch("/return-items/:rent_transaction_id", async (req, res) => {
    const { rent_transaction_id } = req.params;
    const { stars, description } = req.body
    const token = req.cookies.token || '';
    const user = jwt.verify(token, process.env.JWT_SECRET);

    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ success: false, message: "Transaction initiation failed." });

        const selectSql = `
            SELECT rt.item_id, rt.rental_quantity, i.user_id AS item_owner_id, rt.renter_id
            FROM rental_transactions rt
            JOIN items i ON rt.item_id = i.id
            WHERE rt.id = ? FOR UPDATE;
            `

        db.query(selectSql, [rent_transaction_id], (err, results) => {
            if (err || results.length === 0) {
                return rollback(res, "Transaction details not found.");
            }

            const { item_id, rental_quantity, item_owner_id, renter_id } = results[0];

            // Save reviews and star rating
            const createReviewAndStarRatingSql = `
                INSERT INTO reviews(item_id, item_owner_id, reviewer_id, rating, review_text, item_renter_id, for_user, role)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'owner')
            `
            db.query(createReviewAndStarRatingSql, [item_id, item_owner_id, user.id, stars, description, renter_id, item_owner_id], (err) => {
                if (err) return rollback(res, "Failed to insert reviews.")

                // Update transaction
                const updateStatusToDone = `
                    UPDATE rental_transactions
                    SET is_renter_submit_review = 1,
                        status = CASE
                                    WHEN is_owner_submit_review = 1 THEN 'done'
                                    ELSE status
                                 END
                    WHERE id = ?
                `
                db.query(updateStatusToDone, [rent_transaction_id], (err) => {
                    if (err) return rollback(res, "Failed to update rental transactions");

                    db.commit((err) => {
                        if (err) return res.status(500).json({
                            success: false,
                            message: "Commit failed."
                        });

                        res.status(200).json({
                            success: true,
                            message: 'Successfully updated.'
                        })
                    })
                })
            })
        })
    })
})


export default router
