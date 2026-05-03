// --- SUPABASE CONFIG ---
const supabaseUrl = "https://pbdeahmgwgelarpmoepo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZGVhaG1nd2dlbGFycG1vZXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NzU1NzMsImV4cCI6MjA5MzM1MTU3M30.V1yP9nP_hDOjICDqL9XenO1K9yNm9nJHMfWQJNNjXvs";

const db = supabase.createClient(supabaseUrl, supabaseKey);

// --- ELEMENTS ---
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const emailInput = document.getElementById("auth-email");
const passInput = document.getElementById("auth-password");

// --- INITIAL CHECK ---
async function checkUser() {
  const {
    data: { session },
  } = await db.auth.getSession();
  if (session) {
    // If user is already logged in, send them to the main dashboard
    window.location.href = "dashboard.html";
  }
}

// --- SIGN UP ---
signupBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passInput.value;

  const { data, error } = await db.auth.signUp({ email, password });

  if (error) {
    alert("Oops! " + error.message);
  } else {
    alert("Check your email for the magic link!");
  }
});

// --- LOG IN ---
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value;
  const password = passInput.value;

  const { data, error } = await db.auth.signInWithPassword({ email, password });

  if (error) {
    alert("Hmm, " + error.message);
  } else {
    window.location.href = "dashboard.html"; // Your next page
  }
});

checkUser();
