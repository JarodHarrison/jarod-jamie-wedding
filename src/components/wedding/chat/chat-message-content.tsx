import { formatChatMarkdown } from "@/lib/chat-markdown";

type ChatMessageContentProps = {
  content: string;
  className?: string;
  isStreaming?: boolean;
};

export function ChatMessageContent({
  content,
  className = "",
  isStreaming = false,
}: ChatMessageContentProps) {
  if (isStreaming) {
    return <div className={`whitespace-pre-wrap ${className}`}>{content}</div>;
  }

  return (
    <div
      className={`[&_em]:italic [&_strong]:font-semibold [&_strong]:text-[#2a2723] ${className}`}
      dangerouslySetInnerHTML={{ __html: formatChatMarkdown(content) }}
    />
  );
}
