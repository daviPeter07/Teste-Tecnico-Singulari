"use client";

import {EyeIcon, EyeOffIcon} from "lucide-react";
import {useState, type ComponentProps} from "react";

import {Input} from "@/shared/components/ui/input";

type PasswordInputProps = ComponentProps<typeof Input>;

export function PasswordInput({
                                  className,
                                  ...props
                              }: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <Input
                {...props}
                className={["pr-10", className].filter(Boolean).join(" ")}
                type={visible ? "text" : "password"}
            />

            <button
                aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={visible}
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                disabled={props.disabled}
                onClick={() => setVisible((current) => !current)}
                type="button"
            >
                {visible ? (
                    <EyeOffIcon className="size-4"/>
                ) : (
                    <EyeIcon className="size-4"/>
                )}
            </button>
        </div>
    );
}