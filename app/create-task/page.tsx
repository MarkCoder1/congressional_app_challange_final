"use client";

import { PageTransition } from "@/components/PageTransition";
import { CreateTaskWizard } from "@/components/create-task/CreateTaskWizard";

export default function CreateTaskPage() {
  return (
    <PageTransition>
      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-lg">
          <CreateTaskWizard />
        </div>
      </div>
    </PageTransition>
  );
}
