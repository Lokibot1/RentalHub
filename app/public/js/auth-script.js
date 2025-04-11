// Form validation function
async function signup(event) {
    event.preventDefault(); // Prevent form submission

    // Get input values
    const firstName = document.getElementById("first-name").value.trim();
    const lastName = document.getElementById("last-name").value.trim();
    const contactNumber = document.getElementById("contact-number").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    // Error elements
    const firstNameError = document.getElementById("first-name-error");
    const lastNameError = document.getElementById("last-name-error");
    const birthdateError = document.getElementById("birth-date-error");
    const contactError = document.getElementById("contact-error");
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                contact_number: contactNumber,
                email: email,
                password: password,
                confirm_password: confirmPassword
            }),
        });

        const data = await response.json();

        if ('errors' in data) {
            if(data.errors.first_name) {
                firstNameError.textContent = data.errors.first_name
            }
            if(data.errors.last_name) {
                lastNameError.textContent = data.errors.last_name
            }
            if(data.birth_date) {
                birthdateError.textContent = data.errors.birth_date
            }
            if (data.errors.email) {
                emailError.textContent = data.errors.email
            } else {
                emailError.textContent = ""
            }

            if (data.errors.password) {
                passwordError.textContent = data.errors.password
            } else {
                passwordError.textContent = ""
            }

            if (data.errors.contact_number) {
                contactError.textContent = data.errors.contact_number
            } else {
                contactError.textContent = ""
            }
        }

        if (!response.ok) {
            throw new Error(data.message || "Signup failed. Please try again.");
        }

        window.location.href = `/auth/otp?email=${data.data.email}`;
    } catch (error) {
        console.log(error.message);
    }
}

const modal = document.getElementById("terms-modal");
const openModal = document.getElementById("open-terms");
const closeModal = document.querySelector(".close-btn");
const overlay = document.getElementById("modal-overlay");

openModal.addEventListener("click", function () {
    modal.style.display = "block";
    overlay.style.display = "block";
});

closeModal.addEventListener("click", function () {
    modal.style.display = "none";
    overlay.style.display = "none";
});

overlay.addEventListener("click", function () {
    modal.style.display = "none";
    overlay.style.display = "none";
});

document.getElementById("signup-form").addEventListener("submit", function (event) {
    let checkbox = document.getElementById("terms-checkbox");

    if (!checkbox.checked) {
        alert("You must agree to the Terms and Conditions before creating an account.")
        event.preventDefault(); // Prevent form submission
    }
})

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.type = field.type === "password" ? "text" : "password";
    }
}

// Show/hide toggle button based on input value
function handlePasswordInput(fieldId) {
    const field = document.getElementById(fieldId);
    const toggle = document.getElementById(`toggle-${fieldId}`);

    if (field && toggle) {
        toggle.style.display = field.value.length > 0 ? "block" : "none";
    }
}

//date picker
var picker = new Pikaday({ field: document.getElementById('birthdate') });
