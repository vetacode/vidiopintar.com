"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeleteVideoDialogStore } from '@/lib/store/dialog-store'
import { handleDeleteVideo } from "@/app/actions"
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useTranslations } from 'next-intl';

function DeleteButton() {
    const { pending } = useFormStatus();
    const t = useTranslations('video');
    
    return (
        <Button type="submit" disabled={pending} className="cursor-pointer">
            {pending ? <Loader className="size-4 animate-spin" /> : t('deleteConfirm')}
        </Button>
    );
}

export function DeleteVideoDialog() {
    const { isOpen, closeDialog, id } = useDeleteVideoDialogStore()
    const [state, formAction] = useActionState(handleDeleteVideo, { success: false, errors: undefined });
    const t = useTranslations('video');
    const tCommon = useTranslations('common');

    useEffect(() => {
        if (state.success) {
            closeDialog();
        }
    }, [state, closeDialog]);
    
    return (
        <AlertDialog open={isOpen} onOpenChange={closeDialog}>
            <AlertDialogContent>
                <form key={id} action={formAction}>
                    <input type="hidden" value={id} name="id" />
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription className="mb-4">
                            {t('deleteDescription')}
                        </AlertDialogDescription>
                        {state.errors && (
                            <div className="mt-4">
                                <ul className="p-2 bg-red-100 rounded list-inside">
                                    {state.errors.map(error => (
                                        <li key={error} className="text-red-500 ">{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel type="button">{tCommon('cancel')}</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <DeleteButton />
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
