import { Button, ButtonProps } from "./button";

export const IconButton = ({ className = "", ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={`hover:bg-secondary-light min-w-fit 
      border-2 rounded-full py-4 px-4 enabled:hover:drop-shadow-[5px_5px_0_rgba(30,30,30,1)] transition
      ${className}`}
    ></button>
  );
};
