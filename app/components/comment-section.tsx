import { useState, useEffect, useRef } from "react";
import { Link, useFetcher } from "react-router";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Reply,
  MoreHorizontal,
  Trash2,
  Loader2,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { CommentTree } from "~/services/comments/comments";

const MAX_INDENT_DEPTH = 5;

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "hace un momento";
  if (diffMinutes < 60) return `hace ${diffMinutes}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays <= 7) return `hace ${diffDays}d`;
  return date.toLocaleDateString("es-CL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function countComments(comments: CommentTree[]): number {
  let count = 0;
  for (const comment of comments) {
    count += 1 + countComments(comment.children);
  }
  return count;
}

interface CommentSectionProps {
  comments: CommentTree[];
  currentUserId: string | null;
  productId: string;
}

export function CommentSection({
  comments,
  currentUserId,
  productId,
}: CommentSectionProps) {
  const totalCount = countComments(comments);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          Comentarios ({totalCount})
        </h2>
      </div>

      {currentUserId ? (
        <CommentForm productId={productId} />
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link to="/sign-in" className="text-primary hover:underline">
            Inicia sesion
          </Link>{" "}
          para dejar un comentario.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Se el primero en comentar
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              depth={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentForm({
  productId,
  parentId,
  onCancel,
  onSuccess,
}: {
  productId: string;
  parentId?: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== "idle";
  const formRef = useRef<HTMLFormElement>(null);
  const prevState = useRef(fetcher.state);

  useEffect(() => {
    if (prevState.current !== "idle" && fetcher.state === "idle" && fetcher.data && !("error" in fetcher.data)) {
      formRef.current?.reset();
      onSuccess?.();
    }
    prevState.current = fetcher.state;
  }, [fetcher.state, fetcher.data, onSuccess]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <fetcher.Form method="post" ref={formRef}>
      <input type="hidden" name="intent" value="add-comment" />
      <input type="hidden" name="productId" value={productId} />
      {parentId && <input type="hidden" name="parentId" value={parentId} />}
      <div className="space-y-3">
        <Textarea
          name="content"
          placeholder={parentId ? "Escribe tu respuesta..." : "Escribe un comentario..."}
          required
          rows={3}
          className="min-h-20 resize-none"
          onKeyDown={handleKeyDown}
        />
        <div className="flex items-center gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Enviando...
              </>
            ) : parentId ? (
              "Responder"
            ) : (
              "Comentar"
            )}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
}

function CommentThread({
  comment,
  currentUserId,
  depth,
}: {
  comment: CommentTree;
  currentUserId: string | null;
  depth: number;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const childCount = countComments(comment.children);

  return (
    <div>
      <CommentItem
        comment={comment}
        currentUserId={currentUserId}
        onReply={() => setShowReplyForm(!showReplyForm)}
      />

      {showReplyForm && currentUserId && (
        <div className="mt-3 ml-6 sm:ml-8 pl-4 sm:pl-6">
          <CommentForm
            productId={comment.productId}
            parentId={comment.id}
            onCancel={() => setShowReplyForm(false)}
            onSuccess={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {comment.children.length > 0 && (
        <div
          className={
            depth < MAX_INDENT_DEPTH
              ? "mt-3 ml-6 sm:ml-8 border-l-2 border-border pl-4 sm:pl-6"
              : "mt-3"
          }
        >
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="mb-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            {collapsed
              ? `Mostrar ${childCount} ${childCount === 1 ? "respuesta" : "respuestas"}`
              : `Ocultar ${childCount === 1 ? "respuesta" : "respuestas"}`}
          </button>
          {!collapsed && (
            <div className="space-y-4">
              {comment.children.map((child) => (
                <CommentThread
                  key={child.id}
                  comment={child}
                  currentUserId={currentUserId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
}: {
  comment: CommentTree;
  currentUserId: string | null;
  onReply: () => void;
}) {
  const isOwner = currentUserId === comment.userId;
  const deleteFetcher = useFetcher();
  const voteFetcher = useFetcher();

  const isDeleting = deleteFetcher.state !== "idle";

  // Optimistic vote state
  const getOptimisticVote = (): {
    userVote: string;
    likes: number;
    dislikes: number;
  } => {
    if (voteFetcher.formData) {
      const intent = voteFetcher.formData.get("intent") as string;
      const newVoteType = voteFetcher.formData.get("voteType") as string;
      const prevVote = comment.userVote;
      let likes = comment.voteCounts.likes;
      let dislikes = comment.voteCounts.dislikes;

      if (intent === "remove-vote") {
        if (prevVote === "like") likes--;
        if (prevVote === "dislike") dislikes--;
        return { userVote: "", likes, dislikes };
      }

      // intent === "vote-comment"
      if (prevVote === "like") likes--;
      if (prevVote === "dislike") dislikes--;
      if (newVoteType === "like") likes++;
      if (newVoteType === "dislike") dislikes++;
      return { userVote: newVoteType, likes, dislikes };
    }

    return {
      userVote: comment.userVote,
      likes: comment.voteCounts.likes,
      dislikes: comment.voteCounts.dislikes,
    };
  };

  const { userVote, likes, dislikes } = getOptimisticVote();

  const handleVote = (voteType: "like" | "dislike") => {
    if (!currentUserId) return;

    if (userVote === voteType) {
      // Toggle off
      voteFetcher.submit(
        { intent: "remove-vote", commentId: comment.id },
        { method: "post" },
      );
    } else {
      voteFetcher.submit(
        { intent: "vote-comment", commentId: comment.id, voteType },
        { method: "post" },
      );
    }
  };

  const handleDelete = () => {
    deleteFetcher.submit(
      { intent: "delete-comment", commentId: comment.id },
      { method: "post" },
    );
  };

  if (isDeleting) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Eliminando comentario...
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarImage
          src={comment.author.image || undefined}
          alt={comment.author.name}
          referrerPolicy="no-referrer"
        />
        <AvatarFallback>
          <User className="h-3 w-3" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {comment.author.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.createdAt)}
          </span>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="ml-auto text-muted-foreground"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p className="mt-1 text-sm whitespace-pre-line break-words text-foreground">
          {comment.content}
        </p>

        <div className="mt-2 flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleVote("like")}
            disabled={!currentUserId}
            className={userVote === "like" ? "text-primary" : "text-muted-foreground"}
          >
            <ThumbsUp className="h-3 w-3" />
            {likes > 0 && <span>{likes}</span>}
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleVote("dislike")}
            disabled={!currentUserId}
            className={
              userVote === "dislike" ? "text-destructive" : "text-muted-foreground"
            }
          >
            <ThumbsDown className="h-3 w-3" />
            {dislikes > 0 && <span>{dislikes}</span>}
          </Button>
          {currentUserId && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onReply}
              className="text-muted-foreground"
            >
              <Reply className="h-3 w-3" />
              Responder
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
