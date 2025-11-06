export default function Badge({ children, tone="zinc" }){
const map = {
zinc: "bg-zinc-800 text-zinc-200",
red: "bg-red-500/10 text-red-300 ring-1 ring-red-500/20",
green: "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20",
yellow:"bg-yellow-500/10 text-yellow-300 ring-1 ring-yellow-500/20",
}
return (
<span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs ${map[tone]}`}>{children}</span>
);
}