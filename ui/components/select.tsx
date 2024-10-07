import { DetailedHTMLProps, SelectHTMLAttributes } from "react";

type SelectProps = DetailedHTMLProps<
  SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
> & {
  options: string[];
  defaultOption?: string;
};

export const Select = ({
  children,
  options,
  defaultOption,
  ...props
}: SelectProps) => {
  return (
    <select {...props}>
      {defaultOption ? (
        <option value="" disabled>
          {defaultOption}
        </option>
      ) : null}
      {options.map((option, index) => (
        <option key={option} value={index.toString()}>
          {option}
        </option>
      ))}
    </select>
  );
};
