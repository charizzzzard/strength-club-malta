(function () {
  "use strict";

  const CAPACITY = 40;
  const occupancyProfile = [
    3, 2, 2, 2, 2, 3, 5, 8, 11, 13, 12, 10,
    11, 13, 15, 18, 23, 29, 34, 31, 24, 17, 10, 6
  ];
  const forecastProfile = [10, 6, 5, 8, 22, 34, 40, 43, 62, 92, 66, 34];
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

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

  function getTimeBasedOccupancy(date) {
    const hour = date.getHours();
    const nextHour = (hour + 1) % occupancyProfile.length;
    const hourProgress = date.getMinutes() / 60;
    const interpolated = occupancyProfile[hour]
      + ((occupancyProfile[nextHour] - occupancyProfile[hour]) * hourProgress);

    return Math.round(interpolated);
  }

  function getStatus(occupancy) {
    if (occupancy <= 12) {
      return {
        className: "status--quiet",
        text: "ILLUSTRATIVE LOW OCCUPANCY"
      };
    }

    if (occupancy <= 27) {
      return {
        className: "status--steady",
        text: "ILLUSTRATIVE MODERATE OCCUPANCY"
      };
    }

    return {
      className: "status--busy",
      text: "ILLUSTRATIVE HIGH OCCUPANCY"
    };
  }

  function prepareDials() {
    document.querySelectorAll("[data-dial-progress]").forEach((path) => {
      path.setAttribute("stroke-dasharray", "100 100");
      path.setAttribute("stroke-dashoffset", "100");
    });
  }

  function setOccupancy(value) {
    const occupancy = clamp(Math.round(value), 0, CAPACITY);
    const paddedOccupancy = String(occupancy).padStart(2, "0");
    const status = getStatus(occupancy);

    document.querySelectorAll("[data-occupancy-count]").forEach((element) => {
      element.textContent = String(occupancy);
    });

    document.querySelectorAll("[data-occupancy-padded]").forEach((element) => {
      element.textContent = paddedOccupancy;
    });

    document.querySelectorAll("[data-dial-progress]").forEach((path) => {
      const progressOffset = 100 * (1 - (occupancy / CAPACITY));
      path.setAttribute("stroke-dashoffset", String(progressOffset));
    });

    document.querySelectorAll("[data-dial-graphic]").forEach((graphic) => {
      graphic.setAttribute("aria-label", `Illustrative occupancy demo index: ${occupancy}`);
    });

    document.querySelectorAll("[data-status]").forEach((element) => {
      element.classList.remove("status--quiet", "status--steady", "status--busy");
      element.classList.add(status.className);
      const statusText = element.querySelector("[data-status-text]");
      if (statusText) {
        statusText.textContent = status.text;
      }
    });

    return occupancy;
  }

  function renderForecast() {
    const chart = document.querySelector("[data-forecast]");
    if (!chart) {
      return;
    }

    const currentSlot = Math.floor(new Date().getHours() / 2);
    const peakValue = Math.max(...forecastProfile);
    const fragment = document.createDocumentFragment();

    forecastProfile.forEach((value, index) => {
      const bar = document.createElement("span");
      const startHour = String(index * 2).padStart(2, "0");
      const endHour = String((index + 1) * 2).padStart(2, "0");

      bar.className = "forecast-bar";
      bar.style.setProperty("--bar-value", `${value}%`);
      bar.setAttribute("aria-hidden", "true");
      bar.title = `${startHour}:00–${endHour}:00 — illustrative demo index ${value}`;

      if (value === peakValue) {
        bar.classList.add("is-peak");
      }

      if (index === currentSlot) {
        bar.classList.add("is-current");
      }

      fragment.appendChild(bar);
    });

    chart.replaceChildren(fragment);
    chart.setAttribute(
      "aria-label",
      "Illustrative occupancy forecast concept. Not live data."
    );
  }

  function setupOccupancySimulation() {
    let currentOccupancy = getTimeBasedOccupancy(new Date());

    const drawInitialState = () => {
      currentOccupancy = setOccupancy(currentOccupancy);
    };

    if (motionQuery.matches) {
      drawInitialState();
    } else {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(drawInitialState);
      });
    }

    const scheduleUpdate = () => {
      const interval = 8000 + Math.round(Math.random() * 7000);

      window.setTimeout(() => {
        const fluctuations = [-1, 0, 0, 0, 1];
        const change = fluctuations[Math.floor(Math.random() * fluctuations.length)];
        currentOccupancy = setOccupancy(currentOccupancy + change);
        scheduleUpdate();
      }, interval);
    };

    scheduleUpdate();
  }

  function setupMobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const navigation = document.querySelector(".nav-links");

    if (!toggle || !navigation) {
      return;
    }

    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      navigation.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("menu-open", !isOpen);
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        toggle.focus();
      }
    });

    window.matchMedia("(min-width: 861px)").addEventListener("change", (event) => {
      if (event.matches) {
        closeMenu();
      }
    });
  }

  function setupConceptSlider() {
    const slider = document.querySelector("[data-concept-slider]");
    if (!slider) {
      return;
    }

    const slides = Array.from(slider.querySelectorAll("[data-concept-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-concept-dot]"));
    const previousButton = slider.querySelector("[data-concept-previous]");
    const nextButton = slider.querySelector("[data-concept-next]");
    const toggleButton = slider.querySelector("[data-concept-toggle]");
    const toggleIcon = slider.querySelector("[data-concept-toggle-icon]");

    if (slides.length < 2 || dots.length !== slides.length
      || !previousButton || !nextButton || !toggleButton || !toggleIcon) {
      return;
    }

    const AUTOPLAY_INTERVAL = 5000;
    const SWIPE_THRESHOLD = 45;
    let activeIndex = 0;
    let timerId = null;
    let userPaused = false;
    let hoverPaused = false;
    let focusPaused = false;
    let visibilityPaused = document.hidden;
    let touchStartX = null;
    let touchStartY = null;

    const clearTimer = () => {
      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }
    };

    const canAutoplay = () => !motionQuery.matches
      && !userPaused
      && !hoverPaused
      && !focusPaused
      && !visibilityPaused;

    const updateToggle = () => {
      toggleButton.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
      toggleButton.setAttribute("aria-pressed", String(userPaused));
      toggleIcon.textContent = userPaused ? "▶" : "Ⅱ";
    };

    const setActiveSlide = (nextIndex) => {
      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });

      dots.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle("is-active", isActive);
        if (isActive) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    };

    const scheduleAutoplay = () => {
      clearTimer();
      if (!canAutoplay()) {
        return;
      }

      timerId = window.setTimeout(() => {
        setActiveSlide(activeIndex + 1);
        scheduleAutoplay();
      }, AUTOPLAY_INTERVAL);
    };

    const showSlide = (nextIndex) => {
      setActiveSlide(nextIndex);
      scheduleAutoplay();
    };

    previousButton.addEventListener("click", () => showSlide(activeIndex - 1));
    nextButton.addEventListener("click", () => showSlide(activeIndex + 1));

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        showSlide(Number(dot.dataset.slideIndex));
      });
    });

    toggleButton.addEventListener("click", () => {
      userPaused = !userPaused;
      updateToggle();
      scheduleAutoplay();
    });

    slider.addEventListener("mouseenter", () => {
      hoverPaused = true;
      clearTimer();
    });

    slider.addEventListener("mouseleave", () => {
      hoverPaused = false;
      scheduleAutoplay();
    });

    slider.addEventListener("focusin", () => {
      focusPaused = true;
      clearTimer();
    });

    slider.addEventListener("focusout", (event) => {
      if (!slider.contains(event.relatedTarget)) {
        focusPaused = false;
        scheduleAutoplay();
      }
    });

    slider.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showSlide(activeIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showSlide(activeIndex + 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        showSlide(0);
      } else if (event.key === "End") {
        event.preventDefault();
        showSlide(slides.length - 1);
      }
    });

    slider.addEventListener("touchstart", (event) => {
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    slider.addEventListener("touchend", (event) => {
      const touch = event.changedTouches[0];
      if (!touch || touchStartX === null || touchStartY === null) {
        return;
      }

      const horizontalDistance = touch.clientX - touchStartX;
      const verticalDistance = touch.clientY - touchStartY;
      touchStartX = null;
      touchStartY = null;

      if (Math.abs(horizontalDistance) < SWIPE_THRESHOLD
        || Math.abs(horizontalDistance) <= Math.abs(verticalDistance)) {
        return;
      }

      showSlide(activeIndex + (horizontalDistance < 0 ? 1 : -1));
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      visibilityPaused = document.hidden;
      scheduleAutoplay();
    });

    const syncMotionPreference = () => {
      const reduceMotion = motionQuery.matches;
      slider.classList.toggle("is-reduced-motion", reduceMotion);
      toggleButton.hidden = reduceMotion;
      scheduleAutoplay();
    };

    motionQuery.addEventListener("change", syncMotionPreference);
    setActiveSlide(0);
    updateToggle();
    slider.classList.add("slider-ready");
    syncMotionPreference();
  }

  function setupScrollReveal() {
    const revealElements = document.querySelectorAll(".reveal");

    if (!revealElements.length || motionQuery.matches || !("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
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

    revealElements.forEach((element) => observer.observe(element));
  }

  setupWebFonts();
  renderForecast();
  prepareDials();
  setupMobileMenu();
  setupConceptSlider();
  setupScrollReveal();
  setupOccupancySimulation();
}());
