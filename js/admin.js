const sections = document.querySelectorAll(".admin-section");
const navButtons = document.querySelectorAll(".nav-btn");

const hamburgerBtn = document.getElementById("hamburgerBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

const pendingBox = document.getElementById("pendingBookings");
const approvedBox = document.getElementById("approvedBookings");
const rejectedBox = document.getElementById("rejectedBookings");

const todayCount = document.getElementById("todayCount");
const pendingCount = document.getElementById("pendingCount");
const approvedCount = document.getElementById("approvedCount");
const rejectedCount = document.getElementById("rejectedCount");

const todaySchedule = document.getElementById("todaySchedule");
const upcomingAppointments = document.getElementById("upcomingAppointments");

const addVacationBtn = document.getElementById("addVacationBtn");
const blockedDaysList = document.getElementById("blockedDaysList");

const workingHoursEditor = document.getElementById("workingHoursEditor");
const saveWorkingHoursBtn = document.getElementById("saveWorkingHoursBtn");

const adminSearch = document.getElementById("adminSearch");
const adminNotes = document.getElementById("adminNotes");
const saveNotesBtn = document.getElementById("saveNotesBtn");
const darkModeBtn = document.getElementById("darkModeBtn");

const dayNames = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday"
};

const defaultWorkingHours = {
  0: null,
  1: { start: "09:00", end: "17:00" },
  2: { start: "09:00", end: "17:00" },
  3: { start: "09:00", end: "17:00" },
  4: { start: "09:00", end: "17:00" },
  5: { start: "09:00", end: "17:00" },
  6: { start: "10:00", end: "14:00" }
};

function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("show");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

hamburgerBtn.addEventListener("click", openSidebar);
overlay.addEventListener("click", closeSidebar);

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    navButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    sections.forEach(section => section.classList.remove("active"));
    document.getElementById(button.dataset.section).classList.add("active");

    closeSidebar();
  });
});

function getBookings() {
  return JSON.parse(localStorage.getItem("bookings")) || [];
}

function saveBookings(bookings) {
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

function getBlockedDays() {
  return JSON.parse(localStorage.getItem("blockedDays")) || [];
}

function saveBlockedDays(days) {
  localStorage.setItem("blockedDays", JSON.stringify(days));
}

function getWorkingHours() {
  return JSON.parse(localStorage.getItem("workingHours")) || defaultWorkingHours;
}

function saveWorkingHours(hours) {
  localStorage.setItem("workingHours", JSON.stringify(hours));
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function dateKey(date) {
  return new Date(date).toISOString().split("T")[0];
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function renderDashboard() {
  const bookings = getBookings();

  const pending = bookings.filter(b => b.status === "pending");
  const approved = bookings.filter(b => b.status === "approved");
  const rejected = bookings.filter(b => b.status === "rejected");

  const todayBookings = bookings.filter(b => {
    return dateKey(b.date) === getTodayKey() && b.status === "approved";
  });

  todayCount.textContent = todayBookings.length;
  pendingCount.textContent = pending.length;
  approvedCount.textContent = approved.length;
  rejectedCount.textContent = rejected.length;

  todaySchedule.innerHTML = todayBookings.length
    ? todayBookings.sort((a, b) => a.time.localeCompare(b.time)).map(smallBookingRow).join("")
    : "<p>No approved appointments today.</p>";

  const upcoming = approved
    .filter(b => dateKey(b.date) >= getTodayKey())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 6);

  upcomingAppointments.innerHTML = upcoming.length
    ? upcoming.map(smallBookingRow).join("")
    : "<p>No upcoming appointments.</p>";
}

function smallBookingRow(booking) {
  return `
    <div class="booking-item">
      <h3>${booking.time} — ${booking.name}</h3>
      <p>${formatDate(booking.date)}</p>
      <p>${booking.email} · ${booking.phone || "No phone"}</p>
      <span class="status ${booking.status}">${booking.status}</span>
    </div>
  `;
}

function bookingCard(booking, showButtons = false) {
  return `
    <div class="booking-item">
      <h3>${booking.name}</h3>
      <p><b>Date:</b> ${formatDate(booking.date)}</p>
      <p><b>Time:</b> ${booking.time}</p>
      <p><b>Email:</b> ${booking.email}</p>
      <p><b>Phone:</b> ${booking.phone || "No phone"}</p>
      <p><b>Notes:</b> ${booking.notes || "No notes"}</p>
      <p><span class="status ${booking.status}">${booking.status}</span></p>

      <div class="booking-actions">
        ${
          showButtons
            ? `
              <button class="approve-btn" onclick="approveBooking(${booking.id})">Approve</button>
              <button class="reject-btn" onclick="rejectBooking(${booking.id})">Reject</button>
            `
            : ""
        }

        <button class="delete-btn" onclick="deleteBooking(${booking.id})">Delete</button>
      </div>
    </div>
  `;
}

function renderBookings(searchTerm = "") {
  const bookings = getBookings();

  const filtered = bookings.filter(booking => {
    const text = `
      ${booking.name}
      ${booking.email}
      ${booking.phone}
      ${booking.notes}
      ${booking.time}
      ${formatDate(booking.date)}
      ${booking.status}
    `.toLowerCase();

    return text.includes(searchTerm.toLowerCase());
  });

  const pending = filtered.filter(b => b.status === "pending");
  const approved = filtered.filter(b => b.status === "approved");
  const rejected = filtered.filter(b => b.status === "rejected");

  pendingBox.innerHTML = "<h2>Pending Bookings</h2>";
  approvedBox.innerHTML = "<h2>Approved Appointments</h2>";
  rejectedBox.innerHTML = "<h2>Rejected Bookings</h2>";

  pendingBox.innerHTML += pending.length
    ? pending.map(b => bookingCard(b, true)).join("")
    : "<p>No pending bookings.</p>";

  approvedBox.innerHTML += approved.length
    ? approved.map(b => bookingCard(b, false)).join("")
    : "<p>No approved appointments.</p>";

  rejectedBox.innerHTML += rejected.length
    ? rejected.map(b => bookingCard(b, false)).join("")
    : "<p>No rejected bookings.</p>";
}

function approveBooking(id) {
  updateBookingStatus(id, "approved");
}

function rejectBooking(id) {
  updateBookingStatus(id, "rejected");
}

function updateBookingStatus(id, status) {
  const updatedBookings = getBookings().map(booking => {
    if (booking.id === id) {
      return { ...booking, status };
    }
    return booking;
  });

  saveBookings(updatedBookings);
  refreshAll();
}

function deleteBooking(id) {
  const confirmDelete = confirm("Delete this appointment? The time will become available again.");
  if (!confirmDelete) return;

  const updatedBookings = getBookings().filter(booking => booking.id !== id);
  saveBookings(updatedBookings);
  refreshAll();
}

function renderWorkingHoursEditor() {
  const hours = getWorkingHours();
  workingHoursEditor.innerHTML = "";

  for (let day = 0; day <= 6; day++) {
    const isOpen = hours[day] !== null;
    const start = isOpen ? hours[day].start : "09:00";
    const end = isOpen ? hours[day].end : "17:00";

    workingHoursEditor.innerHTML += `
      <div class="working-day">
        <b>${dayNames[day]}</b>

        <label class="open-row">
          <input type="checkbox" class="open-checkbox" data-day="${day}" ${isOpen ? "checked" : ""}>
          Open
        </label>

        <input type="time" class="start-time" data-day="${day}" value="${start}" ${!isOpen ? "disabled" : ""}>
        <input type="time" class="end-time" data-day="${day}" value="${end}" ${!isOpen ? "disabled" : ""}>
      </div>
    `;
  }

  document.querySelectorAll(".open-checkbox").forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const row = checkbox.closest(".working-day");
      row.querySelector(".start-time").disabled = !checkbox.checked;
      row.querySelector(".end-time").disabled = !checkbox.checked;
    });
  });
}

function saveWorkingHoursFromEditor() {
  const newHours = {};

  for (let day = 0; day <= 6; day++) {
    const checkbox = document.querySelector(`.open-checkbox[data-day="${day}"]`);
    const startInput = document.querySelector(`.start-time[data-day="${day}"]`);
    const endInput = document.querySelector(`.end-time[data-day="${day}"]`);

    if (!checkbox.checked) {
      newHours[day] = null;
      continue;
    }

    if (endInput.value <= startInput.value) {
      alert(`${dayNames[day]} end time must be after start time.`);
      return;
    }

    newHours[day] = {
      start: startInput.value,
      end: endInput.value
    };
  }

  saveWorkingHours(newHours);
  alert("Working hours saved.");
}

function addVacationDays() {
  const start = document.getElementById("vacationStart").value;
  const end = document.getElementById("vacationEnd").value;
  const reason = document.getElementById("vacationReason").value || "Blocked";

  if (!start || !end) {
    alert("Please select start and end date.");
    return;
  }

  if (end < start) {
    alert("End date cannot be before start date.");
    return;
  }

  const blockedDays = getBlockedDays();

  blockedDays.push({
    id: Date.now(),
    start,
    end,
    reason
  });

  saveBlockedDays(blockedDays);

  document.getElementById("vacationStart").value = "";
  document.getElementById("vacationEnd").value = "";
  document.getElementById("vacationReason").value = "";

  renderBlockedDays();
}

function deleteBlockedDays(id) {
  const blockedDays = getBlockedDays().filter(day => day.id !== id);
  saveBlockedDays(blockedDays);
  renderBlockedDays();
}

function renderBlockedDays() {
  const blockedDays = getBlockedDays();

  blockedDaysList.innerHTML = "<h3>Blocked Days</h3>";

  if (blockedDays.length === 0) {
    blockedDaysList.innerHTML += "<p>No blocked days.</p>";
    return;
  }

  blockedDaysList.innerHTML += blockedDays.map(day => `
    <div class="booking-item">
      <p><b>From:</b> ${formatDate(day.start)}</p>
      <p><b>To:</b> ${formatDate(day.end)}</p>
      <p><b>Reason:</b> ${day.reason}</p>

      <button class="delete-btn" onclick="deleteBlockedDays(${day.id})">
        Remove Block
      </button>
    </div>
  `).join("");
}

function loadNotes() {
  adminNotes.value = localStorage.getItem("adminNotes") || "";
}

function saveNotes() {
  localStorage.setItem("adminNotes", adminNotes.value);
  alert("Notes saved.");
}

function loadDarkMode() {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

adminSearch.addEventListener("input", () => {
  renderBookings(adminSearch.value);
});

addVacationBtn.addEventListener("click", addVacationDays);
saveWorkingHoursBtn.addEventListener("click", saveWorkingHoursFromEditor);
saveNotesBtn.addEventListener("click", saveNotes);
darkModeBtn.addEventListener("click", toggleDarkMode);

function refreshAll() {
  renderDashboard();
  renderBookings(adminSearch.value);
}

loadDarkMode();
loadNotes();
renderDashboard();
renderBookings();
renderWorkingHoursEditor();
renderBlockedDays();