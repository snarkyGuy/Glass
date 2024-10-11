import Link from "next/link";
import { Button, ButtonProps } from "./button";

type NavigationButtonProps = {
  href: string;
} & ButtonProps;

export const NavigationButton = ({
  href,
  ...buttonProps
}: NavigationButtonProps) => {
  return (
    <Link href={href}>
      <Button {...buttonProps} />
    </Link>
  );
};
