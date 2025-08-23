'use client'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api, type RouterOutputs } from '@/trpc/react'
import React from 'react'
import { toast } from 'sonner'
import { askMeeting } from '../../meetings/actions'
import { readStreamableValue } from '@ai-sdk/rsc'
import MDEditor from '@uiw/react-md-editor'

type Props = {
    issue: NonNullable<RouterOutputs['meeting']['getMeetingDetails']>['issues'][number]
}

const IssueCard = ({ issue }: Props) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [answer, setAnswer] = React.useState("");
    const askIssue = api.meeting.askIssue.useMutation();


    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        setAnswer("")
        const { output } = await askMeeting(query, issue.summary ?? "", issue.meetingId);
        for await (const delta of readStreamableValue(output)) {
            if (delta) {
                setAnswer(prev => prev + delta);
            }
        }
        setIsLoading(false)
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogTitle>{issue.gist}</DialogTitle>
                    <DialogDescription >
                        {issue.createdAt.toDateString()}
                    </DialogDescription>
                    <p className="text-gray-600">{issue.headline}</p>
                    <blockquote className="mt-2 border-l-4 border-gray-300 bg-gray-50 p-4 dark:border-gray-500 dark:bg-gray-800">
                        <span className="text-sm text-gray-600">
                            {issue.start} - {issue.end}
                        </span>
                        <p className="font-medium italic leading-relaxed text-gray-900 dark:text-white">
                            {issue.summary}
                        </p>
                    </blockquote>
                    <form className="mt-4" onSubmit={handleSubmit}>
                        <div>
                            <Label>Ask for further clarification...</Label>
                            <Input
                                className="mt-1"
                                placeholder="What did you mean by..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <span className="text-xs text-gray-500">
                                RepoMind has context about this issue and the meeting
                            </span>
                            {answer && (
                                <>
                                    <p className="mt-2 text-xs font-semibold">Answer</p>
                                    <MDEditor.Markdown source={answer} className='flex-1 w-full !h-full max-h-[40vh] overflow-scroll custom-ref' />
                                </>
                            )}
                        </div>
                        <Button isLoading={isLoading} className="mt-3 w-full">
                            Ask Question
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
            <Card className="relative">
                <CardHeader>
                    <CardTitle className="text-xl">{issue.gist}</CardTitle>
                    <div className="border-b"></div>
                    <CardDescription>{issue.headline}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-4"></div>
                    <Button
                        onClick={() => setOpen(true)}
                        className="absolute bottom-4 left-4"
                    >
                        Details
                    </Button>
                </CardContent>
            </Card>
        </>
    );
}

export default IssueCard