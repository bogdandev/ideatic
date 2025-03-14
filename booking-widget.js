/**
 * Simple Coworking Space Booking Widget
 * =====================================
 *
 * This script creates a "Book Now" button that opens a modal dialog
 * allowing users to book either a hotdesk or meeting room.
 *
 * Usage:
 * 1. Include this script in your HTML
 * 2. Add <div class="coworking-booking-container"></div> where you want the button to appear
 * 3. The script will handle the rest
 */

(function () {
  // Configuration - can be customized
  const config = {
    apiEndpoint: "https://yourapi.example.com/bookings", // Change to your API endpoint
    colors: {
      primary: "#4f46e5", // Main color for buttons
      primaryHover: "#4338ca", // Hover color for buttons
      text: "#ffffff", // Text color on buttons
      background: "#ffffff", // Background color of modal
    },
  };

  // Create and inject CSS
  const addStyles = () => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
        /* Base styles for the booking widget */
        .coworking-booking-widget {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
  
        /* Button styles */
        .book-now-btn {
          background-color: ${config.colors.primary};
          color: ${config.colors.text};
          border: none;
          border-radius: 4px;
          padding: 10px 16px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .book-now-btn:hover {
          background-color: ${config.colors.primaryHover};
        }
  
        /* Modal styles */
        .booking-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          overflow-y: auto;
        }
        .booking-modal.active {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          background-color: ${config.colors.background};
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 24px;
          position: relative;
        }
        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
        }
  
        /* Tab styles */
        .tab-container {
          margin-top: 16px;
        }
        .tabs {
          display: flex;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 16px;
        }
        .tab {
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 2px solid transparent;
        }
        .tab.active {
          border-bottom: 2px solid ${config.colors.primary};
          color: ${config.colors.primary};
          font-weight: 500;
        }
  
        /* Form styles */
        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        .form-control {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 16px;
        }
        .form-control:focus {
          outline: 2px solid ${config.colors.primary};
          border-color: transparent;
        }
  
        /* Calendar styles */
        .calendar-container {
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        .calendar-day {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          border-radius: 4px;
          cursor: pointer;
        }
        .calendar-day:hover {
          background-color: #f3f4f6;
        }
        .calendar-day.selected {
          background-color: ${config.colors.primary};
          color: white;
        }
        .calendar-day.disabled {
          color: #d1d5db;
          cursor: not-allowed;
        }
  
        /* Duration selector styles */
        .duration-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .duration-option {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .duration-option input {
          cursor: pointer;
        }
        .duration-option label {
          cursor: pointer;
        }
  
        /* Submit button styles */
        .submit-btn {
          background-color: ${config.colors.primary};
          color: ${config.colors.text};
          border: none;
          border-radius: 4px;
          padding: 12px 16px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          width: 100%;
          margin-top: 8px;
        }
        .submit-btn:hover {
          background-color: ${config.colors.primaryHover};
        }
      `;
    document.head.appendChild(styleElement);
  };

  // Generate a month's calendar view
  const generateCalendar = (year, month, selectedDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    let calendarHTML = `
        <div class="calendar-container">
          <div class="calendar-header">
            <button id="prev-month">&lt;</button>
            <h3>${new Date(year, month).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}</h3>
            <button id="next-month">&gt;</button>
          </div>
          <div class="calendar-grid">
            ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
              .map(
                (day) =>
                  `<div style="text-align: center; font-weight: 500; font-size: 12px;">${day}</div>`
              )
              .join("")}
      `;

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      calendarHTML += `<div></div>`;
    }

    // Add cells for days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isDisabled = date < today;
      const isSelected =
        selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      calendarHTML += `
          <div class="calendar-day ${isDisabled ? "disabled" : ""} ${
        isSelected ? "selected" : ""
      }" 
               data-date="${year}-${month + 1}-${i}"
               ${isDisabled ? "disabled" : ""}>
            ${i}
          </div>
        `;
    }

    calendarHTML += `
          </div>
        </div>
      `;

    return calendarHTML;
  };

  // Generate duration selector based on space type
  const generateDurationSelector = (type) => {
    let durationHTML = `
        <div class="form-group">
          <label>Duration</label>
          <div class="duration-options">
            <div class="duration-option">
              <input type="radio" id="half-day" name="duration" value="half-day" checked>
              <label for="half-day">Half Day (4 hours) - 60 RON</label>
            </div>
            <div class="duration-option">
              <input type="radio" id="full-day" name="duration" value="full-day">
              <label for="full-day">Full Day (8 hours) - 120 RON</label>
            </div>
      `;

    // Add additional options for hotdesk
    if (type === "hotdesk") {
      durationHTML += `
            <div class="duration-option">
              <input type="radio" id="week" name="duration" value="week">
              <label for="week">Week (5 days) - 500 RON</label>
            </div>
            <div class="duration-option">
              <input type="radio" id="two-weeks" name="duration" value="two-weeks">
              <label for="two-weeks">Two Weeks (10 days) - 750 RON</label>
            </div>
            <div class="duration-option">
              <input type="radio" id="month" name="duration" value="month">
              <label for="month">Month (20 days) - 1100 RON</label>
            </div>
        `;
    }

    durationHTML += `
          </div>
        </div>
      `;

    return durationHTML;
  };

  // Create the booking widget
  const createBookingWidget = () => {
    // Create the "Book Now" button
    const button = document.createElement("button");
    button.className = "book-now-btn";
    button.textContent = "Book Now";
    console.log("hei");

    // Create the modal
    const modal = document.createElement("div");
    modal.className = "booking-modal";
    modal.innerHTML = `
        <div class="modal-content">
          <button class="close-btn">&times;</button>
          <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 16px;">Book a Space</h2>
          
          <div class="tab-container">
            <div class="tabs">
              <div class="tab active" data-tab="hotdesk">Hotdesk</div>
              <div class="tab" data-tab="meeting">Meeting Room</div>
            </div>
            
            <div id="booking-form-container">
              <form class="booking-form" id="booking-form">
                <!-- Calendar will be inserted here -->
                <div id="calendar-placeholder"></div>
                
                <!-- Duration selector will be inserted here -->
                <div id="duration-selector-placeholder"></div>
                
                <div class="form-group">
                  <label for="name">Full Name</label>
                  <input type="text" id="name" class="form-control" placeholder="Enter your full name" required>
                </div>
                
                <div class="form-group">
                  <label for="email">Email Address</label>
                  <input type="email" id="email" class="form-control" placeholder="Enter your email" required>
                </div>
                
                <button type="submit" class="submit-btn">Confirm Booking</button>
              </form>
            </div>
          </div>
        </div>
      `;

    // Append the elements to the container
    const containers = document.querySelectorAll(
      ".coworking-booking-container"
    );
    containers.forEach((container) => {
      const widgetContainer = document.createElement("div");
      widgetContainer.className = "coworking-booking-widget";

      // Clone the button for each container
      const buttonClone = button.cloneNode(true);
      widgetContainer.appendChild(buttonClone);
      container.appendChild(widgetContainer);

      // Add event listener to the button
      buttonClone.addEventListener("click", () => {
        // Clone the modal for each button
        const modalClone = modal.cloneNode(true);
        document.body.appendChild(modalClone);

        // Initialize the widget with hotdesk as default
        initializeWidget(modalClone, "hotdesk");

        // Show the modal
        setTimeout(() => {
          modalClone.classList.add("active");
        }, 10);
      });
    });
  };

  // Initialize the widget with the correct content
  const initializeWidget = (modalElement, activeTab) => {
    const today = new Date();
    let selectedDate = null;
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    // Set active tab
    const tabs = modalElement.querySelectorAll(".tab");
    tabs.forEach((tab) => {
      tab.classList.remove("active");
      if (tab.dataset.tab === activeTab) {
        tab.classList.add("active");
      }
    });

    // Generate calendar
    const calendarPlaceholder = modalElement.querySelector(
      "#calendar-placeholder"
    );
    calendarPlaceholder.innerHTML = generateCalendar(
      currentYear,
      currentMonth,
      selectedDate
    );

    // Generate duration selector
    const durationPlaceholder = modalElement.querySelector(
      "#duration-selector-placeholder"
    );
    durationPlaceholder.innerHTML = generateDurationSelector(activeTab);

    // Tab switching
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        // Update duration selector based on selected tab
        const type = tab.dataset.tab;
        durationPlaceholder.innerHTML = generateDurationSelector(type);
      });
    });

    // Calendar navigation
    const prevMonthButton = modalElement.querySelector("#prev-month");
    const nextMonthButton = modalElement.querySelector("#next-month");

    prevMonthButton.addEventListener("click", () => {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      calendarPlaceholder.innerHTML = generateCalendar(
        currentYear,
        currentMonth,
        selectedDate
      );
      attachCalendarEventListeners();
    });

    nextMonthButton.addEventListener("click", () => {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      calendarPlaceholder.innerHTML = generateCalendar(
        currentYear,
        currentMonth,
        selectedDate
      );
      attachCalendarEventListeners();
    });

    // Function to attach event listeners to calendar days
    const attachCalendarEventListeners = () => {
      const calendarDays = modalElement.querySelectorAll(
        ".calendar-day:not(.disabled)"
      );
      calendarDays.forEach((day) => {
        day.addEventListener("click", () => {
          // Remove selected class from all days
          modalElement
            .querySelectorAll(".calendar-day")
            .forEach((d) => d.classList.remove("selected"));

          // Add selected class to clicked day
          day.classList.add("selected");

          // Parse the date
          const [year, month, date] = day.dataset.date.split("-").map(Number);
          selectedDate = new Date(year, month - 1, date);
        });
      });
    };

    // Initial attachment of calendar event listeners
    attachCalendarEventListeners();

    // Close button
    const closeButton = modalElement.querySelector(".close-btn");
    closeButton.addEventListener("click", () => {
      modalElement.classList.remove("active");
      setTimeout(() => {
        modalElement.remove();
      }, 300);
    });

    // Form submission
    const form = modalElement.querySelector("#booking-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Validate form
      if (!selectedDate) {
        alert("Please select a date");
        return;
      }

      // Get form data
      const name = modalElement.querySelector("#name").value;
      const email = modalElement.querySelector("#email").value;
      const activeTabElement = modalElement.querySelector(".tab.active");
      const type = activeTabElement.dataset.tab;
      const duration = modalElement.querySelector(
        'input[name="duration"]:checked'
      ).value;

      // Prepare booking data
      const bookingData = {
        type,
        date: selectedDate.toISOString(),
        duration,
        name,
        email,
      };

      // Send the booking data to the API
      console.log("Booking submitted:", bookingData);

      // You can uncomment this to send the data to your API
      /*
        fetch(config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          alert(`Thank you for your booking! We'll send a confirmation to ${email}.`);
          modalElement.classList.remove('active');
          setTimeout(() => {
            modalElement.remove();
          }, 300);
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('There was an error processing your booking. Please try again.');
        });
        */

      // For now, just show a success message
      alert(
        `Thank you for your booking! We'll send a confirmation to ${email}.`
      );

      // Close the modal
      modalElement.classList.remove("active");
      setTimeout(() => {
        modalElement.remove();
      }, 300);
    });
  };

  // Initialize the widget
  const init = () => {
    addStyles();
    createBookingWidget();
  };

  // Run the initialization when the page is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
