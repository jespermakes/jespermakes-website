import { VideoCreateForm } from "@/components/admin/video-create-form";

export default function NewLongformPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl font-normal text-wood mb-6">New long-form video</h1>
      <VideoCreateForm kind="longform" />
    </div>
  );
}
