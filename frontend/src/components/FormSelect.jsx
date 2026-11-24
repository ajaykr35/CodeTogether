// Reusable dropdown: label + select + (hint) + error message.

function FormSelect({ label, name, value, onChange, options, error, hint }) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={error ? "form-input form-select input-error" : "form-input form-select"}
        aria-invalid={error ? "true" : "false"}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {hint && !error && <span className="form-hint">{hint}</span>}

      {error && (
        <span className="form-error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default FormSelect;