const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const {auth, db} = require('./config/Firebase');
const {
    createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut
} = require('firebase/auth');
const {doc, setDoc, updateDoc, getDoc, collection, getDocs, deleteDoc} = require('firebase/firestore');
const app = express();
const upload = multer();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use("/public", express.static(__dirname + '/public'));
app.set("view engine", "ejs");
app.set("views", "./views");
app.use('/', require("./route/router"));


const twilio = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);


app.post('/send-sms', upload.none(), async (req, res) => {
    try {
        const { to, template, params } = req.body;
        const parsedParams = JSON.parse(params || '[]');

        let contentSid = '';

        // Match the template name to the correct Content SID
        if (template === 'repaired_msg_1') {
            contentSid = 'HXfdcbb76d6237a906f72e1760c6ba1923';
        } else if (template === 'refused') {
            contentSid = 'HX113d15529b23c0ab561d6a2a721ad174';
        } else if (template === 'unrepaired_msg') {
            contentSid = 'HX1f0e3e10171b949b49bf9e8bf2e32bf9';
        } else {
            return res.status(400).send('Invalid template name');
        }

        const messageData = {
            from: 'whatsapp:+97225853259', // Your Twilio WhatsApp sender
            to: `whatsapp:${to}`,
            contentSid: contentSid,
        };

        if (parsedParams.length > 0) {
            // If there are variables like {{1}}
            const contentVariables = {};

            // Twilio expects variables as { "1": "value1", "2": "value2", ... }
            parsedParams.forEach((param, index) => {
                contentVariables[(index + 1).toString()] = param;
            });

            messageData.contentVariables = JSON.stringify(contentVariables);
        }

        await client.messages.create(messageData);

        res.send('✅ Template message sent successfully!');
    } catch (error) {
        console.error('❌ Error sending template message:', error.message);
        res.status(500).send('Error sending template message');
    }
});




//register auth
app.post('/register', upload.none(), (req, res) => {
    const {email, password} = req.body;
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            res.status(200);
        })
        .catch(() => {
            res.status(500);
        });
});


//login auth

app.post("/login", upload.none(), (req, res) => {
    const {email, password} = req.body;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // User signed in successfully
            const user = userCredential.user;
            res.status(200).send({message: "Login successful"});
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(error);
            res.status(500).send({message: "Login failed"});
        });
});

app.post('/logout', upload.none(), (req, res) => {
    signOut(auth)
        .then(() => {
            res.sendStatus(200); // Sending 200 OK status
        })
        .catch((error) => {
            console.error(error);
            res.sendStatus(500); // Sending 500 Internal Server Error status
        });
});


//check auth


//add customer to database
app.post('/add-customer', upload.none(), (req, res) => {
    console.log("add customer called");
    console.log(req.body);
    const {name, phone, issue, passcode, status, price, received_date, done_date,brand,model,img,categoryId} = req.body;
    //generate random ticket id for each customer
    const ticketId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const customer = {
        name: name, phone: phone, tickets: []
    }
    const ticket = {
        id: ticketId,
        issue: issue,
        passcode: passcode,
        status: status,
        price: price,
        received_date: received_date,
        done_date: done_date,
        brand:brand,
        model:model,
        img:img,
        categoryId:categoryId
    }

    const custRef = doc(db, 'customers', phone);
    const liveRef = doc(db, 'live-tickets', ticketId);

    getDoc(custRef).then((doc) => {

        if (doc.exists()) {
            const cust = doc.data();
            cust.name = customer.name;
            if (cust.tickets) {
                cust.tickets.push(ticket);
            } else {
                cust.tickets = [ticket];
            }

            updateDoc(custRef, cust).then(() => {
                ticket.name = customer.name;
                ticket.phone = customer.phone;
                setDoc(liveRef, ticket).then(() => {
                    res.status(200).send('Customer added successfully');
                });
            });
        } else {
            customer.tickets = [ticket];
            setDoc(custRef, customer).then(() => {
                ticket.name = customer.name;
                ticket.phone = customer.phone;
                setDoc(liveRef, ticket).then(() => {
                    res.status(200).send('Customer added successfully');
                });
            });
        }
    });
});
app.post('/search', upload.none(), (req, res) => {
    //get all live tickets collection
    console.log('search by number');
    let {phone} = req.body;
    console.log(phone);
    const custRef = doc(db, 'customers', phone);
    getDoc(custRef).then((doc) => {
        if (doc.exists()) {
            const customer = doc.data();
            res.send(customer);
        } else {
            res.status(500).send('Customer not found');
        }
    });


});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});

