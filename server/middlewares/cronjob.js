import cron from "node-cron";
import { db } from "../configs/db.js";
import { sendNotification } from '../helpers/send-notification.js'; // Import your mailer utility

// Run every 2 minutes (for testing)
cron.schedule('*/2 * * * *', () => {
    console.log('Running rental request cleanup cron...');

    // Step 1: Find transactions that should be voided
    const findSql = `
        SELECT 
            rt.id AS rental_transaction_id,
            i.name AS item_name,
            rt.rental_quantity,
            renter.email AS renter_email,
            owner.email AS owner_email
        FROM rental_transactions rt
        JOIN items i ON rt.item_id = i.id
        JOIN users renter ON rt.renter_id = renter.id
        JOIN users owner ON i.user_id = owner.id
        WHERE rt.is_approved = 0
          AND rt.status = 'pending'
          AND rt.created_at <= NOW()
    `;

    db.query(findSql, (err, transactions) => {
        if (err) {
            console.error('Error finding pending rental transactions:', err);
            return;
        }

        if (transactions.length === 0) {
            console.log('No rental transactions to void.');
            return;
        }

        // Step 2: Update their status to 'voided'
        const idsToVoid = transactions.map(t => t.rental_transaction_id);
        const updateSql = `
            UPDATE rental_transactions
            SET status = 'voided'
            WHERE id IN (?)
        `;

        db.query(updateSql, [idsToVoid], (err, result) => {
            if (err) {
                console.error('Error updating rental transactions:', err);
                return;
            }

            console.log(`Rental transactions voided: ${result.affectedRows}`);

            // Step 3: Send notification emails
            transactions.forEach(t => {
                const { item_name, rental_quantity, renter_email, owner_email, rental_transaction_id } = t;

                const subject = 'Rental Request Voided';
                const html = `
                    <p>Rental request for <strong>${item_name}</strong> has been automatically <strong>voided</strong> due to no action taken.</p>
                    <p>Rental Quantity: ${rental_quantity}</p>
                    <p>Rental Transaction ID: ${rental_transaction_id}</p>
                    <p>If you have any questions, please contact the platform support.</p>
                `;

                const template = { subject, html };

                // Send to both renter and owner
                sendNotification(renter_email, template);
                sendNotification(owner_email, template);
            });
        });
    });
});
