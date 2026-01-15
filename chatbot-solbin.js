// Chatbot Solbin - Widget Front-End (sin backend)
(function () {
  const BOT_NAME = 'Danna';

  function $(id) {
    return document.getElementById(id);
  }

  function formatTime(d = new Date()) {
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = String(text ?? '');
    return div.textContent;
  }

  function getCartSummary() {
    const cm = window.cartManager;
    if (!cm) return null;
    const items = Array.isArray(cm.cart) ? cm.cart : [];
    const subtotal = cm.getSubtotal ? cm.getSubtotal() : 0;
    const igv = cm.getIGV ? cm.getIGV() : 0;
    const shipping = cm.getShipping ? cm.getShipping() : 0;
    const total = cm.getTotal ? cm.getTotal() : 0;
    return { itemsCount: items.reduce((s, it) => s + (it.quantity || 0), 0), subtotal, igv, shipping, total };
  }

  function money(n) {
    const v = Number(n) || 0;
    return `S/. ${v.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function botReply(userTextRaw) {
    const userText = (userTextRaw || '').toLowerCase();
    const cart = getCartSummary();

    if (userText.includes('hola') || userText.includes('buenas') || userText.includes('hey')) {
      return `¡Hola! Soy ${BOT_NAME}. ¿En qué te ayudo? Puedo darte info del catálogo, el envío, o tu carrito.`;
    }

    if (userText.includes('envío') || userText.includes('envio') || userText.includes('delivery')) {
      return 'El envío es GRATIS para pedidos mayores a S/. 500. Si tu carrito está vacío, el envío es S/. 0.00.';
    }

    if (userText.includes('igv') || userText.includes('impuesto')) {
      return 'El IGV es 18% y se calcula automáticamente según tu subtotal.';
    }

    if (userText.includes('carrito') || userText.includes('total') || userText.includes('resumen')) {
      if (!cart) return 'Aún no puedo leer tu carrito. Intenta recargar la página.';
      return `Resumen del carrito:\n- Items: ${cart.itemsCount}\n- Subtotal: ${money(cart.subtotal)}\n- IGV: ${money(cart.igv)}\n- Envío: ${money(cart.shipping)}\n- Total: ${money(cart.total)}`;
    }

    if (userText.includes('pago') || userText.includes('comprar') || userText.includes('checkout')) {
      return 'Para pagar, ve al carrito y pulsa “Proceder al Pago”. Te enviaremos confirmación por WhatsApp.';
    }

    if (userText.includes('contacto') || userText.includes('whatsapp') || userText.includes('wsp')) {
      return 'Puedes contactarnos por WhatsApp desde el botón verde flotante o desde el checkout del carrito.';
    }

    if (userText.includes('gracias')) {
      return '¡Con gusto! Si quieres, dime qué producto te interesa y te ayudo a elegir.';
    }

    return 'Te leo. Escribe “carrito” para ver tu resumen, “envío” para costos, o “pago” para cómo finalizar la compra.';
  }

  function appendMessage(container, who, text) {
    const msg = document.createElement('div');
    msg.className =
      who === 'user'
        ? 'flex justify-end'
        : 'flex justify-start';

    const bubble = document.createElement('div');
    bubble.className =
      who === 'user'
        ? 'max-w-[85%] bg-sky-600 text-white rounded-2xl rounded-br-md px-4 py-2 shadow'
        : 'max-w-[85%] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-bl-md px-4 py-2 shadow border border-gray-200 dark:border-gray-700';

    const p = document.createElement('pre');
    p.className = 'whitespace-pre-wrap font-sans text-sm';
    p.textContent = sanitizeText(text);

    const meta = document.createElement('div');
    meta.className = 'mt-1 text-[11px] opacity-70';
    meta.textContent = `${formatTime()} · ${who === 'user' ? 'Tú' : BOT_NAME}`;

    bubble.appendChild(p);
    bubble.appendChild(meta);
    msg.appendChild(bubble);
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  function ensureWidget() {
    const root = $('solbin-chatbot-root');
    if (!root) return;

    const openBtn = $('solbin-chatbot-open');
    const panel = $('solbin-chatbot-panel');
    const closeBtn = $('solbin-chatbot-close');
    const msgs = $('solbin-chatbot-messages');
    const input = $('solbin-chatbot-input');
    const send = $('solbin-chatbot-send');

    if (!openBtn || !panel || !closeBtn || !msgs || !input || !send) return;

    const open = () => {
      panel.classList.remove('hidden');
      openBtn.classList.add('hidden');
      input.focus();
    };
    const close = () => {
      panel.classList.add('hidden');
      openBtn.classList.remove('hidden');
    };

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);

    // Mensaje inicial (una sola vez)
    if (!msgs.dataset.initialized) {
      msgs.dataset.initialized = '1';
      appendMessage(msgs, 'bot', `Hola, soy ${BOT_NAME}. ¿Necesitas ayuda con tu compra en Solbin-X?`);
    }

    const doSend = () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      appendMessage(msgs, 'user', text);
      setTimeout(() => {
        appendMessage(msgs, 'bot', botReply(text));
      }, 250);
    };

    send.addEventListener('click', doSend);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSend();
      if (e.key === 'Escape') close();
    });
  }

  document.addEventListener('DOMContentLoaded', ensureWidget);
})();


