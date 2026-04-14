export function PostContent({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none text-foreground leading-relaxed">
      <div className="whitespace-pre-wrap">{content}</div>
    </div>
  );
}
