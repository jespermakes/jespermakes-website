import { Suspense } from "react";
import ConeLampDesigner from "@/components/lamp-designer/cone-lamp-designer";
import ConeLampLoading from "./loading";

export default function ConeLampPage() {
  return (
    <Suspense fallback={<ConeLampLoading />}>
      <ConeLampDesigner />
    </Suspense>
  );
}
