const supabaseUrl = "https://pbdeahmgwgelarpmoepo.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZGVhaG1nd2dlbGFycG1vZXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NzU1NzMsImV4cCI6MjA5MzM1MTU3M30.V1yP9nP_hDOjICDqL9XenO1K9yNm9nJHMfWQJNNjXvs";
const db = supabase.createClient(supabaseUrl, supabaseKey);

let moodChartInstance = null;

async function loadStats() {
  const {
    data: { session },
  } = await db.auth.getSession();
  if (!session) {
    window.location.href = "index.html";
    return;
  }

  const { data } = await db
    .from("moods")
    .select("*")
    .order("log_date", { ascending: true })
    .limit(7);

  if (!data || data.length === 0) {
    document.getElementById("insight-text").innerText =
      "Not enough data yet. Log your mood to see trends!";
    return;
  }

  // Calculate Average for Insight
  const avg = (
    data.reduce((acc, curr) => acc + curr.rating, 0) / data.length
  ).toFixed(1);
  document.getElementById("insight-text").innerText =
    `Your average mood this week is ${avg}/10. Keep shining! ✨`;

  renderChart(data);
}

function renderChart(data) {
  const ctx = document.getElementById("moodChart").getContext("2d");

  // Create Gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 250);
  gradient.addColorStop(0, "rgba(230, 164, 180, 0.4)");
  gradient.addColorStop(1, "rgba(230, 164, 180, 0)");

  moodChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.map((m) =>
        new Date(m.log_date).toLocaleDateString([], {
          month: "short",
          day: "numeric",
        }),
      ),
      datasets: [
        {
          data: data.map((m) => m.rating),
          borderColor: "#e6a4b4",
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: "#fff",
          pointBorderColor: "#e6a4b4",
          pointRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          grid: { color: "rgba(0,0,0,0.03)", drawBorder: false },
          ticks: { stepSize: 2, color: "#999" },
        },
        x: { grid: { display: false }, ticks: { color: "#999" } },
      },
    },
  });
}

loadStats();
