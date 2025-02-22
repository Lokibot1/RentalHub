
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

        window.location.href = "/"; // Redirect to homepage
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

    // console.log('hello signup', firstName, lastName, contactNumber, email, password, confirmPassword)

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                contact_number: contactNumber,
                email: email,
                password: password
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Signup failed. Please try again.");
        }

        localStorage.setItem("token", data.token); // Store token
        alert("Signup successful!"); // Replace this with actual form submission logic

        window.location.href = "/login"; // Redirect to homepage
    } catch (error) {
        alert(error.message);
    }

    /*
    let valid = true;

    //  Validate Contact Number (10-12 digits)
    if (!/^\d{10,12}$/.test(contactNumber)) {
        contactError.textContent = "Contact number must be 10-12 digits.";
        valid = false;
    } else {
        contactError.textContent = "";
    }

    //  Validate Email Format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = "Enter a valid email address.";
        valid = false;
    } else {
        emailError.textContent = "";
    }

    //  Validate Password Strength (8+ characters, at least one letter and number)
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
        passwordError.textContent = "Password must be at least 8 characters, include letters and numbers.";
        valid = false;
    } else if (password !== confirmPassword) {
        passwordError.textContent = "Passwords do not match.";
        valid = false;
    } else {
        passwordError.textContent = "";
    }

    // If all validations pass, submit the form
    if (valid) {
        alert("Signup successful!"); // Replace this with actual form submission logic
        document.getElementById("signup-form").submit();
    }
    */
}