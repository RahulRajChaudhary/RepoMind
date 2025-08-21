"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useProject from "@/hooks/use-project";
import React from "react";
import { toast } from "sonner";


const InviteButton = () => {
    const { projectId } = useProject()
    const [open, setOpen] = React.useState(false);
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogTitle className="text-xl font-semibold text-gray-800">
                        Invite a team member!
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                        Ask them to copy and paste this link into their browser:
                    </p>
                    <Input
                        className="mt-4"
                        readOnly
                        onClick={() => {
                            navigator.clipboard.writeText(
                                `${process.env.NEXT_PUBLIC_URL}/join/${projectId}`,
                            );
                            toast.success("Copied to clipboard!");
                        }}
                        value={`${process.env.NEXT_PUBLIC_URL}/join/${projectId}`}
                    />
                </DialogContent>
            </Dialog>
            <Button onClick={() => setOpen(true)} variant="outline">
                Invite a team member!
            </Button>
        </>
    );
};

export default InviteButton;