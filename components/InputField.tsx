import styles from "./InputField.module.css";

type InputFieldProps = {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function InputField({
  label,
  id,
  type = "text",
  value,
  onChange,
}: InputFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}