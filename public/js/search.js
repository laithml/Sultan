let table = $('#Table').DataTable({
    data: [],
    columns: [
        {data:"img"},
        {data: "model"},
        {data: "issue"},
        {data: "status"},
        {data: "price"},
        {data: "received_date"},
        {data: "done_date"},
        {data: "Pick UP"},
        {data: "categoryId", visible: false} // Hidden column for category ID

    ]
});

let categories; // Global variable to store categories

function fetchCategories() {
    fetch('/getCategories')
        .then(response => response.json())
        .then(categoriesData => {
            categories = categoriesData; // Assign categories globally
        })
        .catch(error => console.error('Error fetching categories:', error));
}

function fetchCustomerAndTickets(phone, table) {

    let formData = new FormData();
    formData.append('phone', phone);
    console.log(phone);
    fetch('/search', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
        .then(data => {
            const customer = data;
            console.log(customer);
            $("#userInfo").html(`
                <div class="col-12">
                    <div class="row">
                        <div class="col-6">
                        <hr>
                            <p> <b>Name:</b> ${customer.name}</p>
                            <p> <b>Phone:</b> ${customer.phone}</p>
                        </div>
                    </div>
                </div>
            `);
            const tickets = customer.tickets;
            console.log(tickets);
            tickets.forEach(ticket => {
                if (ticket.img === undefined) {
                    ticket.img = "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png";
                }
                if(ticket.model === undefined){
                    ticket.model = "No Model";
                }
                if (!ticket.categoryId) {
                    ticket.categoryId = "A";
                }

                let customer1 = $('<tr>')
                    .append($('<td>').text(ticket.model))
                    .append($('<td>').html(`<img src="${ticket.img}" alt="model" width="50" height="50">`))
                    .append($('<td>').text(ticket.issue))
                    .append($('<td>').text(ticket.status))
                    .append($('<td>').text(ticket.price))
                    .append($('<td>').text(ticket.received_date))
                    .append($('<td>').text(ticket.done_date))
                    .append($('<td>').html(`<button class="btn btn-success btn-circle btn-pick" data-id="${ticket.id}" data-phone="${customer.phone}">  <i class="fas fa-check"></i> </button>`))
                    .append($('<td>').text(ticket.categoryId));
                // Set background color based on category ID
                const category = categories.find(cat => cat.id === ticket.categoryId);
                const categoryColor = category ? category.color : ''; // Default color if category not found
                customer1.css('background-color', categoryColor);

                table.row.add(customer1);
            });
            table.draw();
        })
        .catch(error => {
            $('#userInfo').text("Customer not found");
            console.error(error)
        })
    $(document).on('click', 'button.btn-pick', function () {
        let id = $(this).data('id');
        let phone = $(this).data('phone');
        //get note from back edn accord to the id\
        let formData = new FormData();
        formData.append('id', id);
        formData.append('phone', phone);
        for (var pair of formData.entries()) {
            console.log(pair[0] + ', ' + pair[1]);
        }
        fetch('/get-note', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Something went wrong');
                }
            })
            .then(data => {
                console.log(data);
                $('#note').text("");
                $('#note').text(data.note);
                $('#showNote').modal('show');

            })
        //update the status in the db when clicked on picked btn
        $("#picked").click(() => {

            let formData1 = new FormData();
            formData1.append('id', id);
            formData1.append('phone', phone);
            formData1.append('status', 'تم الاستلام');

            fetch('/picked', {
                method: 'POST',
                body: formData1
            })
                .then(response => {
                    if (response.ok) {
                    } else {
                        throw new Error('Something went wrong');
                    }
                })
                .catch(error => {
                    console.error(error);
                });
            $('#showNote').modal('hide');


        });
    });


}


fetchCategories();


$('#search').click(function (e) {
    let phone = $("#searchInput").val();
    e.preventDefault();
    table.clear();
    if (phone[0] === '0') {
        phone = phone.substring(1);
    }
    fetchCustomerAndTickets(phone, table);
});
