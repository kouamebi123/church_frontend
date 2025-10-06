import React, { useEffect } from 'react';

const ConsoleProtection = () => {
  useEffect(() => {
    const shouldHideConsole = true;

    if (!shouldHideConsole) return;

    // 2) neutraliser toutes les méthodes console
    const noop = () => {};
    const consoleMethods = [
      'log','error','warn','info','debug','trace','table',
      'group','groupEnd','groupCollapsed','time','timeEnd','timeStamp',
      'count','clear','dir','dirxml','profile','profileEnd'
    ];
    consoleMethods.forEach((m) => {
      try {
        console[m] = noop;
      } catch {}
    });

    // 3) bloquer raccourcis devtools
    const onKeyDown = (e) => {
      const k = (e.key || '').toLowerCase();

      if ((e.ctrlKey || e.metaKey) && k === 'a') {
        const t = e.target;
        if (t) {
          const isFormEl =
            ['input', 'textarea', 'select'].includes((t.tagName || '').toLowerCase()) ||
            t.isContentEditable;
          if (isFormEl) return;
        }
      }

      if (k === 'f12') { e.preventDefault(); e.stopPropagation(); return; }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i','j','c'].includes(k)) {
        e.preventDefault(); e.stopPropagation(); return;
      }
      if ((e.ctrlKey || e.metaKey) && k === 'u') {
        e.preventDefault(); e.stopPropagation(); return;
      }
    };

    const onDragStart = (e) => { e.preventDefault(); };

    document.addEventListener('keydown', onKeyDown, { capture: true });
    document.addEventListener('dragstart', onDragStart, { capture: true });

    // 4) masquer erreurs et promesses non gérées
    const onWindowError = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation?.();
      return false;
    };
    const onUnhandledRejection = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation?.();
      return false;
    };

    window.addEventListener('error', onWindowError, { capture: true });
    window.addEventListener('unhandledrejection', onUnhandledRejection, { capture: true });

     // 5) bloquer websocket localhost:3000 (port frontend) - désactivé pour Socket.IO
     const BLOCKED_WS_HOST = 'localhost';
     const BLOCKED_WS_PORT = '3000';

    const noopWS = function() {
      this.readyState = 1;
      this.close = () => { this.readyState = 3; };
      this.send = noop;
      this.addEventListener = noop;
      this.removeEventListener = noop;
      this.dispatchEvent = () => true;
      this.onopen = this.onclose = this.onerror = this.onmessage = null;
    };

    const OriginalWS = window.WebSocket;
    window.WebSocket = new Proxy(OriginalWS, {
      construct(target, argArray) {
        const url = argArray[0];
        try {
          const u = new URL(url);
          // Permettre les connexions Socket.IO même sur localhost:3000
          if ((u.hostname === BLOCKED_WS_HOST || u.hostname === '127.0.0.1') && u.port === BLOCKED_WS_PORT && !u.pathname.includes('/socket.io/')) {
            return new noopWS();
          }
        } catch {}
        return new target(...argArray);
      }
    });

    // 6) détection devtools silencieuse
    const interval = window.setInterval(() => {
      const opened = (window.outerHeight - window.innerHeight > 160) ||
                     (window.outerWidth - window.innerWidth > 160);
      void opened;
    }, 700);

    // cleanup
    return () => {
      document.removeEventListener('keydown', onKeyDown, { capture: true });
      document.removeEventListener('dragstart', onDragStart, { capture: true });
      window.removeEventListener('error', onWindowError, { capture: true });
      window.removeEventListener('unhandledrejection', onUnhandledRejection, { capture: true });
      window.clearInterval(interval);
    };
  }, []);

  return null;
};

export default ConsoleProtection;
