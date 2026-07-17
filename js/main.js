(function () {
  "use strict";

  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

  function setupWebFonts() {
    const stylesheet = document.querySelector("[data-font-stylesheet]");

    if (!stylesheet) {
      return;
    }

    const activateStylesheet = () => {
      stylesheet.media = "all";
    };

    if (stylesheet.sheet) {
      activateStylesheet();
    } else {
      stylesheet.addEventListener("load", activateStylesheet, { once: true });
    }
  }

  function setupMobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const navigation = document.querySelector(".nav-links");
    const toggleLabel = toggle?.querySelector(".sr-only");

    if (!toggle || !navigation) {
      return;
    }

    const setMenuState = (isOpen, restoreFocus = false) => {
      toggle.setAttribute("aria-expanded", String(isOpen));
      navigation.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("menu-open", isOpen);

      if (toggleLabel) {
        toggleLabel.textContent = isOpen ? "Close navigation menu" : "Open navigation menu";
      }

      if (restoreFocus) {
        toggle.focus();
      }
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      setMenuState(!isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenuState(false, true);
      }
    });

    window.matchMedia("(min-width: 1121px)").addEventListener("change", (event) => {
      if (event.matches) {
        setMenuState(false);
      }
    });
  }

  function setupScrollReveal() {
    const elements = document.querySelectorAll(".reveal");

    if (!elements.length || motionPreference.matches || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    document.documentElement.classList.add("reveal-enabled");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -7% 0px"
    });

    elements.forEach((element) => observer.observe(element));
  }

  setupWebFonts();
  setupMobileMenu();
  setupScrollReveal();
}());
