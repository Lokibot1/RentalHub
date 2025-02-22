
const loginButton = document.querySelector('#login-button')
const emailField = document.querySelector('input[name="email"]')
const passwordField = document.querySelector('input[name="password"]')

loginButton.addEventListener('click', async (event) => {
    event.preventDefault()
    const email = emailField.value
    const password = passwordField.value

    console.log('hello login', email, password)

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