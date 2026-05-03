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
  loadPeriods();
}

// Save Period Start
document.getElementById("save-period").addEventListener("click", async () => {
  const date = document.getElementById("period-start").value;
  if (!date) return;

  const { error } = await db
    .from("periods")
    .insert([{ start_date: date, user_id: currentUser.id }]);

  if (!error) {
    alert("Cycle logged! Take care of yourself. 🍵");
    loadPeriods();
  }
});

// Load History
async function loadPeriods() {
  const { data, error } = await db
    .from("periods")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) return;

  const container = document.getElementById("period-history");
  container.innerHTML = data
    .map((p) => {
      const d = new Date(p.start_date);
      return `
      <div class="cycle-card">
        <div class="cycle-icon">🌸</div>
        <div class="cycle-info">
          <span>${d.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}</span>
          <small>Cycle start date logged</small>
        </div>
      </div>
    `;
    })
    .join("");
}

init();
