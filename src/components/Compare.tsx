import { useEffect, useMemo, useState } from 'react';
import { getCar } from '@/services/api';
import { Button } from './ui/button';
import { formatCurrency, formatKm } from '@/utils/format';
import { Card, CardContent, CardHeader } from './ui/card';

interface CompareCar {
  id: string;
  brand?: string;
  model?: string;
  price?: number;
  year?: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  image?: string;
}

const COMPARE_KEY = 'compareCars';

const Compare = () => {
  const [ids, setIds] = useState<string[]>([]);
  const [cars, setCars] = useState<CompareCar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const list: string[] = JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]');
    setIds(list);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const results: CompareCar[] = [];
        for (const id of ids) {
          const c = await getCar(id);
          if (c) {
            results.push({
              id,
              brand: c.brand,
              model: c.model,
              price: c.price,
              year: c.year,
              mileage: c.mileage,
              fuelType: c.fuelType,
              transmission: c.transmission,
              image: c.images?.[0],
            });
          }
        }
        setCars(results);
      } finally {
        setLoading(false);
      }
    };
    if (ids.length) load(); else { setCars([]); setLoading(false); }
  }, [ids]);

  const clearAll = () => {
    localStorage.setItem(COMPARE_KEY, JSON.stringify([]));
    setIds([]);
  };

  const remove = (id: string) => {
    const list: string[] = JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]');
    const next = list.filter(x => x !== id);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
    setIds(next);
  };

  const headers = useMemo(() => [
    { key: 'brand', label: 'Brand' },
    { key: 'model', label: 'Model' },
    { key: 'price', label: 'Price' },
    { key: 'year', label: 'Year' },
    { key: 'mileage', label: 'Mileage' },
    { key: 'fuelType', label: 'Fuel' },
    { key: 'transmission', label: 'Transmission' },
  ] as const, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Compare</h1>
        <Button variant="outline" onClick={clearAll} disabled={ids.length === 0}>Clear All</Button>
      </div>

      {cars.length === 0 ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">No cars selected</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Go to the listings and click "Compare" on up to 3 cars to compare them here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="p-3 border w-56">Car</th>
                {cars.map((c) => (
                  <th key={c.id} className="p-3 border text-left">
                    <div className="flex items-center gap-3">
                      {c.image && <img src={c.image} alt="car" className="w-16 h-12 object-cover rounded" loading="lazy" />}
                      <div>
                        <div className="font-semibold">{c.brand} {c.model}</div>
                        <Button size="sm" variant="ghost" onClick={() => remove(c.id)}>Remove</Button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {headers.map(h => (
                <tr key={h.key}>
                  <td className="p-3 border font-medium">{h.label}</td>
                  {cars.map(c => (
                    <td key={c.id + h.key} className="p-3 border">
                      {h.key === 'price' ? formatCurrency(c.price || 0) :
                       h.key === 'mileage' ? formatKm(c.mileage || 0) :
                       String((c as any)[h.key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Compare;
