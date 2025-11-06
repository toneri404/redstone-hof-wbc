export default function SearchBar({ value, onChange, placeholder="Search..." }){
return (
<div className="relative">
<input
value={value}
onChange={e=>onChange(e.target.value)}
placeholder={placeholder}
className="w-full md:w-80 bg-zinc-900 border border-zinc-800 focus:border-red-500/70 outline-none rounded-xl px-4 py-2 text-sm"
/>
<span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">⌕</span>
</div>
);
}