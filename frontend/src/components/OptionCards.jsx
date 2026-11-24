// frontend/src/components/OptionCards.jsx
// Bade clickable cards me se ek chunne ke liye (radio buttons jaisa).
// Create Room mein "Who can join" ke liye use hota hai.

// Chhote SVG icons
const icons = {
  open: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </>
  ),
  approval: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </>
  ),
};

function OptionCards({ label, value, onChange, options }) {
  return (
    <div className="form-group">
      <span className="type-legend" id="option-cards-label">
        {label}
      </span>

      <div className="type-picker" role="radiogroup" aria-labelledby="option-cards-label">
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <button
              type="button"
              key={option.value}
              role="radio"
              aria-checked={isSelected}
              className={isSelected ? "type-option selected" : "type-option"}
              onClick={() => onChange(option.value)}
            >
              <span className="type-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {icons[option.icon]}
                </svg>
              </span>
              <strong>{option.title}</strong>
              <span className="type-text">{option.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default OptionCards;