import { ReactNode } from "react";
import { Button, ButtonProps } from "./button";

export const ModalOption = ({ children, disabled }: ButtonProps) => {
  return (
    <Button
      disabled={disabled}
      className="bg-transparent enabled:text-text-standard enabled:hover:bg-secondary-brand h-full w-full"
    >
      {children}
    </Button>
  );
};
