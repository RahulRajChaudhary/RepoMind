"use client"

import { Button } from '@/components/ui/button'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from 'lucide-react' // Changed PlusIcon to Plus
import Link from 'next/link' // Added Link import
import { usePathname } from 'next/navigation'
import React from 'react'

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

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <h1>Logo</h1>
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
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild>
                    <div className={cn(
                      "flex items-center gap-3 p-2 rounded-md transition-colors",
                      {
                        // 'bg-primary text-white': projectId === project.id,
                        'hover:bg-accent': true
                      }
                    )}>
                      <div className={cn(
                        "rounded-sm border w-6 h-6 flex items-center justify-center text-xs font-medium bg-background",
                        {
                          // If active: 'bg-primary text-primary-foreground border-primary'
                        }
                      )}>
                        {project.name[0]}
                      </div>
                      <span className="truncate">{project.name}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem key="create">
                <div className="mt-2">
                  <Link href="/create">
                    <Button size="sm" variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> 
                      Create Project
                    </Button>
                  </Link>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}