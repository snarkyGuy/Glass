import { ReactNode } from "react";
import { Button, ButtonProps } from "./button";

export const ModalOption = ({ children, disabled }: ButtonProps) => {
  return (
    <Button
      disabled={disabled}
      className="bg-transparent  p-10 enabled:text-gray-500 h-full w-full"
    >
      {children}
    </Button>
  );
};
