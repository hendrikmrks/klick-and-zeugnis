import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
};

export default function PageContainer({ children, className, size = "default" }: Props) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 md:px-8",
        size === "narrow" && "max-w-4xl",
        size === "default" && "max-w-[90rem]",
        size === "wide" && "max-w-[100rem]",
        className
      )}
    >
      {children}
    </div>
  );
}
