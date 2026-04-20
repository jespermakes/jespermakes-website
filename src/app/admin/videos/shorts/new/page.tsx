import { VideoCreateForm } from "@/components/admin/video-create-form";

export default function NewShortsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl font-normal text-wood mb-6">New short</h1>
      <VideoCreateForm kind="shorts" />
    </div>
  );
}
