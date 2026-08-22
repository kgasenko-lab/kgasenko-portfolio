document.addEventListener("DOMContentLoaded", () => {

  /* ==================================================
     MOBILE NAVIGATION
  ================================================== */

  const menuButton =
    document.querySelector(".menu-toggle");

  const mobileMenu =
    document.querySelector(".mobile-menu");

  const mobileLinks =
    document.querySelectorAll(".mobile-menu a");


  function closeMenu() {

    if (!menuButton || !mobileMenu) {
      return;
    }


    menuButton.classList.remove(
      "is-open"
    );


    mobileMenu.classList.remove(
      "is-open"
    );


    menuButton.setAttribute(
      "aria-expanded",
      "false"
    );


    menuButton.setAttribute(
      "aria-label",
      "Open navigation"
    );


    document.body.classList.remove(
      "menu-open"
    );

  }


  function openMenu() {

    if (!menuButton || !mobileMenu) {
      return;
    }


    menuButton.classList.add(
      "is-open"
    );


    mobileMenu.classList.add(
      "is-open"
    );


    menuButton.setAttribute(
      "aria-expanded",
      "true"
    );


    menuButton.setAttribute(
      "aria-label",
      "Close navigation"
    );


    document.body.classList.add(
      "menu-open"
    );

  }


  if (menuButton && mobileMenu) {

    menuButton.addEventListener(
      "click",
      () => {

        const isOpen =
          menuButton.getAttribute(
            "aria-expanded"
          ) === "true";


        if (isOpen) {
          closeMenu();
        } else {
          openMenu();
        }

      }
    );


    mobileLinks.forEach(
      (link) => {

        link.addEventListener(
          "click",
          closeMenu
        );

      }
    );


    document.addEventListener(
      "keydown",
      (event) => {

        if (event.key === "Escape") {
          closeMenu();
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

  }



  /* ==================================================
     SMOOTH INTERNAL LINKS
  ================================================== */

  const internalLinks =
    document.querySelectorAll(
      'a[href^="#"]'
    );


  internalLinks.forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          const targetId =
            link.getAttribute("href");


          if (
            !targetId ||
            targetId === "#"
          ) {
            return;
          }


          const target =
            document.querySelector(
              targetId
            );


          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

        }
      );

    }
  );



  /* ==================================================
     SAFE SCROLL REVEAL

     IMPORTANT:
     The page is visible by default.

     JavaScript only hides elements that are safely
     below the initial viewport.

     Therefore:
     - if JS fails, page stays visible
     - if JS is cached incorrectly, page stays visible
     - first screen never disappears
  ================================================== */

  const prefersReducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;


  const revealItems =
    Array.from(
      document.querySelectorAll(
        ".reveal"
      )
    );


  if (
    !prefersReducedMotion &&
    "IntersectionObserver" in window
  ) {

    const revealObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            (entry) => {

              if (
                entry.isIntersecting
              ) {

                entry.target
                  .classList
                  .remove(
                    "reveal-pending"
                  );


                revealObserver
                  .unobserve(
                    entry.target
                  );

              }

            }
          );

        },
        {
          threshold: 0.08,

          rootMargin:
            "0px 0px -25px 0px",
        }
      );


    revealItems.forEach(
      (item) => {

        const rect =
          item.getBoundingClientRect();


        /*
         Only animate content that starts
         below the visible first screen.
        */

        if (
          rect.top >
          window.innerHeight * 0.9
        ) {

          item.classList.add(
            "reveal-pending"
          );


          revealObserver.observe(
            item
          );

        }

      }
    );

  }



  /* ==================================================
     CURRENT YEAR
  ================================================== */

  const year =
    document.getElementById(
      "year"
    );


  if (year) {

    year.textContent =
      new Date().getFullYear();

  }

});
