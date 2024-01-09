import {sendSms} from "./script.js";
//TODO: add a note when received a ticket, edit button,search by name also,timer to print waiting
// Custom sorting extension for DataTables
jQuery.extend(jQuery.fn.dataTableExt.oSort, {
    "date-custom-pre": function(a) {
        let dateTime = a.split(' ');
        let date = dateTime[0].split('/');
        let time = dateTime[1].split(':');

        // ensure two digits for day and month
        let day = date[2].padStart(2, '0');
        let month = date[1].padStart(2, '0');

        let year = date[0];
        let hour = time[0].padStart(2, '0');
        let minute = time[1].padStart(2, '0');

        return year + month + day + hour + minute;
    },
    "date-custom-asc": function(a, b) {
        return a.localeCompare(b);
    },
    "date-custom-desc": function(a, b) {
        return b.localeCompare(a);
    }
});

let categories = []; // Define categories globally

$(document).ready(() => {
    let table = $('#Tickets').DataTable({
        data: [],
        pageLength: 100,
        columns: [
            { data: "img" },
            { data: "model" },
            { data: "name" },
            { data: "phone" },
            { data: "issue" },
            { data: "passcode" },
            { data: "price" },
            { data: "received_date", type: "date-custom" },
            { data: "category", visible: false }, // Hidden column for category ID
            { data: "Done" }
        ],
        order: [[7, "desc"]]
    });

    // Fetch data from backend server
    function fetchLiveTickets() {
        fetch('/get-live')
            .then(response => response.json())
            .then(data => {
                // Create rows in DataTables with fetched data
                table.clear();
                Object.values(data).forEach(row => {
                    let customer = $('<tr>')
                        .append($('<td>').html(`<img src="${row.img}" alt="image" width="75" height="75">`))
                        .append($('<td>').text(row.model))
                        .append($('<td>').text(row.name))
                        .append($('<td>').text(row.phone))
                        .append($('<td>').text(row.issue))
                        .append($('<td>').text(row.price))
                        .append($('<td>').text(row.passcode))
                        .append($('<td>').text(row.received_date))
                        .append($('<td>').text(row.categoryId)) // Hidden column for category ID
                        .append($('<td>').html(`<button class="btn btn-success btn-circle btn-done" data-id="${row.id}" data-price="${row.price}" data-phone="${row.phone}">  <i class="fas fa-check"></i> </button>
                                              <button class="btn btn-secondary btn-circle btn-edit" data-id="${row.id}" data-phone="${row.phone}"> <i class="fas fa-edit"></i> </button>
                                              <button class="btn btn-danger btn-circle btn-delete" data-id="${row.id}" data-phone="${row.phone}"> <i class="fas fa-minus-circle"></i> </button>`));

                    const category = categories.find(cat => cat.id === row.categoryId);
                    const categoryColor = category ? category.color : ''; // Default color if category not found
                    customer.css('background-color', categoryColor);

                    table.row.add(customer);
                });
                table.draw();
            })
            .catch(error => console.error(error));
    }

    function fetchCategories() {
        fetch('/getCategories')
            .then(response => response.json())
            .then(categoriesData => {
                categories = categoriesData; // Assign categories globally
                updateFilterBar(categories);
                fetchLiveTickets(); // Fetch tickets after categories are loaded
            })
            .catch(error => console.error('Error fetching categories:', error));
    }

    // Update the filter bar with category bubbles
    function updateFilterBar(categories) {
        const filterBar = $('#filterBar');

        // Clear existing filter bar
        filterBar.empty();

        // Add "All" category bubble
        const allCategoryBubble = $('<div class="category-bubble" data-category-id="A">All</div>');
        allCategoryBubble.css('background-color', '#fff');
        filterBar.append(allCategoryBubble);

        // Add category bubbles
        categories.forEach(category => {
            const categoryBubble = $(`<div class="category-bubble" data-category-id="${category.id}">${category.name}</div>`);
            categoryBubble.css('background-color', category.color);
            filterBar.append(categoryBubble);
        });

        // Add click event to category bubbles
        $('.category-bubble').on('click', function () {
            const selectedCategoryId = $(this).data('category-id');
            filterTableByCategory(selectedCategoryId);
        });
    }

    function filterTableByCategory(selectedCategory) {
        if (selectedCategory === "A") {
            // Clear the category filter
            table.column(8).search('').draw();
        } else {
            // Filter by the selected category
            table.column(8).search(selectedCategory);
            table.draw(); // Draw after setting the search term
        }
    }



    // Fetch categories and live tickets on page load
    fetchCategories();
    setInterval(fetchLiveTickets, 500000);

    $(document).on('click', 'button.btn-delete', function () {
        const id = $(this).data('id');
        const phone = $(this).data('phone');
        fetch('/delete-ticket/' + phone + "/" + id, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    window.location.href = "tickets";
                }
            })
            .catch(error => console.log(error));
    });
    $(document).on('click', 'button.btn-edit', function () {
        const id = $(this).data('id');
        const phone = $(this).data('phone');
        const formData = new FormData();
        formData.append('id', id);
        formData.append('phone', phone);
        console.log(id, phone);
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
                $("#issue").val(data.issue);
                $("#price").val(data.price);
                $("#passcode").val(data.passcode);
                $("#editModal").modal('show');

                $("#update").click(() => {
                    let issue = $("#issue").val();
                    let price = $("#price").val();
                    let passcode = $("#passcode").val();
                    console.log(issue, price, passcode, id, phone);
                    const formData = new FormData();
                    formData.append('id', id);
                    formData.append('phone', phone);
                    formData.append('issue', issue);
                    formData.append('price', price);
                    formData.append('passcode', passcode);
                    fetch('/update-ticket', {
                        method: 'PUT',
                        body: formData
                    })
                        .then(response => {
                            if (response.ok) {
                                window.location.href = "tickets";
                            } else {
                                throw new Error('Something went wrong');
                            }
                        })
                        .catch(error => console.log(error));
                });
            })
            .catch(error => console.log(error));
    });


    $(document).on('click', 'button.btn-done', function () {
        console.log('done');
        let phone = $(this).data('phone');
        let id = $(this).data('id');
        let price = $(this).data('price');
        console.log(phone, id, price);
        let phoneNumber = '+972' + $(this).data('phone');
        const formData = new FormData();
        formData.append('id', id);
        formData.append('phone', phone);
        $('#final_price').val(price);
        $('#noteModal').modal('show');

        //get data from noteModal
        $('#addNote').click(function () {
            //get the radio option
            let note = $('#note').val();
            let price = $('#final_price').val();

            if (price.trim() === '') {
                alert('Please enter a price.');
                return;
            }
            formData.append('note', note);
            formData.append('price', price);
            formData.append('status', "done");


            fetch('/done-ticket', {
                method: 'POST', body: formData
            }).then(response => {
                if (response.ok) {
                    let msg = "Your phone is ready to pick up, please come to the store to pick it up\n" +
                        "Thank you for choosing us\n" +
                        "Total price: " +price + " ₪\n" +
                        "Sultan Technology - 025853259\n"+
                        "The store is not responsible for the phone after 7 days from receiving this message.";
                    // let msg= "هاتفك جاهز للاستلام ، يرجى الحضور إلى المتجر لاستلامه\n"+
                    //     "شكرا لك لاختيارنا\n"
                    // +"السعر الإجمالي: "+ price+"\n"
                    // +"سلطان للتكنولوجيا - 025853259\n"+
                    //     "المتجر غير مسئول عن الهاتف بعد 7 أيام من استلام هذه الرسالة.\n" ;
                    sendSms(phoneNumber, msg);
                    window.location.href = "tickets";
                } else {
                    throw new Error('Network response was not ok');
                }
            })
                .catch(error => console.log(error));
        });
    });
});
