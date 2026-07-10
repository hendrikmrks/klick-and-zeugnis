import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: "primary" | "danger" | "ghost";
};

export default function ActionButton({ label, onClick, variant = "primary" }: Props) {
  return (
    <Button
      type="button"
      size="xs"
      variant={
        variant === "danger" ? "destructive" : variant === "ghost" ? "outline" : "default"
      }
      onClick={onClick}
      className={cn(variant === "ghost" && "bg-white")}
    >
      {label}
    </Button>
  );
}
