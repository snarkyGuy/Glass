import { DetailedHTMLProps, InputHTMLAttributes } from "react";

export const Input = ({
  className = "",
  ...props
}: DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>) => {
  return (
    <input
      {...props}
      className={`bg-white p-2 px-4 rounded-md border-blue-1 border-2 ${className}`}
    />
  );
};
