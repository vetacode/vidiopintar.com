import { handleVideoSubmit } from "@/app/actions"
import { Textarea } from './ui/textarea'
import { SubmitButton } from "./submit-button";

export default function VideoSubmitForm() {
  return (
    <form action={handleVideoSubmit} className="space-y-4 max-w-md mx-auto mb-8">
      <div className="relative border rounded-3xl p-3 pt-4">
        <Textarea
          name="videoUrl"
          placeholder="Paste YouTube link here..."
          className="min-h-[24px] max-h-[160px] w-full rounded-3xl border-0 bg-transparent text-gray-900 placeholder:text-gray-400 placeholder:text-base focus-visible:ring-0 focus-visible:ring-offset-0 text-sm pl-2 pr-4 pt-0 pb-0 resize-none overflow-y-auto leading-tight"
          required
        />
        <div className="flex justify-end">
          <SubmitButton label="Go" />
        </div>
      </div>
    </form>
  )
}
