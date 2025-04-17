document.addEventListener("DOMContentLoaded", function () {
    // Attach form validation when the page loads
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", validateForm);
    }
});

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
        passwordError.textContent =
            "Password must be at least 8 characters, include letters and numbers.";
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

//  LOGIN FUNCTIONALITY
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = document.querySelector("#login-email")?.value.trim();
            const password = document.querySelector("#login-password")?.value.trim();

            try {
                const response = await fetch("http://localhost:5000/login", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({email, password}),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Login failed. Please try again.");
                }

                localStorage.setItem("token", data.token); // Store token
                alert("Login successful!");
                window.location.href = "index.html"; // Redirect to homepage
            } catch (error) {
                alert(error.message);
            }
        });
    }
});

// CHECK IF USER IS LOGGED IN (PROTECTED ROUTES)
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (token) {
        fetch("http://localhost:5000/protected", {
            method: "GET",
            headers: {Authorization: token},
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.success) {
                    localStorage.removeItem("token"); // Clear invalid token
                    window.location.href = "login.html"; // Redirect to login
                }
            })
            .catch(() => {
                localStorage.removeItem("token");
                window.location.href = "login.html";
            });
    }
});

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
    ownerContent.style.display = "none"; // Hide owners section

    renterBtn.addEventListener("click", function () {
        slider.style.transform = "translateX(0%)";
        renterBtn.style.color = "#12263f";
        ownerBtn.style.color = "white";
        renterContent.style.display = "block"; // Show renters section
        ownerContent.style.display = "none"; // Hide owners section
    });

    ownerBtn.addEventListener("click", function () {
        slider.style.transform = "translateX(100%)";
        ownerBtn.style.color = "#12263f";
        renterBtn.style.color = "white";
        renterContent.style.display = "none"; // Hide renters section
        ownerContent.style.display = "block"; // Show owners section
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
    "magnifying-glass.png",
    "receive.png",
    "request.png",
];

const ownerImages = [
    "owner-image-1.png",
    "owner-image-2.png",
    "owner-image-3.png",
    "owner-image-4.png",
];

let imageIndex = 0;

function createImageRotator(element, directory, imageArray) {
    let imageIndex = 0;

    return function () {
        imageIndex = (imageIndex + 1) % imageArray.length;
        document.getElementById(element).style.opacity = 0; // Fade out

        setTimeout(() => {
            document.getElementById(element).src = `/images/how-rentalhub-works/${directory}/${imageArray[imageIndex]}`;
            document.getElementById(element).style.opacity = 1; // Fade in
        }, 500);
    };
}

const renterImageRotator = createImageRotator("renterImages", 'renter', renterImages);
const ownerImageRotator = createImageRotator("ownerImages", 'owner', ownerImages);

setInterval(renterImageRotator, 3000);
setInterval(ownerImageRotator, 3000);


document.getElementById("renterBtn").addEventListener("click", () => {
    document.getElementById("renterContent").style.display = "block";
    document.getElementById("ownerContent").style.display = "none";
});

document.getElementById("ownerBtn").addEventListener("click", () => {
    document.getElementById("renterContent").style.display = "none";
    document.getElementById("ownerContent").style.display = "block";
});

//Active button
var header = document.querySelector(".categories-cont");
var btns = header.getElementsByClassName("category");

for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
        var current = document.querySelector(".category.active");
        if (current) {
            current.classList.remove("active");
        }
        this.classList.add("active");
    });
}

//For Listings
//Shopping Side(Display)
document.addEventListener("DOMContentLoaded", function () {
    let items = JSON.parse(localStorage.getItem("items")) || [];

    let shoppingContainer = document.createElement("div");
    shoppingContainer.id = "shoppingContainer"; //For CSS

    let shoppingList = document.createElement("ul");
    shoppingList.id = "shoppingList"; //For CSS

    items.forEach((item) => {
        let li = document.createElement("li");
        li.className = "shoppingItem"; //For CSS

        li.innerHTML = `
  <img src="${item.image}" alt="Item Image" class="itemImage">
  <br>
  <strong>${item.name}</strong>
  <br>
  <br>
  <strong>₱</strong>${item.price}<span>📍 Location: ${item.location}</span>
  <hr>
  `;
        shoppingList.appendChild(li);
    });
    shoppingContainer.appendChild(shoppingList);
    document.body.appendChild(shoppingContainer);
});

//Listing(Posting)
document.getElementById("listingForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let itemName = document.getElementById("itemName").value.trim();
    let itemPrice = parseFloat(document.getElementById("itemPrice").value);
    let itemDescription = document.getElementById("itemDescription").value.trim();
    let location = document.getElementById("location").value.trim();
    let ewallet = document.getElementById("ewallet").value.trim();
    let category = document.getElementById("categories").value;
    let imgInput = document.getElementById("img");

    // Validate price
    if (itemPrice <= 0 || isNaN(itemPrice)) {
        alert("Please enter a valid price greater than zero.");
        return;
    }

    // Validate e-wallet number (ensure only digits)
    if (!/^\d+$/.test(ewallet)) {
        alert("Please enter a valid e-wallet number (digits only).");
        return;
    }

    if (imgInput.files.length > 0) {
        let reader = new FileReader();
        reader.onload = function (event) {
            let item = {
                name: itemName,
                price: itemPrice.toFixed(2),
                description: itemDescription,
                location: location,
                image: event.target.result, // Base64 encoded image
                category: category,
                ewallet: ewallet,
            };

            // Save to localStorage
            let items = JSON.parse(localStorage.getItem("items")) || [];
            items.push(item);
            localStorage.setItem("items", JSON.stringify(items));

            alert("Item added!");
            document.getElementById("listingForm").reset(); // Reset form
            window.location.href = "shopping.html"; // Redirect to shopping page
        };
        reader.readAsDataURL(imgInput.files[0]); // Convert image to Base64
    } else {
        alert("Please select an image.");
    }
});
document.addEventListener("DOMContentLoaded", function () {
    loadNavbar();
    loadSelectedProduct();
});

// Function to load the navbar from shopping.html
function loadNavbar() {
    fetch("shopping.html")
        .then((response) => response.text())
        .then((html) => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(html, "text/html");
            let navbar = doc.querySelector("nav");
            if (navbar) {
                document.getElementById("navbar-container").innerHTML =
                    navbar.outerHTML;
            }
        })
        .catch((error) => console.error("Error loading navbar:", error));
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 50, // Adjust offset for navbar
                behavior: "smooth",
            });
        }
    });
});

function openCategory(category) {
    window.location.href = `/shop?category=${category}`;
}
  