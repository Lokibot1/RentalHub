const loginButton = document.querySelector('#login-button')
const emailField = document.querySelector('input[name="email"]')
const passwordField = document.querySelector('input[name="password"]')

loginButton.addEventListener('click', async (event) => {
    event.preventDefault()
    const email = emailField.value
    const password = passwordField.value

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed. Please try again.");
        }

        localStorage.setItem("token", data.token); // Store token

        window.location.href = "/dashboard"; // Redirect to homepage
    } catch (error) {
        alert(error.message);
    }
})

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
    const contactError = document.getElementById("contact-error");
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

        localStorage.setItem("token", data.token); // Store token
        alert("Signup successful!"); // Replace this with actual form submission logic

        window.location.href = "/login"; // Redirect to homepage
    } catch (error) {
        alert(error.message);
    }
}