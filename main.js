document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // MOBILE NAVIGATION
  // =========================

  const menuButton =
    document.querySelector(".menu-toggle");

  const mobileMenu =
    document.querySelector(".mobile-menu");

  const mobileLinks =
    document.querySelectorAll(".mobile-menu a");


  const closeMenu = () => {

    if (!menuButton || !mobileMenu) {
      return;
    }

    menuButton.classList.remove("is-open");

    mobileMenu.classList.remove("is-open");

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

  };


  const openMenu = () => {

    if (!menuButton || !mobileMenu) {
      return;
    }

    menuButton.classList.add("is-open");

    mobileMenu.classList.add("is-open");

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

  };


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


    window.addEventListener(
      "resize",
      () => {

        if (window.innerWidth > 900) {
          closeMenu();
        }

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

  }


  // =========================
  // SMOOTH INTERNAL SCROLL
  // =========================

  document
    .querySelectorAll('a[href^="#"]')
    .forEach(
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


  // =========================
  // SCROLL REVEAL
  // =========================

  const revealItems =
    document.querySelectorAll(".reveal");


  if ("IntersectionObserver" in window) {

    const revealObserver =
      new IntersectionObserver(
        (entries) => {

          entries.forEach(
            (entry) => {

              if (entry.isIntersecting) {

                entry.target
                  .classList
                  .add("is-visible");


                revealObserver
                  .unobserve(
                    entry.target
                  );

              }

            }
          );

        },
        {
          threshold: 0.1,

          rootMargin:
            "0px 0px -30px 0px",
        }
      );


    revealItems.forEach(
      (item) => {

        revealObserver.observe(item);

      }
    );

  } else {

    revealItems.forEach(
      (item) => {

        item.classList.add(
          "is-visible"
        );

      }
    );

  }


  // =========================
  // CURRENT YEAR
  // =========================

  const year =
    document.getElementById("year");


  if (year) {

    year.textContent =
      new Date().getFullYear();

  }

});
