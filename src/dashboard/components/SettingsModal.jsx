import * as Dialog from "@radix-ui/react-dialog";
import { useEffect } from "react";

export default function SettingsModal({ open, onClose, title, children, actions }) {
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const root = document.documentElement;
    body.classList.add("settings-modal-open");
    root.classList.add("settings-modal-open");
    return () => {
      body.classList.remove("settings-modal-open");
      root.classList.remove("settings-modal-open");
    };
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : null)}>
      <Dialog.Portal>
        <Dialog.Overlay className="settings-modal-overlay" />
        <Dialog.Content className="settings-modal">
          <div className="settings-modal-header">
            <Dialog.Title>{title}</Dialog.Title>
          </div>
          <div className="settings-modal-body">{children}</div>
          {actions && <div className="settings-modal-actions">{actions}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
