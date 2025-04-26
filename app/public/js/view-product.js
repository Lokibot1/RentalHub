// Open Form (Show overlay & form)
function openForm() {
    document.getElementById("myForm").style.display = "flex";
  }
  // Close Form (Hide overlay & form)
  function closeForm() {
    document.getElementById("myForm").style.display = "none";
  }
  // Switch Tabs
  function switchTab(event, tabName) {
    // Remove active class from all buttons
    document
      .querySelectorAll(".tab-btn")
      .forEach((btn) => btn.classList.remove("active"));
  
    // Hide all content sections
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));
  
    // Add active class to the clicked button
    event.currentTarget.classList.add("active");
  
    // Show the selected tab content
    document.getElementById(tabName).classList.add("active");
  }
  
  // Function to load the selected product details
  function loadSelectedProduct() {
    let item = JSON.parse(localStorage.getItem("selectedItem"));
    if (item) {
      document.getElementById("product-image").src = item.image || "default.jpg";
      document.getElementById("product-name").innerText = item.name;
      document.getElementById(
        "product-price"
      ).innerText = `Price per day: ₱${item.price}`;
      document.getElementById("product-description").innerText = item.description;
    } else {
      alert("No product selected!");
      window.location.href = "shopping.html";
    }
  }
  
  //view-product.html functions
  const API_URL = "http://localhost:5000/api/owner";
  
  async function fetchOwnerDetails() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
  
      if (!data.error) {
        document.getElementById("owner-name").textContent =
          data.name || "Unknown Owner";
        document.getElementById("owner-location").textContent =
          data.location || "Unknown Location";
        document.getElementById("owner-image").src =
          data.profile_picture || "default.png";
  
        // Calculate and display average rating
        const ratings = data.ratings || []; // Array of ratings
        const averageRating =
          ratings.length > 0
            ? (
                ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
              ).toFixed(1)
            : "This item has no ratings yet.";
  
        document.getElementById("owner-rating").innerHTML =
          generateStars(averageRating);
      }
    } catch (error) {
      console.error("Error fetching owner data:", error);
    }
  }
  
  // Function to convert rating number to stars
  function generateStars(rating) {
    if (rating === "This item has no ratings yet.") return rating;
    let stars = "⭐".repeat(Math.floor(rating)); // Full stars
    return stars + ` (${rating})`; // Show the average rating value
  }
  
  // Call function when page loads
  fetchOwnerDetails();
  
  //CALENDRRRRRRRRRRRRRRRRRRRRRRRRRRRR
  //calendar functionssssss
  document.addEventListener("DOMContentLoaded", function () {
    const datesGrid = document.getElementById("dates-grid");
    const monthYearDisplay = document.getElementById("month-year");
    const prevMonthBtn = document.getElementById("prev-month");
    const nextMonthBtn = document.getElementById("next-month");
  
    const instructionText = document.createElement("p");
    instructionText.id = "instruction-text";
    instructionText.textContent = "Select a start date for your rental.";
    datesGrid.parentElement.appendChild(instructionText);
  
    const resetBtn = document.createElement("button");
    resetBtn.id = "reset-selection";
    resetBtn.textContent = "Reset Selection";
    resetBtn.style.marginTop = "10px";
    resetBtn.style.display = "none";
    datesGrid.parentElement.appendChild(resetBtn);
  
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    let displayedMonth = currentDate.getMonth();
    let displayedYear = currentDate.getFullYear();
    let startDate = null;
    let endDate = null;
  
    const unavailableDates = [];
  
    function renderCalendar() {
      datesGrid.innerHTML = "";
      instructionText.textContent = "Select a start date for your rental.";
      resetBtn.style.display = "none";
  
      const firstDay = new Date(displayedYear, displayedMonth, 1);
      const lastDay = new Date(displayedYear, displayedMonth + 1, 0);
      const startingDay = firstDay.getDay();
      const monthLength = lastDay.getDate();
  
      monthYearDisplay.textContent = `${firstDay.toLocaleString("default", {
        month: "long",
      })} ${displayedYear}`;
  
      for (let i = 0; i < startingDay; i++) {
        const emptyCell = document.createElement("div");
        emptyCell.className = "empty-cell";
        datesGrid.appendChild(emptyCell);
      }
  
      for (let day = 1; day <= monthLength; day++) {
        const dateCell = document.createElement("div");
        dateCell.className = "date-cell";
        dateCell.textContent = day;
  
        const cellDate = new Date(displayedYear, displayedMonth, day);
        cellDate.setHours(0, 0, 0, 0);
  
        // ✅ FIX: Use locale date format to prevent timezone shift issues
        dateCell.dataset.date = cellDate.toLocaleDateString("en-CA");
  
        if (cellDate < currentDate) {
          dateCell.classList.add("disabled");
        } else if (unavailableDates.includes(dateCell.dataset.date)) {
          dateCell.classList.add("unavailable");
        } else {
          dateCell.addEventListener("click", () =>
            handleDateSelection(dateCell.dataset.date, dateCell)
          );
        }
  
        datesGrid.appendChild(dateCell);
      }
  
      highlightSelectedDates();
    }
  
    function handleDateSelection(dateStr, cell) {
      // ✅ FIX: Convert dataset string back to Date consistently
      const selectedDate = new Date(dateStr);
      selectedDate.setHours(0, 0, 0, 0);
  
      if (selectedDate < currentDate || unavailableDates.includes(dateStr)) {
        return;
      }
  
      if (!startDate) {
        startDate = selectedDate;
        instructionText.textContent = "Now select an end date for your rental.";
        resetBtn.style.display = "block";
        highlightSelectedDates();
      } else if (!endDate && selectedDate >= startDate) {
        endDate = selectedDate;
        instructionText.textContent = `Rental period: ${formatDate(
          startDate
        )} to ${formatDate(endDate)}.`;
        highlightSelectedDates();
      } else {
        resetSelection();
      }
    }
  
    function highlightSelectedDates() {
      document.querySelectorAll(".date-cell").forEach((cell) => {
        const cellDate = new Date(cell.dataset.date);
        cellDate.setHours(0, 0, 0, 0);
  
        cell.classList.remove("selected", "range");
  
        if (startDate && cellDate.getTime() === startDate.getTime()) {
          cell.classList.add("selected");
        }
        if (endDate && cellDate.getTime() === endDate.getTime()) {
          cell.classList.add("selected");
        }
        if (startDate && endDate && cellDate > startDate && cellDate < endDate) {
          cell.classList.add("range");
        }
      });
    }
  
    function resetSelection() {
      startDate = null;
      endDate = null;
      instructionText.textContent = "Select a start date for your rental.";
      resetBtn.style.display = "none";
      highlightSelectedDates();
    }
  
    prevMonthBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (
        displayedYear > currentDate.getFullYear() ||
        (displayedYear === currentDate.getFullYear() &&
          displayedMonth > currentDate.getMonth())
      ) {
        displayedMonth--;
        if (displayedMonth < 0) {
          displayedMonth = 11;
          displayedYear--;
        }
        renderCalendar();
      }
    });
  
    nextMonthBtn.addEventListener("click", (e) => {
      e.preventDefault();
      displayedMonth++;
      if (displayedMonth > 11) {
        displayedMonth = 0;
        displayedYear++;
      }
      renderCalendar();
    });
  
    resetBtn.addEventListener("click", resetSelection);
  
    function formatDate(date) {
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  
    renderCalendar();
  });
  
  //PRESSED FUNCTION SA Mode of Payment
  document.addEventListener("DOMContentLoaded", function () {
    const meetupBtn = document.getElementById("meetup-btn");
    const deliveryBtn = document.getElementById("delivery-btn");
  
    function addPressEffect(button) {
      button.classList.add("pressed");
  
      // Keep the effect for 200ms before removing it
      setTimeout(() => {
        button.classList.remove("pressed");
      }, 200);
    }
  
    meetupBtn.addEventListener("click", function () {
      addPressEffect(meetupBtn);
    });
  
    deliveryBtn.addEventListener("click", function () {
      addPressEffect(deliveryBtn);
    });
  });
  
  //FUNCTION FOR REQUEST BUTTON!!!!
  document.addEventListener("DOMContentLoaded", function () {
    const requestBtn = document.getElementById("request-btn");
    const meetupBtn = document.getElementById("meetup-btn");
    const deliveryBtn = document.getElementById("delivery-btn");
  
    let selectedDeliveryMethod = null;
  
    // Get access to the calendar's date variables
    const calendar = document.querySelector(".calendar");
  
    // Handle delivery method selection
    meetupBtn.addEventListener("click", function () {
      selectedDeliveryMethod = "Meet Up";
      meetupBtn.classList.add("selected");
      deliveryBtn.classList.remove("selected");
    });
  
    deliveryBtn.addEventListener("click", function () {
      selectedDeliveryMethod = "Delivery";
      deliveryBtn.classList.add("selected");
      meetupBtn.classList.remove("selected");
    });
  
    // ✅ Handle Request Button Click
    requestBtn.addEventListener("click", function () {
      // Get the selected dates from the calendar
      const selectedDates = document.querySelectorAll(".date-cell.selected");
      const instructionText = document.getElementById("instruction-text");
  
      // Check if two dates are selected
      if (selectedDates.length < 2) {
        showErrorMessage(
          "Please select both start and end dates for your rental period."
        );
        return;
      }
  
      // Get the actual dates
      const startDateStr = selectedDates[0].dataset.date;
      const endDateStr = selectedDates[1].dataset.date;
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
  
      // Check if dates are in proper order
      if (endDate < startDate) {
        showErrorMessage("End date cannot be before start date.");
        return;
      }
  
      // Check if delivery method is selected
      if (!selectedDeliveryMethod) {
        showErrorMessage(
          "Please select a mode of delivery (Meet Up or Delivery)."
        );
        return;
      }
  
      // If all checks pass, show confirmation modal
      showConfirmationModal(startDate, endDate, selectedDeliveryMethod);
    });
  
    // Function to show confirmation modal
    function showConfirmationModal(startDate, endDate, deliveryMethod) {
      const modalOverlay = document.createElement("div");
      modalOverlay.className = "modal-overlay";
  
      const modal = document.createElement("div");
      modal.className = "modal";
      modal.innerHTML = `
              <p>Confirm rental request for:<br>
              <strong>From:</strong> ${formatDate(startDate)}<br>
              <strong>To:</strong> ${formatDate(endDate)}<br>
              <strong>Delivery Method:</strong> ${deliveryMethod}</p>
              <div class="modal-buttons">
                  <button id="confirm-btn">Yes</button>
                  <button id="cancel-btn">No</button>
              </div>
          `;
  
      modalOverlay.appendChild(modal);
      document.body.appendChild(modalOverlay);
  
      // Add styles for modal
      modalOverlay.style.position = "fixed";
      modalOverlay.style.top = "0";
      modalOverlay.style.left = "0";
      modalOverlay.style.width = "100%";
      modalOverlay.style.height = "100%";
      modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      modalOverlay.style.display = "flex";
      modalOverlay.style.justifyContent = "center";
      modalOverlay.style.alignItems = "center";
      modalOverlay.style.zIndex = "1000";
  
      modal.style.backgroundColor = "white";
      modal.style.padding = "20px";
      modal.style.borderRadius = "8px";
      modal.style.minWidth = "300px";
  
      document
        .getElementById("confirm-btn")
        .addEventListener("click", function () {
          console.log("Rental confirmed!");
          document.body.removeChild(modalOverlay);
          showSuccessMessage();
        });
  
      document
        .getElementById("cancel-btn")
        .addEventListener("click", function () {
          console.log("Rental canceled.");
          document.body.removeChild(modalOverlay);
        });
    }
  
    // Function to show success message modal
    function showSuccessMessage() {
      const modalOverlay = document.createElement("div");
      modalOverlay.className = "modal-overlay";
      modalOverlay.style.position = "fixed";
      modalOverlay.style.top = "0";
      modalOverlay.style.left = "0";
      modalOverlay.style.width = "100%";
      modalOverlay.style.height = "100%";
      modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      modalOverlay.style.display = "flex";
      modalOverlay.style.justifyContent = "center";
      modalOverlay.style.alignItems = "center";
      modalOverlay.style.zIndex = "1000";
  
      const modal = document.createElement("div");
      modal.className = "modal";
      modal.style.backgroundColor = "white";
      modal.style.padding = "20px";
      modal.style.borderRadius = "8px";
      modal.innerHTML = `<p>Rental request submitted successfully!</p>`;
  
      modalOverlay.appendChild(modal);
      document.body.appendChild(modalOverlay);
  
      setTimeout(() => {
        document.body.removeChild(modalOverlay);
      }, 2000);
    }
  
    // Function to show error message modal
    function showErrorMessage(message) {
      const modalOverlay = document.createElement("div");
      modalOverlay.className = "modal-overlay";
      modalOverlay.style.position = "fixed";
      modalOverlay.style.top = "0";
      modalOverlay.style.left = "0";
      modalOverlay.style.width = "100%";
      modalOverlay.style.height = "100%";
      modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      modalOverlay.style.display = "flex";
      modalOverlay.style.justifyContent = "center";
      modalOverlay.style.alignItems = "center";
      modalOverlay.style.zIndex = "1000";
  
      const modal = document.createElement("div");
      modal.className = "modal";
      modal.style.backgroundColor = "#ffe6e6";
      modal.style.padding = "20px";
      modal.style.borderRadius = "8px";
      modal.innerHTML = `<p>${message}</p>`;
  
      modalOverlay.appendChild(modal);
      document.body.appendChild(modalOverlay);
  
      setTimeout(() => {
        document.body.removeChild(modalOverlay);
      }, 2000);
    }
  
    // Helper function to format date
    function formatDate(date) {
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  });
  