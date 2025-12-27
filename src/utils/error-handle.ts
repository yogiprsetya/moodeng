import { toast } from "sonner";

export const handleError = (error: unknown) => {
  if (error instanceof Error) {
    toast.error("Error", {
      description: error.message,
    });
    return;
  }

  if (typeof error === "string") {
    toast.error("Error", {
      description: error,
    });
    return;
  }

  toast.error("Error", {
    description: "An unexpected error occurred",
  });
};
