document.addEventListener("DOMContentLoaded", function () {
    // Attach form validation when the page loads
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", validateForm);
    }
});

/*
    Note: 
    In a real application, you would send the form data to a server for processing.
    This example demonstrates client-side form validation only.
    The backend should always validate the data again to prevent tampering.
*/
// Form validation function
function validateForm(event) {
    event.preventDefault(); // Prevent form submission

    // Get input values
    const firstName = document.getElementById("first-name")?.value.trim();
    const lastName = document.getElementById("last-name")?.value.trim();
    const contactNumber = document.getElementById("contact-number")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("signup-password")?.value;
    const confirmPassword = document.getElementById("confirm-password")?.value;

    // Error elements
    const contactError = document.getElementById("contact-error");
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

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
}


// CHECK IF USER IS LOGGED IN (PROTECTED ROUTES)
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (token) {
        fetch("/api/auth/protected", {
            method: "GET",
            headers: { Authorization: token },
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.success) {
                    localStorage.removeItem("token"); // Clear invalid token
                    window.location.href = "/login"; // Redirect to login
                }
            })
            .catch(() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
            });
    }
});

/*
*/

// LOGOUT FUNCTIONALITY
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token"); // Remove token
        alert("Logged out successfully");
        window.location.href = "login.html"; // Redirect to login
    });
}

//  TOGGLE PASSWORD VISIBILITY
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.type = field.type === "password" ? "text" : "password";
    }
}

// Drag scrolling functional

const carousel = document.querySelector(".carousel-container");

let isDown = false;
let startX;
let scrollLeft;

carousel.addEventListener("mousedown", (e) => {
    isDown = true;
    carousel.classList.add("active");
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
});

carousel.addEventListener("mouseleave", () => {
    isDown = false;
    carousel.classList.remove("active");
});

carousel.addEventListener("mouseup", () => {
    isDown = false;
    carousel.classList.remove("active");
});

carousel.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2; // Adjust for smoothness
    carousel.scrollLeft = scrollLeft - walk;
});

// Toggle between renter and owner
document.addEventListener("DOMContentLoaded", function () {
    const renterBtn = document.getElementById("renterBtn");
    const ownerBtn = document.getElementById("ownerBtn");
    const slider = document.querySelector(".toggle-slider");
    const renterContent = document.getElementById("renterContent");
    const ownerContent = document.getElementById("ownerContent");

    // Default state: Show "For Renters" and position the slider
    slider.style.transform = "translateX(0%)";
    renterBtn.style.color = "#12263f";
    ownerBtn.style.color = "white";
    renterContent.style.display = "block"; // Show renters section
    ownerContent.style.display = "none";   // Hide owners section

    renterBtn.addEventListener("click", function () {
        slider.style.transform = "translateX(0%)";
        renterBtn.style.color = "#12263f";
        ownerBtn.style.color = "white";
        renterContent.style.display = "block";  // Show renters section
        ownerContent.style.display = "none";    // Hide owners section
    });

    ownerBtn.addEventListener("click", function () {
        slider.style.transform = "translateX(100%)";
        ownerBtn.style.color = "#12263f";
        renterBtn.style.color = "white";
        renterContent.style.display = "none";   // Hide renters section
        ownerContent.style.display = "block";   // Show owners section
    });
});

// Toggle between renter and owner    
document.addEventListener("DOMContentLoaded", function () {
    const renterBtn = document.getElementById("renterBtn");
    const ownerBtn = document.getElementById("ownerBtn");
    const slider = document.querySelector(".toggle-slider");
    const renterContent = document.getElementById("renterContent");
    const ownerContent = document.getElementById("ownerContent");

    // Default state: Show "For Renters" and position the slider
    slider.style.transform = "translateX(0%)";
    renterBtn.style.color = "#12263f";
    ownerBtn.style.color = "white";
    renterContent.style.display = "block";
    ownerContent.style.display = "none";

    renterBtn.addEventListener("click", function () {
        slider.style.transform = "translateX(0%)";
        renterBtn.style.color = "#12263f";
        ownerBtn.style.color = "white";
        renterContent.style.display = "block";
        ownerContent.style.display = "none";
    });

    ownerBtn.addEventListener("click", function () {
        slider.style.transform = "translateX(100%)";
        ownerBtn.style.color = "#12263f";
        renterBtn.style.color = "white";
        renterContent.style.display = "none";
        ownerContent.style.display = "block";
    });
});


// Slideshow for Renters and Owners
// Image arrays for Renters and Owners
const renterImages = [
    "magnifyingglass.png",
    "request.png",
    "recieve.png"
];

const ownerImages = [
    "howitworksowner1.png",
    "howitworksowner2.png",
    "howitoworksowner3.png",
    "howitowrksowner4.png"
];

let renterIndex = 0;
let ownerIndex = 0;

function changeRenterImage() {
    renterIndex = (renterIndex + 1) % renterImages.length;
    document.getElementById("renterImage").style.opacity = 0; // Fade out
    setTimeout(() => {
        document.getElementById("renterImage").src = `/images/${renterImages[renterIndex]}`;
        document.getElementById("renterImage").style.opacity = 1; // Fade in
    }, 500);
}

function changeOwnerImage() {
    ownerIndex = (ownerIndex + 1) % ownerImages.length;
    document.getElementById("ownerImage").style.opacity = 0; // Fade out
    setTimeout(() => {
        document.getElementById("ownerImage").src = `/images/${ownerImages[ownerIndex]}`;
        document.getElementById("ownerImage").style.opacity = 1; // Fade in
    }, 500);
}

setInterval(changeRenterImage, 3000);
setInterval(changeOwnerImage, 3000);

document.getElementById("renterBtn").addEventListener("click", () => {
    document.getElementById("renterContent").style.display = "block";
    document.getElementById("ownerContent").style.display = "none";
});

document.getElementById("ownerBtn").addEventListener("click", () => {
    document.getElementById("renterContent").style.display = "none";
    document.getElementById("ownerContent").style.display = "block";
});