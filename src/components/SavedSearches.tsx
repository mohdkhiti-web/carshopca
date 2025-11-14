import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';

const KEY = 'savedSearches';

interface SavedSearch {
  id: string;
  name: string;
  params: Record<string, string>;
  createdAt: number;
}

const SavedSearches = () => {
  const [items, setItems] = useState<SavedSearch[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) || '[]';
      const list: SavedSearch[] = JSON.parse(raw);
      setItems(list);
    } catch {
      setItems([]);
    }
  }, []);

  const open = (s: SavedSearch) => {
    const params = new URLSearchParams(s.params).toString();
    navigate(`/listings?${params}`);
  };

  const remove = (id: string) => {
    const next = items.filter(i => i.id !== id);
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const clearAll = () => {
    setItems([]);
    localStorage.setItem(KEY, '[]');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Saved Searches</h1>
        <Button variant="outline" onClick={clearAll} disabled={!items.length}>Clear All</Button>
      </div>

      {!items.length ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">No saved searches</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Save searches from the Listings page to find cars faster next time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((i) => (
            <Card key={i.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{i.name}</h3>
                    <p className="text-xs text-gray-500">{new Date(i.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => open(i)}>Open</Button>
                    <Button size="sm" variant="outline" onClick={() => remove(i.id)}>Delete</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700 break-all">
                  {Object.entries(i.params).map(([k, v]) => `${k}=${v}`).join(' • ')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedSearches;
