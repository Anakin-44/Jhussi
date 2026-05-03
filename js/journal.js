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
  loadJournal();
}

// Save Entry
document.getElementById("save-journal").addEventListener("click", async () => {
  const entry = document.getElementById("journal-entry").value;
  if (!entry.trim()) return;

  const { error } = await db
    .from("journal")
    .insert([{ entry, user_id: currentUser.id }]);

  if (!error) {
    document.getElementById("journal-entry").value = "";
    loadJournal();
  } else {
    alert("Oops! Couldn't save your thought.");
  }
});

// Load History
async function loadJournal() {
  const { data, error } = await db
    .from("journal")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return;

  const container = document.getElementById("journal-history");
  container.innerHTML = data
    .map(
      (j) => `
    <div class="history-item">
      <small>${new Date(j.created_at).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}</small>
      <p>${j.entry}</p>
    </div>
  `,
    )
    .join("");
}

init();
