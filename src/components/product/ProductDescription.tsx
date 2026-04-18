import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import { useReviews } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import { Product } from "@/data/products";
import { formatDistanceToNow } from "date-fns";

interface ProductDescriptionProps {
  product: Product;
}

const ProductDescription = ({ product }: ProductDescriptionProps) => {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCareOpen, setIsCareOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(true);

  const { user } = useAuth();
  const { reviews, myReview, average, submit, remove, loading } = useReviews(String(product.id));

  const [draftRating, setDraftRating] = useState(myReview?.rating ?? 0);
  const [draftTitle, setDraftTitle] = useState(myReview?.title ?? "");
  const [draftComment, setDraftComment] = useState(myReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);

  const apiRating = product.rating?.rate ?? 0;
  const apiCount = product.rating?.count ?? 0;
  const combinedAverage =
    reviews.length > 0 && apiCount > 0
      ? (apiRating * apiCount + reviews.reduce((s, r) => s + r.rating, 0)) / (apiCount + reviews.length)
      : average ?? apiRating;
  const combinedCount = apiCount + reviews.length;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (draftRating < 1) return;
    setSubmitting(true);
    const ok = await submit({ rating: draftRating, title: draftTitle, comment: draftComment });
    setSubmitting(false);
    if (ok && !myReview) {
      // keep values, but hook will reload
    }
  };

  return (
    <div className="space-y-0 mt-8 border-t border-border">
      {/* Description */}
      <div className="border-b border-border">
        <Button
          variant="ghost"
          onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none text-left"
        >
          <span className="text-sm uppercase tracking-[0.16em]">Description</span>
          {isDescriptionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isDescriptionOpen && (
          <div className="pb-6 space-y-4">
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              {product.description ?? "A considered piece designed to be worn every day, forever."}
            </p>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="border-b border-border">
        <Button
          variant="ghost"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
        >
          <span className="text-sm uppercase tracking-[0.16em]">Product Details</span>
          {isDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isDetailsOpen && (
          <div className="pb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-light text-muted-foreground">SKU</span>
              <span className="text-sm font-light text-foreground">LE-{String(product.id).padStart(4, "0")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-light text-muted-foreground">Category</span>
              <span className="text-sm font-light text-foreground">{product.category}</span>
            </div>
          </div>
        )}
      </div>

      {/* Care */}
      <div className="border-b border-border">
        <Button
          variant="ghost"
          onClick={() => setIsCareOpen(!isCareOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
        >
          <span className="text-sm uppercase tracking-[0.16em]">Care &amp; Cleaning</span>
          {isCareOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isCareOpen && (
          <div className="pb-6 space-y-2">
            <ul className="space-y-2">
              <li className="text-sm font-light text-muted-foreground">• Clean with a soft, dry cloth after each wear</li>
              <li className="text-sm font-light text-muted-foreground">• Avoid contact with perfumes, lotions, and cleaning products</li>
              <li className="text-sm font-light text-muted-foreground">• Store in the provided pouch when not wearing</li>
            </ul>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="border-b border-border lg:mb-16">
        <Button
          variant="ghost"
          onClick={() => setIsReviewsOpen(!isReviewsOpen)}
          className="w-full h-14 px-0 justify-between hover:bg-transparent font-light rounded-none"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm uppercase tracking-[0.16em]">Customer Reviews</span>
            {combinedCount > 0 && (
              <StarRating rating={combinedAverage} count={combinedCount} showValue />
            )}
          </div>
          {isReviewsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        {isReviewsOpen && (
          <div className="pb-8 space-y-8">
            {/* Write a review */}
            <div className="bg-muted/40 dark:bg-muted/20 p-5 space-y-3">
              <h4 className="text-xs uppercase tracking-[0.14em] font-light text-muted-foreground">
                {myReview ? "Update your review" : "Write a review"}
              </h4>
              {!user ? (
                <p className="text-sm font-light text-muted-foreground">
                  <Link to="/auth" className="underline">Sign in</Link> to leave a review.
                </p>
              ) : (
                <form onSubmit={onSubmit} className="space-y-3">
                  <StarRating
                    rating={draftRating}
                    interactive
                    size="lg"
                    onChange={setDraftRating}
                  />
                  <Input
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="Review title (optional)"
                    className="rounded-none bg-background"
                  />
                  <Textarea
                    value={draftComment}
                    onChange={(e) => setDraftComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="rounded-none bg-background"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submitting || draftRating < 1}
                      className="rounded-none font-light"
                    >
                      {submitting ? "Saving..." : myReview ? "Update review" : "Post review"}
                    </Button>
                    {myReview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={remove}
                        className="rounded-none font-light"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Reviews list */}
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm font-light text-muted-foreground">
                No customer reviews yet. Be the first to share your thoughts.
              </p>
            ) : (
              <div className="space-y-6">
                {reviews.map((r) => (
                  <div key={r.id} className="space-y-2 pb-6 border-b border-border last:border-b-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <StarRating rating={r.rating} />
                        <span className="text-sm font-light text-foreground">
                          {r.author_name ?? "Customer"}
                        </span>
                      </div>
                      <span className="text-xs font-light text-muted-foreground">
                        {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {r.title && <p className="text-sm font-medium text-foreground">{r.title}</p>}
                    {r.comment && (
                      <p className="text-sm font-light text-muted-foreground leading-relaxed">
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDescription;
