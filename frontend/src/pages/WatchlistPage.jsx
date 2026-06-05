import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import WatchlistItem from '../components/WatchlistItem';

export default function WatchlistPage() {
  const { data: watchlist = [], isLoading, isError } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.get('/watchlist').then(r => r.data),
  });

  return (
    <div className="bg-[#f7f6f2] min-h-screen">
    <div className="max-w-2xl mx-auto p-6 ">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Your <span className="text-teal-600">Watchlist</span>
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Monitor your selected mutual funds and analyze their historical performance
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">Failed to load your watchlist. Please try again.</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !isError && watchlist.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-6">
          <svg className="mx-auto h-16 w-16 text-teal-500/80 mb-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-bold text-gray-800">Your watchlist is empty</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            You haven't added any mutual funds to your watchlist yet. Start searching to build your list.
          </p>
          <div className="mt-6">
            <Link
              to="/search"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
            >
              Search for funds to get started
            </Link>
          </div>
        </div>
      )}

      {!isLoading && !isError && watchlist.length > 0 && (
        <div className="space-y-3">
          {watchlist.map(item => (
            <WatchlistItem key={item.schemeCode} item={item} />
          ))}
        </div>
      )}
    </div>
    </div>
  );
}
