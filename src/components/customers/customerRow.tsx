type CustomerRowProps = {
    id:number;
    customerName : string;
    phoneNumber:string;
};

export default function CustomerRow({id,customerName,phoneNumber}:CustomerRowProps){
    return(
            <div className="grid grid-cols-4 px-6 py-4 text-sm text-zinc-700">
                    <span>#{id}</span>
                    <span>{customerName}</span>
                    <span>{phoneNumber}</span>
                </div>
)}