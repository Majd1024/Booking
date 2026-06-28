const calendarPage = document.getElementById("calendarPage");
const detailsPage = document.getElementById("detailsPage");
const successPage = document.getElementById("successPage");

const continueBtn = document.getElementById("continueBtn");
const backBtn = document.getElementById("backBtn");
const newBookingBtn = document.getElementById("newBookingBtn");

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(pageId).classList.add("active");
  window.scrollTo(0, 0);
}

continueBtn.addEventListener("click", () => {
  if (!selectedDate) {
    alert("Please select a date first.");
    return;
  }

  if (!selectedTime) {
    alert("Please select a time first.");
    return;
  }

  updateBookingSummary();
  showPage("detailsPage");
});

backBtn.addEventListener("click", () => {
  showPage("calendarPage");
});

newBookingBtn.addEventListener("click", () => {
  location.reload();
});