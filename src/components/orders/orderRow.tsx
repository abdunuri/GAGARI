type OrderRowProps = {
    customerName : string;
    total : number;
    status : "PENDING" | "PAID" | "CANCELLED";
};

export default function OrderRow({customerName,total,status}:OrderRowProps){
    return(
            <div className="grid grid-cols-3 px-6 py-4 text-sm text-zinc-700">
                    <span>{customerName}</span>
                    <span>${total}</span>
                    <span className={
                        status==="PAID"? "font-medium text-green-600"
                        :status ==="PENDING" ? "font-medium text-yellow-600"
                        :"font-medium text-red-600"
                    }
                    
                    >{status}</span>
                </div>
)}