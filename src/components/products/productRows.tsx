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
                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => onEdit({ id, name: productName, category, price })}
                            aria-label={`Edit ${productName}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100"
                        >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.115 2.115 0 0 1 2.99 2.99L9.614 16.716 6 17.5l.784-3.614 10.078-10.4Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 5.85 17.5 8.85" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete({ id, name: productName })}
                            aria-label={`Delete ${productName}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 text-rose-600 transition hover:bg-rose-50"
                        >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.2 7l.7 11a2 2 0 0 0 2 1.9h4.2a2 2 0 0 0 2-1.9l.7-11" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v5M14 11v5" />
                            </svg>
                        </button>
                    </div>
                </div>
)}