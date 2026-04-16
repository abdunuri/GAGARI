type OrderRowProps = {
    customerName : string;
    total : number;
    status : "PENDING" | "PAID" | "CANCELLED";
};

export default function OrderRow({customerName,total,status}:OrderRowProps){
    return(
            <div className="grid gap-3 px-4 py-4 text-sm text-zinc-700 md:grid-cols-3 md:gap-4 md:px-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 md:hidden">Customer</span>
                        <span className="font-medium text-zinc-900 md:font-normal">{customerName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 md:hidden">Total</span>
                        <span className="font-medium text-zinc-900 md:font-normal">${total}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 md:hidden">Status</span>
                        <span className={
                            status==="PAID"? "font-medium text-emerald-600"
                            :status ==="PENDING" ? "font-medium text-amber-600"
                            :"font-medium text-rose-600"
                        }
                    
                    >{status}</span>
                    </div>
                </div>
)}