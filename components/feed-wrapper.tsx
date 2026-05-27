import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const FeedWrapper = ({ children, className }: Props) => {
  return (
    <div className={cn("flex-1 relative top-0 pb-10", className)}>
      {children}
    </div>
  );
};
