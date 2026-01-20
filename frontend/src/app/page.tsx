'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Send, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['stats'],
        queryFn: () => api.getStats(),
        refetchInterval: 5000, // Refresh every 5 seconds
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Mail className="h-8 w-8 text-primary" />
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                ReachInbox
                            </h1>
                        </div>
                        <nav className="flex gap-4">
                            <Link
                                href="/schedule"
                                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                            >
                                Schedule Email
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Email Scheduler Dashboard
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Production-grade email scheduling with BullMQ, Redis, and rate limiting.
                        Schedule emails, track delivery, and manage senders all in one place.
                    </p>
                </div>

                {/* Stats Cards */}
                {!isLoading && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Scheduled
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-600">
                                    {stats.emails.scheduled}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Waiting to be sent
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4" />
                                    Sent
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">
                                    {stats.emails.sent}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Successfully delivered
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Failed
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-600">
                                    {stats.emails.failed}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Delivery failed
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4" />
                                    Total
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-purple-600">
                                    {stats.emails.total}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    All emails
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Queue Stats */}
                {!isLoading && stats && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Queue Status</CardTitle>
                            <CardDescription>Real-time BullMQ queue statistics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {stats.queue.waiting}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Waiting</div>
                                </div>
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {stats.queue.active}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Active</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {stats.queue.delayed}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Delayed</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {stats.queue.completed}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Completed</div>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">
                                        {stats.queue.failed}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Failed</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Rate Limit Info */}
                {!isLoading && stats && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Rate Limiting</CardTitle>
                            <CardDescription>Current hour usage</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-sm font-medium">
                                            Emails sent this hour
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {stats.rateLimit.currentHour.count} / {stats.rateLimit.currentHour.limit}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-primary h-2.5 rounded-full transition-all"
                                            style={{
                                                width: `${Math.min(
                                                    (stats.rateLimit.currentHour.count / stats.rateLimit.currentHour.limit) * 100,
                                                    100
                                                )}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Link href="/schedule">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Send className="h-5 w-5 text-primary" />
                                    Schedule Email
                                </CardTitle>
                                <CardDescription>
                                    Create and schedule a new email to be sent
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/emails">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-primary" />
                                    View Emails
                                </CardTitle>
                                <CardDescription>
                                    Browse scheduled and sent emails
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/senders">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-primary">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                    Manage Senders
                                </CardTitle>
                                <CardDescription>
                                    Add and configure email sender accounts
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t mt-16 py-8 bg-white/50">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>
                        Built with Next.js, Express, BullMQ, Redis, and PostgreSQL
                    </p>
                    <p className="mt-2">
                        Production-grade email scheduler for ReachInbox
                    </p>
                </div>
            </footer>
        </div>
    );
}
