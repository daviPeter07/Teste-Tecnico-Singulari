"use client";

import { Loader2Icon, LogOutIcon } from "lucide-react";
import { useFormStatus } from "react-dom";
import { logoutAction } from "@/modules/auth/services/auth.actions";
import { Button } from "@/shared/components/ui/button";

function LogoutSubmit({
  label,
  variant,
}: {
  label: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant={variant}>
      {pending ? <Loader2Icon className="animate-spin" /> : <LogOutIcon />}
      {pending ? "Saindo..." : label}
    </Button>
  );
}

export function LogoutButton({
  label = "Sair",
  variant = "outline",
}: {
  label?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  return (
    <form action={logoutAction}>
      <LogoutSubmit label={label} variant={variant} />
    </form>
  );
}
