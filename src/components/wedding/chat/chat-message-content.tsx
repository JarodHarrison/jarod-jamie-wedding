import { formatChatMarkdown } from "@/lib/chat-markdown";

type ChatMessageContentProps = {
  content: string;
  className?: string;
};

export function ChatMessageContent({ content, className = "" }: ChatMessageContentProps) {
  return (
    <div
      className={`[&_em]:italic [&_strong]:font-semibold [&_strong]:text-[#2a2723] ${className}`}
      dangerouslySetInnerHTML={{ __html: formatChatMarkdown(content) }}
    />
  );
}
