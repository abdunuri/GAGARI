type CustomerRowProps = {
    customerName : string;
    phoneNumber:string;
};

export default function CustomerRow({customerName,phoneNumber}:CustomerRowProps){
    return(
            <div className="grid grid-cols-2 px-6 py-4 text-sm text-zinc-700">
                    
                    <span>{customerName}</span>
                    <span>{phoneNumber}</span>
                </div>
)}