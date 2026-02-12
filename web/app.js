(function () {
  const hexInput = document.getElementById("hexInput");
  const seriesSelect = document.getElementById("seriesSelect");
  const limitSelect = document.getElementById("limitSelect");
  const searchBtn = document.getElementById("searchBtn");
  const previewSwatch = document.getElementById("previewSwatch");
  const previewLabel = document.getElementById("previewLabel");
  const messageEl = document.getElementById("message");
  const resultsCard = document.getElementById("resultsCard");
  const resultsBody = document.getElementById("resultsBody");
  const resultCount = document.getElementById("resultCount");

  const HEX_RE = /^#?([0-9A-Fa-f]{6})$/;

  function normalize(val) {
    const m = val.trim().match(HEX_RE);
    return m ? "#" + m[1].toUpperCase() : null;
  }

  // Live preview
  hexInput.addEventListener("input", () => {
    const hex = normalize(hexInput.value);
    if (hex) {
      previewSwatch.style.background = hex;
      previewLabel.textContent = hex;
    } else {
      previewSwatch.style.background = "#fff";
      previewLabel.textContent = hexInput.value.trim() ? "Invalid HEX" : "";
    }
  });

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = type;
  }

  function clearResults() {
    resultsBody.innerHTML = "";
    resultsCard.hidden = true;
  }

  function distanceClass(d) {
    if (d < 20) return "exact";
    if (d < 80) return "close";
    return "far";
  }

  function renderResults(data) {
    clearResults();

    if (data.results.length === 0) {
      showMessage("No matches found.", "info");
      return;
    }

    if (data.meta.mode === "stub") {
      showMessage(data.meta.note, "info");
    } else {
      showMessage("", "");
    }

    resultCount.textContent = `${data.results.length} result${data.results.length === 1 ? "" : "s"}`;

    data.results.forEach((r) => {
      const tr = document.createElement("tr");

      // Swatch
      const swatchTd = document.createElement("td");
      const chip = document.createElement("div");
      chip.className = "swatch-cell";
      chip.style.background = r.hex;
      swatchTd.appendChild(chip);
      tr.appendChild(swatchTd);

      // PMS + series
      const pmsTd = document.createElement("td");
      const pmsSpan = document.createElement("span");
      pmsSpan.className = "pms-name";
      pmsSpan.textContent = `PMS ${r.pms}`;
      const seriesSpan = document.createElement("span");
      seriesSpan.className = "pms-series";
      seriesSpan.textContent = r.series;
      pmsTd.appendChild(pmsSpan);
      pmsTd.appendChild(seriesSpan);
      tr.appendChild(pmsTd);

      // HEX
      const hexTd = document.createElement("td");
      hexTd.className = "mono";
      hexTd.textContent = r.hex;
      tr.appendChild(hexTd);

      // Distance badge
      const distTd = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = `distance-badge ${distanceClass(r.distance)}`;
      badge.textContent = r.distance.toFixed(2);
      distTd.appendChild(badge);
      tr.appendChild(distTd);

      // Name
      const nameTd = document.createElement("td");
      nameTd.textContent = r.name;
      tr.appendChild(nameTd);

      // Notes
      const notesTd = document.createElement("td");
      notesTd.textContent = r.notes;
      tr.appendChild(notesTd);

      resultsBody.appendChild(tr);
    });

    resultsCard.hidden = false;
  }

  async function doSearch() {
    const hex = normalize(hexInput.value);
    if (!hex) {
      showMessage("Enter a valid HEX color (#RRGGBB).", "error");
      clearResults();
      return;
    }

    const series = seriesSelect.value;
    const limit = limitSelect.value;

    showMessage("Searching...", "info");
    clearResults();

    try {
      const url = `/api/pms?hex=${encodeURIComponent(hex)}&series=${series}&limit=${limit}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        showMessage(data.error || "API error", "error");
        return;
      }

      renderResults(data);
    } catch (err) {
      showMessage("Network error: " + err.message, "error");
    }
  }

  searchBtn.addEventListener("click", doSearch);

  hexInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doSearch();
  });
})();
