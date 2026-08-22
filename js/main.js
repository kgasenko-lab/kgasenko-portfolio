/* ============================================================
   KSENIIA GASENKO PORTFOLIO
   MAIN JAVASCRIPT
============================================================ */

(() => {
  "use strict";


  /* ==========================================================
     HELPERS
  ========================================================== */

  const $ = (selector, scope = document) =>
    scope.querySelector(selector);

  const $$ = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));


  /* ==========================================================
     ELEMENTS
  ========================================================== */

  const body = document.body;

  const header = $(".site-header");

  const menuToggle = $(".menu-toggle");

  const mobileMenu = $("#mobile-menu");

  const mobileLinks = $$("#mobile-menu a");

  const internalLinks = $$('a[href^="#"]');

  const revealItems = $$(".reveal");

  const yearElement = $("#year");


  /* ==========================================================
     CURRENT YEAR
  ========================================================== */

  if (yearElement) {
    yearElement.textContent =
      new Date().getFullYear();
  }


  /* ==========================================================
     MOBILE MENU
  ========================================================== */

  const openMenu = () => {

    if (!menuToggle || !mobileMenu) {
      return;
    }

    menuToggle.classList.add("is-open");

    mobileMenu.classList.add("is-open");

    body.classList.add("menu-open");

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Close navigation"
    );

  };


  const closeMenu = () => {

    if (!menuToggle || !mobileMenu) {
      return;
    }

    menuToggle.classList.remove("is-open");

    mobileMenu.classList.remove("is-open");

    body.classList.remove("menu-open");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Open navigation"
    );

  };


  const toggleMenu = () => {

    if (!mobileMenu) {
      return;
    }

    const isOpen =
      mobileMenu.classList.contains("is-open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }

  };


  if (menuToggle) {

    menuToggle.addEventListener(
      "click",
      toggleMenu
    );

  }


  mobileLinks.forEach((link) => {

    link.addEventListener(
      "click",
      closeMenu
    );

  });


  /* Close menu with Escape */

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {

        closeMenu();

        if (menuToggle) {
          menuToggle.focus();
        }

      }

    }
  );


  /* Close menu when moving back to desktop */

  window.addEventListener(
    "resize",
    () => {

      if (window.innerWidth > 900) {
        closeMenu();
      }

    }
  );


  /* ==========================================================
     SMOOTH INTERNAL NAVIGATION
  ========================================================== */

  internalLinks.forEach((link) => {

    link.addEventListener(
      "click",
      (event) => {

        const href =
          link.getAttribute("href");

        if (
          !href ||
          href === "#" ||
          href.length < 2
        ) {
          return;
        }

        const target =
          document.querySelector(href);

        if (!target) {
          return;
        }

        event.preventDefault();

        closeMenu();


        /* Respect reduced-motion preference */

        const reducedMotion =
          window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;


        target.scrollIntoView({
          behavior:
            reducedMotion
              ? "auto"
              : "smooth",

          block:
            "start"
        });


        /* Keep URL meaningful without page jump */

        if (
          window.history &&
          window.history.pushState
        ) {

          window.history.pushState(
            null,
            "",
            href
          );

        }

      }
    );

  });


  /* ==========================================================
     SAFE REVEAL ANIMATIONS
  ========================================================== */

  /*
     IMPORTANT:
     Elements are visible by default in CSS.

     JavaScript only adds .reveal-pending
     to elements that begin below the viewport.

     Therefore:
     - content does not disappear if JS fails
     - reloads remain safe
     - first-screen content appears immediately
  */


  const setupRevealAnimations = () => {

    if (!revealItems.length) {
      return;
    }


    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;


    if (
      reducedMotion ||
      !("IntersectionObserver" in window)
    ) {

      revealItems.forEach((item) => {

        item.classList.remove(
          "reveal-pending"
        );

      });

      return;
    }


    const viewportHeight =
      window.innerHeight;


    revealItems.forEach((item) => {

      const rect =
        item.getBoundingClientRect();


      /*
         Only hide elements clearly below
         the initial viewport.
      */

      if (
        rect.top >
        viewportHeight * 0.88
      ) {

        item.classList.add(
          "reveal-pending"
        );

      }

    });


    const observer =
      new IntersectionObserver(
        (entries, revealObserver) => {

          entries.forEach((entry) => {

            if (!entry.isIntersecting) {
              return;
            }


            entry.target.classList.remove(
              "reveal-pending"
            );


            revealObserver.unobserve(
              entry.target
            );

          });

        },
        {
          threshold: 0.08,

          rootMargin:
            "0px 0px -4% 0px"
        }
      );


    revealItems.forEach((item) => {

      if (
        item.classList.contains(
          "reveal-pending"
        )
      ) {

        observer.observe(item);

      }

    });


    /*
       Safety fallback:
       nothing remains hidden indefinitely.
    */

    window.setTimeout(
      () => {

        revealItems.forEach((item) => {

          item.classList.remove(
            "reveal-pending"
          );

        });

      },
      4000
    );

  };


  /* ==========================================================
     ACTIVE DESKTOP NAVIGATION
  ========================================================== */

  const desktopSectionLinks =
    $$('.desktop-nav a[href^="#"]')
      .filter((link) => {

        const href =
          link.getAttribute("href");

        return (
          href &&
          href !== "#top" &&
          document.querySelector(href)
        );

      });


  const sections =
    desktopSectionLinks
      .map((link) => {

        const href =
          link.getAttribute("href");

        return document.querySelector(
          href
        );

      })
      .filter(Boolean);


  const updateActiveNavigation = () => {

    if (!sections.length) {
      return;
    }


    const headerHeight =
      header
        ? header.offsetHeight
        : 0;


    const referencePoint =
      window.scrollY +
      headerHeight +
      120;


    let activeSection =
      null;


    sections.forEach((section) => {

      if (
        section.offsetTop <=
        referencePoint
      ) {

        activeSection =
          section;

      }

    });


    desktopSectionLinks.forEach(
      (link) => {

        link.removeAttribute(
          "aria-current"
        );

      }
    );


    if (!activeSection) {
      return;
    }


    const activeLink =
      desktopSectionLinks.find(
        (link) =>
          link.getAttribute("href") ===
          `#${activeSection.id}`
      );


    if (activeLink) {

      activeLink.setAttribute(
        "aria-current",
        "true"
      );

    }

  };


  let scrollTicking =
    false;


  window.addEventListener(
    "scroll",
    () => {

      if (scrollTicking) {
        return;
      }


      scrollTicking =
        true;


      window.requestAnimationFrame(
        () => {

          updateActiveNavigation();

          scrollTicking =
            false;

        }
      );

    },
    {
      passive: true
    }
  );


  /* ==========================================================
     EXTERNAL / DOCUMENT LINKS
  ========================================================== */

  /*
     Resume links with target="_blank"
     and document links with "download"
     are intentionally NOT intercepted.

     Browser behavior remains native:

     View Resume
       → opens PDF in a new tab

     Download Resume
       → downloads PDF

     Portfolio Presentation
       → downloads PPTX
  */


  /* ==========================================================
     CARD INTERACTION
     DESKTOP POINTERS ONLY
  ========================================================== */

  const projectCards =
    $$(".project-card");


  const supportsHover =
    window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;


  if (supportsHover) {

    projectCards.forEach((card) => {

      card.addEventListener(
        "mousemove",
        (event) => {

          const rect =
            card.getBoundingClientRect();


          const x =
            event.clientX -
            rect.left;


          const y =
            event.clientY -
            rect.top;


          card.style.setProperty(
            "--pointer-x",
            `${x}px`
          );


          card.style.setProperty(
            "--pointer-y",
            `${y}px`
          );

        }
      );


      card.addEventListener(
        "mouseleave",
        () => {

          card.style.removeProperty(
            "--pointer-x"
          );

          card.style.removeProperty(
            "--pointer-y"
          );

        }
      );

    });

  }


  /* ==========================================================
     HASH NAVIGATION ON INITIAL LOAD
  ========================================================== */

  const scrollToInitialHash = () => {

    const hash =
      window.location.hash;


    if (
      !hash ||
      hash === "#"
    ) {
      return;
    }


    const target =
      document.querySelector(hash);


    if (!target) {
      return;
    }


    /*
       Browser may already have jumped.
       This corrects position after fonts/layout load.
    */

    window.setTimeout(
      () => {

        target.scrollIntoView({
          behavior: "auto",
          block: "start"
        });

      },
      80
    );

  };


  /* ==========================================================
     PAGE RESTORE SAFETY
  ========================================================== */

  window.addEventListener(
    "pageshow",
    () => {

      /*
         Safari / mobile browsers can restore
         a page from cache with old animation states.
      */

      revealItems.forEach((item) => {

        const rect =
          item.getBoundingClientRect();


        if (
          rect.top <
          window.innerHeight
        ) {

          item.classList.remove(
            "reveal-pending"
          );

        }

      });


      updateActiveNavigation();

    }
  );


  /* ==========================================================
     INITIALIZATION
  ========================================================== */

  const init = () => {

    closeMenu();

    setupRevealAnimations();

    updateActiveNavigation();

    scrollToInitialHash();

  };


  /*
     Script is currently placed immediately
     before </body>, so DOM is normally ready.
     This guard also makes the file safe if
     you later move it into <head>.
  */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );

  } else {

    init();

  }

})();
