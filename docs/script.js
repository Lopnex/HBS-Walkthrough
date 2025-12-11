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

    const hideBtn = section.querySelector(".hide-section");

    // If this section was hidden previously, reflect that in UI
    if (hiddenSet.has(id)) {
      li.style.display = "none";
      addHiddenRow(id, title);
      if (hideBtn) {
        hideBtn.textContent = "Unhide";
      }
    }

    // Attach hide/unhide toggle button inside the section header
    if (hideBtn) {
      hideBtn.addEventListener("click", () => {
        const isHidden = hiddenSet.has(id);
        if (isHidden) {
          unhideSection(id);
        } else {
          hideSection(id, title);
        }
      });

      // Add a Back button (except on info/hidden manager sections)
      if (id !== "info" && id !== "hiddenManager") {
        const backBtn = document.createElement("button");
        backBtn.className = "back-btn";
        backBtn.textContent = "Back";

        // Insert it directly after the hide/unhide button
        hideBtn.insertAdjacentElement("afterend", backBtn);

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

  // --- Hide / Unhide helper functions ---

  function hideSection(id, title) {
    // Hide from menu
    const link = sectionList.querySelector(`a[data-section-id="${id}"]`);
    if (link && link.parentElement) {
      link.parentElement.style.display = "none";
    }

    hiddenSet.add(id);
    saveHidden();
    addHiddenRow(id, title);

    // Change button text to "Unhide"
    const section = sections.find((s) => s.id === id);
    if (section) {
      const hideBtn = section.querySelector(".hide-section");
      if (hideBtn) {
        hideBtn.textContent = "Unhide";
      }
    }
  }

  function unhideSection(id) {
    // Show in menu again
    const link = sectionList.querySelector(`a[data-section-id="${id}"]`);
    if (link && link.parentElement) {
      link.parentElement.style.display = "";
    }

    hiddenSet.delete(id);
    saveHidden();

    // Remove row from Manage Hidden list
    const row = hiddenList.querySelector(`li[data-section-id="${id}"]`);
    if (row) {
      hiddenList.removeChild(row);
    }

    // Reset button text to "Hide"
    const section = sections.find((s) => s.id === id);
    if (section) {
      const hideBtn = section.querySelector(".hide-section");
      if (hideBtn) {
        hideBtn.textContent = "Hide";
      }
    }
  }

  function addHiddenRow(id, title) {
    if (!hiddenList) return;

    // Don't duplicate rows
    if (hiddenList.querySelector(`li[data-section-id="${id}"]`)) return;

    const li = document.createElement("li");
    li.dataset.sectionId = id;

    const label = document.createElement("span");
    label.textContent = title;
    li.appendChild(label);

    const btn = document.createElement("button");
    btn.textContent = "Unhide";
    btn.addEventListener("click", () => {
      unhideSection(id);
    });
    li.appendChild(btn);

    hiddenList.appendChild(li);
  }

  function saveHidden() {
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

        // If NTR is ON, turn it OFF
        ntrBtn.classList.remove("active");
      }
    });

    // CURRENT STORYLINES
    // - Toggles independently
    // - Does NOT touch New or the pulse
    currentBtn.addEventListener("click", () => {
      const isActive = currentBtn.classList.contains("active");

      if (isActive) {
        currentBtn.classList.remove("active");
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

    // CLICK ANY TAG BUTTON INSIDE THE SECTIONS
    // - Toggles its own active state
    // - Always turns New OFF + stops pulse
    const tagButtons = document.querySelectorAll(".section-tag");
    tagButtons.forEach((btn) => {
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
