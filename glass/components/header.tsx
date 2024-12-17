import Link from "next/link";
import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useState } from "react";

export const Header = () => {
  const { address } = useAccount();
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <header
      style={{ fontFamily: '"Akaya Kanadaka", system-ui' }}
      className="bg-[#ffd0d0] px-4 md:px-8"
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Logo and Title */}
        <div className="flex items-center gap-4 py-4">
          <h2 className="text-gray-700 text-2xl ">Glass</h2>
        </div>

        {/* Hamburger Menu (Visible on small screens) */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            {isMenuOpen ? (
              <span className="text-xl">✕</span>
            ) : (
              <span className="text-xl">☰</span>
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:flex items-center gap-8 py-4 flex-col md:flex-row`}
        >
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-md">
            <HeaderButton href="/">Home</HeaderButton>
            <HeaderButton href="/mydashboard">My Portfolio</HeaderButton>
            <HeaderButton href="/">Most Viewed</HeaderButton>
          </div>

          {/* Connect Button */}
          <div className="py-2 flex justify-center md:py-0 md:ml-auto">
            <ConnectKitButton />
          </div>
        </nav>
      </div>
    </header>
  );
};

type HeaderButtonProps = {
  href: string;
  children: React.ReactNode;
};

const HeaderButton = ({ href, children }: HeaderButtonProps) => {
  const { pathname } = useRouter();
  const selectedRoute =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <div className="flex flex-col text-gray-600 relative justify-center group">
      <Link
        className={`${
          selectedRoute ? "font-bold" : ""
        } no-underline text-base hover:text-gray-800`}
        href={href}
      >
        {children}
      </Link>
      <div
        className={`h-1 -bottom-4 left-0 right-0 absolute ${
          selectedRoute ? "bg-green-500" : ""
        }`}
      />
    </div>
  );
};
