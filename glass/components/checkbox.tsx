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
      />
      <label htmlFor={id} className="mx-4">
        {label}
      </label>
    </div>
  );
};
