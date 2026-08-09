export default function TextInput({ label, name, value, onChange, placeholder = "", className = "" }) {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-teal-600">
            {label}
          </label>
        )}
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-teal-500 focus:outline-hidden focus:ring-1 focus:ring-primary ${className}`}
        />
      </div>
    );
  }