
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenuItem } from '@/components/ui/sidebar'
import React from 'react'

export const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <h1>Logo</h1>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Group 1</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuItem>Item 1</SidebarMenuItem>
            <SidebarMenuItem>Item 2</SidebarMenuItem>
            <SidebarMenuItem>Item 3</SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
   </Sidebar>
  )
}