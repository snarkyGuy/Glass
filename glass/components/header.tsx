import Link from "next/link";
import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";

export const Header = () => {
  const { address } = useAccount();
  let connectedAccount = "";
  if (address === "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266") {
    connectedAccount = "Account: creator.eth";
  }

  if (address === "0x70997970C51812dc3A010C7d01b50e0d17dc79C8") {
    connectedAccount = "Account: pinner.eth";
  }

  return (
    <header style={{ fontFamily: '"Akaya Kanadaka", system-ui' }}  className="bg-[#ffd0d0] px-8">
      <div className="max-w-6xl mx-auto flex justify-between">
        <div className="flex items-center gap-8 py-4">
      
          <h2>Glass</h2>
          
          <div className="text-md flex gap-8 h-full">
            <HeaderButton href="/">Home</HeaderButton>
            <HeaderButton href="/mydashboard">Dashboard</HeaderButton>
          </div>
        </div>
        <div className="py-4 flex gap-8 items-center">
          <p>{connectedAccount}</p>
          <ConnectKitButton />
        </div>
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
    <div className="flex flex-col relative justify-center group">
      <Link
        className={`${selectedRoute ? "font-bold" : ""} no-underline`}
        href={href}
      >
        {children}
      </Link>
      <div
        className={`h-1 -bottom-4 left-0 right-0 absolute ${
          selectedRoute ? "bg-green" : ""
        }`}
      />
    </div>
  );
};
