"use client";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from "axios";
import { PlusIcon, Presentation, Upload } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone"
import { uploadFileToFirebase } from "@/lib/storage";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useProject from "@/hooks/use-project";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import useRefetch from "@/hooks/use-refetch";


const MeetingCard = () => {
    const [progress, setProgress] = React.useState(0);
    const uploadMeeting = api.project.uploadMeeting.useMutation();
    const processMeeting = useMutation({
        mutationFn: async (data: { audio_url: string, projectId: string, meetingId: string }) => {
            const response = await axios.post("/api/process-meeting", data);
            return response.data;
        }
    })
    const refetch = useRefetch()
    const [isUploading, setIsUploading] = React.useState(false);
    const router = useRouter();
    const { getRootProps, getInputProps } = useDropzone({
        // only accept audio files
        accept: {
            "audio/*":
                ".mp3,.m4a,.wav,.flac,.ogg,.aac,.opus,.wma,.webm,.amr,.3gp,.mp2,.m2a,.m4b,.m4p,.mpc,.mpga,.oga,.spx,.wv,.mka,.m3u,.m3u8,.m4u".split(
                    ",",
                ),
        },
        multiple: false,
        onDragEnter: () => {
            console.log("drag enter")
        },
        onDragOver: () => {
            console.log("drag over")
        },
        onDragLeave: () => {
            console.log("drag leave")
        },
        // 50mb
        maxSize: 50000000,
        onDrop: async (acceptedFiles) => {
            if (!project) return;
            setIsUploading(true);
            try {
                const file = acceptedFiles[0];
                if (file instanceof File) {
                    const downloadUrl = await uploadFileToFirebase(file, file.name, setProgress);
                    const meeting = await uploadMeeting.mutateAsync({
                        audio_url: downloadUrl,
                        name: file.name,
                        projectId: project.id,
                    })
                    refetch()
                    router.push("/meetings");
                    processMeeting.mutateAsync({
                        audio_url: downloadUrl,
                        projectId: project.id,
                        meetingId: meeting.id,
                    })
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsUploading(false);
            }
        },
    });
    const { project } = useProject()

    return (
        <>
            <Card
                {...getRootProps()}
                className="col-span-2 flex flex-col items-center justify-center rounded-lg border bg-white p-10"
            >
                {!isUploading && (
                    <>
                        <Presentation className="h-10 w-10 animate-bounce" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">
                            Create a new meeting
                        </h3>
                        <p className="mt-1 text-center text-sm text-gray-500">
                            Analyse your meeting with RepoMind.
                            <br />
                            Powered by AI.
                        </p>
                        <div className="mt-6">
                            <Button isLoading={isUploading}>
                                <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                Upload Meeting
                                <input className="hidden" {...getInputProps()} />
                            </Button>
                        </div>
                    </>
                )}
                {isUploading && (
                    <div>
                        <CircularProgressbar value={progress} text={`${Math.round(progress)}%`} className='size-20'
                            styles={buildStyles({
                                pathColor: '#2563eb',
                                textColor: '#2563eb'
                            })}
                        />
                        <p className="mt-3 text-center text-xs text-gray-500">
                            Uploading and processing meeting... <br />
                            This may take a few minutes...
                        </p>
                    </div>
                )}
            </Card>
        </>
    );
};

export default MeetingCard;