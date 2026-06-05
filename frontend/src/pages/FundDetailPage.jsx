import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosClient';
import NavChart from '../components/NavChart';
import RangeToggle from '../components/RangeToggle';
import { filterByRange } from '../utils/navHelpers';

const RANGES = ['1Y', '3Y', '5Y', 'All'];

export default function FundDetailPage() {
  const { schemeCode } = useParams();
  const navigate = useNavigate();
  const [range, setRange] = useState('5Y');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['fund-nav', schemeCode],
    queryFn: () => api.get(`/funds/${schemeCode}`).then(r => r.data),
    staleTime: 1000 * 60 * 60, // 1 hr - matches server cache
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading historical fund data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-bold text-red-800">Failed to load fund data</h3>
          <p className="mt-2 text-sm text-red-600">We couldn't retrieve the NAV history for this scheme.</p>
          <button 
            onClick={() => navigate('/search')}
            className="mt-6 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-colors"
          >
            &larr; Back to Search
          </button>
        </div>
      </div>
    );
  }

  if (!data?.data?.length) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 font-medium text-lg">No NAV data available for this fund.</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 text-teal-600 hover:text-teal-700 font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const chartData = filterByRange(data.data, range);
  const { schemeName } = data.meta;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center text-sm font-medium text-gray-500 hover:text-teal-600 mb-6 transition-colors"
        >
          <svg className="mr-1.5 h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {schemeName}
        </h1>
        <div className="mt-3 flex items-center space-x-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
            Scheme Code: {schemeCode}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 sm:mb-0">NAV History</h3>
          <RangeToggle ranges={RANGES} active={range} onChange={setRange} />
        </div>

        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[380px] bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No data available for the selected range.</p>
          </div>
        ) : (
          <NavChart data={chartData} />
        )}
      </div>
    </div>
  );
}
