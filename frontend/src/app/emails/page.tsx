'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { Email, EmailStatus } from '@/types/email.types';

const statusColors: Record<EmailStatus, string> = {
    PENDING: 'bg-gray-100 text-gray-800',
    SCHEDULED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-yellow-100 text-yellow-800',
    SENT: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    RATE_LIMITED: 'bg-orange-100 text-orange-800',
};

function EmailRow({ email, onCancel }: { email: Email; onCancel: (id: string) => void }) {
    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="px-4 py-3 text-sm">
                <div className="font-medium">{email.recipientEmail}</div>
                {email.recipientName && (
                    <div className="text-xs text-muted-foreground">{email.recipientName}</div>
                )}
            </td>
            <td className="px-4 py-3 text-sm">
                <div className="font-medium">{email.subject}</div>
                <div className="text-xs text-muted-foreground">
                    From: {email.sender.email}
                </div>
            </td>
            <td className="px-4 py-3 text-sm">
                <div>{format(new Date(email.scheduledAt), 'MMM d, yyyy')}</div>
                <div className="text-xs text-muted-foreground">
                    {format(new Date(email.scheduledAt), 'h:mm a')}
                </div>
            </td>
            <td className="px-4 py-3 text-sm">
                {email.sentAt ? (
                    <div>
                        <div>{format(new Date(email.sentAt), 'MMM d, yyyy')}</div>
                        <div className="text-xs text-muted-foreground">
                            {format(new Date(email.sentAt), 'h:mm a')}
                        </div>
                    </div>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )}
            </td>
            <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[email.status]}`}>
                    {email.status}
                </span>
            </td>
            <td className="px-4 py-3">
                {(email.status === 'SCHEDULED' || email.status === 'PENDING') && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancel(email.id)}
                    >
                        <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                )}
            </td>
        </tr>
    );
}

export default function EmailsPage() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'sent'>('all');

    const { data: allEmails, isLoading } = useQuery({
        queryKey: ['emails'],
        queryFn: () => api.listEmails({ limit: 100 }),
        refetchInterval: 5000,
    });

    const cancelMutation = useMutation({
        mutationFn: api.cancelEmail,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
        },
    });

    const scheduledEmails = allEmails?.emails.filter(
        e => e.status === 'SCHEDULED' || e.status === 'PENDING'
    ) || [];

    const sentEmails = allEmails?.emails.filter(
        e => e.status === 'SENT'
    ) || [];

    const handleCancel = (id: string) => {
        if (confirm('Are you sure you want to cancel this email?')) {
            cancelMutation.mutate(id);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <header className="border-b bg-white/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-6 w-6 text-primary" />
                            Email Management
                        </CardTitle>
                        <CardDescription>
                            View and manage scheduled and sent emails
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="all">
                                    All Emails ({allEmails?.emails.length || 0})
                                </TabsTrigger>
                                <TabsTrigger value="scheduled">
                                    Scheduled ({scheduledEmails.length})
                                </TabsTrigger>
                                <TabsTrigger value="sent">
                                    Sent ({sentEmails.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="mt-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Recipient
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Subject
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Scheduled
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Sent
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                        Loading...
                                                    </td>
                                                </tr>
                                            ) : allEmails?.emails.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                        No emails found
                                                    </td>
                                                </tr>
                                            ) : (
                                                allEmails?.emails.map(email => (
                                                    <EmailRow key={email.id} email={email} onCancel={handleCancel} />
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            <TabsContent value="scheduled" className="mt-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Recipient
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Subject
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Scheduled
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Sent
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {scheduledEmails.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                        No scheduled emails
                                                    </td>
                                                </tr>
                                            ) : (
                                                scheduledEmails.map(email => (
                                                    <EmailRow key={email.id} email={email} onCancel={handleCancel} />
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>

                            <TabsContent value="sent" className="mt-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Recipient
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Subject
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Scheduled
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Sent
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Status
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sentEmails.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                        No sent emails
                                                    </td>
                                                </tr>
                                            ) : (
                                                sentEmails.map(email => (
                                                    <EmailRow key={email.id} email={email} onCancel={handleCancel} />
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
