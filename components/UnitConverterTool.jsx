'use client';

import { useState } from 'react';
import * as Lucide from 'lucide-react';

// Each category: units defined by their factor relative to a base unit.
// Temperature is special-cased (offsets, not just factors).
const CATEGORIES = {
  Length: {
    base: 'Meter',
    units: {
      Millimeter: 0.001, Centimeter: 0.01, Meter: 1, Kilometer: 1000,
      Inch: 0.0254, Foot: 0.3048, Yard: 0.9144, Mile: 1609.344,
    },
  },
  Weight: {
    base: 'Kilogram',
    units: {
      Milligram: 0.000001, Gram: 0.001, Kilogram: 1, Tonne: 1000,
      Ounce: 0.0283495, Pound: 0.453592, Stone: 6.35029,
    },
  },
  Temperature: { base: 'Celsius', units: { Celsius: 1, Fahrenheit: 1, Kelvin: 1 } },
  Volume: {
    base: 'Liter',
    units: {
      Milliliter: 0.001, Liter: 1, 'Cubic meter': 1000,
      Teaspoon: 0.00492892, Tablespoon: 0.0147868, 'Cup (US)': 0.236588,
      'Pint (US)': 0.473176, 'Quart (US)': 0.946353, 'Gallon (US)': 3.78541,
    },
  },
  Area: {
    base: 'Square meter',
    units: {
      'Square meter': 1, 'Square kilometer': 1000000, 'Square foot': 0.092903,
      'Square yard': 0.836127, 'Square mile': 2589988.11, Acre: 4046.86, Hectare: 10000,
    },
  },
  Speed: {
    base: 'Meter per second',
    units: {
      'Meter per second': 1, 'Kilometer per hour': 0.277778,
      'Mile per hour': 0.44704, Knot: 0.514444, 'Foot per second': 0.3048,
    },
  },
  Time: {
    base: 'Second',
    units: {
      Millisecond: 0.001, Second: 1, Minute: 60, Hour: 3600,
      Day: 86400, Week: 604800, Month: 2629800, Year: 31557600,
    },
  },
  Data: {
    base: 'Megabyte',
    units: {
      Bit: 0.000000125, Byte: 0.000001, Kilobyte: 0.001, Megabyte: 1,
      Gigabyte: 1000, Terabyte: 1000000,
    },
  },
};

function convert(category, value, from, to) {
  const v = parseFloat(value);
  if (!isFinite(v)) return '';
  if (category === 'Temperature') {
    // Convert from -> Celsius, then Celsius -> to.
    let c;
    if (from === 'Celsius') c = v;
    else if (from === 'Fahrenheit') c = (v - 32) * (5 / 9);
    else c = v - 273.15; // Kelvin
    let out;
    if (to === 'Celsius') out = c;
    else if (to === 'Fahrenheit') out = c * (9 / 5) + 32;
    else out = c + 273.15;
    return out;
  }
  const units = CATEGORIES[category].units;
  return (v * units[from]) / units[to];
}

function fmt(n) {
  if (n === '' || n === null || !isFinite(n)) return '';
  const rounded = Math.round(n * 1e6) / 1e6;
  return String(rounded);
}

export default function UnitConverterTool() {
  const [category, setCategory] = useState('Length');
  const unitList = Object.keys(CATEGORIES[category].units);
  const [value, setValue] = useState('1');
  const [from, setFrom] = useState(unitList[0]);
  const [to, setTo] = useState(unitList[1] || unitList[0]);

  function changeCategory(cat) {
    setCategory(cat);
    const list = Object.keys(CATEGORIES[cat].units);
    setFrom(list[0]);
    setTo(list[1] || list[0]);
  }

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const result = fmt(convert(category, value, from, to));
  const selectStyle = { color: 'var(--ink)' };

  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>Category</label>
        <div className="flex flex-wrap gap-2">
          {Object.keys(CATEGORIES).map((cat) => (
            <button key={cat} onClick={() => changeCategory(cat)} className="rounded-lg px-4 py-2 text-sm font-semibold border surface" style={category === cat ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : selectStyle}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="border surface rounded-2xl p-6" style={{ background: 'var(--surface)' }}>
        <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>From</label>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="w-full rounded-xl border surface px-4 py-3 text-lg bg-transparent mb-2" style={selectStyle} />
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={selectStyle}>
              {unitList.map((u) => <option key={u} value={u} style={{ color: '#000' }}>{u}</option>)}
            </select>
          </div>

          <button onClick={swap} className="rounded-xl border surface w-11 h-11 inline-flex items-center justify-center mb-1 shrink-0 mx-auto" style={selectStyle} aria-label="Swap units">
            <Lucide.ArrowLeftRight className="w-4 h-4" />
          </button>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--ink)' }}>To</label>
            <input readOnly value={result} className="w-full rounded-xl border surface px-4 py-3 text-lg bg-transparent mb-2 font-bold" style={{ color: 'var(--brand)' }} />
            <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-xl border surface px-4 py-2 text-sm bg-transparent" style={selectStyle}>
              {unitList.map((u) => <option key={u} value={u} style={{ color: '#000' }}>{u}</option>)}
            </select>
          </div>
        </div>

        {result !== '' && (
          <p className="muted text-sm mt-5">
            {value} {from} = <strong style={{ color: 'var(--ink)' }}>{result} {to}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
