(function () {
  'use strict';

  var toast = document.getElementById('toast');
  var toastTimer = null;

  function showToast(message) {
    if (!toast) {
      return;
    }
    toast.textContent = message;
    toast.classList.add('is-visible');

    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 4200);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /* ---------- Formularios de email (reserva / lead magnet) ---------- */
  var emailForms = document.querySelectorAll('[data-form="email"]');

  emailForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var input = form.querySelector('input[type="email"]');
      if (!input) {
        return;
      }

      var value = input.value.trim();

      if (!isValidEmail(value)) {
        input.focus();
        showToast('Revisá el formato del email antes de enviar.');
        return;
      }

      var message =
        form.getAttribute('data-success-message') ||
        '¡Listo! Vas a recibir un mail para confirmar tu lugar.';

      showToast(message);
      input.value = '';
    });
  });

  /* ---------- Botones de membresía ---------- */
  var membershipButtons = document.querySelectorAll('[data-action="membership"]');

  membershipButtons.forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      showToast('Te contactamos a la brevedad para completar tu suscripción.');
    });
  });
})();
