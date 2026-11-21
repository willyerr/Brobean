interface BrewRatingProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function BrewRating({ value, onChange, disabled = false }: BrewRatingProps) {
  return (
    <div className="brew-rating" role="radiogroup" aria-label="Overall brew rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          role="radio"
          aria-checked={value === rating}
          aria-label={`${rating} out of 5 stars`}
          className={rating <= value ? 'selected' : ''}
          disabled={disabled}
          onClick={() => onChange(rating)}
        >
          ★
        </button>
      ))}
      <span>{value ? `${value}/5` : 'Choose a rating'}</span>
    </div>
  );
}
