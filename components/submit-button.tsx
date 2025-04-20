"use client"
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function SubmitButton({ label } : { label: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit"
            className='rounded-xl cursor-pointer' disabled={pending} aria-disabled={pending}>
            {pending ? <LoadingSpinner text="Loading..." /> : label}
        </Button>
    );
}
