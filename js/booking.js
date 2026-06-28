let selectedTime = null;

const timeGrid = document.getElementById("timeGrid");
const selectedTimeText = document.getElementById("selectedTimeText");
const bookingSummary = document.getElementById("bookingSummary");
const bookingForm = document.getElementById("bookingForm");
const closedMessage = document.getElementById("closedMessage");

const defaultWorkingHours = {
  0: null,
  1: { start: "09:00", end: "17:00" },
  2: { start: "09:00", end: "17:00" },
  3: { start: "09:00", end: "17:00" },
  4: { start: "09:00", end: "17:00" },
  5: { start: "09:00", end: "17:00" },
  6: { start: "10:00", end: "14:00" }
};

const slotLengthMinutes = 30;

function getWorkingHours() {
  return JSON.parse(localStorage.getItem("workingHours")) || defaultWorkingHours;
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getTimesForDate(date) {
  const dayOfWeek = date.getDay();
  const workingHours = getWorkingHours();
  const hours = workingHours[dayOfWeek];

  if (!hours) {
    return [];
  }

  const times = [];
  const start = timeToMinutes(hours.start);
  const end = timeToMinutes(hours.end);

  for (let time = start; time < end; time += slotLengthMinutes) {
    times.push(minutesToTime(time));
  }

  return times;
}

function updateAvailableTimes() {
  selectedTime = null;
  selectedTimeText.textContent = "Not selected";
  timeGrid.innerHTML = "";
  closedMessage.textContent = "";

  if (!selectedDate) {
    closedMessage.textContent = "Please select a date first.";
    return;
  }

  const times = getTimesForDate(selectedDate);

  if (times.length === 0) {
    closedMessage.textContent = "Closed on this day.";
    return;
  }

  const approvedTimes = getApprovedTimesForDate(selectedDate);

  times.forEach(time => {
    const button = document.createElement("button");
    button.className = "time-btn";
    button.textContent = time;

    if (approvedTimes.includes(time)) {
      button.classList.add("disabled");
      button.disabled = true;
    }

    button.addEventListener("click", () => {
      if (button.disabled) return;

      document.querySelectorAll(".time-btn").forEach(btn => {
        btn.classList.remove("selected");
      });

      button.classList.add("selected");
      selectedTime = time;
      selectedTimeText.textContent = selectedTime;
    });

    timeGrid.appendChild(button);
  });
}

function updateBookingSummary() {
  if (!selectedDate || !selectedTime) {
    bookingSummary.textContent = "No date selected";
    return;
  }

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  bookingSummary.textContent = `${formattedDate} · ${selectedTime}`;
}

bookingForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const booking = {
    id: Date.now(),
    name: document.getElementById("nameInput").value,
    email: document.getElementById("emailInput").value,
    phone: document.getElementById("phoneInput").value,
    notes: document.getElementById("notesInput").value,
    date: selectedDate.toISOString(),
    time: selectedTime,
    status: "pending"
  };

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings.push(booking);

  localStorage.setItem("bookings", JSON.stringify(bookings));

  showPage("successPage");
});