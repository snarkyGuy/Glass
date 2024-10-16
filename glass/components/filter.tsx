import Link from "next/link";
import { useRouter } from "next/router";

type FilterProps = {
  children: React.ReactNode;
};
export const Filter = ({ children }: FilterProps) => {
  return (
    <div className="flex border-2 rounded-md border-outlines overflow-hidden">
      {children}
    </div>
  );
};

type FilterTabProps = {
  filter: string;
  children: React.ReactNode;
  isDefault?: boolean;
};

export const FilterTab = ({
  filter,
  children,
  isDefault = false,
}: FilterTabProps) => {
  const { query } = useRouter();
  const isActive =
    query.filter === filter || (query.filter === undefined && isDefault);

  return (
    <div
      className={`border-r-2 bg-[#faebeb]  border-r-outlines last:border-r-0 px-4 py-2 
    ${isActive ? "bg-secondary-brand" : ""}`}
    >
      <Link className={`mx-auto`} href={`?filter=${filter}`}>
        {children}
      </Link>
    </div>
  );
};
