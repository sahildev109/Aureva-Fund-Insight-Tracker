import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '../hooks/useDebounce';
import api from '../api/axiosClient';
import SchemeResultCard from '../components/SchemeResultCard';

const LOADING_PHRASES = [
  "Searching...",
  "Working hard...",
  "Almost there...",
  "Crunching the numbers...",
  "Hunting down mutual funds...",
  "Just a brief moment..."
];

const STATS = [
  { label: "Mutual Funds", value: "2,500+" },
  { label: "AMCs", value: "45+" },
  { label: "Categories", value: "36" },
];

const POPULAR = ["SBI", "HDFC", "Mirae", "Axis", "Nippon", "ICICI"];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const { data: results = [], isLoading, isError } = useQuery({
    queryKey: ['funds-search', debouncedQuery],
    queryFn: () => api.get(`/funds/search?q=${debouncedQuery}`).then(r => r.data),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 2,
  });

  useEffect(() => {
    if (!isLoading) {
      setPhraseIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setPhraseIndex((prevIndex) => (prevIndex + 1) % LOADING_PHRASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading]);

  const hasResults = results.length > 0;
  const showEmpty = results.length === 0 && debouncedQuery.length >= 2 && !isLoading;
  const showHero = debouncedQuery.length < 2 && !isLoading;

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      {/* Top bar */}
     

      <main className="max-w-3xl mx-auto px-6 pb-16">

        {/* Hero section */}
        <div className="pt-14 pb-10 text-center">
        
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-3">
            Find the right<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
              mutual fund
            </span>
          </h1>
          <p className="text-gray-500 text-base max-w-sm mx-auto leading-relaxed">
            Search across all SEBI-registered Indian mutual funds by name, AMC, or scheme code.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by fund name, AMC or scheme code…"
            className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-5 py-4 text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent shadow-sm transition-shadow hover:shadow-md"
          />
          {query.length > 0 && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Popular chips */}
        {showHero && (
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {POPULAR.map(tag => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition-all font-medium shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Stats */}
        {showHero && (
          <div className="grid grid-cols-3 gap-3 mb-12">
            {STATS.map(s => (
              <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
                <div className="text-2xl font-black text-teal-600 tracking-tight">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="mt-8 flex flex-col items-center justify-center py-14 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-teal-100"></div>
              <div className="absolute inset-0 rounded-full border-t-2 border-teal-500 animate-spin"></div>
            </div>
            <span className="text-sm text-gray-500 font-medium transition-all duration-300 min-w-[180px] text-center">
              {LOADING_PHRASES[phraseIndex]}
            </span>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="mt-6 bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-4 items-start">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex-shrink-0 flex items-center justify-center mt-0.5">
              <svg className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-800 mb-0.5">Something went wrong</p>
              <p className="text-xs text-red-600">Failed to fetch results. Please check your connection and try again.</p>
            </div>
          </div>
        )}

        {/* Results count */}
        {hasResults && !isLoading && (
          <div className="flex items-center justify-between mb-4 mt-6">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{results.length}</span> fund{results.length !== 1 ? 's' : ''} found
              {debouncedQuery && <> for <span className="font-medium text-teal-700">"{debouncedQuery}"</span></>}
            </p>
          </div>
        )}

        {/* Results list */}
        {hasResults && (
          <ul className="space-y-3">
            {results.map(scheme => (
              <SchemeResultCard key={scheme.schemeCode} scheme={scheme} />
            ))}
          </ul>
        )}

        {/* Empty state */}
        {showEmpty && (
          <div className="mt-10 text-center py-14 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="h-7 w-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-700 font-semibold text-base mb-1">No funds found</p>
            <p className="text-sm text-gray-400">No results for <span className="text-gray-600 font-medium">"{debouncedQuery}"</span></p>
            <p className="text-xs text-gray-400 mt-1">Try a different keyword or AMC name</p>
          </div>
        )}

        {/* Footer hint */}
        {showHero && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Data sourced from AMFI · Updated daily
          </p>
        )}
      </main>
    </div>
  );
}