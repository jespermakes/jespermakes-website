import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ImageLibraryClient } from "./ImageLibraryClient";
import { IMAGE_TAG_VOCABULARY } from "@/data/image-tag-vocabulary";

export const metadata = {
  title: "Image Library · Admin",
};

export default async function AdminImagesPage() {
  const session = await auth();
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/login?callbackUrl=/admin/images");
  }
  return <ImageLibraryClient vocabulary={IMAGE_TAG_VOCABULARY} />;
}
