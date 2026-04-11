type OrderRowProps = {
    id:number;
    customerName : String;
    total : number;
    status : "Pending" | "Completed" | "Cancelled";
};

export default function OrderRow({id,customerName,total,status}:OrderRowProps){
    return(
            <div className="grid grid-cols-4 px-6 py-4 text-sm text-zinc-700">
                    <span>#{id}</span>
                    <span>{customerName}</span>
                    <span>${total}</span>
                    <span className={
                        status==="Completed"? "font-medium text-green-600"
                        :status ==="Pending" ? "font-medium text-yellow-600"
                        :"font-medium text-red-600"
                    }
                    
                    >{status}</span>
                </div>
)}