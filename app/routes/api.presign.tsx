import { getAuthSession } from "~/services/auth/session.server";
import type { Route } from "./+types/api.presign";

export async function action({ request }: Route.ActionArgs) {
  const { signInData, authenticatedFetch, getHeaders } =
    await getAuthSession(request);

  if (!signInData?.accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, contentType, folder } = await request.json();

  const result = await authenticatedFetch<{
    presignedUrl: string;
    publicUrl: string;
  }>("post", "upload/presign", {
    json: { filename, contentType, folder },
  });

  return Response.json(result, { headers: await getHeaders() });
}
