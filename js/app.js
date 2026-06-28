const calendarPage = document.getElementById("calendarPage");
const detailsPage = document.getElementById("detailsPage");
const successPage = document.getElementById("successPage");

const continueBtn = document.getElementById("continueBtn");
const backBtn = document.getElementById("backBtn");
const newBookingBtn = document.getElementById("newBookingBtn");

const installBtn = document.getElementById("installBtn");

let deferredPrompt = null;

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

/* =========================
   PWA INSTALL BUTTON
========================= */

if (installBtn) {
  installBtn.style.display = "none";
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();

  deferredPrompt = event;

  if (installBtn) {
    installBtn.style.display = "inline-flex";
  }
});

if (installBtn) {
  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    deferredPrompt = null;
    installBtn.style.display = "none";
  });
}

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;

  if (installBtn) {
    installBtn.style.display = "none";
  }
});

/* =========================
   SERVICE WORKER
========================= */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => {
        console.log("Service worker registered");
      })
      .catch(error => {
        console.log("Service worker registration failed:", error);
      });
  });
}