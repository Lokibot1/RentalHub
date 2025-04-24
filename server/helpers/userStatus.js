import { db } from '../configs/db.js';


// helpers/userStatus.js
export const getUserBannedStatus = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT status FROM users WHERE id = ?";
        db.query(sql, [userId], (err, results) => {
            if (err || results.length === 0) return resolve(false); // default to not banned
            resolve(results[0].status === 'banned');
        });
    });
};
