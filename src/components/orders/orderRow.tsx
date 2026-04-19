type OrderRowProps = {
    customerName : string;
    total : number;
    status : "PENDING" | "PAID" | "CANCELLED";
};

export default function OrderRow({customerName,total,status}:OrderRowProps){
    return(
            <div className="grid gap-3 px-4 py-4 text-sm text-zinc-700 grid-cols-3 gap-4 px-6">
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-zinc-900 md:font-normal">{customerName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-zinc-900 md:font-normal">${total.toFixed(2)}</span>                    </div>
                    <div className="flex flex-col gap-1">
                        <span className={
                            status==="PAID"? "font-medium text-emerald-600"
                            :status ==="PENDING" ? "font-medium text-amber-600"
                            :"font-medium text-rose-600"
                        }
                    
                    >{status}</span>
                    </div>
                </div>
)}