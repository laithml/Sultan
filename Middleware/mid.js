const {auth} = require("../config/Firebase");

function requireAuth(req, res, next) {
    const user = auth.currentUser;
    if (user) {
        // User is logged in, proceed to the next middleware/route handler
        next();
    } else {
        // User is not logged in, redirect to the login page or return an error
        res.redirect("/login"); // Change "/login" to the appropriate route for your login page
    }
}

module.exports = requireAuth;
