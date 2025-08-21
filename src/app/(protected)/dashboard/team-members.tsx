'use client'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import Image from 'next/image'
import React from 'react'

const TeamMembers = () => {
    const { projectId } = useProject()
    const { data: members } = api.project.getMembers.useQuery({ projectId })
    return (
        <div className='flex items-center gap-2'>
            {members?.map((member) => (
                <Image key={member.id} src={member.user.imageUrl ?? '/default-avatar.png'} alt="Avatar" width={30} height={30} className="rounded-full" />
            ))}
        </div>
    )
}

export default TeamMembers