'use client'
import { api } from '@/trpc/react'
import { CreditCard } from 'lucide-react'
import React from 'react'

const TransactionHistory = () => {
    const { data: stripeTransactions } = api.project.getStripeTransactions.useQuery()
    if (!stripeTransactions || stripeTransactions.length === 0) return null
    return (
        <div>
            <h1 className='text-lg font-semibold'>Transaction History</h1>
            {stripeTransactions?.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 my-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-full">
                            <CreditCard className='size-5 text-green-600' />
                        </div>
                        <div>
                            <p className="font-medium">Credits Added</p>
                            <p className="text-sm text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="text-md font-semibold text-green-600">+{transaction.credits} credits</div>
                </div>
            ))}
        </div>
    )
}

export default TransactionHistory