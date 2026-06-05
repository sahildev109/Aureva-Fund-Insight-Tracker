import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';

export default function SchemeResultCard({ scheme }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: watchlist = [] } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.get('/watchlist').then(r => r.data),
    enabled: !!token,
  });

  const isInWatchlist = watchlist.some(
    (item) => String(item.schemeCode) === String(scheme.schemeCode)
  );

  const { mutate: addToWatchlist, isPending, isError, error } = useMutation({
    mutationFn: () =>
      api.post('/watchlist', {
        schemeCode: scheme.schemeCode,
        schemeName: scheme.schemeName,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!token) return navigate('/login');
    addToWatchlist();
  };

  const handleViewDetails = () => {
    navigate(`/fund/${scheme.schemeCode}`);
  };

  return (
    <li 
      onClick={handleViewDetails}
      className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:bg-teal-50/30 hover:border-teal-100 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex-1 pr-4">
        <p className="font-semibold text-gray-800 line-clamp-2 hover:text-teal-600 transition-colors">
          {scheme.schemeName}
        </p>
        <div className="flex items-center space-x-3 mt-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            Code: {scheme.schemeCode}
          </span>
        </div>
        {isError && (
          <p className="text-xs text-red-500 font-medium mt-2">
            {error?.response?.status === 409 ? 'Already in watchlist' : 'Failed to add. Please try again.'}
          </p>
        )}
      </div>
      <button
        onClick={isInWatchlist ? undefined : handleAdd}
        disabled={isPending || isInWatchlist}
        className={`ml-4 flex-shrink-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg transition-colors shadow-sm ${
          isInWatchlist
            ? 'bg-gray-100 text-gray-500 cursor-default'
            : 'text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50'
        }`}
      >
        {isPending ? (
          <div className="flex items-center space-x-1.5">
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Adding...</span>
          </div>
        ) : isInWatchlist ? (
          <span>In Watchlist</span>
        ) : (
          <span>+ Watchlist</span>
        )}
      </button>
    </li>
  );
}
