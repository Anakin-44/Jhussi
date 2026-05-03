const supabaseUrl = "https://pbdeahmgwgelarpmoepo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZGVhaG1nd2dlbGFycG1vZXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NzU1NzMsImV4cCI6MjA5MzM1MTU3M30.V1yP9nP_hDOjICDqL9XenO1K9yNm9nJHMfWQJNNjXvs";
const db = supabase.createClient(supabaseUrl, supabaseKey);

let currentUser = null;
let waterGlasses = 0;

// --- INITIALIZATION ---
async function init() {
  const {
    data: { session },
  } = await db.auth.getSession();

  if (!session) {
    window.location.href = "index.html";
    return;
  }

  currentUser = session.user;

  setGreetings();
  fetchAvgMood();
  initWaterCounter();
}

// --- GREETING LOGIC ---
function setGreetings() {
  const greetings = [
    "Hello babyy ✨",
    "Welcome home 🏠",
    "I love you Aru ☁️",
    "Hello lovely! 🌸",
  ];
  const subGreetings = [
    "How are you feeling?",
    "Take a deep breath.",
    "Time for a little check-in.",
    "You're doing great.",
  ];

  document.getElementById("greeting").innerText =
    greetings[Math.floor(Math.random() * greetings.length)];
  document.getElementById("sub-greeting").innerText =
    subGreetings[Math.floor(Math.random() * subGreetings.length)];
}

// --- MOOD LOGIC ---
const slider = document.getElementById("mood-slider");
const display = document.getElementById("mood-value");

if (slider) {
  slider.addEventListener("input", (e) => {
    display.innerText = e.target.value;
  });
}

document.getElementById("save-mood").addEventListener("click", async () => {
  const rating = parseInt(slider.value);
  const { error } = await db
    .from("moods")
    .insert([{ rating, user_id: currentUser.id }]);

  if (error) {
    alert("Could not save: " + error.message);
  } else {
    alert("Mood saved! You're doing amazing! ✨");
    fetchAvgMood(); // Refresh the average display immediately
  }
});

async function fetchAvgMood() {
  const { data, error } = await db
    .from("moods")
    .select("rating")
    .eq("user_id", currentUser.id);

  if (data && data.length > 0) {
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = (sum / data.length).toFixed(1);
    document.getElementById("avg-mood-val").innerText = `${avg}/10`;
  }
}

// --- WATER COUNTER LOGIC ---
function initWaterCounter() {
  const today = new Date().toLocaleDateString();
  const savedData = JSON.parse(localStorage.getItem("waterData"));

  if (savedData && savedData.date === today) {
    waterGlasses = savedData.count;
  } else {
    waterGlasses = 0;
  }
  updateWaterUI();
}

function updateWaterUI() {
  document.getElementById("water-count").innerText = waterGlasses;
  document.getElementById("water-goal-status").innerText =
    `${waterGlasses} / 8 glasses`;

  const today = new Date().toLocaleDateString();
  localStorage.setItem(
    "waterData",
    JSON.stringify({ date: today, count: waterGlasses }),
  );
}

document.getElementById("add-water").addEventListener("click", () => {
  waterGlasses++;
  updateWaterUI();
});

document.getElementById("remove-water").addEventListener("click", () => {
  if (waterGlasses > 0) {
    waterGlasses--;
    updateWaterUI();
  }
});

// Start the app
init();
