let selectedBrand = null;
let selectedModel = null;
let selectedImg = null;

document.querySelectorAll('.brand-icon').forEach(icon => {
    let modelDropdown = document.getElementById('phoneModel');

    icon.addEventListener('click', async function() {
        // Remove selection from all icons
        document.querySelectorAll('.brand-icon').forEach(i => i.classList.remove('selected'));

        // Mark the clicked icon as selected
        this.classList.add('selected');

         selectedBrand = this.dataset.brand;

        // Clear existing options
        modelDropdown.innerHTML = '<option value="">Select Model</option>';

        // Fetch models based on selected brand from API
        let response = await fetch("/getDevices/"+ selectedBrand);
        let models = await response.json();

        // Populate the dropdown
        models.forEach(model => {
            let option = document.createElement('option');
            console.log(model);
            option.value = model.name;
            option.innerText = model.name;
            option.dataset.image = model.img;
            modelDropdown.appendChild(option);
        });

        // Hide the image until a model is selected
        document.getElementById('phoneImage').style.display = 'none';
    });
    modelDropdown.addEventListener('change', function() {
        console.log("Dropdown change event triggered");

        // Retrieve the selected option
         selectedModel = this.options[this.selectedIndex];

        console.log(selectedModel.value);
        // Retrieve the image URL from the data-image attribute
         selectedImg = selectedModel.dataset.image;
         selectedModel = selectedModel.value;
        // Get the phoneImage element
        const phoneImage = document.getElementById('phoneImage');

        if (selectedImg) {
            phoneImage.src = selectedImg;
            phoneImage.style.display = 'block';
        } else {
            // If for some reason there's no imageUrl, keep the image hidden
            phoneImage.style.display = 'none';
        }
    });


});




function validateEmail(email) {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function validateForm(email, password, passwordRepeat) {
    const errors = [];

    if (!validateEmail(email)) {
        errors.push('Invalid email');
    }

    if (!validatePassword(password)) {
        errors.push('Password must be at least 8 characters long');
    }

    if (password !== passwordRepeat) {
        errors.push('Passwords do not match');
    }

    return errors;
}

export function sendSms(to, body) {
    const formData = new FormData();
    formData.append('to', to);
    formData.append('body', body);
    fetch('/send-sms', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                alert('Failed to send SMS.');
            }
        })
        .catch(error => {
            console.error(error);
        });
}


function generateBarcode(phone,name,passcode) {
    $("#barcode").JsBarcode(phone,{
        width:8,
        height:90,
        displayValue: false});
    let canvas = document.getElementById("barcode");
    let dataUrl = canvas.toDataURL();
    let windowContent = '<!DOCTYPE html>';
    windowContent += '<html>';
    windowContent += '<head><title>Print canvas</title></head>';
    windowContent += '<body>';
    windowContent += '<img src="' + dataUrl + '" style="max-width: 40mm; max-height: 100mm;">';
    windowContent += '<p style="align-content: center; font-size: 14px;">' + name +" , "+phone + ", "+ passcode + '</p>';
    windowContent += '</body>';
    windowContent += '</html>';

    let printWin = window.open('', '', 'width=600,height=320');
    printWin.document.open();
    printWin.document.write(windowContent);
    printWin.document.close();
    printWin.focus();
    setTimeout(function () {
        printWin.print();
    }, 500);
    setTimeout(function () {
        printWin.close();
    }, 1000);
}



$("#registerBtn").click(function () {
    let email = $("#email").val();
    let password = $("#password").val();
    let passwordRepeat = $("#passwordRepeat").val();
    let errors = validateForm(email, password, passwordRepeat);
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    if (errors.length === 0) {
        fetch('/register', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    window.location.href = "login";
                } else {
                    throw new Error('Something went wrong');
                }
            })
            .catch(error => {
                console.error(error);
                alert('An error occurred while registering.');
            });
    }
    //error with validation form
    else {
        alert(errors);
    }
});

$("#loginBtn").click(function (e) {
    e.preventDefault();
    let email = $("#emailIn").val();
    let password = $("#passwordIn").val();
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    fetch('/login', {
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
            localStorage.setItem('token', data.token);
            window.location.href = "/";
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred while logging in.');
        });
});

function validatePhone(phone) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
}

$("#addBtn").click(function (event) {
    event.preventDefault();
    const today = new Date();
    const date = today.getFullYear() + '/' + (today.getMonth() + 1) + '/' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes();
    const Customer = {
        name: $("#name").val(),
        phone: $("#tel").val(),
        issue: $("#issue").val(),
        passcode: $("#passcode").val(),
        status: "فالصيانة",
        price: $("#price").val(),
        received_date: date + ' ' + time,
        done_date: "--",
        brand:selectedBrand,
        model:selectedModel,
        img:selectedImg
    }
    //validate phone
    if (!validatePhone(Customer.phone)) {
        alert("Invalid phone number");
        return;
    }
    if (Customer.phone[0] === '0') {
        Customer.phone = Customer.phone.substring(1);
    }
    //add customer to db
    const formData = new FormData();
    formData.append('name', Customer.name);
    formData.append('phone', Customer.phone);
    formData.append('issue', Customer.issue);
    formData.append('passcode', Customer.passcode);
    formData.append('status', Customer.status);
    formData.append('price', Customer.price);
    formData.append('received_date', Customer.received_date);
    formData.append('done_date', Customer.done_date);
    formData.append('brand', Customer.brand);
    formData.append('model', Customer.model);
    formData.append('img', Customer.img);

    fetch('/add-customer', {
        method: 'POST',
        body: formData

    })
        .then(response => {
            if (response.ok) {
                generateBarcode(Customer.phone,Customer.name,Customer.passcode);
                const overlay = $('<div>').css({
                    'position': 'fixed',
                    'top': '0',
                    'left': '0',
                    'width': '100%',
                    'height': '100%',
                    'background-color': 'rgba(0, 0, 0, 0.5)',
                    'z-index': '9999'
                });
                $('body').append(overlay);
                setTimeout(function () {
                    overlay.remove();
                    window.location.href = "/";
                }, 1000);
            } else {
                throw new Error('Something went wrong');
            }
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred while adding the customer.');
        });


});


$("#logout").click(function () {
    fetch('/logout', {
        method: 'POST'
    })
        .then(response => {
            if (response.ok) {
                // Redirect to the login page or perform any other desired action
                window.location.href = "/login";
            } else {
                throw new Error('Failed to logout');
            }
        })
        .catch(error => {
            console.error(error);
            alert('An error occurred while logging out.');
        });
});
