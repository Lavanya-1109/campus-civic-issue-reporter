document.addEventListener("DOMContentLoaded", async () => {
  const mount = document.getElementById("feed-mount");

  try {
    const response = await fetch("../reports/reports.html");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const sourceDocument = new DOMParser().parseFromString(await response.text(), "text/html");
    const sourceMain = sourceDocument.querySelector("main");
    if (!sourceMain) throw new Error("No <main> found in reports/reports.html");

    sourceMain.id = "feed-mount";
    mount.replaceWith(sourceMain);
    applyRole(localStorage.getItem("univpulse_dev_role") || "student");
  } catch (error) {
    console.error("Failed to load reports fragment:", error);
    mount.innerHTML = `
      <div class="text-center py-24">
        <p class="text-body-sm font-body-sm text-error mb-2">Couldn't load reports right now.</p>
        <a class="text-label-md font-label-md text-secondary hover:underline" href="../reports/reports.html">Open Reports directly →</a>
      </div>`;
  }
});
