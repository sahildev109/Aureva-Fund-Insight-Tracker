import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts';

const formatDate = (dateStr) => {
  const [d, m, y] = dateStr.split('-');
  return `${d}/${m}/${y.slice(2)}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-lg ring-1 ring-black ring-opacity-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-teal-700">
        ₹ {payload[0].value.toFixed(4)}
      </p>
    </div>
  );
};

export default function NavChart({ data }) {
  const navs = data.map(d => d.nav);
  const minNav = Math.min(...navs);
  const maxNav = Math.max(...navs);
  const padding = (maxNav - minNav) * 0.05;

  // Thin out x-axis ticks for readability
  const tickInterval = Math.max(1, Math.floor(data.length / 8));

  return (
    <div className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={data} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            interval={tickInterval}
            tick={{ fontSize: 11, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            dy={10}
          />
          <YAxis
            domain={[minNav - padding, maxNav + padding]}
            tickFormatter={v => `₹${v.toFixed(0)}`}
            tick={{ fontSize: 11, fill: '#64748b' }}
            width={60}
            tickLine={false}
            axisLine={false}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Line
            type="monotone"
            dataKey="nav"
            stroke="#0d9488"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 6, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
