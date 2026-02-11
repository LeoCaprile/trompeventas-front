import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { formatRelativeTime } from "./comment-section";
import type { CommentTree } from "~/services/comments/comments";
import { FETCHER_STATE } from "~/constants/fetcher-states";

// ─── Mock react-router ──────────────────────────────────────────────────────
const mockSubmit = vi.fn();
let mockFetcherState = FETCHER_STATE.IDLE;
let mockFetcherData: unknown = undefined;
let mockFetcherFormData: FormData | undefined = undefined;

vi.mock("react-router", () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useFetcher: () => ({
    Form: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      method?: string;
    }) => (
      <form
        {...props}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          mockSubmit(Object.fromEntries(formData));
        }}
      >
        {children}
      </form>
    ),
    submit: mockSubmit,
    state: mockFetcherState,
    data: mockFetcherData,
    formData: mockFetcherFormData,
  }),
}));

// Lazy import after mocks are set up
const { CommentSection } = await import("./comment-section");

function makeTree(overrides: Partial<CommentTree> = {}): CommentTree {
  return {
    id: "c1",
    productId: "p1",
    userId: "u1",
    parentId: null,
    content: "Test comment",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: { name: "Alice", image: "" },
    voteCounts: { likes: 0, dislikes: 0 },
    userVote: "",
    children: [],
    ...overrides,
  };
}

// ─── formatRelativeTime ─────────────────────────────────────────────────────

describe("formatRelativeTime", () => {
  it('returns "hace un momento" for times less than a minute ago', () => {
    const now = new Date();
    expect(formatRelativeTime(now.toISOString())).toBe("hace un momento");
  });

  it("returns minutes for times less than an hour ago", () => {
    const date = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(date.toISOString())).toBe("hace 5m");
  });

  it("returns hours for times less than a day ago", () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(formatRelativeTime(date.toISOString())).toBe("hace 3h");
  });

  it("returns days for times less than 7 days ago", () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date.toISOString())).toBe("hace 2d");
  });

  it("returns a formatted date for times more than 7 days ago", () => {
    const date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = formatRelativeTime(date.toISOString());
    expect(result).not.toMatch(/^hace/);
    expect(result).toMatch(/\d{4}/);
  });

  it("handles boundary at exactly 60 seconds", () => {
    const date = new Date(Date.now() - 60 * 1000);
    expect(formatRelativeTime(date.toISOString())).toBe("hace 1m");
  });

  it("handles boundary at exactly 7 days", () => {
    const date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(date.toISOString())).toBe("hace 7d");
  });
});

// ─── CommentSection Component ───────────────────────────────────────────────

describe("CommentSection", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mockSubmit.mockClear();
    mockFetcherState = FETCHER_STATE.IDLE;
    mockFetcherData = undefined;
    mockFetcherFormData = undefined;
  });

  it("shows empty state when there are no comments", () => {
    render(
      <CommentSection comments={[]} currentUserId="u1" productId="p1" />,
    );
    expect(screen.getByText("Se el primero en comentar")).toBeInTheDocument();
  });

  it("shows comment count in header", () => {
    const comments = [
      makeTree({
        id: "c1",
        children: [makeTree({ id: "c2", parentId: "c1" })],
      }),
    ];
    render(
      <CommentSection
        comments={comments}
        currentUserId="u1"
        productId="p1"
      />,
    );
    expect(screen.getByText("Comentarios (2)")).toBeInTheDocument();
  });

  it("shows sign-in prompt when not authenticated", () => {
    render(
      <CommentSection comments={[]} currentUserId={null} productId="p1" />,
    );
    expect(screen.getByText("Inicia sesion")).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("Escribe un comentario..."),
    ).not.toBeInTheDocument();
  });

  it("shows comment form when authenticated", () => {
    render(
      <CommentSection comments={[]} currentUserId="u1" productId="p1" />,
    );
    expect(
      screen.getByPlaceholderText("Escribe un comentario..."),
    ).toBeInTheDocument();
  });

  it("renders comment content and author name", () => {
    const comments = [
      makeTree({
        content: "Great product!",
        author: { name: "Bob", image: "" },
      }),
    ];
    render(
      <CommentSection
        comments={comments}
        currentUserId={null}
        productId="p1"
      />,
    );
    expect(screen.getByText("Great product!")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders nested replies with indentation", () => {
    const comments = [
      makeTree({
        id: "c1",
        content: "Parent comment",
        children: [
          makeTree({
            id: "c2",
            parentId: "c1",
            content: "Child reply",
          }),
        ],
      }),
    ];
    render(
      <CommentSection
        comments={comments}
        currentUserId={null}
        productId="p1"
      />,
    );
    expect(screen.getByText("Parent comment")).toBeInTheDocument();
    expect(screen.getByText("Child reply")).toBeInTheDocument();
  });

  it("does not show reply button when not authenticated", () => {
    const comments = [makeTree()];
    render(
      <CommentSection
        comments={comments}
        currentUserId={null}
        productId="p1"
      />,
    );
    expect(screen.queryByText("Responder")).not.toBeInTheDocument();
  });

  it("shows reply button when authenticated", () => {
    const comments = [makeTree()];
    render(
      <CommentSection
        comments={comments}
        currentUserId="u1"
        productId="p1"
      />,
    );
    expect(screen.getByText("Responder")).toBeInTheDocument();
  });

  it("submits comment form on Enter key press", async () => {
    const user = userEvent.setup();
    render(
      <CommentSection comments={[]} currentUserId="u1" productId="p1" />,
    );

    const textarea = screen.getByPlaceholderText("Escribe un comentario...");
    await user.click(textarea);
    await user.type(textarea, "My comment");
    await user.keyboard("{Enter}");

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        intent: "add-comment",
        content: "My comment",
        productId: "p1",
      }),
    );
  });

  it("allows Shift+Enter for newlines without submitting", async () => {
    const user = userEvent.setup();
    render(
      <CommentSection comments={[]} currentUserId="u1" productId="p1" />,
    );

    const textarea = screen.getByPlaceholderText("Escribe un comentario...");
    await user.click(textarea);
    await user.type(textarea, "Line one");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(textarea, "Line two");

    expect(mockSubmit).not.toHaveBeenCalled();
    expect(textarea).toHaveValue("Line one\nLine two");
  });

  it("opens reply form when reply button is clicked", async () => {
    const user = userEvent.setup();
    const comments = [makeTree()];
    render(
      <CommentSection
        comments={comments}
        currentUserId="u1"
        productId="p1"
      />,
    );

    // Before clicking, only the action "Responder" button exists
    await user.click(screen.getByText("Responder"));
    expect(
      screen.getByPlaceholderText("Escribe tu respuesta..."),
    ).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("closes reply form when cancel is clicked", async () => {
    const user = userEvent.setup();
    const comments = [makeTree()];
    render(
      <CommentSection
        comments={comments}
        currentUserId="u1"
        productId="p1"
      />,
    );

    await user.click(screen.getByText("Responder"));
    expect(
      screen.getByPlaceholderText("Escribe tu respuesta..."),
    ).toBeInTheDocument();

    await user.click(screen.getByText("Cancelar"));
    expect(
      screen.queryByPlaceholderText("Escribe tu respuesta..."),
    ).not.toBeInTheDocument();
  });

  it("submits reply form with parentId via Enter key", async () => {
    const user = userEvent.setup();
    const comments = [makeTree({ id: "parent-123" })];
    render(
      <CommentSection
        comments={comments}
        currentUserId="u1"
        productId="p1"
      />,
    );

    // Click the first "Responder" (the action button on the comment)
    const responderButtons = screen.getAllByText("Responder");
    await user.click(responderButtons[0]);

    const replyTextarea = screen.getByPlaceholderText(
      "Escribe tu respuesta...",
    );
    await user.click(replyTextarea);
    await user.type(replyTextarea, "My reply");
    await user.keyboard("{Enter}");

    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        intent: "add-comment",
        content: "My reply",
        parentId: "parent-123",
        productId: "p1",
      }),
    );
  });

  it("disables vote buttons when not authenticated", () => {
    const comments = [makeTree({ voteCounts: { likes: 3, dislikes: 1 } })];
    render(
      <CommentSection
        comments={comments}
        currentUserId={null}
        productId="p1"
      />,
    );
    // Vote buttons have data-variant="ghost" and data-size="xs"
    const allButtons = screen.getAllByRole("button");
    const voteButtons = allButtons.filter(
      (btn) =>
        btn.getAttribute("data-variant") === "ghost" &&
        btn.getAttribute("data-size") === "xs",
    );
    expect(voteButtons.length).toBe(2);
    for (const btn of voteButtons) {
      expect(btn).toBeDisabled();
    }
  });

  it("shows vote counts when non-zero", () => {
    const comments = [makeTree({ voteCounts: { likes: 5, dislikes: 2 } })];
    render(
      <CommentSection
        comments={comments}
        currentUserId="u1"
        productId="p1"
      />,
    );
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  // ─── Collapse / Expand ──────────────────────────────────────────────────

  it("shows collapse toggle for comments with children", () => {
    const comments = [
      makeTree({
        id: "c1",
        children: [makeTree({ id: "c2", parentId: "c1", content: "Reply" })],
      }),
    ];
    render(
      <CommentSection
        comments={comments}
        currentUserId={null}
        productId="p1"
      />,
    );
    expect(screen.getByText("Ocultar respuesta")).toBeInTheDocument();
  });

  it("does not show collapse toggle for comments without children", () => {
    const comments = [makeTree({ id: "c1", children: [] })];
    render(
      <CommentSection
        comments={comments}
        currentUserId={null}
        productId="p1"
      />,
    );
    expect(screen.queryByText(/Ocultar/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Mostrar/)).not.toBeInTheDocument();
  });

  it("collapses children when toggle is clicked", async () => {
    const user = userEvent.setup();
    const comments = [
      makeTree({
        id: "c1",
        content: "Parent",
        children: [
          makeTree({ id: "c2", parentId: "c1", content: "Child reply" }),
        ],
      }),
    ];
    render(
      <CommentSection
        comments={comments}
        currentUserId={null}
        productId="p1"
      />,
    );

    // Children visible initially
    expect(screen.getByText("Child reply")).toBeInTheDocument();

    // Collapse
    await user.click(screen.getByText("Ocultar respuesta"));
    expect(screen.queryByText("Child reply")).not.toBeInTheDocument();
    expect(screen.getByText("Mostrar 1 respuesta")).toBeInTheDocument();
  });

  it("expands children when toggle is clicked again", async () => {
    const user = userEvent.setup();
    const comments = [
      makeTree({
        id: "c1",
        children: [
          makeTree({ id: "c2", parentId: "c1", content: "Hidden reply" }),
        ],
      }),
    ];
    render(
      <CommentSection
        comments={comments}
        currentUserId={null}
        productId="p1"
      />,
    );

    // Collapse
    await user.click(screen.getByText("Ocultar respuesta"));
    expect(screen.queryByText("Hidden reply")).not.toBeInTheDocument();

    // Expand
    await user.click(screen.getByText("Mostrar 1 respuesta"));
    expect(screen.getByText("Hidden reply")).toBeInTheDocument();
  });

  it("shows correct plural form for multiple replies", () => {
    const comments = [
      makeTree({
        id: "c1",
        children: [
          makeTree({ id: "c2", parentId: "c1" }),
          makeTree({ id: "c3", parentId: "c1" }),
          makeTree({ id: "c4", parentId: "c1" }),
        ],
      }),
    ];
    render(
      <CommentSection
        comments={comments}
        currentUserId={null}
        productId="p1"
      />,
    );
    expect(screen.getByText("Ocultar respuestas")).toBeInTheDocument();
  });

  it("counts nested descendants in collapse label", async () => {
    const user = userEvent.setup();
    const comments = [
      makeTree({
        id: "c1",
        children: [
          makeTree({
            id: "c2",
            parentId: "c1",
            children: [makeTree({ id: "c3", parentId: "c2" })],
          }),
        ],
      }),
    ];
    render(
      <CommentSection
        comments={comments}
        currentUserId={null}
        productId="p1"
      />,
    );

    // c1 has 2 descendants (c2 + c3), so its toggle says "Ocultar respuestas" (plural)
    await user.click(screen.getByText("Ocultar respuestas"));
    expect(screen.getByText("Mostrar 2 respuestas")).toBeInTheDocument();
  });

  it("keeps parent comment visible when children are collapsed", async () => {
    const user = userEvent.setup();
    const comments = [
      makeTree({
        id: "c1",
        content: "I am the parent",
        children: [
          makeTree({
            id: "c2",
            parentId: "c1",
            content: "I am the child",
          }),
        ],
      }),
    ];
    render(
      <CommentSection
        comments={comments}
        currentUserId={null}
        productId="p1"
      />,
    );

    await user.click(screen.getByText("Ocultar respuesta"));
    expect(screen.getByText("I am the parent")).toBeInTheDocument();
    expect(screen.queryByText("I am the child")).not.toBeInTheDocument();
  });
});
