'use client'
import useProject from '@/hooks/use-project'
import { ExternalLink, Github } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import CommitLog from './commit-log'
import AskQuestionCard from './ask-question-card'
import MeetingCard from './meeting-card'


const DashboardPage = () => {
    const { project } = useProject()

    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-y-4">
                <div className="w-fit rounded-md bg-primary px-4 py-3">
                    <div className="flex items-center">
                        <Github className="h-5 w-5 text-white" />
                        <div className="ml-2">
                            <p className="text-sm font-medium text-white">
                                This project is linked to{" "}
                                <Link
                                    className="inline-flex items-center text-white/80 hover:underline"
                                    href={project?.githubUrl ?? ''}
                                >
                                    {project?.githubUrl}
                                    <ExternalLink className="ml-1 h-4 w-4" />
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="h-4"></div>
                <div className="flex items-center gap-4">
                    {/* <TeamMembers />
                    <InviteButton />
                    <ArchiveButton /> */}
                </div>
            </div>
            <div className="mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                    <AskQuestionCard />
                    <MeetingCard />
                </div>
            </div>
            <div className="mt-8">
                <CommitLog />
            </div>
        </div>
    )
}

export default DashboardPage