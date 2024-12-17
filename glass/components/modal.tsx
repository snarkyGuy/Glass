import { Dialog, DialogOverlay, DialogContent } from "@reach/dialog";

type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onDismiss: () => void;
};

export const Modal = ({ children, isOpen, onDismiss }: ModalProps) => {
  return (
    <DialogOverlay isOpen={isOpen} onDismiss={onDismiss}>
      <DialogContent
        aria-label="dialog"
        className="border-outlines   mt-48  border-2 rounded-md p-0 max-w-xl"
      >
        {children}
      </DialogContent>
    </DialogOverlay>
  );
};
