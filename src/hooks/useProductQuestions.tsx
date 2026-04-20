import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export interface Question {
  id: string;
  product_id: string;
  user_id: string;
  author_name: string | null;
  question: string;
  created_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  user_id: string;
  author_name: string | null;
  answer: string;
  helpful_count: number;
  created_at: string;
}

export const useProductQuestions = (productId: string | undefined) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({});
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    const { data: qs, error } = await supabase
      .from("product_questions")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Could not load questions", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    setQuestions((qs ?? []) as Question[]);
    if (qs && qs.length) {
      const { data: ans } = await supabase
        .from("product_answers")
        .select("*")
        .in(
          "question_id",
          qs.map((q: any) => q.id),
        )
        .order("created_at", { ascending: true });
      const grouped: Record<string, Answer[]> = {};
      ((ans ?? []) as Answer[]).forEach((a) => {
        grouped[a.question_id] = grouped[a.question_id] || [];
        grouped[a.question_id].push(a);
      });
      setAnswers(grouped);
    } else {
      setAnswers({});
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const askQuestion = async (text: string, authorName?: string) => {
    if (!productId || !user) return;
    const { error } = await supabase.from("product_questions").insert({
      product_id: productId,
      user_id: user.id,
      author_name: authorName ?? user.email?.split("@")[0] ?? "Customer",
      question: text.trim(),
    });
    if (error) {
      toast({ title: "Could not post question", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Question posted" });
    await refresh();
    return true;
  };

  const answerQuestion = async (questionId: string, text: string, authorName?: string) => {
    if (!user) return;
    const { error } = await supabase.from("product_answers").insert({
      question_id: questionId,
      user_id: user.id,
      author_name: authorName ?? user.email?.split("@")[0] ?? "Customer",
      answer: text.trim(),
    });
    if (error) {
      toast({ title: "Could not post answer", description: error.message, variant: "destructive" });
      return false;
    }
    await refresh();
    return true;
  };

  const deleteQuestion = async (id: string) => {
    await supabase.from("product_questions").delete().eq("id", id);
    await refresh();
  };

  return { questions, answers, loading, askQuestion, answerQuestion, deleteQuestion, refresh };
};