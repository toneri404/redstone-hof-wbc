import { motion } from "framer-motion";


export default function Card({ children, className="" }){
return (
<motion.div
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.25 }}
className={`rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 ${className}`}
>
{children}
</motion.div>
);
}