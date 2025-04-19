import express from "express"
import { db } from "../../../configs/db.js"
import jwt from "jsonwebtoken";
import { sendNotification } from '../../../helpers/send-notification.js'; // Import your mailer utility

const router = express.Router();


/**
 * Get dashboard data
 *
 * @route GET /api/user/view-product/posted-by/:item_id
 */
router.get("/posted-by/:item_id", async (req, res) => {
    const { item_id } = req.params

    const sql = `
        SELECT
            users.id AS id,
            profile_image,
            CONCAT(users.first_name, ' ', users.last_name) AS owner,
            contact_number,
            social_media,
            location,
            AVG(reviews.rating) AS average_rating
        FROM items
                 JOIN users ON users.id = items.user_id
                 LEFT JOIN reviews ON reviews.item_id = items.id
        WHERE items.id = ?
        GROUP BY users.id, profile_image, users.first_name, users.last_name, contact_number, social_media, location
    `

    db.query(sql, [item_id], (err, results) => {
        if (err) {
            console.error("Database not connected", err);
            return res.status(500).json({ success: false, message: "Query failed." });
        }

        res.status(200).json({
            success: true,
            data: results.length > 0 ? results[0] : null
        });
    });
});


/**
 * Send rental inquiry email to item owner
 *
 * @route POST /api/user/view-product/send-inquiry
 */
router.post("/send-inquiry", async (req, res) => {
    const {
      item_id,
      rental_quantity,
      mode,
      start_date,
      end_date,
    } = req.body;
  
    try {
      const token = req.cookies.token || '';
      const user = jwt.verify(token, process.env.JWT_SECRET); // ✅ Extract user from JWT
      const renter_id = user.id;
  
      if (!renter_id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      // Fetch item + owner info
      const [itemRows] = await db.promise().query(`
        SELECT 
          i.name AS item_name,
          i.location AS item_location,
          CONCAT_WS(' ', u.first_name, u.middle_name, u.last_name) AS owner_name,
          u.email AS owner_email,
          u.social_media
        FROM items i
        JOIN users u ON i.user_id = u.id
        WHERE i.id = ?
      `, [item_id]);
  
      if (itemRows.length === 0) {
        return res.status(404).json({ message: "Item not found" });
      }
  
      const item = itemRows[0];
  
      // Fetch renter info
      const [renterRows] = await db.promise().query(`
        SELECT 
          CONCAT_WS(' ', first_name, middle_name, last_name) AS renter_name,
          city AS renter_address,
          email AS renter_email,
          contact_number AS renter_contact_number,
          social_media AS renter_social_media
        FROM users
        WHERE id = ?
      `, [renter_id]);
  
      if (renterRows.length === 0) {
        return res.status(404).json({ message: "Renter not found" });
      }
  
      const renter = renterRows[0];
  
      // Compose email
      const subject = `Rental Inquiry: ${item.item_name}`;
      const html = `
        <p>You have received a rental inquiry for the following item:</p>
        <ul>
          <li><strong>Item Name:</strong> ${item.item_name}</li>
          <li><strong>Quantity:</strong> ${rental_quantity}</li>
          <li><strong>Location:</strong> ${item.item_location}</li>
          <li><strong>Mode:</strong> ${mode}</li>
          <li><strong>Rental Start Date:</strong> ${start_date}</li>
          <li><strong>Rental End Date:</strong> ${end_date}</li>
        </ul>
        <p><strong>Renter Information:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${renter.renter_name}</li>
          <li><strong>Address:</strong> ${renter.renter_address}</li>
          <li><strong>Email:</strong> ${renter.renter_email}</li>
          <li><strong>Contact Number:</strong> ${renter.renter_contact_number}</li>
        </ul>
        <p><strong>Social Media Contact:</strong> ${renter.renter_social_media}</p>
      `;
  
      const template = { subject, html };
  
      // Send email to owner
      await sendNotification(item.owner_email, template);
  
      res.status(200).json({ message: "Inquiry email sent successfully." });
  
    } catch (error) {
      console.error("Inquiry error:", error);
      res.status(500).json({ message: "Failed to send inquiry." });
    }
  });
  


export default router
