import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  route("/sign-out", "./routes/sign-out.tsx"),
  route("/auth/google/callback", "./routes/auth.google.callback.tsx"),
  route("/api/presign", "./routes/api.presign.tsx"),
  layout("./routes/main-layout.tsx", [
    index("routes/home.tsx"),
    route("/products/:id", "routes/product-detail.tsx"),
    route("/sign-in", "routes/sign-in.tsx"),
    route("/sign-up", "routes/sign-up.tsx"),
    route("/verify-email", "routes/verify-email.tsx"),
    route("/email-verified", "routes/email-verified.tsx"),
    route("/publish-product", "routes/publish-product.tsx"),
    route("/profile", "routes/profile.tsx"),
    route("/my-products", "routes/my-products.tsx"),
  ]),
] satisfies RouteConfig;
