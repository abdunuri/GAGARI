import RowActionButtons from "@/components/ui/rowActionButtons";

type CustomerRowProps = {
    id: number;
    customerName : string;
    phoneNumber:string;
    onEdit: (customer: { id: number; name: string; phoneNumber: string }) => void;
    onDelete: (customer: { id: number; name: string }) => void;
};

export default function CustomerRow({id,customerName,phoneNumber,onEdit,onDelete}:CustomerRowProps){
    return(
            <div className="grid grid-cols-3 gap-4 px-6 py-4 text-sm text-zinc-700">
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-zinc-900 md:font-normal">{customerName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span><a href={`tel:${phoneNumber}`}>{phoneNumber}</a></span>
                    </div>
                    <RowActionButtons
                        id={id}
                        name={customerName}
                        onEdit={({ id: customerId, name }) => onEdit({ id: customerId, name, phoneNumber })}
                        onDelete={onDelete}
                    />
                </div>
)}