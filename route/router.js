const express = require("express");
const router = express.Router();

const HomeController = require("../controllers/HomeController");
const TicketsController = require("../controllers/TicketsController");
const requireAuth = require("../Middleware/mid");
const multer = require("multer");
const gsm = require("../controllers/gsm");
const profile = require("../controllers/ProfileController");
const upload = multer();

router.get("/", requireAuth, HomeController.Main);

router.get("/login", HomeController.login);

router.get("/register", HomeController.register);

router.get("/search", requireAuth, HomeController.search);

router.get("/tickets", requireAuth, HomeController.tickets);

router.get("/customers", requireAuth, HomeController.customers);

router.get("/not-found", HomeController.notFound);

router.get("/preOrder", requireAuth, HomeController.preOrder);

//*****************************************************************************************//
//************************************TICKETS ROUTES***************************************//
//*****************************************************************************************//
router.post("/done-ticket", requireAuth, upload.none(), TicketsController.doneTicket);
router.get('/get-live', requireAuth, upload.none(), TicketsController.getLive);
router.post("/get-note", requireAuth, upload.none(), TicketsController.getNote);
router.post('/picked', requireAuth, upload.none(), TicketsController.picked);
router.delete('/delete-ticket/:phone/:id', requireAuth, upload.none(), TicketsController.deleteTicket);
router.post('/get-ticket-lives',requireAuth, upload.none(), TicketsController.getLiveTicket);
router.put('/update-ticket', requireAuth, upload.none(), TicketsController.updateTicket);
router.get('/getCustomers', requireAuth, upload.none(), TicketsController.getCustomers);
router.get("/getDevices/:brand", requireAuth, upload.none(), gsm.getDevices);
router.delete('/delete-customer/:phone', requireAuth, upload.none(), TicketsController.deleteCustomer);

//*****************************************************************************************//
//************************************PROFILE ROUTES***************************************//
//*****************************************************************************************//
router.get("/getCategories", requireAuth, profile.getCategories);


router.get("*", (req, res) => {
    res.redirect("/not-found");
});

module.exports = router;
