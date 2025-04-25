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
                const response = await fetchWithAutoRefresh("http://localhost:5000/login", {
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
                alert("Login Failed: This may be due to an invalid email or password. Please try again.");
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

//NavScroll Effect
window.addEventListener("scroll", function () {
    const navbar = document.getElementById("navbar");
    const hero = document.getElementById("Hero");
  
    const heroBottom = hero.offsetTop + hero.offsetHeight;
  
    if (window.scrollY >= heroBottom) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
  
  //Hamburger Menu
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    hamburger.classList.toggle("open"); // added for animation
  });
  
  // Carousel Function
  const carousel = document.getElementById("carousel");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const categories = carousel.querySelectorAll(".category");
  const paginationContainer = document.getElementById("paginationDots");
  
  let currentIndex = 0;
  const visibleCards = 1;
  const totalCards = categories.length;
  
  // Initialize pagination dots
  for (let i = 0; i < totalCards; i++) {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goToCard(i));
    paginationContainer.appendChild(dot);
  }
  
  const updateCarousel = () => {
    const cardWidth = categories[0].offsetWidth + 40;
    const track = document.querySelector(".carousel-track");
    const offset = -(
      cardWidth * currentIndex -
      (carousel.offsetWidth - cardWidth) / 2
    );
  
    track.style.transform = `translateX(${offset}px)`;
  
    categories.forEach((card, index) => {
      card.classList.remove("active", "side");
      if (index === currentIndex) {
        card.classList.add("active");
      } else {
        card.classList.add("side");
      }
    });
  
    document.querySelectorAll(".dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });
  };
  
  const goToCard = (index) => {
    currentIndex = Math.max(0, Math.min(index, totalCards - 1));
    updateCarousel();
  };
  
  prevBtn.addEventListener("click", () => {
    currentIndex = currentIndex > 0 ? currentIndex - 1 : totalCards - 1;
    updateCarousel();
  });
  
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % totalCards;
    updateCarousel();
  });
  
  // Initial setup
  updateCarousel();
  
  // Drag support
  let isDragging = false;
  let startX;
  let scrollLeft;
  
  carousel.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    carousel.classList.add("dragging");
  });
  
  carousel.addEventListener("mouseleave", () => {
    isDragging = false;
    carousel.classList.remove("dragging");
  });
  
  carousel.addEventListener("mouseup", () => {
    isDragging = false;
    carousel.classList.remove("dragging");
  });
  
  carousel.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2;
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
    renterBtn.style.color = "#f5f5f5";
    ownerBtn.style.color = "#880000";
    renterContent.style.display = "block";
    ownerContent.style.display = "none";

    renterBtn.addEventListener("click", function () {
        slider.style.transform = "translateX(0%)";
        renterBtn.style.color = "#f5f5f5";
        ownerBtn.style.color = "#880000";
        renterContent.style.display = "block";
        ownerContent.style.display = "none";
    });

    ownerBtn.addEventListener("click", function () {
        slider.style.transform = "translateX(100%)";
        ownerBtn.style.color = "#f5f5f5";
        renterBtn.style.color = "#880000";
        renterContent.style.display = "none";
        ownerContent.style.display = "block";
    });
});

// Slideshow for Renters and Owners
// Image arrays for Renters and Owners
const renterImages = [
    "wsearch.png",
    "request.png",
    "receive.png",
    "return.png",
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
    window.location.href = `/shop?category=${encodeURIComponent(category)}`;
}
  