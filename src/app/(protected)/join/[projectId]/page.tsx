import { db } from '@/server/db';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';

type Props = { params: Promise<{ projectId: string }> }

const JoinPage = async ({ params }: Props) => {
    const { projectId } = await params
    const { userId } = await auth();
    const dbUser = await db.user.findUnique({
        where: {
            id: userId ?? "",
        },
    });
    const client = await clerkClient()
    const user = await client.users.getUser(userId ?? "")

    if (!dbUser) {
        await db.user.upsert({
            where: {
                emailAddress: user.emailAddresses[0]?.emailAddress ?? ""
            },
            update: {
                imageUrl: user.imageUrl,
                firstName: user.firstName,
                lastName: user.lastName
            },
            create: {
                id: userId ?? "",
                emailAddress: user.emailAddresses[0]?.emailAddress ?? "",
                imageUrl: user.imageUrl,
                firstName: user.firstName,
                lastName: user.lastName
            }
        })
    }

    const project = await db.project.findUnique({
        where: {
            id: projectId,
        },
    });
    if (!project) {
        return notFound();
    }

    try {
        await db.userToProject.create({
            data: {
                projectId,
                userId: user.id,
            },
        });
    } catch (error) {
        console.log('user already in project')
    }
    return redirect(`/dashboard`);
}

export default JoinPage