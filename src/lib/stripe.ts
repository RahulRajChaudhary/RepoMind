'use server'
import Stripe from 'stripe'
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { creditsToDollars } from '@/constants';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
})

// 50 credits per dollar


export async function createCheckoutSession(credits: number) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('User not found');
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `${credits} RepoMind Credits`,
                    },
                    unit_amount: Math.round((credits / creditsToDollars) * 100),
                },
                quantity: 1,
            },
        ],
        customer_creation: 'always',
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_URL}/create`,
        cancel_url: `${process.env.NEXT_PUBLIC_URL}/billing`,
        client_reference_id: userId.toString(),
        metadata: {
            credits,
        },
    });

    redirect(session.url!);
}