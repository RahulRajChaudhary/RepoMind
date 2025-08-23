'use client'
import MDEditor from '@uiw/react-md-editor';
import type { MarkdownPreviewRef } from '@uiw/react-markdown-preview';
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { generate } from './action'
import { readStreamableValue } from '@ai-sdk/rsc'
import CodeReferences from './code-references';
import Image from 'next/image';
import { DownloadIcon } from 'lucide-react';
import { api } from '@/trpc/react';
import useProject from '@/hooks/use-project';
import { toast } from 'sonner';

type Props = {}

const AskQuestionCard = (props: Props) => {
    const [open, setOpen] = React.useState(false)
    const [question, setQuestion] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const [answer, setAnswer] = React.useState('')
    const saveAnswer = api.question.saveAnswer.useMutation()
    const { projectId } = useProject()

    const answerRef = React.useRef<MarkdownPreviewRef>(null)
    const [filesReferenced, setFilesReferenced] = React.useState<Awaited<ReturnType<typeof generate>>['filesReferenced']>([])
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        if (!projectId) return
        setAnswer('')
        e.preventDefault()
        setIsLoading(true)
        const { output, filesReferenced } = await generate(question, projectId)
        setOpen(true)
        setFilesReferenced(filesReferenced)
        for await (const delta of readStreamableValue(output)) {
            if (delta) {
                setAnswer(prev => prev + delta);
                const el = document.querySelector('.custom-ref')
                if (el) {
                    el.scrollTop = el.scrollHeight;
                }
            }
        }
        setIsLoading(false)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={(open) => {
                setOpen(open)
                if (!open) {
                    setQuestion('')
                }
            }}>
                <DialogContent className='sm:max-w-[80vw]'>
                    <div className="flex items-center gap-2">
                        <DialogTitle>
                            <Image src="/repomind-logo.png" alt="Logo" width={40} height={40} />
                        </DialogTitle>
                        <Button isLoading={saveAnswer.isPending || isLoading} variant="outline" onClick={() => {
                            saveAnswer.mutate({
                                projectId,
                                question,
                                answer,
                                filesReferenced
                            }, {
                                onSuccess: () => {
                                    toast.success('Answer saved')
                                },
                                onError: () => {
                                    toast.error('Failed to save answer')
                                }
                            })
                        }}>
                            <DownloadIcon className="w-4 h-4" />
                            Save Answer</Button>
                    </div>
                    <MDEditor.Markdown source={answer} className='max-w-[70vw] !h-full max-h-[40vh] overflow-scroll custom-ref' />
                    <CodeReferences filesReferenced={filesReferenced} />
                    <Button onClick={() => setOpen(false)}>Close</Button>
                </DialogContent>
            </Dialog>
            <Card className="relative col-span-3">
                <CardHeader>
                    <CardTitle>Ask a question</CardTitle>
                    <CardDescription>
                        RepoMind has knowledge of the codebase
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <Textarea
                            placeholder="Which file should I edit to change the home page?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                        <Button isLoading={isLoading} className="mt-4">
                            Ask RepoMind!
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestionCard