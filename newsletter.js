// Suscripción por correo (Front-End) - Solbin-X
(function () {
  const STORAGE_KEY = 'solbinx_newsletter_email';

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function showMessage(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.classList.remove('hidden');
    el.classList.toggle('text-green-700', type === 'success');
    el.classList.toggle('text-red-700', type === 'error');
  }

  function init() {
    const form = document.getElementById('newsletter-form');
    const input = document.getElementById('newsletter-email');
    const msg = document.getElementById('newsletter-message');

    if (!form || !input) return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) input.value = saved;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const email = (input.value || '').trim();

      if (!isValidEmail(email)) {
        showMessage(msg, 'Ingresa un correo válido (ej: usuario@dominio.com).', 'error');
        return;
      }

      localStorage.setItem(STORAGE_KEY, email);
      showMessage(msg, '¡Gracias! Te suscribiste correctamente.', 'success');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();

