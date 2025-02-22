
const loginButton = document.querySelector('#login-button')
const emailField = document.querySelector('input[name="email"]')
const passwordField = document.querySelector('input[name="password"]')

loginButton.addEventListener('click', (event) => {
    event.preventDefault()

    console.log('hello login', emailField.value, passwordField.value)
})