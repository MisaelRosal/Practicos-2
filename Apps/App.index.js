document.addEventListener("DOMContentLoaded", () => {
  // Ocultar el spinner de carga inicial una vez que la página esté completamente cargada
  const spinner = document.getElementById("loadingSpinner");

  window.addEventListener("load", () => {
    if (spinner) {
      spinner.style.opacity = "0";
      spinner.style.visibility = "hidden";
      setTimeout(() => {
        spinner.style.display = "none";
      }, 500);
    }
  });

  const themeToggleBtn = document.getElementById("themeToggle");
  const htmlElement = document.documentElement;

  const savedTheme = localStorage.getItem("theme");

  const setTheme = (theme) => {
    if (theme === "dark") {
      htmlElement.setAttribute("data-bs-theme", "dark");
      themeToggleBtn.innerHTML = '<i class="bi bi-moon-fill"></i>';
      localStorage.setItem("theme", "dark");
    } else {
      htmlElement.setAttribute("data-bs-theme", "light");
      themeToggleBtn.innerHTML = '<i class="bi bi-sun-fill"></i>';
      localStorage.setItem("theme", "light");
    }
  };

  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setTheme(prefersDark ? "dark" : "light");
  }

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = htmlElement.getAttribute("data-bs-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  });

  const contactForm = document.getElementById("contactForm");
  const alertContainer = document.getElementById("formAlertContainer");

  const showAlert = (message, type) => {
    alertContainer.innerHTML = `
           <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="bi ${type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
  };

  if (contactForm) {
    contactForm.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!contactForm.checkVisibility()) {
          contactForm.classList.add("was-validated");
          showAlert("Por favor, revisa los campos marcados en rojo.", "danger");
        } else {
          showAlert("¡Formulario enviado a alguna parte con éxito!", "danger");

          contactForm.reset();
          contactForm.classList.remove("was-validated");
        }
      },
      false,
    );
  }

  const backToTopBtn = document.getElementById("backToTop");

  if (backToTopBtn) {
    backToTopBtn.style.opacity = "0";
    backToTopBtn.style.visibility = "hidden";
    backToTopBtn.style.transition =
      "opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease";

    window.addEventListener("scroll", () => {
      if (window.scroll > 300) {
        backToTopBtn.style.opacity = "1";
        backToTopBtn.style.visibility = "visible";
      } else {
        backToTopBtn.style.opacity = "0";
        backToTopBtn.style.visibility = "hidden";
      }
    });

    backToTopBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }
});
