document.addEventListener("DOMContentLoaded", () => {
  // ====== BASIC HOOKS ======
  const navList = document.getElementById("navList");
  const navItems = Array.from(navList.querySelectorAll(".nav-item"));
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

  // ====== FILTER CONFIG ======

  // Current storylines list
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
    // nothing else here – info/getting-started/extra-content are NOT always shown
  ]);

  // Pregnancy highlight IDs (pink)
  const pregnancyIds = new Set([
    "adel-reynolds",
    "gemma-rey",
    "christine-samson",
    "marcy-trevean",
    "lillie-michaels",
    "tilly-reynolds",
    "claire-bosworth"
  ]);

  // NTR highlight IDs (red)
  const ntrRedIds = new Set([
    "adel-reynolds",
    "christine-samson",
    "gemma-rey",
    "lillie-michaels",
    "marcy-trevean",
    "rosie-stevens",
    "marie-prescott",
    "regan-collins",
    "tania-abrahms",
    "amber-johnson",
    "abigail-coney",
    "claire-bosworth",
    "leia-littleton",
    "polly-mathers",
    "shelley-bruce",
    "tilly-reynolds",
    "jessica-martin",
    "jill-romer",
    "nigel-cunningham",
    "lucas-channing",
    "steve-randall",
    "frank",
    "dr-jones",
    "jack-romer",
    "connor-gilding",
    "bruce-kreiger"
  ]);

  // NEW content IDs (green)
  const newIds = new Set([
    "main-story",
    "tilly-reynolds",
    "ella-norton"
  ]);

  // Paths — go into "Paths" header when NTR is active
  const pathIds = [
    "dr-jones",
    "frank",
    "lucas-channing",
    "nigel-cunningham"
  ];

  // Save original positions for path items
  const originalPositions = new Map();
  pathIds.forEach((id) => {
    const item = document.querySelector(
      '.nav-item[data-section="' + id + '"]'
    );
    if (item) {
      originalPositions.set(id, {
        parent: item.parentNode,
        nextSibling: item.nextElementSibling
      });
    }
  });

  // When filter is on, manual "unhide" can override filter until filter clicked again
  const currentOverrides = new Set();
  let currentFilterOn = false;

  // ====== SECTION SWITCHING (MIDDLE CONTENT) ======
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

      // Ignore clicks on manually hidden sections
      if (hiddenSections.has(sectionId)) return;

      showSection(sectionId);
      setActiveNav(sectionId);
    });
  });

  // Manage Hidden link (right sidebar) -> open Manage Hidden
  manageHiddenLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showSection("hiddenManager");
      setActiveNav(null);
    });
  });

  // ====== MANAGE HIDDEN SECTIONS ======
  function getNavItem(sectionId) {
    return navList.querySelector(
      '.nav-item[data-section="' + sectionId + '"]'
    );
  }

  function getNavTitle(sectionId) {
    const item = getNavItem(sectionId);
    if (!item) return sectionId;
    const btn = item.querySelector(".nav-link");
    return btn ? btn.textContent.trim() : sectionId;
  }

  function removeHiddenRow(sectionId) {
    if (!hiddenList) return;
    const row = hiddenList.querySelector(
      'li[data-section="' + sectionId + '"]'
    );
    if (row) hiddenList.removeChild(row);
  }

  function addHiddenRow(sectionId) {
    if (!hiddenList) return;
    // Avoid duplicates
    if (hiddenList.querySelector('li[data-section="' + sectionId + '"]')) {
      return;
    }

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
      '.hide-section-btn[data-section="' + sectionId + '"]'
    );
    if (btn) btn.textContent = "Unhide";

    // If you hide the currently visible section, go back to info
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
      '.hide-section-btn[data-section="' + sectionId + '"]'
    );
    if (btn) btn.textContent = "Hide";

    // If Current filter is ON, this acts as an override
    if (currentFilterOn && !currentStorylineIds.has(sectionId)) {
      currentOverrides.add(sectionId);
    }

    applyCurrentFilter();
  }

  // Hook up Hide/Unhide buttons in each section
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

  // Cache colors from buttons
  let ntrTextColor = null;
  function getNtrTextColor() {
    if (!ntrTextColor && ntrBtn) {
      const styles = window.getComputedStyle(ntrBtn);
      ntrTextColor = styles.color || "#cc0000";
    }
    return ntrTextColor || "#cc0000";
  }

  let newTextColor = null;
  function getNewTextColor() {
    if (!newTextColor && newBtn) {
      const styles = window.getComputedStyle(newBtn);
      newTextColor = styles.color || "#3bd97a";
    }
    return newTextColor || "#3bd97a";
  }

  // Apply Paths header when NTR is active
  function activatePaths() {
    const mainCharactersHeader = document.querySelector(
      ".main-characters-header"
    );
    if (!mainCharactersHeader) return;

    let pathsHeader = document.querySelector(".paths-header");
    if (!pathsHeader) {
      pathsHeader = document.createElement("div");
      pathsHeader.className = "nav-header paths-header";
      pathsHeader.textContent = "Paths";
      navList.insertBefore(pathsHeader, mainCharactersHeader);
    }

    const items = [];
    pathIds.forEach((id) => {
      const item = document.querySelector(
        '.nav-item[data-section="' + id + '"]'
      );
      if (item) items.push(item);
    });

    items.sort((a, b) => {
      const ta =
        a.querySelector(".nav-link")?.textContent.trim() || "";
      const tb =
        b.querySelector(".nav-link")?.textContent.trim() || "";
      return ta.localeCompare(tb);
    });

    items.forEach((item) => {
      navList.insertBefore(item, mainCharactersHeader);
    });
  }

  function deactivatePaths() {
    pathIds.forEach((id) => {
      const info = originalPositions.get(id);
      const item = document.querySelector(
        '.nav-item[data-section="' + id + '"]'
      );
      if (!info || !item) return;
      const { parent, nextSibling } = info;
      if (nextSibling && nextSibling.parentNode === parent) {
        parent.insertBefore(item, nextSibling);
      } else {
        parent.appendChild(item);
      }
    });

    const pathsHeader = document.querySelector(".paths-header");
    if (pathsHeader) pathsHeader.remove();
  }

  // Color logic for nav items based on active filters
  function updateNavColors() {
    navItems.forEach((navItem) => {
      const secId = navItem.getAttribute("data-section");
      const link = navItem.querySelector(".nav-link");
      if (!link) return;

      // Store base/original color once
      if (!link.dataset.baseColorStored) {
        link.dataset.baseColor = link.style.color || "";
        link.dataset.baseColorStored = "1";
      }

      let color = link.dataset.baseColor || "";
      link.classList.remove("ntr-preg-glow");

      const currentOn =
        currentBtn &&
        currentBtn.classList.contains("active") &&
        currentStorylineIds.has(secId);

      const ntrOn =
        ntrBtn &&
        ntrBtn.classList.contains("active") &&
        ntrRedIds.has(secId);

      const pregOn =
        pregBtn &&
        pregBtn.classList.contains("active") &&
        pregnancyIds.has(secId);

      const newOn =
        newBtn &&
        newBtn.classList.contains("active") &&
        newIds.has(secId);

      // NEW CONTENT -> uses New button color, takes priority
      if (newOn) {
        color = getNewTextColor();
      } else {
        // Current -> blue
        if (currentOn) {
          color = "#3bafd9";
        }

        // Pregnancy -> pink (can override blue)
        if (pregOn) {
          color = "#ffa3e2";
        }

        // NTR -> red (unless combined with Pregnancy)
        if (ntrOn) {
          if (pregOn) {
            // Pink name, red glow
            link.classList.add("ntr-preg-glow");
          } else {
            color = getNtrTextColor();
          }
        }
      }

      link.style.color = color;
    });
  }

  // Hook up highlight buttons
  if (newBtn && currentBtn && ntrBtn && pregBtn) {
    // NEW
    newBtn.addEventListener("click", () => {
      const isActive = newBtn.classList.contains("active");

      if (isActive) {
        newBtn.classList.remove("active");
        document.body.classList.remove("v0610-new-active");
      } else {
        newBtn.classList.add("active");
        document.body.classList.add("v0610-new-active");

        // Ensure Current is ON + filter applied
        if (!currentBtn.classList.contains("active")) {
          currentBtn.classList.add("active");
        }
        currentFilterOn = true;
        applyCurrentFilter();

        // Turn OFF NTR + Paths
        if (ntrBtn.classList.contains("active")) {
          ntrBtn.classList.remove("active");
          deactivatePaths();
        }

        // Turn OFF Pregnancy
        if (pregBtn.classList.contains("active")) {
          pregBtn.classList.remove("active");
        }
      }

      updateNavColors();
    });

    // CURRENT STORYLINES
    currentBtn.addEventListener("click", () => {
      const isActive = currentBtn.classList.contains("active");

      if (isActive) {
        currentBtn.classList.remove("active");
        newBtn.classList.remove("active");
        document.body.classList.remove("v0610-new-active");
        currentFilterOn = false;
      } else {
        currentBtn.classList.add("active");
        newBtn.classList.remove("active");
        document.body.classList.remove("v0610-new-active");
        currentFilterOn = true;
      }

      currentOverrides.clear();
      applyCurrentFilter();
      updateNavColors();
    });

    // NTR
    ntrBtn.addEventListener("click", () => {
      const isActive = ntrBtn.classList.contains("active");

      if (isActive) {
        ntrBtn.classList.remove("active");
        newBtn.classList.remove("active");
        document.body.classList.remove("v0610-new-active");
        deactivatePaths();
      } else {
        ntrBtn.classList.add("active");
        newBtn.classList.remove("active");
        document.body.classList.remove("v0610-new-active");
        activatePaths();
      }

      updateNavColors();
    });

    // PREGNANCY
    pregBtn.addEventListener("click", () => {
      const isActive = pregBtn.classList.contains("active");
      if (isActive) {
        pregBtn.classList.remove("active");
      } else {
        pregBtn.classList.add("active");
      }

      // Pregnancy and New are exclusive
      newBtn.classList.remove("active");
      document.body.classList.remove("v0610-new-active");

      updateNavColors();
    });
  }

  // ====== BACK BUTTONS & SCROLL-TO-NAV ======

  // Map: section id -> nav item on the left
  const navItemBySection = {};
  navItems.forEach((item) => {
    const id = item.getAttribute("data-section");
    if (id) {
      navItemBySection[id] = item;
    }
  });

  // Which nav item opened each section
  const openerForSection = {};

  // When clicking a name on the left:
  // - remember opener
  // - scroll window to top
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const sectionId = link.getAttribute("data-section");
      const item = link.closest(".nav-item");

      if (sectionId && item) {
        openerForSection[sectionId] = item;
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Scroll back to nav item on the left
  function scrollNavItemIntoView(sectionId) {
    const item =
      openerForSection[sectionId] || navItemBySection[sectionId];
    if (!item) return;

    const rect = item.getBoundingClientRect();
    const offset = rect.top + window.scrollY - 80;

    window.scrollTo({
      top: offset < 0 ? 0 : offset,
      behavior: "smooth"
    });
  }

  // Add Back buttons to each section (except info + hiddenManager)
  function addBackButtonsToSection(section) {
    const id = section.id;
    if (!id || id === "info" || id === "hiddenManager") return;

    const header = section.querySelector(".section-header");
    if (header) {
      const hideBtn = header.querySelector(".hide-section-btn");

      // Wrapper for stacking hide + back buttons
      let btnWrapper = header.querySelector(".section-header-buttons");
      if (!btnWrapper) {
        btnWrapper = document.createElement("div");
        btnWrapper.className = "section-header-buttons";
        header.appendChild(btnWrapper);
      }

      // Move Hide button into wrapper if it's still on header
      if (hideBtn && hideBtn.parentElement === header) {
        btnWrapper.appendChild(hideBtn);
      }

      // TOP Back button
      const backTop = document.createElement("button");
      backTop.className = "hide-section-btn";
      backTop.textContent = "Back";
      backTop.addEventListener("click", () => {
        scrollNavItemIntoView(id);
      });
      btnWrapper.appendChild(backTop);
    }

    // BOTTOM Back button
    const footer = document.createElement("div");
    footer.className = "section-footer";

    const backBottom = document.createElement("button");
    backBottom.className = "hide-section-btn";
    backBottom.textContent = "Back";
    backBottom.addEventListener("click", () => {
      scrollNavItemIntoView(id);
    });

    footer.appendChild(backBottom);
    section.appendChild(footer);
  }

  // Apply Back buttons to all sections
  sections.forEach((section) => addBackButtonsToSection(section));

  // SPECIAL CASE: Manage Hidden → Back returns to Information
  const hiddenManager = document.getElementById("hiddenManager");
  if (hiddenManager) {
    const header = hiddenManager.querySelector(".section-header");
    if (header) {
      const backManage = document.createElement("button");
      backManage.className = "hide-section-btn";
      backManage.textContent = "Back";

      backManage.addEventListener("click", () => {
        showSection("info");
        setActiveNav("info");
        scrollNavItemIntoView("info");
      });

      header.appendChild(backManage);
    }
  }

  // ====== INITIAL STATE ======
  showSection("info");
  setActiveNav("info");
  applyCurrentFilter();
  updateNavColors();
});
