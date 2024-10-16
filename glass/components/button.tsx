import { DetailedHTMLProps, ButtonHTMLAttributes } from "react";
import { LoadingSpinner } from "./loading-spinner";

export type ButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  loading?: boolean;
};

export const Button = ({
  className = "",
  loading = false,
  ...props
}: ButtonProps) => {
  const children = loading ? <LoadingSpinner /> : props.children;

  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`bg-[#faebeb]
        text-gray-700 font-bold p-2 px-4 
    transition
        ${className}`}
    >
      {children}
    </button>
  );
};
