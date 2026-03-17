import { redirect } from "next/navigation";

type AtlasPageProps = {
  searchParams: Promise<{
    focus?: string;
  }>;
};

export default async function AtlasPage({ searchParams }: AtlasPageProps) {
  const params = await searchParams;

  if (params.focus) {
    redirect(`/?focus=${encodeURIComponent(params.focus)}#atlas`);
  }

  redirect("/#atlas");
}
