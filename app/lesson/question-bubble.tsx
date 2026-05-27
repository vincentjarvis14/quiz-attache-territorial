import { cn } from "@/lib/utils";

type Props = {
  question: string;
};

export const QuestionBubble = ({ question }: Props) => {
  return (
    <div className="flex items-center gap-x-4 mb-6">
      <div className="hidden lg:flex items-center justify-center h-12 w-12 rounded-full border-2 border-purple-200 bg-purple-50">
        <span className="text-xl">🤖</span>
      </div>
      <div className="relative max-w-[420px] rounded-2xl border-2 border-purple-200 bg-white px-6 py-4 text-sm text-slate-700 lg:text-base">
        {question}
        <div className="absolute -left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-l-2 border-b-2 border-purple-200 bg-white" />
      </div>
    </div>
  );
};
