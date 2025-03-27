
//logout
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