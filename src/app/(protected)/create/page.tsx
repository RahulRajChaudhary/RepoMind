'use client'
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import React, { useReducer, useRef } from 'react'
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { AlertTriangle, ArrowRight, FileText, Github, Info, Key } from 'lucide-react';



type FormInput = {
  repoUrl: string
  projectName: string
  githubToken?: string
}

const CreateProjectPage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation({
    
  })


  const router = useRouter()

  function onSubmit(data: FormInput) {
    createProject.mutate({
      githubUrl: data.repoUrl,
      name: data.projectName,
      githubToken: data.githubToken!
    }, {
      onSuccess: () => {
        toast.success('Project created successfully')
        reset()
      },
      onError: () => {
        toast.error('Error creating project')
      }
    })
  }

  return (
    <div className='flex items-center justify-center gap-12 h-full w-full'>
      <img src='/undraw_github.svg' className='h-56 w-auto' />
      <div>
        <div>
          <h1 className='font-semibold text-2xl'>Link your GitHub Repository</h1>
          <p className='text-sm text-muted-foreground'>
            Enter the URL of your GitHub repository to link it to RepoMind.
          </p>
        </div>
        <div className="h-4"></div>

      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            placeholder="Project Name"
            {...register('projectName',{ required: true })}
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
          <div className='h-4'></div>
          <Button type='submit' disabled={createProject.isPending}>Create Project</Button>
        </form>
      </div>

    </div>
  ); 
}

export default CreateProjectPage