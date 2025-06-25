"use client"

import { useFormStatus } from "react-dom";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

export const SubmitButton = forwardRef<HTMLButtonElement, { label: string, className?: string }>(( { label, className }, ref ) => {
    const { pending } = useFormStatus();
    return (
        <Button ref={ref} type="submit" className={cn('rounded-xl cursor-pointer', className)} disabled={pending} aria-disabled={pending}>
            {pending ? <LoadingSpinner text="Loading..." /> : label}
        </Button>
    );
});

SubmitButton.displayName = "SubmitButton";
