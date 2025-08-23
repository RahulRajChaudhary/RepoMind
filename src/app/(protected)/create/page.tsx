'use client'
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import React, { useReducer, useRef } from 'react'
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { AlertTriangle, ArrowRight, FileText, Github, Info, Key } from 'lucide-react';
import useRefetch from '@/hooks/use-refetch';
import { createCheckoutSession } from '@/lib/stripe';


type FormInput = {
  repoUrl: string
  projectName: string
  githubToken?: string
}

const CreateProjectPage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const linkRepo = api.project.create.useMutation();
  const checkCredits = api.project.checkCredits.useMutation()
  const refetch = useRefetch()

  const router = useRouter()
  const onSubmit = async (data: FormInput) => {
    if (!!!checkCredits.data) {
      checkCredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken,
      }, {
        onError: () => {
          toast.error("GitHub API rate limit exceeded, please try again later.");
        },
      })
    } else {
      linkRepo.mutate({
        githubUrl: data.repoUrl,
        name: data.projectName,
        githubToken: data.githubToken,
      }, {
        onSuccess: () => {
          toast.success("Project created successfully");
          router.push(`/dashboard`)
          refetch()
          reset()
        },
        onError: () => {
          toast.error("Failed to create project");
        },
      });
    }
  };

  const hasEnoughCredits = checkCredits.data?.credits ? checkCredits.data?.credits >= checkCredits.data?.fileCount : true

  return (
    <div className='flex items-center gap-12 h-full justify-center'>
      {/* TODO: add github api search */}
      <img src='/undraw_github.svg' className='h-56 w-auto' />
      <div>
        <div>
          <h1 className='font-semibold text-2xl'>Link your GitHub Repository</h1>
          <p className='text-sm text-muted-foreground'>
            Enter the URL of your GitHub repository to link it to RepoMind.
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
       <Input
            placeholder="Project Name"
            {...register('projectName', { required: true })}
            required
          />
          <div className='h-2'></div>

          <Input
            placeholder="Repository URL"
            {...register('repoUrl', { required: true })}
            required
          />
          <div className='h-2'></div>
          <Input
            placeholder="Github Token(Optional)"
            {...register('githubToken')}
          />

            {!!checkCredits.data &&
              <>
                <div className="mt-4 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 text-orange-700">
                  <div className="flex items-center gap-2">
                    <Info className='size-4' />
                    <p className='text-sm'>You will be charged <strong>{checkCredits.data?.fileCount}</strong> credits for this repository.</p>
                  </div>
                  <p className='text-sm text-blue-600 ml-6'>You have <strong>{checkCredits.data?.credits}</strong> credits remaining.</p>

                </div>
                {!hasEnoughCredits &&
                  <div className="mt-4 bg-red-50 px-4 py-2 rounded-md border border-red-200 text-red-700">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className='size-4' />
                      <p className='text-sm text-red-500'>You do not have enough credits to create this project.</p>
                    </div>
                    <div className="h-2"></div>
                    <Button type='button' variant='outline' onClick={() => createCheckoutSession(checkCredits.data?.fileCount - checkCredits.data?.credits)}>Buy {checkCredits.data?.fileCount - checkCredits.data?.credits} Credits</Button>
                  </div>
                }
              </>
            }

            <div className="h-4"></div>
            <Button type="submit" disabled={!hasEnoughCredits} isLoading={linkRepo.isPending || checkCredits.isPending}>
              {checkCredits.data ? 'Create Project' : 'Check Credits'} <ArrowRight className='size-4' />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateProjectPage
