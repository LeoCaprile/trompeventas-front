import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  route("/sign-out", "./routes/sign-out.tsx"),
  route("/auth/google/callback", "./routes/auth.google.callback.tsx"),
  layout("./routes/main-layout.tsx", [
    index("routes/home.tsx"),
    route("/products/:id", "routes/product-detail.tsx"),
    route("/sign-in", "routes/sign-in.tsx"),
  ]),
] satisfies RouteConfig;
