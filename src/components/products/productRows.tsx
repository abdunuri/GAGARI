type ProductRowProps = {
    productName : string;
    price : number | string;
    category : "BREAD" | "FASTF" | "CAKE";
};

export default function ProductRow({productName,price,category}:ProductRowProps){
    const displayPrice = typeof price === "number" ? price.toString() : price;
    return(
            <div className="grid gap-3 px-4 py-4 text-sm text-zinc-700 md:grid-cols-3 md:gap-4 md:px-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 md:hidden">Product Name</span>
                        <span className="font-medium text-zinc-900 md:font-normal">{productName}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 md:hidden">Product Category</span>
                        <span>{category}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 md:hidden">Product Price</span>
                        <span className="font-medium text-zinc-900 md:font-normal">${displayPrice}</span>
                    </div>
                </div>
)}