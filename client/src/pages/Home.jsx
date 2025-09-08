import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import Filters from "../components/Filters";

function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-5 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-6" />
        <div className="h-9 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const grid = useMemo(() => {
    if (loading) {
      return Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />);
    }
    return items.map(i => <ProductCard key={i.id} item={i} />);
  }, [items, loading]);

  useEffect(() => {
    // Debounce filters to avoid spamming the API while typing
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Abort previous in-flight request
      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      setLoading(true);
      setErr("");
      api.listItems(filters, ctrl.signal)
        .then(setItems)
        .catch(e => { if (e.name !== "AbortError") setErr(e.message); })
        .finally(() => setLoading(false));
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      // do not abort here; we only abort when starting a new request
    };
  }, [filters]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-4">
      <Filters onChange={setFilters} />
      {err && (
        <div className="card p-3 border-red-200 bg-red-50 text-red-700 text-sm">
          {err} — <button className="underline" onClick={() => setFilters({ ...filters })}>Retry</button>
        </div>
      )}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {grid}
      </div>
      {!loading && items.length === 0 && !err && (
        <div className="text-center text-gray-600 py-10">No items found for your filters.</div>
      )}
    </div>
  );
}
