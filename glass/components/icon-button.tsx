import { Button, ButtonProps } from "./button";

export const IconButton = ({ className = "", ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={`hover:bg-secondary-light min-w-fit 
border-1 rounded-full py-4 px-4 
enabled:hover:scale-110 transition-transform

      ${className}`}
    ></button>
  );
};
