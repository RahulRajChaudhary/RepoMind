"use client"

import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React from 'react'
import Logo from './logo'

const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Q&A',
    url: '/qa',
    icon: Bot
  },
  {
    title: 'Meetings',
    url: '/meetings',
    icon: Presentation
  },
  {
    title: 'Billing',
    url: '/billing',
    icon: CreditCard
  }
]

const projects = [
  {
    id: '1', // Added ID for key
    name: 'Project 1',
  },
  {
    id: '2',
    name: 'Project 2',
  },
  {
    id: '3',
    name: 'Project 3',
  }
]

export const AppSidebar = () => {

  const pathname = usePathname();
  const {open} = useSidebar()

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className={cn(
                      "flex items-center gap-3 p-2 rounded-md transition-colors",
                      {
                        'bg-primary text-white': pathname === item.url,
                        'hover:bg-accent': pathname !== item.url
                      }
                    )}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild>
                    <div >
                      <div className="">
                        <div className={cn("rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary", {
                          // 'bg-primary text-white': projectId === project.id,
                          'bg-primary text-white': true,
                        })}>
                          {project.name[0]}
                        </div>
                      </div>
                      <span>{project.name}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <div className="h-2"></div>
              {open && (
                <SidebarMenuItem key="create">
                  <Link href="/create">
                    <Button size='sm' variant={'outline'}>
                      <Plus />
                      <span>Create Project</span>
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

