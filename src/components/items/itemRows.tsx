type ItemRowProps = {
    ItemName : string;
    price : number | string;
    category : "BREAD" | "FASTF" | "CAKE";
};

export default function ItemRow({ItemName,price,category}:ItemRowProps){
    const displayPrice = typeof price === "number" ? price.toString() : price;
    return(
            <div className="grid grid-cols-3 px-6 py-4 text-sm text-zinc-700">
                    <span>{ItemName}</span>
                    <span>{category}</span>
                    <span>${displayPrice}</span>
                </div>
)}