import { FormStartLearning } from "./FormStartLearning";

export function Footer() {
    return (
        <div>
            <div></div>
            <div></div>
            <div className=" flex bg-card gap-6 mt-2.5 items-center justify-center w-full min-h-[378px] px-12 rounded-xs lg:bg-[url(/footer-asset.svg)] sm:bg-none bg-no-repeat bg-right bg-contain">
                <div className="flex flex-col justify-center gap-6 w-full h-full">
                    <div className="text-3xl font-semibold text-left tracking-tight">
                        Start your learning today, Free.
                        <div className="text-base font-normal mt-2 text-secondary-foreground tracking-normal">
                            Learn Any Topic, One Video at a Time.
                        </div>
                    </div>
                    <div className="relative">
                        <FormStartLearning isFooter={true} />
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center w-full py-8 px-2 flex-col sm:flex-row gap-8">
                <div className="flex gap-6 text-sm text-secondary-foreground">
                    <a
                        href="/changelogs"
                        className="hover:text-white transition-colors cursor-pointer"
                    >
                        Changelogs
                    </a>
                    <a
                        href="/privacy"
                        className="hover:text-white transition-colors cursor-pointer"
                    >
                        Privacy
                    </a>
                    <a
                        href="/terms"
                        className="hover:text-white transition-colors cursor-pointer"
                    >
                        Terms
                    </a>
                    <a
                        href="https://github.com/ahmadrosid/vidiopintar.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors cursor-pointer"
                    >
                        Github
                    </a>
                    <a
                        href="https://github.com/ahmadrosid/vidiopintar.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors cursor-pointer"
                    >
                        Credits
                    </a>
                </div>
                <div className="text-sm text-secondary-foreground">
                    © {new Date().getFullYear()} Vidiopintar, All rights reserved
                </div>
            </div>
        </div>
    )
}