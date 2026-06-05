import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';

export default function WatchlistItem({ item }) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { mutate: removeWatchlist, isPending } = useMutation({
    mutationFn: () => api.delete(`/watchlist/${item.schemeCode}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const handleRemove = (e) => {
    e.stopPropagation();
    removeWatchlist();
  };

  const handleNavigate = () => {
    navigate(`/fund/${item.schemeCode}`);
  };

  return (
    <div 
      onClick={handleNavigate}
      className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-teal-100 cursor-pointer transition-all duration-200"
    >
      <div className="flex-1 pr-4">
        <h3 className="font-semibold text-gray-800 hover:text-teal-600 transition-colors line-clamp-2">
          {item.schemeName}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Code: {item.schemeCode}
        </p>
      </div>

      <button
        onClick={handleRemove}
        disabled={isPending}
        className="ml-4 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg disabled:opacity-50 transition-colors"
      >
        {isPending ? (
          <div className="flex items-center space-x-1">
            <svg className="animate-spin h-3.5 w-3.5 text-red-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Removing...</span>
          </div>
        ) : (
          <span>Remove</span>
        )}
      </button>
    </div>
  );
}
