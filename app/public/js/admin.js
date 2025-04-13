document.addEventListener("DOMContentLoaded", function () {
    const logoutLink = document.getElementById("logout");
    const modal = document.getElementById("logout-modal");
    const confirmLogout = document.getElementById("confirm-logout");
    const cancelLogout = document.getElementById("cancel-logout");

    // Ensure modal starts hidden
    modal.style.display = "none";

    // Show modal when logout is clicked
    logoutLink.addEventListener("click", function (event) {
        event.preventDefault(); // Prevents default link behavior
        modal.style.display = "flex"; // Show modal only on click
    });

    // Redirect when "Yes" is clicked
    confirmLogout.addEventListener("click", function () {
        window.location.href = "/logout"; // Adjust logout URL
    });

    // Close modal when "No" is clicked
    cancelLogout.addEventListener("click", function () {
        modal.style.display = "none"; // Hide modal
    });
});


// Tabs Functionality
function openTab(evt, tabName) {
    var tabs = document.getElementsByClassName("tab-content");
    var buttons = document.getElementsByClassName("tablinks");

    // Hide all tabs
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.display = "none";
    }

    // Remove active class from all buttons
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("active");
    }

    // Show the selected tab and mark the button as active
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

// Set default active tab when the page loads
document.addEventListener("DOMContentLoaded", function () {
    let firstButton = document.querySelector(".tablinks");

    if (firstButton) {
        firstButton.click(); // Trigger click to properly initialize the first tab
    }
});

//admin view prod
document.addEventListener("DOMContentLoaded", function () {
    const acceptBtn = document.getElementById("accept-btn");
    const confirmPopup = document.getElementById("confirm-popup");
    const overlay = document.getElementById("overlay");
    const confirmNo = document.getElementById("confirm-no");
    const confirmYes = document.getElementById("confirm-yes");
    const successPopup = document.getElementById("success-popup");
    const declineBtn = document.getElementById("decline-btn");
    const declinePopup = document.getElementById("decline-popup");
    const confirmNoDecline = document.getElementById("confirm-no-decline");
    const confirmYesDecline = document.getElementById("confirm-yes-decline");
    const successPopupDecline = document.getElementById("success-popup-decline");

    acceptBtn.addEventListener("click", function () {
        confirmPopup.style.display = "block";
        overlay.style.display = "block";
    });

    confirmNo.addEventListener("click", function () {
        confirmPopup.style.display = "none";
        overlay.style.display = "none";
    });

    confirmYes.addEventListener("click", async function () {
        confirmPopup.style.display = "none";
        successPopup.style.display = "block";

        // Update is_approved to 1
        const itemId = document.querySelector("[name='item_id']").value

        try {
            const response = await fetch(`http://localhost:8000/api/admin/manage-listings/approve/${itemId}`, {
                method: "POST",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Approve failed. Please try again.");
            }

        } catch (error) {
            alert(error.message);
        }

        setTimeout(function () {
            successPopup.style.display = "none";
            overlay.style.display = "none";

            window.location.href = "/admin/manage-listings";
        }, 3000);

    });


    // Decline button functionality
    // When the decline button is clicked, show the decline popup
    declineBtn.addEventListener("click", function () {
        declinePopup.style.display = "block";
        overlay.style.display = "block";
        console.log("working to pre");
    });

    confirmNoDecline.addEventListener("click", function () {
        declinePopup.style.display = "none";
        overlay.style.display = "none";
    });

    confirmYesDecline.addEventListener("click", async function () {
        declinePopup.style.display = "none";
        successPopup.style.display = "block";

        // Update is_approved to 0
        const itemId = document.querySelector("[name='item_id']").value

        try {
            const response = await fetch(`http://localhost:8000/api/admin/manage-listings/decline-requests/${itemId}`, {
                method: "PATCH",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Approve failed. Please try again.");
            }

        } catch (error) {
            alert(error.message);
        }

        setTimeout(function () {
            successPopupDecline.style.display = "none";
            overlay.style.display = "none";

            window.location.href = "/admin/manage-listings";
        }, 3000);

    });
});


// Ban User
const banIcon = document.getElementById("ban");
const banModal = document.getElementById("banModal");
const cancelBtn = document.getElementById("cancelBtn");
const confirmBan = document.getElementById("confirmBan");
const banToast = document.getElementById("banToast");

banIcon.addEventListener("click", function (event) {
    event.preventDefault();
    banModal.style.display = "flex";
});
cancelBtn.addEventListener("click", function () {
    banModal.style.display = "none";
});
window.addEventListener("click", function (event) {
    if (event.target === banModal) {
        banModal.style.display = "none";
    }
});

function showBanToast(message) {
    banToast.textContent = message;
    banToast.classList.add("show");
    setTimeout(() => {
        banToast.classList.remove("show");
    }, 3000);
}

confirmBan.addEventListener("click", function () {
    showBanToast("User successfully banned.");
    banModal.style.display = "none";
});

// Restore User
const restoreIcon = document.getElementById("restore");
const restoreModal = document.getElementById("restoreModal");
const cancelRestore = document.getElementById("cancelRestore");
const confirmRestore = document.getElementById("confirmRestore");
const restoreToast = document.getElementById("restoreToast");
restoreIcon.addEventListener("click", function (event) {
    event.preventDefault();
    restoreModal.style.display = "flex";
});
cancelRestore.addEventListener("click", function () {
    restoreModal.style.display = "none";
});
window.addEventListener("click", function (event) {
    if (event.target === restoreModal) {
        restoreModal.style.display = "none";
    }
});

function showRestoreToast(message) {
    restoreToast.textContent = message;
    restoreToast.classList.add("show");
    setTimeout(() => {
        restoreToast.classList.remove("show");
    }, 3000);
}

confirmRestore.addEventListener("click", function () {
    showRestoreToast("User Successfully Restored.");
    restoreModal.style.display = "none";
});


// View user details
const viewUserDetail = async (userId) => {
    
    console.log('Users:', userId);

    const response = await fetch(`http://localhost:8000/api/admin/manage-users/${userId}`);
    const {data: user, success} = await response.json();
    console.log('User:', user);

        if (success) {
                
                document.getElementById('UserList').style.display = 'none';
                
                let userInfoDetails = document.getElementById('userInfoDetails');
                if (!userInfoDetails) {
                    userInfoDetails = document.createElement('div');
                    userInfoDetails.id = 'userInfoDetails';
                    document.querySelector('.tab-content').parentNode.appendChild(userInfoDetails);
                }
                
                // Populate the user details
                userInfoDetails.innerHTML = `
                    <div class="user-detail-container">
                        <div class="back-button">
                            <a href="#" onclick="returnToUserList()">
                                <i class="fa-solid fa-arrow-left"></i>
                            </a>
                            
                        </div>
                        
                        <div class="user-detail-table">
                            <table>
                                <tr>
                                    <td>User ID</td>
                                    <td>${user.id}</td>
                                </tr>
                                <tr>
                                    <td>Name</td>
                                    <td>${user.fullname}</td>
                                </tr>
                                <tr>
                                    <td>Email</td>
                                    <td>${user.email}</td>
                                </tr>
                                <tr>
                                    <td>Contact Number</td>
                                    <td>${user.contact_number}</td>
                                </tr>
                                <tr>
                                    <td>Account Status</td>
                                    <td>${user.account_status}</td>
                                </tr>
                                <tr>
                                    <td>Total Listings</td>
                                    <td>${user.total_listing}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                `;
                
                // Display the user details
                userInfoDetails.style.display = 'block';
            } else {
                // Handle error
                alert('Error: Could not retrieve user details.');
            }
        }
        function returnToUserList() {
            // Hide user details
            document.getElementById('userInfoDetails').style.display = 'none';
            
            // Show user list
            document.getElementById('UserList').style.display = 'block';
        }
// Ban User Toast Function
function showBanToast(message) {
    const overlay = document.getElementById("overlay");
    banToast.textContent = message;
    banToast.classList.add("show");
    overlay.style.display = "block";  // Show dark background

    setTimeout(() => {
        banToast.classList.remove("show");
        overlay.style.display = "none"; // Hide dark background
    }, 3000);
}

// Restore User Toast Function
function showRestoreToast(message) {
    const overlay = document.getElementById("overlay");
    restoreToast.textContent = message;
    restoreToast.classList.add("show");
    overlay.style.display = "block";  // Show dark background

    setTimeout(() => {
        restoreToast.classList.remove("show");
        overlay.style.display = "none"; // Hide dark background
    }, 3000);
}

