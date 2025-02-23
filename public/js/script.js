function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function deleteCookie(name) {
    document.cookie = `${name}=; Max-Age=0; path=/;`;
}


// Initialize the auth status
document.addEventListener("DOMContentLoaded", () => {
    const token = getCookie("token");

    if (token) {
        fetch("/api/auth/check-auth", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify({ token }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.isAuthenticated) {
                    document.getElementById("auth-status").innerHTML = `<a href='/logout' id='logout-link'>Logout</a>`;
                } else {
                    document.getElementById("auth-status").innerHTML = `<a href='/login'>Login</a>`;
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    // Add event listener for logout link
    document.addEventListener("click", (event) => {
        if (event.target && event.target.id === "logout-link") {
            deleteCookie("token"); // Remove token from cookies
            window.location.href = "/login"; // Redirect to /logout route
        }
    });
});


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