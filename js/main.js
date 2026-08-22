/* ============================================================
   KSENIIA GASENKO
   MAIN WEBSITE JAVASCRIPT
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


  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key !== "Escape") {
        return;
      }

      closeMenu();

      if (menuToggle) {
        menuToggle.focus();
      }

    }
  );


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


        let target;

        try {
          target =
            document.querySelector(href);
        } catch {
          return;
        }


        if (!target) {
          return;
        }


        event.preventDefault();

        closeMenu();


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
     Content is visible by default in CSS.

     JavaScript only temporarily hides elements
     that begin below the first viewport.

     This prevents the old "white page" problem
     if JavaScript fails or the page is restored
     from browser cache.
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


      if (
        rect.top >
        viewportHeight * 0.92
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
            "0px 0px -5% 0px"
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
       Final safety fallback.
       Nothing should remain hidden indefinitely.
    */

    window.setTimeout(
      () => {

        revealItems.forEach((item) => {

          item.classList.remove(
            "reveal-pending"
          );

        });

      },
      4500
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

        if (
          !href ||
          href === "#top"
        ) {
          return false;
        }


        try {
          return Boolean(
            document.querySelector(href)
          );
        } catch {
          return false;
        }

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
      130;


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
     HEADER STATE ON SCROLL
  ========================================================== */

  const updateHeaderState = () => {

    if (!header) {
      return;
    }


    if (window.scrollY > 20) {

      header.classList.add(
        "is-scrolled"
      );

    } else {

      header.classList.remove(
        "is-scrolled"
      );

    }

  };


  let headerTicking =
    false;


  window.addEventListener(
    "scroll",
    () => {

      if (headerTicking) {
        return;
      }


      headerTicking =
        true;


      window.requestAnimationFrame(
        () => {

          updateHeaderState();

          headerTicking =
            false;

        }
      );

    },
    {
      passive: true
    }
  );


  /* ==========================================================
     CONTACT FORM UX
  ========================================================== */

  const contactForm =
    $(".contact-form");

  const formSubmit =
    $(".form-submit");


  if (
    contactForm &&
    formSubmit
  ) {

    contactForm.addEventListener(
      "submit",
      () => {

        formSubmit.disabled =
          true;


        formSubmit.classList.add(
          "is-submitting"
        );


        const originalText =
          formSubmit.innerHTML;


        formSubmit.dataset.originalText =
          originalText;


        formSubmit.innerHTML =
          `
            <span>Sending...</span>
          `;


        /*
           If browser validation or network flow
           returns the user to this page,
           restore the button automatically.
        */

        window.setTimeout(
          () => {

            if (
              document.visibilityState ===
              "visible"
            ) {

              formSubmit.disabled =
                false;


              formSubmit.classList.remove(
                "is-submitting"
              );


              if (
                formSubmit.dataset.originalText
              ) {

                formSubmit.innerHTML =
                  formSubmit.dataset.originalText;

              }

            }

          },
          5000
        );

      }
    );

  }


  /* ==========================================================
     INITIAL HASH
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


    let target;


    try {

      target =
        document.querySelector(hash);

    } catch {

      return;

    }


    if (!target) {
      return;
    }


    window.setTimeout(
      () => {

        target.scrollIntoView({
          behavior: "auto",
          block: "start"
        });

      },
      100
    );

  };


  /* ==========================================================
     PAGE RESTORE SAFETY
  ========================================================== */

  window.addEventListener(
    "pageshow",
    () => {

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


      if (
        formSubmit &&
        formSubmit.dataset.originalText
      ) {

        formSubmit.disabled =
          false;


        formSubmit.classList.remove(
          "is-submitting"
        );


        formSubmit.innerHTML =
          formSubmit.dataset.originalText;

      }


      updateActiveNavigation();

      updateHeaderState();

    }
  );


  /* ==========================================================
     INITIALIZATION
  ========================================================== */

  const init = () => {

    closeMenu();

    setupRevealAnimations();

    updateActiveNavigation();

    updateHeaderState();

    scrollToInitialHash();

  };


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
