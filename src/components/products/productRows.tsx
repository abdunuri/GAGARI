import RowActionButtons from "@/components/ui/rowActionButtons";

type ProductRowProps = {
    id: number;
    productName : string;
    price : number | string;
    category : "BREAD" | "FASTF" | "CAKE";
    onEdit: (product: { id: number; name: string; category: "BREAD" | "FASTF" | "CAKE"; price: number | string }) => void;
    onDelete: (product: { id: number; name: string }) => void;
};

export default function ProductRow({id,productName,price,category,onEdit,onDelete}:ProductRowProps){
    const displayPrice = typeof price === "number" ? price.toString() : price;
    return(
            <div className="grid grid-cols-4 gap-4 px-6 py-4 text-sm text-zinc-700 transition hover:bg-zinc-50/90">
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-zinc-900 md:font-normal">{productName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="inline-flex w-fit rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium tracking-wide text-zinc-700">{category}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-medium text-zinc-900 md:font-normal">${displayPrice}</span>
                    </div>
                    <RowActionButtons
                        id={id}
                        name={productName}
                        onEdit={({ id: productId, name }) => onEdit({ id: productId, name, category, price })}
                        onDelete={onDelete}
                    />
                </div>
)}