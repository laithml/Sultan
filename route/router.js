const express = require("express");
const router = express.Router();

const HomeController = require("../controllers/HomeController");
const TicketsController = require("../controllers/TicketsController");
const requireAuth = require("../Middleware/mid");
const multer = require("multer");
const gsm = require("../controllers/gsm");
const upload = multer();

router.get("/", requireAuth, HomeController.Main);

router.get("/login", HomeController.login);

router.get("/register", HomeController.register);

router.get("/search", requireAuth, HomeController.search);

router.get("/tickets", requireAuth, HomeController.tickets);

router.get("/not-found", HomeController.notFound);


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

router.get("/getDevices/:brand", requireAuth, upload.none(), gsm.getDevices);

router.get("*", (req, res) => {
    res.redirect("/not-found");
});

module.exports = router;
