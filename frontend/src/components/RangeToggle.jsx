export default function RangeToggle({ ranges, active, onChange }) {
  return (
    <div className="flex space-x-2 mb-6">
      {ranges.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-all duration-200 ${
            active === range
              ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-600 ring-offset-1'
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
