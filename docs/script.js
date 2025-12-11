document.addEventListener("DOMContentLoaded", () => {
  // ===== Core DOM references =====
  const sections = Array.from(document.querySelectorAll(".content-section"));
  const navList = document.getElementById("navList");
  const navButtons = navList
    ? Array.from(navList.querySelectorAll(".nav-link"))
    : [];
  const hiddenList = document.getElementById("hiddenList");
  const manageHiddenLink = document.querySelector(".manage-hidden-link");

  // If navList isn't found something is very wrong; bail out gracefully.
  if (!navList) {
    console.warn("navList (#navList) not found – check your HTML.");
  }

  // ===== Hidden sections (persisted in localStorage) =====
  const hiddenFromStorage = JSON.parse(
    localStorage.getItem("hiddenSections") || "[]"
  );
  const hiddenSet = new Set(hiddenFromStorage);

  function saveHidden() {
    localStorage.setItem("hiddenSections", JSON.stringify([...hiddenSet]));
  }

  function findSectionTitle(id) {
    const section = document.getElementById(id);
    if (section) {
      const h2 = section.querySelector("h2");
      if (h2) return h2.textContent.trim();
    }

    if (navList) {
      const navBtn = navList.querySelector(
        `.nav-item[data-section="${id}"] .nav-link`
      );
      if (navBtn) return navBtn.textContent.trim();
    }

    return id;
  }

  function updateHideButtonLabel(id) {
    const section = document.getElementById(id);
    if (!section) return;
    const hideBtn = section.querySelector(".hide-section-btn");
    if (!hideBtn) return;

    hideBtn.textContent = hiddenSet.has(id) ? "Unhide" : "Hide";
  }

  function addHiddenRow(id) {
    if (!hiddenList) return;

    // Don't duplicate rows
    if (hiddenList.querySelector(`li[data-section-id="${id}"]`)) return;

    const li = document.createElement("li");
    li.dataset.sectionId = id;

    const label = document.createElement("span");
    label.textContent = findSectionTitle(id);
    li.appendChild(label);

    const btn = document.createElement("button");
    btn.textContent = "Unhide";
    btn.addEventListener("click", () => {
      unhideSection(id);
    });
    li.appendChild(btn);

    hiddenList.appendChild(li);
  }

  function hideSection(id) {
    const navItem = navList
      ? navList.querySelector(`.nav-item[data-section="${id}"]`)
      : null;
    if (navItem) {
      navItem.style.display = "none";
    }

    hiddenSet.add(id);
    saveHidden();
    addHiddenRow(id);
    updateHideButtonLabel(id);
  }

  function unhideSection(id) {
    const navItem = navList
      ? navList.querySelector(`.nav-item[data-section="${id}"]`)
      : null;
    if (navItem) {
      navItem.style.display = "";
    }

    hiddenSet.delete(id);
    saveHidden();

    if (hiddenList) {
      const row = hiddenList.querySelector(`li[data-section-id="${id}"]`);
      if (row) {
        hiddenList.removeChild(row);
      }
    }

    updateHideButtonLabel(id);
  }

  // Apply hidden state from localStorage on load
  hiddenSet.forEach((id) => {
    const navItem = navList
      ? navList.querySelector(`.nav-item[data-section="${id}"]`)
      : null;
    if (navItem) {
      navItem.style.display = "none";
    }
    addHiddenRow(id);
    updateHideButtonLabel(id);
  });

  // ===== Section show/hide via left nav =====
  function showSection(id) {
    sections.forEach((section) => {
      section.classList.toggle("visible", section.id === id);
    });
  }

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.section;
      if (!id) return;

      showSection(id);

      navButtons.forEach((b) => {
        b.classList.toggle("active", b === btn);
      });
    });
  });

  // "Manage Hidden Sections" link on the right
  if (manageHiddenLink) {
    manageHiddenLink.addEventListener("click", (evt) => {
      evt.preventDefault();
      const id = manageHiddenLink.dataset.section;
      if (!id) return;
      showSection(id);

      // Clear active state from left nav (nothing in left nav corresponds to this)
      navButtons.forEach((b) => b.classList.remove("active"));
    });
  }

  // ===== Per-section Hide / Unhide + Back buttons =====
  sections.forEach((section) => {
    const id = section.id;
    const hideBtn = section.querySelector(".hide-section-btn");

    if (hideBtn) {
      // Set initial label based on whether it's in the hidden set
      updateHideButtonLabel(id);

      hideBtn.addEventListener("click", () => {
        const isHidden = hiddenSet.has(id);
        if (isHidden) {
          // Clicking "Unhide" -> undo hiding
          unhideSection(id);
        } else {
          // Clicking "Hide" -> hide from left menu + add to Manage Hidden
          hideSection(id);
        }
      });

      // Optional Back button at top-right (skip info + hiddenManager)
      if (id !== "info" && id !== "hiddenManager") {
        const backBtn = document.createElement("button");
        backBtn.className = "hide-section-btn";
        backBtn.textContent = "Back";

        // Stack under the Hide/Unhide button if there's a wrapper, else place after
        const headerButtonsWrapper = section.querySelector(
          ".section-header-buttons"
        );
        if (headerButtonsWrapper) {
          headerButtonsWrapper.appendChild(backBtn);
        } else {
          hideBtn.insertAdjacentElement("afterend", backBtn);
        }

        backBtn.addEventListener("click", () => {
          const navItem = document.querySelector(
            `.nav-item[data-section="${id}"] .nav-link`
          );
          if (navItem) {
            navItem.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
      }
    }
  });

  // ===== Highlight toggle logic (New / Current / NTR + section tags) =====
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

    // Section tag buttons
    const tagButtons = document.querySelectorAll(".section-tag");
    tagButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const isActive = btn.classList.contains("active");

        if (isActive) {
          btn.classList.remove("active");
        } else {
          btn.classList.add("active");
        }

        // Any time a tag button is clicked, New turns OFF + pulse stops
        newBtn.classList.remove("active");
        document.body.classList.remove("v0610-new-active");
      });
    });
  }
});
