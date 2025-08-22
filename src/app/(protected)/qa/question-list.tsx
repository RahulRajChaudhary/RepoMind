'use client'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import MDEditor from "@uiw/react-md-editor"
import React from 'react'
import CodeReferences from "../dashboard/code-references"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Loader2 } from "lucide-react"
import AskQuestionCard from "../dashboard/ask-question-card"

const QuestionList = () => {
  const { projectId } = useProject()
  const { data: questions, isLoading } = api.question.getAllQuestions.useQuery({ projectId })
  const [questionIdx, setQuestionIdx] = React.useState(0)
  const question = questions?.[questionIdx]
  if (isLoading) {
    return <div>
      <Loader2 className="animate-spin" />
    </div>
  }
  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-semibold text-gray-800">Saved Questions</h1>
      <div className="h-2"></div>
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-1">
        {questions?.map((question, idx) => (
          <React.Fragment key={question.id}>
            <SheetTrigger onClick={() => setQuestionIdx(idx)} >
              <div className="flex items-center gap-4 bg-white rounded-lg p-4 shadow border">
                <Image src={question.user.imageUrl ?? '/default-avatar.png'} alt="Avatar" width={30} height={30} className="rounded-full" />

                <div className="text-left flex flex-col">
                  <div className="flex items-center gap-2">
                    <p className="text-gray-700 line-clamp-1 text-lg font-medium">
                      {question.question}
                    </p>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(question.createdAt, {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-1">
                    {question.answer}
                  </p>
                </div>

              </div>
            </SheetTrigger>
          </React.Fragment>
        ))}
      </div>
      {question && (
        <SheetContent className="sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle>{question.question}</SheetTitle>
            <MDEditor.Markdown source={question.answer} className='flex-1 w-full !h-full max-h-[50vh] overflow-scroll custom-ref' />
            <CodeReferences filesReferenced={(question.filesReferenced ?? []) as any} />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>

  )
}

export default QuestionList