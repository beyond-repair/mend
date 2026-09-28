import { createFileRoute } from "@tanstack/react-router";
import { Game } from "@/components/mend/Game";

export const Route = createFileRoute("/")({
  component: Game,
});
