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
      className={`[&_a]:font-medium [&_a]:text-pink-600 [&_a]:underline [&_a]:decoration-pink-300 [&_a]:underline-offset-2 [&_em]:italic [&_strong]:font-semibold [&_strong]:text-[#2a2723] ${className}`}
      dangerouslySetInnerHTML={{ __html: formatChatMarkdown(content) }}
    />
  );
}
