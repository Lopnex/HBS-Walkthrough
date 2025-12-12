document.addEventListener("DOMContentLoaded", () => {
  // ====== BASIC HOOKS ======
  const navList = document.getElementById("navList");
  const navItems = Array.from(
    navList.querySelectorAll(".nav-item")
  );
  const navLinks = Array.from(
    navList.querySelectorAll(".nav-link[data-section]")
  );
  const sections = Array.from(
    document.querySelectorAll(".content-section")
  );
  const manageHiddenLinks = Array.from(
    document.querySelectorAll(".manage-hidden-link")
  );
  const hiddenList = document.getElementById("hiddenList");

  // Manually-hidden sections (from "Hide"/"Unhide")
  const hiddenSections = new Set();

  // When using Current Storylines filter, these IDs are allowed
  const currentStorylineIds = new Set([
    "adel-reynolds",
    "gemma-rey",
    "christine-samson",
    "marie-prescott",
    "marcy-trevean",
    "rosie-stevens",
    "regan-collins",
    "lana-goodman",
    "amber-johnson",
    "marley-dewitt",
    "bethany-benson",
    "frank",
    "ella-norton",
    "abigail-coney",
    "claire-bosworth",
    "lola-johnson",
    "amy-bronson",
    "stacey-price",
    "loretta-hobson",
    "julie-compton",
    "steve-randall",
    "molly-simmons",
    "margot-simmons",
    "marion-ravenwood",
    "leia-littleton",
    "tania-abrahms",
    "polly-mathers",
    "shelley-bruce",
    "connor-gilding",
    "greg-hutchins",
    "yua-mita",
    "tilly-reynolds",
    "jessica-martin",
    "frankie-durham",
    "jack-romer",
    "jill-romer",
    "nigel-cunningham",
    "dr-jones",
    "thomas-wilson",
    // Extra current names
    "lucas-channing",
    "bruce-kreiger"
  ]);

  // IDs that should always stay in the nav even when filtered
  const alwaysShowIds = new Set([
    "main-story",
    "side-quests"
    
    // (no left-nav item for hiddenManager, that's opened from the right)
  ]);

  // When filter is on, manual "unhide" can override filter until filter clicked again
  const currentOverrides = new Set();
  let currentFilterOn = false;

  // ====== SECTION SWITCHING ======
  function showSection(id) {
    sections.forEach((sec) => {
      sec.classList.toggle("visible", sec.id === id);
    });
  }

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      const sec = link.getAttribute("data-section");
      link.classList.toggle("active", sec === id);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = link.getAttribute("data-section");
      if (!sectionId) return;

      // Ignore clicks on sections that are manually hidden
      if (hiddenSections.has(sectionId)) return;

      showSection(sectionId);
      setActiveNav(sectionId);
    });
  });

  // Manage Hidden link (right sidebar) -> open Manage Hidden section
  manageHiddenLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showSection("hiddenManager");
      setActiveNav(null);
    });
  });

  // ====== MANAGE HIDDEN SECTIONS ======

  function getNavItem(sectionId) {
    return navList.querySelector(`.nav-item[data-section="${sectionId}"]`);
  }

  function getNavTitle(sectionId) {
    const item = getNavItem(sectionId);
    if (!item) return sectionId;
    const btn = item.querySelector(".nav-link");
    return btn ? btn.textContent.trim() : sectionId;
  }

  function removeHiddenRow(sectionId) {
    if (!hiddenList) return;
    const row = hiddenList.querySelector(`li[data-section="${sectionId}"]`);
    if (row) hiddenList.removeChild(row);
  }

  function addHiddenRow(sectionId) {
    if (!hiddenList) return;
    // Avoid duplicates
    if (hiddenList.querySelector(`li[data-section="${sectionId}"]`)) return;

    const li = document.createElement("li");
    li.dataset.section = sectionId;

    const span = document.createElement("span");
    span.textContent = getNavTitle(sectionId);

    const btn = document.createElement("button");
    btn.textContent = "Unhide";
    btn.addEventListener("click", () => {
      unhideSection(sectionId, true);
    });

    li.appendChild(span);
    li.appendChild(btn);
    hiddenList.appendChild(li);
  }

  function applyCurrentFilter() {
    navItems.forEach((li) => {
      const id = li.dataset.section;
      // Headers have no data-section
      if (!id) {
        li.style.display = "";
        return;
      }

      // If manually hidden, never show in nav no matter what
      if (hiddenSections.has(id)) {
        li.style.display = "none";
        return;
      }

      if (!currentFilterOn) {
        // Filter OFF: show anything not manually hidden
        li.style.display = "";
        return;
      }

      // Filter ON:
      const isAlways = alwaysShowIds.has(id);
      const isCurrent = currentStorylineIds.has(id);
      const overridden = currentOverrides.has(id);

      const shouldShow = isAlways || isCurrent || overridden;
      li.style.display = shouldShow ? "" : "none";
    });
  }

  function hideSection(sectionId) {
    const item = getNavItem(sectionId);
    if (item) {
      item.style.display = "none";
    }
    hiddenSections.add(sectionId);
    // No override when hiding
    currentOverrides.delete(sectionId);
    addHiddenRow(sectionId);

    // Change that section's button text to "Unhide"
    const btn = document.querySelector(
      `.hide-section-btn[data-section="${sectionId}"]`
    );
    if (btn) btn.textContent = "Unhide";

    // If you hide the section you're currently viewing, bounce back to "info"
    const currentVisible = sections.find((s) =>
      s.classList.contains("visible")
    );
    if (currentVisible && currentVisible.id === sectionId) {
      showSection("info");
      setActiveNav("info");
    }
  }

  function unhideSection(sectionId, fromManager = false) {
    hiddenSections.delete(sectionId);

    const item = getNavItem(sectionId);
    if (item) {
      item.style.display = "";
    }

    // Remove from Manage Hidden list
    removeHiddenRow(sectionId);

    // Make the hide button say "Hide" again
    const btn = document.querySelector(
      `.hide-section-btn[data-section="${sectionId}"]`
    );
    if (btn) btn.textContent = "Hide";

    // If Current filter is ON, this acts as a temporary override
    // so it stays visible until you click the filter again
    if (currentFilterOn && !currentStorylineIds.has(sectionId)) {
      currentOverrides.add(sectionId);
    }

    applyCurrentFilter();
  }

  // Hook up the Hide/Unhide buttons in the middle pane
  const hideButtons = Array.from(
    document.querySelectorAll(".hide-section-btn[data-section]")
  );

  hideButtons.forEach((btn) => {
    const sectionId = btn.getAttribute("data-section");
    btn.addEventListener("click", () => {
      if (hiddenSections.has(sectionId)) {
        // Already hidden → now unhide
        unhideSection(sectionId, false);
      } else {
        // Not hidden → hide it
        hideSection(sectionId);
      }
    });
  });

  // ====== HIGHLIGHT / FILTER BUTTONS (RIGHT SIDEBAR) ======

  const newBtn = document.querySelector(
    '.highlight-option[data-highlight="new"]'
  );
  const currentBtn = document.querySelector(
    '.highlight-option[data-highlight="current"]'
  );
  const pregBtn = document.querySelector(
    '.highlight-option[data-highlight="pregnancy"]'
  );
  const ntrBtn = document.querySelector(
    '.highlight-option[data-highlight="ntr"]'
  );

  // Simple New/Current/NTR toggle logic (visual + green pulse)
  if (newBtn && currentBtn && ntrBtn) {
    // New in 0.6.1.x: toggles pulse & is exclusive with NTR
    newBtn.addEventListener("click", () => {
      const isActive = newBtn.classList.contains("active");
      if (isActive) {
        newBtn.classList.remove("active");
        document.body.classList.remove("v0610-new-active");
      } else {
        newBtn.classList.add("active");
        document.body.classList.add("v0610-new-active");

        // New & NTR cannot both be on
        ntrBtn.classList.remove("active");
      }
    });

    // Current Storylines = our actual FILTER
    currentBtn.addEventListener("click", () => {
      currentFilterOn = !currentFilterOn;
      currentBtn.classList.toggle("active", currentFilterOn);

      if (!currentFilterOn) {
        // Turning filter OFF: clear overrides and show everything again
        currentOverrides.clear();
      }

      applyCurrentFilter();
    });

    // NTR: just a visual toggle and turns New off
    ntrBtn.addEventListener("click", () => {
      const isActive = ntrBtn.classList.contains("active");
      if (isActive) {
        ntrBtn.classList.remove("active");
      } else {
        ntrBtn.classList.add("active");
        // NTR on → New off + pulse stop
        newBtn.classList.remove("active");
        document.body.classList.remove("v0610-new-active");
      }
    });
  }

  // Pregnancy button (for now just visual toggle; you can hook more later)
  if (pregBtn) {
    pregBtn.addEventListener("click", () => {
      pregBtn.classList.toggle("active");
    });
  }

  // ====== INITIAL STATE ======
  showSection("info");
  setActiveNav("info");
  applyCurrentFilter();
});
