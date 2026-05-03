// Request notification permission on load
if ("Notification" in window) {
  if (
    Notification.permission !== "granted" &&
    Notification.permission !== "denied"
  ) {
    Notification.requestPermission();
  }
}

const supabaseUrl = "https://pbdeahmgwgelarpmoepo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZGVhaG1nd2dlbGFycG1vZXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NzU1NzMsImV4cCI6MjA5MzM1MTU3M30.V1yP9nP_hDOjICDqL9XenO1K9yNm9nJHMfWQJNNjXvs";
const db = supabase.createClient(supabaseUrl, supabaseKey);

let currentUser = null;

async function init() {
  const {
    data: { session },
  } = await db.auth.getSession();
  if (!session) {
    window.location.href = "index.html";
    return;
  }
  currentUser = session.user;
  loadMeds();
}

// Add Med
document.getElementById("add-med").addEventListener("click", async () => {
  const name = document.getElementById("med-name").value;
  const time = document.getElementById("med-time").value;

  if (!name || !time) return;

  const { error } = await db.from("medicine_schedule").insert([
    {
      med_name: name,
      time_to_take: time,
      user_id: currentUser.id,
      is_taken: false, // Ensure new meds start unticked
    },
  ]);

  if (!error) {
    document.getElementById("med-name").value = "";
    document.getElementById("med-time").value = "";
    loadMeds();
  }
});

// Update Med Status in Database
async function toggleMed(id, status) {
  const { error } = await db
    .from("medicine_schedule")
    .update({ is_taken: status })
    .eq("id", id);

  if (error) console.error("Error updating med:", error);
}

// Load Meds
async function loadMeds() {
  const { data, error } = await db
    .from("medicine_schedule")
    .select("*")
    .order("time_to_take");

  if (error) return;

  const container = document.getElementById("med-todo-list");

  // Clear container
  container.innerHTML = "";

  data.forEach((m) => {
    const medDiv = document.createElement("div");
    medDiv.className = "med-check";

    // Create checkbox and set its initial state from DB
    const isChecked = m.is_taken ? "checked" : "";

    medDiv.innerHTML = `
      <input type="checkbox" data-id="${m.id}" ${isChecked}>
      <div>
        <small>${m.time_to_take}</small>
        <span>${m.med_name}</span>
      </div>
    `;

    // Listen for clicks on the checkbox
    const checkbox = medDiv.querySelector("input");
    checkbox.addEventListener("change", (e) => {
      toggleMed(m.id, e.target.checked);
    });

    container.appendChild(medDiv);
  });
}

init();

// Check for due medicines every 60 seconds
setInterval(async () => {
  const now = new Date();
  // Format current time to HH:MM to match Supabase (e.g., "14:30")
  const currentTime =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");

  const { data: meds } = await db
    .from("medicine_schedule")
    .select("*")
    .eq("time_to_take", currentTime)
    .eq("user_id", currentUser.id);

  if (meds && meds.length > 0) {
    meds.forEach((m) => {
      showMedNotification(m.med_name);
    });
  }
}, 60000); // 60000ms = 1 minute

function showMedNotification(medName) {
  if (Notification.permission === "granted") {
    new Notification("Time for your medicine! 💊", {
      body: `It's time to take your ${medName}. Stay healthy! ✨`,
      icon: "icon.png", // Path to your app icon
    });
  } else {
    // Fallback if notifications are blocked
    alert(`Reminder: Time to take your ${medName}! 🌸`);
  }
}
