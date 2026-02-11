import { describe, it, expect } from "vitest";
import { buildCommentTree } from "./comments";
import type { CommentFlat } from "./comments";

function makeComment(overrides: Partial<CommentFlat> = {}): CommentFlat {
  return {
    id: "c1",
    productId: "p1",
    userId: "u1",
    parentId: null,
    content: "Hello",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    author: { name: "User", image: "" },
    voteCounts: { likes: 0, dislikes: 0 },
    userVote: "",
    ...overrides,
  };
}

describe("buildCommentTree", () => {
  it("returns empty array for empty input", () => {
    expect(buildCommentTree([])).toEqual([]);
  });

  it("returns all comments as roots when none have parents", () => {
    const flat: CommentFlat[] = [
      makeComment({ id: "c1" }),
      makeComment({ id: "c2" }),
      makeComment({ id: "c3" }),
    ];
    const tree = buildCommentTree(flat);
    expect(tree).toHaveLength(3);
    expect(tree.every((c) => c.children.length === 0)).toBe(true);
  });

  it("nests a child under its parent", () => {
    const flat: CommentFlat[] = [
      makeComment({ id: "c1" }),
      makeComment({ id: "c2", parentId: "c1" }),
    ];
    const tree = buildCommentTree(flat);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("c1");
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe("c2");
  });

  it("handles multiple levels of nesting", () => {
    const flat: CommentFlat[] = [
      makeComment({ id: "c1" }),
      makeComment({ id: "c2", parentId: "c1" }),
      makeComment({ id: "c3", parentId: "c2" }),
      makeComment({ id: "c4", parentId: "c3" }),
    ];
    const tree = buildCommentTree(flat);
    expect(tree).toHaveLength(1);
    expect(tree[0].children[0].children[0].children[0].id).toBe("c4");
  });

  it("handles multiple children on the same parent", () => {
    const flat: CommentFlat[] = [
      makeComment({ id: "c1" }),
      makeComment({ id: "c2", parentId: "c1" }),
      makeComment({ id: "c3", parentId: "c1" }),
      makeComment({ id: "c4", parentId: "c1" }),
    ];
    const tree = buildCommentTree(flat);
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(3);
  });

  it("treats orphaned comments (parent not in list) as roots", () => {
    const flat: CommentFlat[] = [
      makeComment({ id: "c1", parentId: "nonexistent" }),
      makeComment({ id: "c2" }),
    ];
    const tree = buildCommentTree(flat);
    expect(tree).toHaveLength(2);
  });

  it("builds a complex tree with siblings and nested branches", () => {
    const flat: CommentFlat[] = [
      makeComment({ id: "c1" }),
      makeComment({ id: "c2" }),
      makeComment({ id: "c3", parentId: "c1" }),
      makeComment({ id: "c4", parentId: "c1" }),
      makeComment({ id: "c5", parentId: "c2" }),
      makeComment({ id: "c6", parentId: "c3" }),
    ];
    const tree = buildCommentTree(flat);

    expect(tree).toHaveLength(2);
    // c1 branch
    expect(tree[0].children).toHaveLength(2);
    expect(tree[0].children[0].id).toBe("c3");
    expect(tree[0].children[0].children[0].id).toBe("c6");
    expect(tree[0].children[1].id).toBe("c4");
    // c2 branch
    expect(tree[1].children).toHaveLength(1);
    expect(tree[1].children[0].id).toBe("c5");
  });

  it("preserves comment data in tree nodes", () => {
    const flat: CommentFlat[] = [
      makeComment({
        id: "c1",
        content: "Test content",
        author: { name: "Alice", image: "alice.jpg" },
        voteCounts: { likes: 5, dislikes: 2 },
        userVote: "like",
      }),
    ];
    const tree = buildCommentTree(flat);
    expect(tree[0].content).toBe("Test content");
    expect(tree[0].author.name).toBe("Alice");
    expect(tree[0].voteCounts.likes).toBe(5);
    expect(tree[0].userVote).toBe("like");
  });
});
