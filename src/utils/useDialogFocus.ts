import { useEffect, useRef } from 'react';

const controls = 'button:not(:disabled), input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]';

export function useDialogFocus(open: boolean, onClose: () => void) {
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  const wasOpen = useRef(false);
  const previousFocus = useRef<HTMLElement | null>(null);
  close.current = onClose;
  if (open && !wasOpen.current && typeof document !== 'undefined') previousFocus.current = document.activeElement as HTMLElement | null;
  wasOpen.current = open;
  useEffect(() => {
    if (!open || !dialog.current) return;
    const previous = previousFocus.current;
    const visibleControls = () => [...((dialog.current?.querySelector('[data-dialog-focus-scope]') || dialog.current)?.querySelectorAll<HTMLElement>(controls) || [])].filter(element =>
      !element.closest('[hidden], .hidden, details:not([open])') && getComputedStyle(element).visibility !== 'hidden' && getComputedStyle(element).display !== 'none'
    );
    (visibleControls()[0] || dialog.current).focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close.current(); }
      if (event.key === 'Tab') {
        const items = visibleControls(), first = items[0], last = items.at(-1);
        if (!first) { event.preventDefault(); dialog.current?.focus(); }
        else if (event.shiftKey && (document.activeElement === first || !dialog.current?.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !dialog.current?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    };
    const host = dialog.current;
    host.addEventListener('keydown', keydown);
    return () => { host.removeEventListener('keydown', keydown); if (previous?.isConnected) previous.focus(); };
  }, [open]);
  return dialog;
}
