import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { Button } from './ui/button';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

const SUGGESTIONS: { label: string; prompt: string }[] = [
  { label: 'SUVs under $20k', prompt: 'Show SUVs under $20,000' },
  { label: 'Electric cars', prompt: 'Show electric cars' },
  { label: 'Low mileage < 25k', prompt: 'Show cars with mileage under 25,000 km' },
  { label: 'Recent (2020+)', prompt: 'Show cars from year 2020 and newer' },
  { label: 'Financing', prompt: 'Do you offer financing?' },
  { label: 'Contact', prompt: 'Contact support' },
];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'm1',
      role: 'bot',
      text: 'Hi! I\'m your assistant. I can help you find cars (by brand, price, fuel, transmission, year, mileage), explain features (compare, saved searches), or answer FAQs (financing, contact, hours). What can I do for you today?'
    }
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const id = crypto.randomUUID?.() || String(Date.now());
    setMessages((m) => [...m, { id, role: 'user', text }]);
    handleQuery(text);
    setInput('');
  };

  const reply = (text: string) => {
    const id = crypto.randomUUID?.() || String(Date.now());
    setMessages((m) => [...m, { id, role: 'bot', text }]);
  };

  const handleQuery = (q: string) => {
    const query = q.toLowerCase();

    // Quick intents
    if (/\b(contact|support|phone|email)\b/.test(query)) {
      reply('Opening the contact page for you. Feel free to send us a message or call.');
      navigate('/contact');
      return;
    }
    if (/\b(finance|financing|loan|payment|payments)\b/.test(query)) {
      reply('We work with trusted partners for financing. Typical approvals within 24–48h. Down payment varies by credit profile. I can also filter cars within your budget—try "SUVs under $25,000".');
      return;
    }
    if (/\b(compare)\b/.test(query)) {
      reply('Use the Compare button on any car to add it (max 3). Then open the Compare page to see them side-by-side.');
      return;
    }
    if (/\b(saved\s*search|save\s*search|saved\s*searches)\b/.test(query)) {
      reply('You can save your filters from the listings page and revisit them under Saved Searches. Opening saved searches…');
      navigate('/saved-searches');
      return;
    }

    // Navigate to listings with filters parsed from natural language
    const params = new URLSearchParams();

    // Brand detection
    const brands = ['bmw','audi','ford','mercedes','mini','volvo','porsche','toyota','honda','hyundai','kia','nissan','chevrolet','gmc','dodge','jeep','ram'];
    const brandMatch = brands.find(b => new RegExp(`\\b${b}\\b`, 'i').test(query));
    if (brandMatch) {
      params.append('brand', brandMatch);
    }

    // Price under / between
    const underPrice = query.match(/under\s*\$?([\d,]+)/);
    const betweenPrice = query.match(/(between|from)\s*\$?([\d,]+)\s*(and|to)\s*\$?([\d,]+)/);
    if (betweenPrice) {
      const min = Number(betweenPrice[2].replace(/,/g, '')) || 0;
      const max = Number(betweenPrice[4].replace(/,/g, '')) || 250000;
      params.set('min', String(min));
      params.set('max', String(max));
    } else if (underPrice) {
      const max = Number(underPrice[1].replace(/,/g, '')) || 0;
      params.set('min', '0');
      params.set('max', String(max));
    }

    // Mileage under
    const mileageUnder = query.match(/mileage\s*(under|below|less\s*than)\s*([\d,]+)/) || query.match(/under\s*([\d,]+)\s*km/);
    if (mileageUnder) {
      const km = Number((mileageUnder[2] || mileageUnder[1]).replace(/,/g, '')) || 0;
      params.set('mileage', String(km));
    }

    // Fuel type
    if (/\belectric\b/.test(query)) params.set('fuelType', 'electric');
    else if (/\bhybrid\b/.test(query)) params.set('fuelType', 'hybrid');
    else if (/\bdiesel\b/.test(query)) params.set('fuelType', 'diesel');
    else if (/\b(gas|gasoline|petrol)\b/.test(query)) params.set('fuelType', 'gasoline');

    // Transmission
    if (/\bautomatic\b/.test(query)) params.set('transmission', 'automatic');
    if (/\bmanual\b/.test(query)) params.set('transmission', 'manual');

    // Year range
    const afterYear = query.match(/(after|from|since)\s*(20\d{2})/);
    const beforeYear = query.match(/(before|up\s*to|until)\s*(20\d{2})/);
    if (afterYear) params.set('yearMin', afterYear[2]);
    if (beforeYear) params.set('yearMax', beforeYear[2]);

    // If we have any filter param, navigate to listings
    if (Array.from(params.keys()).length) {
      reply('Got it — showing results that match your request.');
      navigate(`/listings?${params.toString()}`);
      return;
    }

    // Fallback help
    reply('I can search by brand (e.g., BMW), price (under $25,000), mileage (under 25,000 km), fuel (electric, diesel), transmission (automatic), and year (after 2020). Try: "Show electric SUVs under $40,000".');
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button onClick={() => setOpen(true)} className="bg-red-600 hover:bg-red-700 text-white shadow-lg rounded-full h-12 w-12 p-0">
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[92vw] shadow-2xl rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">Assistant</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} className="text-white/90 hover:text-white hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div ref={listRef} className="max-h-[50vh] overflow-y-auto px-4 py-3 space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTIONS.map(s => (
                <button
                  key={s.label}
                  className="text-xs px-2 py-1 rounded-full border hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  onClick={() => send(s.prompt)}
                  title={s.prompt}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 border-t">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
              placeholder="Ask me anything…"
              className="flex-1 text-sm rounded-md border px-3 py-2 bg-white dark:bg-neutral-900"
            />
            <Button onClick={() => send(input)} className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
