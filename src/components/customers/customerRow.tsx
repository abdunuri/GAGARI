type CustomerRowProps = {
    customerName : string;
    phoneNumber:string;
};

export default function CustomerRow({customerName,phoneNumber}:CustomerRowProps){
    return(
            <div className="grid gap-3 px-4 py-4 text-sm text-zinc-700 grid-cols-2 gap-4 px-6">
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-zinc-900 md:font-normal">{customerName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span><a href={`tel:${phoneNumber}`}>{phoneNumber}</a></span>
                    </div>
                </div>
)}