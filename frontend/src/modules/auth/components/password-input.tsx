"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

type PasswordInputProps = React.ComponentProps<typeof Input>;

export function PasswordInput({
  className,
  type,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        className={["pr-10", className].filter(Boolean).join(" ")}
        type={visible ? "text" : "password"}
        {...props}
      />

      <Button
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
        onClick={() => setVisible((current) => !current)}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        {visible ? (
          <EyeOffIcon className="size-4" />
        ) : (
          <EyeIcon className="size-4" />
        )}
      </Button>
    </div>
  );
}
