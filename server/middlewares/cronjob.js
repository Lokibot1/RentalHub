import cron from "node-cron";
import { db } from "../configs/db.js";

// Run every hour
cron.schedule('*/2 * * * *', () => {
    console.log('Running rental request cleanup cron...');

    const sql = `
        UPDATE rental_transactions
        SET status = 'voided'
        WHERE is_approved = 0
          AND status = 'pending'
          AND created_at <= NOW()
    `;

    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error updating rental transactions:', err);
        } else {
            console.log(`Rental transactions voided: ${result.affectedRows}`);
        }
    });
});
