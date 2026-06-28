let selectedDate = null;
let currentDate = new Date();

const today = new Date();
today.setHours(0, 0, 0, 0);

const datesContainer = document.getElementById("dates");
const monthTitle = document.getElementById("monthTitle");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const selectedDateText = document.getElementById("selectedDateText");

function getBookings() {
  return JSON.parse(localStorage.getItem("bookings")) || [];
}

function getBlockedDays() {
  return JSON.parse(localStorage.getItem("blockedDays")) || [];
}

function dateKey(date) {
  return date.toISOString().split("T")[0];
}

function getApprovedTimesForDate(date) {
  const key = dateKey(date);

  return getBookings()
    .filter(booking => booking.status === "approved")
    .filter(booking => booking.date.split("T")[0] === key)
    .map(booking => booking.time);
}

function isBlockedDay(date) {
  const key = dateKey(date);

  return getBlockedDays().some(block => {
    return key >= block.start && key <= block.end;
  });
}

function isFullyBooked(date) {
  if (typeof getTimesForDate !== "function") return false;

  const times = getTimesForDate(date);

  if (times.length === 0) {
    return true;
  }

  const approvedTimes = getApprovedTimesForDate(date);

  return times.every(time => approvedTimes.includes(time));
}

function renderCalendar() {
  datesContainer.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthTitle.textContent = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric"
  });

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let startDay = firstDay.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1;

  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement("div");
    empty.className = "empty";
    datesContainer.appendChild(empty);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);

    const div = document.createElement("div");
    div.className = "date";
    div.textContent = day;

    const pastDate = date < today;
    const fullyBooked = isFullyBooked(date);
    const blocked = isBlockedDay(date);

    if (pastDate || fullyBooked || blocked) {
      div.classList.add("disabled");
    }

    if (blocked) {
      div.title = "Blocked by admin";
    }

    if (date.getTime() === today.getTime()) {
      div.classList.add("today");
    }

    if (selectedDate && date.getTime() === selectedDate.getTime()) {
      div.classList.add("selected");
    }

    if (!pastDate && !fullyBooked && !blocked) {
      div.addEventListener("click", () => {
        selectedDate = date;
        updateSelectedDateText();
        renderCalendar();

        if (typeof updateAvailableTimes === "function") {
          updateAvailableTimes();
        }
      });
    }

    datesContainer.appendChild(div);
  }

  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const shownMonthStart = new Date(year, month, 1);

  prevMonthBtn.disabled = shownMonthStart <= currentMonthStart;
  prevMonthBtn.style.opacity = prevMonthBtn.disabled ? "0.3" : "1";
}

function updateSelectedDateText() {
  if (!selectedDate) {
    selectedDateText.textContent = "Not selected";
    return;
  }

  selectedDateText.textContent = selectedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();