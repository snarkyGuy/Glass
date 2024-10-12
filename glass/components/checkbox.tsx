type CheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const Checkbox = ({ checked, id, label, onChange }: CheckboxProps) => {
  return (
    <div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        value=""
        onChange={onChange}
        // className="appearance-none w-4 h-4 text-blue-600 bg-gray-100 border-2 border-outlines rounded
        //     focus:ring-blue-500 focus:ring-2 checked:bg-slate-200
        //     hover:drop-shadow-[5px_5px_0_rgba(30,30,30,1)]"
      />
      <label htmlFor={id} className="mx-4">
        {label}
      </label>
    </div>
  );
};
