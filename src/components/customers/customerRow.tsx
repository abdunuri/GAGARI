type CustomerRowProps = {
    customerName : string;
    phoneNumber:string;
};

export default function CustomerRow({customerName,phoneNumber}:CustomerRowProps){
    return(
            <div className="grid gap-3 px-4 py-4 text-sm text-zinc-700 md:grid-cols-2 md:gap-4 md:px-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 md:hidden">Customer Name</span>
                        <span className="font-medium text-zinc-900 md:font-normal">{customerName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 md:hidden">Phone Number</span>
                        <span>{phoneNumber}</span>
                    </div>
                </div>
)}