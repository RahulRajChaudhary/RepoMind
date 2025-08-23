import React from 'react'
import MeetingDetails from './meeting-details'

type Props = {
    params: Promise<{ meetingId: string }>
}

const MeetingPage = async (props: Props) => {
    const { meetingId } = await props.params
    return (
        <MeetingDetails meetingId={meetingId} />
    )
}

export default MeetingPage