document.addEventListener("DOMContentLoaded", () => {

  /* =========================================================
     1. HELPERS
  ========================================================= */

  const $ = (selector, scope = document) =>
    scope.querySelector(selector);

  const $$ = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));


  const prefersReducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;



  /* =========================================================
     2. MOBILE NAVIGATION
  ========================================================= */

  const menuButton =
    $(".menu-toggle");

  const mobileMenu =
    $(".mobile-menu");

  const mobileLinks =
    $$(".mobile-menu a");


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


    /*
     Move keyboard focus into the menu.
     Small delay allows the menu transition
     to begin first.
    */

    window.setTimeout(() => {

      const firstLink =
        mobileMenu.querySelector("a");

      if (firstLink) {
        firstLink.focus();
      }

    }, 120);

  }


  function closeMenu({
    returnFocus = false
  } = {}) {

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


    if (returnFocus) {

      menuButton.focus();

    }

  }


  function menuIsOpen() {

    return (
      menuButton &&
      menuButton.getAttribute(
        "aria-expanded"
      ) === "true"
    );

  }


  if (
    menuButton &&
    mobileMenu
  ) {

    menuButton.addEventListener(
      "click",
      () => {

        if (menuIsOpen()) {

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
          () => {

            closeMenu();

          }
        );

      }
    );


    /*
     ESC closes mobile navigation.
    */

    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Escape" &&
          menuIsOpen()
        ) {

          closeMenu({
            returnFocus: true
          });

        }

      }
    );


    /*
     Basic focus trap for mobile navigation.
    */

    mobileMenu.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key !== "Tab" ||
          !menuIsOpen()
        ) {
          return;
        }


        const focusableItems =
          $$(
            'a[href], button:not([disabled])',
            mobileMenu
          );


        if (
          focusableItems.length === 0
        ) {
          return;
        }


        const firstItem =
          focusableItems[0];


        const lastItem =
          focusableItems[
            focusableItems.length - 1
          ];


        if (
          event.shiftKey &&
          document.activeElement ===
            firstItem
        ) {

          event.preventDefault();

          lastItem.focus();

        }


        if (
          !event.shiftKey &&
          document.activeElement ===
            lastItem
        ) {

          event.preventDefault();

          firstItem.focus();

        }

      }
    );


    /*
     Desktop resize automatically
     resets the mobile menu.
    */

    window.addEventListener(
      "resize",
      () => {

        if (
          window.innerWidth > 900 &&
          menuIsOpen()
        ) {

          closeMenu();

        }

      },
      {
        passive: true
      }
    );

  }



  /* =========================================================
     3. SMOOTH INTERNAL NAVIGATION
  ========================================================= */

  const internalLinks =
    $$('a[href^="#"]');


  internalLinks.forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          const targetId =
            link.getAttribute(
              "href"
            );


          if (
            !targetId ||
            targetId === "#"
          ) {
            return;
          }


          const target =
            $(targetId);


          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior:
              prefersReducedMotion
                ? "auto"
                : "smooth",

            block:
              "start"
          });


          /*
           Update URL hash without
           forcing another jump.
          */

          if (
            history.pushState
          ) {

            history.pushState(
              null,
              "",
              targetId
            );

          }

        }
      );

    }
  );



  /* =========================================================
     4. SAFE SCROLL REVEALS

     IMPORTANT:
     Nothing is hidden in the CSS by default.

     JS hides ONLY elements that:
     - are below the initial viewport
     - are registered with the observer

     A fallback timer makes everything
     visible even if the observer fails.
  ========================================================= */

  const revealItems =
    $$(".reveal");


  /*
   Add additional subtle animation
   targets without changing HTML.
  */

  const workflowPills =
    $$(".workflow-strip span");


  workflowPills.forEach(
    (item) => {

      if (
        !item.classList.contains(
          "reveal"
        )
      ) {

        item.classList.add(
          "reveal"
        );

      }

    }
  );


  const allRevealItems =
    $$(".reveal");


  function showElement(
    element
  ) {

    element.classList.remove(
      "reveal-pending"
    );

  }


  function showAllElements() {

    allRevealItems.forEach(
      (element) => {

        showElement(
          element
        );

      }
    );

  }


  if (
    prefersReducedMotion ||
    !(
      "IntersectionObserver"
      in window
    )
  ) {

    showAllElements();

  } else {

    /*
     Only hide elements that begin
     below most of the first viewport.
     This protects the hero from
     disappearing during page load.
    */

    allRevealItems.forEach(
      (element) => {

        const rect =
          element
            .getBoundingClientRect();


        if (
          rect.top >
          window.innerHeight * 0.88
        ) {

          element.classList.add(
            "reveal-pending"
          );

        }

      }
    );


    const revealObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            (entry) => {

              if (
                entry.isIntersecting
              ) {

                showElement(
                  entry.target
                );


                revealObserver.unobserve(
                  entry.target
                );

              }

            }
          );

        },
        {
          threshold:
            0.08,

          rootMargin:
            "0px 0px -35px 0px"
        }
      );


    allRevealItems.forEach(
      (element) => {

        if (
          element.classList.contains(
            "reveal-pending"
          )
        ) {

          revealObserver.observe(
            element
          );

        }

      }
    );


    /*
     Safety fallback:
     even if observer behavior fails,
     nothing can remain hidden.
    */

    window.setTimeout(
      showAllElements,
      2200
    );

  }



  /* =========================================================
     5. STAGGERED PROJECT CARD ANIMATION
  ========================================================= */

  if (
    !prefersReducedMotion
  ) {

    const projectCards =
      $$(".project-card");


    projectCards.forEach(
      (card, index) => {

        const delay =
          Math.min(
            index * 55,
            220
          );


        card.style.transitionDelay =
          `${delay}ms`;

      }
    );


    /*
     Metrics reveal slightly after
     the containing card.
    */

    const metricBlocks =
      $$(".metric-block");


    metricBlocks.forEach(
      (metric, index) => {

        const delay =
          (
            index % 3
          ) * 55;


        metric.style.transitionDelay =
          `${delay}ms`;

      }
    );


    /*
     DMAIC sequence receives a
     restrained cascading reveal.
    */

    const methodSteps =
      $$(".method-step");


    methodSteps.forEach(
      (step, index) => {

        step.style.transitionDelay =
          `${Math.min(
            index * 45,
            225
          )}ms`;

      }
    );


    /*
     Credential cards.
    */

    const credentials =
      $$(".credential");


    credentials.forEach(
      (credential, index) => {

        credential.style.transitionDelay =
          `${Math.min(
            index * 50,
            180
          )}ms`;

      }
    );


    /*
     CME workflow pills.
    */

    workflowPills.forEach(
      (pill, index) => {

        pill.style.transitionDelay =
          `${Math.min(
            index * 32,
            190
          )}ms`;

      }
    );

  }



  /* =========================================================
     6. ACTIVE NAVIGATION SECTION
  ========================================================= */

  const navigationLinks =
    $$(
      '.desktop-nav a[href^="#"], ' +
      '.mobile-menu a[href^="#"]'
    );


  const trackedSections =
    $$(
      "#work, " +
      "#approach, " +
      "#about, " +
      "#credentials"
    );


  function updateActiveNavigation(
    sectionId
  ) {

    navigationLinks.forEach(
      (link) => {

        const href =
          link.getAttribute(
            "href"
          );


        if (
          href ===
          `#${sectionId}`
        ) {

          link.setAttribute(
            "aria-current",
            "true"
          );

        } else {

          link.removeAttribute(
            "aria-current"
          );

        }

      }
    );

  }


  if (
    "IntersectionObserver"
      in window &&
    trackedSections.length
  ) {

    const sectionObserver =
      new IntersectionObserver(
        (entries) => {

          const visibleEntries =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              );


          if (
            visibleEntries.length
          ) {

            updateActiveNavigation(
              visibleEntries[0]
                .target
                .id
            );

          }

        },
        {
          rootMargin:
            "-28% 0px -58% 0px",

          threshold:
            [
              0,
              0.15,
              0.3,
              0.5
            ]
        }
      );


    trackedSections.forEach(
      (section) => {

        sectionObserver.observe(
          section
        );

      }
    );

  }



  /* =========================================================
     7. DESKTOP CARD POINTER EFFECT

     Very restrained.
     Only enabled on devices that have:
     - a mouse / precise pointer
     - hover capability

     No effect on mobile or tablet touch.
  ========================================================= */

  const supportsHover =
    window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;


  if (
    supportsHover &&
    !prefersReducedMotion
  ) {

    const cards =
      $$(".project-card");


    cards.forEach(
      (card) => {

        card.addEventListener(
          "pointermove",
          (event) => {

            const rect =
              card.getBoundingClientRect();


            const x =
              (
                event.clientX -
                rect.left
              ) /
              rect.width;


            const y =
              (
                event.clientY -
                rect.top
              ) /
              rect.height;


            /*
             Extremely subtle perspective.
             CSS hover still controls
             primary card movement.
            */

            const rotateX =
              (
                0.5 - y
              ) * 1.2;


            const rotateY =
              (
                x - 0.5
              ) * 1.2;


            card.style.transform =
              `
                translateY(-6px)
                perspective(900px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
              `;

          }
        );


        card.addEventListener(
          "pointerleave",
          () => {

            card.style.transform =
              "";

          }
        );

      }
    );

  }



  /* =========================================================
     8. PAGE VISIBILITY SAFETY

     Handles browser back/forward cache,
     mobile tab restore and similar cases.
  ========================================================= */

  window.addEventListener(
    "pageshow",
    () => {

      /*
       Hero content should always
       remain immediately visible.
      */

      const heroReveal =
        $$(".hero .reveal");


      heroReveal.forEach(
        (element) => {

          element.classList.remove(
            "reveal-pending"
          );

        }
      );

    }
  );



  /* =========================================================
     9. CURRENT YEAR
  ========================================================= */

  const year =
    $("#year");


  if (year) {

    year.textContent =
      new Date()
        .getFullYear();

  }

});
