export const CardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 animate-pulse">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                    <div className="w-32 h-5 bg-slate-200 rounded"></div>
                </div>
                <div className="w-16 h-6 bg-slate-200 rounded"></div>
            </div>
            <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
                    <div className="w-24 h-4 bg-slate-200 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
                    <div className="w-40 h-4 bg-slate-200 rounded"></div>
                </div>
                <div className="w-36 h-8 bg-slate-200 rounded-lg mt-2"></div>
            </div>
        </div>
    );
};

export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => {
    return (
        <tr className="border-b border-slate-50 animate-pulse">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-6 py-4">
                    <div className={`h-4 bg-slate-200 rounded ${i === 0 ? 'w-3/4' : 'w-1/2'} ${i === columns - 1 ? 'ml-auto' : ''}`}></div>
                </td>
            ))}
        </tr>
    );
};
