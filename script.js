
const dailyGoal = 2000;
const glassSize = 250;

const savedData = JSON.parse(
  localStorage.getItem("sipMyLoveData") || '{"water":0,"history":[]}'
);

let water = savedData.water;
let history = savedData.history;

const count = document.getElementById("count");
const goal = document.getElementById("goal");
const progress = document.getElementById("progress");
const fill = document.getElementById("progress-fill");
const message = document.getElementById("message");

goal.textContent = dailyGoal;

const loveNotes = [
  "Pause for a moment, my love. Your body deserves care too. 💗",
  "A little sip for my favourite human. I love you. 💧",
  "Whatever today brings, remember to take care of yourself, beautiful.",
  "Your personal hydration department is checking in. 😂❤️",
  "Drink a little water, relax your shoulders, and take a breath."
];

function saveData() {
  localStorage.setItem(
    "sipMyLoveData",
    JSON.stringify({ water, history })
  );
}

function updateScreen() {
  count.textContent = water;

  const percentage = Math.min((water / dailyGoal) * 100, 100);
  fill.style.width = percentage + "%";

  progress.textContent =
    water >= dailyGoal
      ? "Beautiful! You've reached your target. 💗"
      : "You're doing lovely, one sip at a time.";

  message.textContent =
    loveNotes[Math.floor(Math.random() * loveNotes.length)];
}

document.getElementById("add-water").addEventListener("click", () => {
  history.push(water);
  water += glassSize;
  saveData();
  updateScreen();
});

document.getElementById("undo-water").addEventListener("click", () => {
  if (history.length > 0) {
    water = history.pop();
    saveData();
    updateScreen();
  }
});

updateScreen();


let reminderTimer = null;
let nextReminderAt = null;

const reminderStatus = document.getElementById("reminder-status");
const enableButton = document.getElementById("enable-reminders");
const pauseButton = document.getElementById("pause-reminders");

const defaultPreferences = {
  start: "09:00",
  end: "21:00",
  interval: "60",
  enabled: false
};

let preferences = {
  ...defaultPreferences,
  ...JSON.parse(
    localStorage.getItem("sipMyLovePreferences") || "{}"
  )
};

// Restore the saved settings in the form.
document.getElementById("start-time").value = preferences.start;
document.getElementById("end-time").value = preferences.end;
document.getElementById("reminder-interval").value =
  preferences.interval;

function savePreferences() {
  preferences.start = document.getElementById("start-time").value;
  preferences.end = document.getElementById("end-time").value;
  preferences.interval =
    document.getElementById("reminder-interval").value;

  localStorage.setItem(
    "sipMyLovePreferences",
    JSON.stringify(preferences)
  );
}

document.getElementById("start-time").addEventListener(
  "change", savePreferences
);

document.getElementById("end-time").addEventListener(
  "change", savePreferences
);

document.getElementById("reminder-interval").addEventListener(
  "change", savePreferences
);

function isWithinReminderHours() {
  const start = document.getElementById("start-time").value;
  const end = document.getElementById("end-time").value;

  if (!start || !end || start === end) return false;

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  if (startMinutes < endMinutes) {
    return current >= startMinutes && current < endMinutes;
  }

  return current >= startMinutes || current < endMinutes;
}

function sendWaterReminder() {
  if (!isWithinReminderHours()) {
    reminderStatus.textContent =
      "It's outside your reminder hours. Rest easy, love. ♡";
    return;
  }

  const note =
    "Hey, beautiful! Take a little sip of water for me. ❤️💧";

  if (
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    new Notification("Sip, My Love 💧", { body: note });
    reminderStatus.textContent =
      "A little reminder sent with love. 💗";
  } else {
    reminderStatus.textContent = note;
  }
}

function startReminderTimer() {
  if (reminderTimer) clearInterval(reminderTimer);

  const minutes = Number(preferences.interval);
  nextReminderAt = Date.now() + minutes * 60 * 1000;

  reminderTimer = setInterval(() => {
    if (Date.now() >= nextReminderAt) {
      sendWaterReminder();
      nextReminderAt = Date.now() + minutes * 60 * 1000;
    }
  }, 5000);
}

enableButton.addEventListener("click", async () => {
  if (!("Notification" in window)) {
    reminderStatus.textContent =
      "Notifications aren't supported in this browser.";
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    reminderStatus.textContent =
      "Please allow notifications in your browser settings.";
    return;
  }

  savePreferences();
  preferences.enabled = true;

  localStorage.setItem(
    "sipMyLovePreferences",
    JSON.stringify(preferences)
  );

  startReminderTimer();

  reminderStatus.textContent =
    "Reminders are on, beautiful. I'll check in every " +
    preferences.interval + " minutes. 💗";
});

pauseButton.addEventListener("click", () => {
  if (reminderTimer) clearInterval(reminderTimer);

  reminderTimer = null;
  nextReminderAt = null;
  preferences.enabled = false;

  localStorage.setItem(
    "sipMyLovePreferences",
    JSON.stringify(preferences)
  );

  reminderStatus.textContent =
    "Reminders paused. Take care, beautiful. ♡";
});

// Restore reminders after refresh if permission was already granted.
if (
  preferences.enabled &&
  "Notification" in window &&
  Notification.permission === "granted"
) {
  startReminderTimer();
  reminderStatus.textContent =
    "Your reminders are back on, beautiful. 💗";
} else {
  preferences.enabled = false;
  localStorage.setItem(
    "sipMyLovePreferences",
    JSON.stringify(preferences)
  );
  reminderStatus.textContent = "Your reminders are currently off.";
}
