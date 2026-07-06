import UsageItem from "./UsageItem";

type Item = {
    label: string;
    value: string;
    progress?: number; // optional
};

type Props = {
    title: string;
    items: Item[];
};

export default function UsageSection({ title, items }: Props) {
    return (
        <div className="space-y-2">
            <h3 className="text-lg font-medium">{title}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item) => (
                    <UsageItem
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        progress={item.progress}
                    />
                ))}
            </div>
        </div>
    );
}
