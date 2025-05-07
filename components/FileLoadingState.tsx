"use client";

import { Spinner } from "@heroui/spinner";

export default function FileLoadingState() {
  return (
    <div className="flex flex-col justify-center items-center py-20">
      <Spinner size="lg" color="primary" />
      <p className="mt-4 text-default-600">Loading your files...</p>
    </div>
  );
}
