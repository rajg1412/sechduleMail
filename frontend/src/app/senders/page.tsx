'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, UserPlus, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Sender } from '@/types/email.types';

function SenderCard({ sender }: { sender: Sender }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{sender.name}</CardTitle>
                <CardDescription>{sender.email}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Rate Limit:</span>
                        <span className="font-medium">{sender.rateLimit} emails/hour</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className={`font-medium ${sender.isActive ? 'text-green-600' : 'text-red-600'}`}>
                            {sender.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function SendersPage() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        smtpUser: '',
        smtpPass: '',
        rateLimit: '100',
    });

    const { data: senders, isLoading } = useQuery({
        queryKey: ['senders'],
        queryFn: () => api.listSenders(),
    });

    const createMutation = useMutation({
        mutationFn: api.createSender,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['senders'] });
            setShowForm(false);
            setFormData({
                name: '',
                email: '',
                smtpUser: '',
                smtpPass: '',
                rateLimit: '100',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            ...formData,
            rateLimit: parseInt(formData.rateLimit),
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Sender Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage email sender accounts and SMTP configurations
                        </p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Sender
                    </Button>
                </div>

                {showForm && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Add New Sender</CardTitle>
                            <CardDescription>
                                Create a new sender account with SMTP credentials
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="smtpUser">SMTP Username *</Label>
                                        <Input
                                            id="smtpUser"
                                            name="smtpUser"
                                            value={formData.smtpUser}
                                            onChange={handleChange}
                                            placeholder="From Ethereal Email"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="smtpPass">SMTP Password *</Label>
                                        <Input
                                            id="smtpPass"
                                            name="smtpPass"
                                            type="password"
                                            value={formData.smtpPass}
                                            onChange={handleChange}
                                            placeholder="From Ethereal Email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="rateLimit">Rate Limit (emails/hour) *</Label>
                                    <Input
                                        id="rateLimit"
                                        name="rateLimit"
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={formData.rateLimit}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {createMutation.error && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                                        {createMutation.error.message}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <Button
                                        type="submit"
                                        disabled={createMutation.isPending}
                                    >
                                        {createMutation.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Create Sender
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Active Senders</h2>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading senders...
                        </div>
                    ) : senders?.length === 0 ? (
                        <Card>
                            <CardContent className="py-8 text-center text-muted-foreground">
                                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No senders configured yet</p>
                                <p className="text-sm mt-2">Add a sender to start scheduling emails</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {senders?.map(sender => (
                                <SenderCard key={sender.id} sender={sender} />
                            ))}
                        </div>
                    )}
                </div>

                <Card className="mt-8 bg-blue-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-lg">💡 Getting Ethereal Email Credentials</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p>
                            <strong>Option 1:</strong> Run the seed script: <code className="bg-white px-2 py-1 rounded">npx tsx prisma/seed.ts</code>
                        </p>
                        <p>
                            <strong>Option 2:</strong> Visit{' '}
                            <a
                                href="https://ethereal.email/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                ethereal.email
                            </a>{' '}
                            and create a test account manually
                        </p>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
