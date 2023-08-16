const {doc, setDoc, deleteDoc, getDoc, updateDoc, collection, getDocs} = require("firebase/firestore");
const {db} = require("../config/Firebase");


exports.getLiveTicket = (req, res) => {
    console.log('get live ticket called');
    const {id, phone} = req.body;

    const liveRef = doc(db, 'live-tickets', id);
    getDoc(liveRef).then((docc) => {
        const ticket = docc.data();
        console.log(ticket);
        res.status(200).send(JSON.stringify(ticket));
    });
}

exports.updateTicket = (req, res) => {
    console.log('update ticket called');
    const {id, phone, issue, passcode, price} = req.body;
    console.log(id, phone, issue, passcode, price);
    const liveRef = doc(db, 'live-tickets', id);
    const noteRef = doc(db, 'customers', phone);
    getDoc(liveRef).then((docc) => {
        const ticket = docc.data();
        ticket.issue = issue;
        ticket.passcode = passcode;
        ticket.price = price;
        updateDoc(liveRef, ticket).then(() => {
            getDoc(noteRef).then((docss) => {
                let note = docss.data();
                const tickets = note.tickets;
                tickets.forEach((ticket) => {
                    if (ticket.id === id) {
                        ticket.issue = issue;
                        ticket.passcode = passcode;
                        ticket.price = price;
                    }
                });
                updateDoc(noteRef, note).then(() => {
                    res.status(200).send('Ticket updated successfully');
                });
            })
        });
    });
}


exports.doneTicket = (req, res) => {
    console.log('done ticket called');
    let {id, phone, note, price,status} = req.body;

    console.log("id", id);
    console.log("phone", phone);
    console.log("note", note);
    console.log("price", price);
    console.log("status", status);



    //remove ticket from live tickets
    const liveRef = doc(db, 'live-tickets', id);
    const custRef = doc(db, 'customers', phone);
    deleteDoc(liveRef).then(() => {
        getDoc(custRef).then((doc) => {
            const cust = doc.data();
            const tickets = cust.tickets;
            tickets.forEach((ticket) => {
                if (ticket.id === id) {
                    //add note to ticket
                    ticket.note = note;
                    ticket.status = status;
                    ticket.price=price;
                    //set done date to today and format it to yyyy-mm-dd hour:minute format
                    const today = new Date();
                    const date = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
                    const time = today.getHours() + ":" + today.getMinutes();
                    ticket.done_date = date + ' ' + time;
                }
            });
            updateDoc(custRef, cust).then(() => {
                res.status(200).send('Ticket updated successfully');
            });
        });
    });
}

exports.deleteTicket = (req, res) => {
    console.log('delete Ticket called');
    const id = req.params.id;
    const phone = req.params.phone;
    const noteRef = doc(db, 'live-tickets', id);
    const noteUserRef = doc(db, 'customers', phone);
    deleteDoc(noteRef).then(() => {
        getDoc(noteUserRef).then((doc) => {
            const cust = doc.data();
            const tickets = cust.tickets;
            //delete the tickets from the customer
            const index = tickets.findIndex((ticket) => ticket.id === id);
            tickets.splice(index, 1);
            //update the customer
            updateDoc(noteUserRef, cust).then(() => {
                res.status(200).send('Ticket deleted successfully');
            });
        });
    });

}

exports.getNote = (req, res) => {
    console.log("get note called");
    const {id, phone} = req.body;
    const noteRef = doc(db, 'notes', id);
    getDoc(noteRef).then((docc) => {
        if (docc.exists()) {
            const note = docc.data();
            res.status(200).send(note);

        } else {
            const ref = doc(db, 'customers', phone);
            getDoc(ref).then((doc) => {
                if (doc.exists()) {
                    const customer = doc.data();
                    const ticket = customer.tickets.find((ticket) => ticket.id === id);
                    res.status(200).send(ticket);
                } else {
                    res.status(500).send('Customer not found');
                }
            });
        }
    });
}

exports.getLive = (req, res) => {
    //get all live tickets collection
    console.log('get live called');
    const liveRef = collection(db, 'live-tickets');
    getDocs(liveRef).then((snapshot) => {
        const liveTickets = [];
        snapshot.forEach((doc) => {
            const data = doc.data();

            // Check if the 'img' field exists. If not, set a default value.
            if (!data.img || data.img === "null") {
                data.img = "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png";
            }

            // Check if the 'model' field exists. If not, set a default value.
            if (!data.model) {
                data.model = "Default Model"; // replace "Default Model" with whatever default value you want
            }

            liveTickets.push(data);
        });
        res.send(liveTickets);
    }).catch((error) => {
        console.error(error);
        res.status(500).send('Error getting live tickets');
    });
}


exports.picked = (req, res) => {
    console.log('picked called');
    const {id, phone, status} = req.body;
    console.log(id, phone, status);
    const custRef = doc(db, 'customers', phone);
    //delete the note from note collection
    const noteRef = doc(db, 'notes', id);

    //check if the ticket is in live tickets and delete it if its there
    const liveRef = doc(db, 'live-tickets', id);
    getDoc(liveRef).then((doc) => {
        if (doc.exists()) {
            deleteDoc(liveRef).then();
        }
    });

    deleteDoc(noteRef).then();

    //update the status of this ticket in customers collection
    getDoc(custRef).then((dd) => {
        const cust = dd.data();
        console.log(cust);
        const tickets = cust.tickets;
        tickets.forEach((ticket) => {
            if (ticket.id === id) {
                ticket.status = status;
                //push back to database
                updateDoc(custRef, cust).then(() => {
                    res.status(200).send('Ticket updated successfully');
                });
            }
        });
    });

}
