'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ScheduleEmailRequest } from '@/types/email.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SchedulePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        senderId: '',
        recipientEmail: '',
        recipientName: '',
        subject: '',
        body: '',
        scheduledAt: '',
    });

    const { data: senders } = useQuery({
        queryKey: ['senders'],
        queryFn: () => api.listSenders(),
    });

    const scheduleMutation = useMutation({
        mutationFn: (data: ScheduleEmailRequest) => api.scheduleEmail(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emails'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            router.push('/emails');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert to ISO string for backend validation
        const scheduledDate = new Date(formData.scheduledAt);

        scheduleMutation.mutate({
            ...formData,
            scheduledAt: scheduledDate.toISOString(),
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
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

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Send className="h-6 w-6 text-primary" />
                            Schedule New Email
                        </CardTitle>
                        <CardDescription>
                            Schedule an email to be sent at a specific time
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="senderId">Sender *</Label>
                                <select
                                    id="senderId"
                                    name="senderId"
                                    value={formData.senderId}
                                    onChange={handleChange as any}
                                    required
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="">Select a sender...</option>
                                    {senders?.map(sender => (
                                        <option key={sender.id} value={sender.id}>
                                            {sender.name} ({sender.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="recipientEmail">Recipient Email *</Label>
                                    <Input
                                        id="recipientEmail"
                                        name="recipientEmail"
                                        type="email"
                                        value={formData.recipientEmail}
                                        onChange={handleChange}
                                        placeholder="user@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="recipientName">Recipient Name</Label>
                                    <Input
                                        id="recipientName"
                                        name="recipientName"
                                        value={formData.recipientName}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject *</Label>
                                <Input
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Email subject"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="body">Email Body</Label>
                                <Textarea
                                    id="body"
                                    name="body"
                                    value={formData.body}
                                    onChange={handleChange}
                                    placeholder="Write your email content here..."
                                    rows={8}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="scheduledAt">Scheduled Time *</Label>
                                <Input
                                    id="scheduledAt"
                                    name="scheduledAt"
                                    type="datetime-local"
                                    value={formData.scheduledAt}
                                    onChange={handleChange}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Select when this email should be sent
                                </p>
                            </div>

                            {scheduleMutation.error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                                    {scheduleMutation.error.message}
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={scheduleMutation.isPending}
                                    className="flex-1"
                                >
                                    {scheduleMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Scheduling...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Schedule Email
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
