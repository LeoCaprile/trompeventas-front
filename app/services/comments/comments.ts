import { serverApiClient } from "../client";

export interface CommentAuthor {
  name: string;
  image: string;
}

export interface VoteCounts {
  likes: number;
  dislikes: number;
}

export interface CommentFlat {
  id: string;
  productId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: CommentAuthor;
  voteCounts: VoteCounts;
  userVote: string;
}

export interface CommentTree extends CommentFlat {
  children: CommentTree[];
}

export async function getProductComments(
  productId: string,
): Promise<CommentFlat[]> {
  const response = await serverApiClient
    .get(`products/${productId}/comments`)
    .json<{ comments: CommentFlat[] }>();
  return response.comments;
}

export function buildCommentTree(flatComments: CommentFlat[]): CommentTree[] {
  const map = new Map<string, CommentTree>();
  const roots: CommentTree[] = [];

  for (const comment of flatComments) {
    map.set(comment.id, { ...comment, children: [] });
  }

  for (const comment of flatComments) {
    const node = map.get(comment.id)!;
    if (comment.parentId && map.has(comment.parentId)) {
      map.get(comment.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
