import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useProductQuestions } from "@/hooks/useProductQuestions";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

const ProductQA = ({ productId }: { productId: string }) => {
  const { user } = useAuth();
  const { questions, answers, loading, askQuestion, answerQuestion, deleteQuestion } =
    useProductQuestions(productId);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const onAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setSubmitting(true);
    const ok = await askQuestion(draft);
    setSubmitting(false);
    if (ok) setDraft("");
  };

  const onAnswer = async (qid: string) => {
    const text = answerDrafts[qid]?.trim();
    if (!text) return;
    const ok = await answerQuestion(qid, text);
    if (ok) setAnswerDrafts((p) => ({ ...p, [qid]: "" }));
  };

  return (
    <div className="border-b border-border">
      <Button
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm uppercase tracking-[0.16em]">Questions &amp; Answers</span>
          {questions.length > 0 && (
            <span className="text-xs text-muted-foreground">({questions.length})</span>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      {open && (
        <div className="pb-8 space-y-6 animate-fade-in">
          <div className="bg-muted/40 dark:bg-muted/20 p-5 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.14em] font-light text-muted-foreground">
              Ask a question
            </h4>
            {!user ? (
              <p className="text-sm font-light text-muted-foreground">
                <Link to="/auth" className="underline">Sign in</Link> to ask a question.
              </p>
            ) : (
              <form onSubmit={onAsk} className="space-y-3">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="What would you like to know about this piece?"
                  rows={3}
                  className="rounded-none bg-background"
                />
                <Button type="submit" size="sm" disabled={submitting || !draft.trim()} className="rounded-none font-light">
                  {submitting ? "Posting..." : "Post question"}
                </Button>
              </form>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : questions.length === 0 ? (
            <p className="text-sm font-light text-muted-foreground">
              No questions yet. Be the first to ask.
            </p>
          ) : (
            <div className="space-y-6">
              {questions.map((q) => (
                <div key={q.id} className="space-y-3 pb-6 border-b border-border last:border-b-0">
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-4 h-4 mt-1 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-light text-foreground">{q.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {q.author_name ?? "Customer"} · {formatDistanceToNow(new Date(q.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {user?.id === q.user_id && (
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <div className="pl-7 space-y-3">
                    {(answers[q.id] ?? []).map((a) => (
                      <div key={a.id} className="bg-muted/20 p-3 text-sm">
                        <p className="font-light text-foreground">{a.answer}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {a.author_name ?? "Customer"} · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                    {user && (
                      <div className="flex gap-2">
                        <Textarea
                          rows={2}
                          placeholder="Add an answer..."
                          value={answerDrafts[q.id] ?? ""}
                          onChange={(e) => setAnswerDrafts((p) => ({ ...p, [q.id]: e.target.value }))}
                          className="rounded-none bg-background flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => onAnswer(q.id)}
                          disabled={!answerDrafts[q.id]?.trim()}
                          className="rounded-none font-light"
                        >
                          Reply
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductQA;