jQuery.extend(jQuery.fn.dataTableExt.oSort, {
    "date-custom-pre": function (a) {
        let dateTime = a.split(' ');
        let date = dateTime[0].split('/');
        let time = dateTime[1].split(':');

        // Ensure two digits for day, month, and hour
        let day = date[0].padStart(2, '0');
        let month = date[1].padStart(2, '0');
        let year = date[2];
        let hour = time[0].padStart(2, '0');
        let minute = time[1].padStart(2, '0');

        // Create a string in the format YYYYMMDDHHmm
        return year + month + day + hour + minute;
    },
    "date-custom-asc": function (a, b) {
        return a.localeCompare(b);
    },
    "date-custom-desc": function (a, b) {
        return b.localeCompare(a);
    }
});

$(document).ready(() => {
    // Initialize DataTables with empty data
    let table = $('#Customers').DataTable({
        data: [],
        pageLength: 100,
        columns: [
            {data: "name"},
            {data: "phone"},
            {data: "last_visited"},
            {data: "Done"}
        ],
        order: [[2, "desc"]]
    });

    fetch('/getCustomers')
        .then(response => response.json())
        .then(data => {
            table.clear();
            Object.values(data).forEach(customer => {
                const lastTicket = customer.tickets.slice(-1)[0]; // Get the last element of the tickets array
                let row = $('<tr>')
                    .append($('<td>').html(customer.name))
                    .append($('<td>').html(customer.phone))
                    .append($('<td>').html(lastTicket ? lastTicket.received_date || lastTicket.done_date : ''))
                    .append($('<td>').html('<button class="btn btn-danger btn-circle btn-delete" data-id="' + customer.phone + '"><i class="fas fa-minus-circle"></i></button>'));
                table.rows.add(row);

            });
            table.draw();
        });

    $('#Customers tbody').on('click', '.btn-delete', function () {
        let phone = $(this).data('id');
        let row = $(this).closest('tr');
        $.ajax({
            url: '/delete-customer/' + phone,
            type: 'delete',
            success: function (response) {
                // Since your server only sends a status code, check if the response is empty
                if (!response) {
                    row.remove();
                } else {
                    alert('Failed to delete customer');
                }
            }
        });
    });

});
