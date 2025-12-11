document.addEventListener("DOMContentLoaded", () => {
  const sections = Array.from(
    document.querySelectorAll(".walkthrough-section")
  );
  const sectionList = document.getElementById("sectionList");
  const hiddenList = document.getElementById("hiddenList");

  // Load hidden sections from localStorage
  const hiddenFromStorage = JSON.parse(
    localStorage.getItem("hiddenSections") || "[]"
  );
  const hiddenSet = new Set(hiddenFromStorage);

  // Build sidebar menu based on sections in the HTML
  sections.forEach((section) => {
    const id = section.id;
    const title =
      section.dataset.title || section.querySelector("h2").textContent;

    // Sidebar link
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#" + id;
    link.textContent = title;
    link.dataset.sectionId = id;
    li.appendChild(link);
    sectionList.appendChild(li);

    // Hide link if section is hidden
    if (hiddenSet.has(id)) {
      li.style.display = "none";
      addHiddenRow(id, title, hiddenSet);
    }

// Attach hide button
const hideBtn = section.querySelector(".hide-section");
if (hideBtn) {
  hideBtn.addEventListener("click", () => {
    hideSection(id, title, hiddenSet);
  });

  // ---------------------------------------------
  // ADD BACK BUTTON (TOP RIGHT)
  // ---------------------------------------------
  if (id !== "info" && id !== "hiddenManager") {
    // Create Back button
    const backBtn = document.createElement("button");
    backBtn.className = "back-btn";
    backBtn.textContent = "Back";

    // Insert it directly under the hide button
    hideBtn.insertAdjacentElement("afterend", backBtn);

    // When back is clicked, scroll to the nav item on the left
    backBtn.addEventListener("click", () => {
      const navItem = document.querySelector(`[data-section="${id}"]`);
      if (navItem) {
        navItem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }
}
  });

  // Smooth scroll & active link highlight
  sectionList.addEventListener("click", (evt) => {
    const link = evt.target.closest("a");
    if (!link) return;

    evt.preventDefault();

    const id = link.dataset.sectionId;
    const target = document.getElementById(id);
    if (!target) return;

    window.scrollTo({
      top: target.offsetTop - 10,
      behavior: "smooth",
    });

    // highlight active link
    sectionList.querySelectorAll("a").forEach((a) => {
      a.classList.toggle("active", a === link);
    });
  });

  function hideSection(id, title, hiddenSet) {
    // Hide from menu
    const link = sectionList.querySelector(`a[data-section-id="${id}"]`);
    if (link && link.parentElement) {
      link.parentElement.style.display = "none";
    }

    hiddenSet.add(id);
    saveHidden(hiddenSet);
    addHiddenRow(id, title, hiddenSet);
  }

  function addHiddenRow(id, title, hiddenSet) {
    // Don't duplicate rows
    if (hiddenList.querySelector(`li[data-section-id="${id}"]`)) return;

    const li = document.createElement("li");
    li.dataset.sectionId = id;
    li.textContent = title;

    const btn = document.createElement("button");
    btn.textContent = "unhide";
    btn.addEventListener("click", () => {
      // show in menu again
      const link = sectionList.querySelector(`a[data-section-id="${id}"]`);
      if (link && link.parentElement) {
        link.parentElement.style.display = "";
      }

      hiddenSet.delete(id);
      saveHidden(hiddenSet);

      // remove row from hidden list
      hiddenList.removeChild(li);
    });

    li.appendChild(btn);
    hiddenList.appendChild(li);
  }

  function saveHidden(hiddenSet) {
    localStorage.setItem("hiddenSections", JSON.stringify([...hiddenSet]));
  }

  /* =======================
     Highlight toggle logic
     ======================= */

  const newBtn = document.querySelector(
    '.highlight-option[data-highlight="new"]'
  );
  const currentBtn = document.querySelector(
    '.highlight-option[data-highlight="current"]'
  );
  const ntrBtn = document.querySelector(
    '.highlight-option[data-highlight="ntr"]'
  );

  if (newBtn && currentBtn && ntrBtn) {
    // NEW IN 0.6.1.0
    // - Toggles its own active state
    // - Can be ON together with Current Storylines
    // - Must be mutually exclusive with NTR
    // - Controls the green pulse via body.v0610-new-active
    newBtn.addEventListener("click", () => {
      const isActive = newBtn.classList.contains("active");

      if (isActive) {
        // Turn New OFF + stop pulse
        newBtn.classList.remove("active");
        document.body.classList.remove("v0610-new-active");
      } else {
        // Turn New ON + enable pulse
        newBtn.classList.add("active");
        document.body.classList.add("v0610-new-active");

        // New and NTR cannot be active together
        ntrBtn.classList.remove("active");

        // If you want New to ALSO auto-enable Current Storylines:
        if (!currentBtn.classList.contains("active")) {
          currentBtn.classList.add("active");
          // If you still have a current filter function, call it here:
          // applyCurrentFilter(true);
        }
      }
    });

    // CURRENT STORYLINES
    // - Toggles independently
    // - Does NOT touch New or the pulse
    currentBtn.addEventListener("click", () => {
      const isActive = currentBtn.classList.contains("active");

      if (isActive) {
        currentBtn.classList.remove("active");
        // If you have a filter for Current Storylines, you’d call:
        // applyCurrentFilter(false);
      } else {
        currentBtn.classList.add("active");
        // applyCurrentFilter(true);
      }
    });

    // NTR
    // - Toggles independently
    // - Mutually exclusive with New (turns New/pulse OFF when NTR is turned ON)
    ntrBtn.addEventListener("click", () => {
      const isActive = ntrBtn.classList.contains("active");

      if (isActive) {
        ntrBtn.classList.remove("active");
      } else {
        ntrBtn.classList.add("active");

        // Turn New OFF + stop pulse
        newBtn.classList.remove("active");
        document.body.classList.remove("v0610-new-active");
      }
    });
  }
});

    // CURRENT & NTR — can work together, always turn New OFF + stop pulse
    [currentBtn, ntrBtn].forEach((btn) => {
      btn.addEventListener("click", () => {
        const isActive = btn.classList.contains("active");

        // toggle this one
        if (isActive) {
          btn.classList.remove("active");
        } else {
          btn.classList.add("active");
        }

        // any time one of these is clicked, New turns OFF + pulse stops
        newBtn.classList.remove("active");
        document.body.classList.remove("v0610-new-active");
      });
    });
  }
});

