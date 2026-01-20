import {
    Email,
    Sender,
    Stats,
    ScheduleEmailRequest,
    CreateSenderRequest,
    EmailStatus,
} from '@/types/email.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
    private async request<T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const url = `${API_URL}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Request failed' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        return data.data || data;
    }

    // Email endpoints
    async scheduleEmail(data: ScheduleEmailRequest): Promise<Email> {
        return this.request<Email>('/api/emails/schedule', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async listEmails(filters?: {
        status?: EmailStatus;
        senderId?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ emails: Email[]; total: number; limit: number; offset: number }> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.senderId) params.append('senderId', filters.senderId);
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.offset) params.append('offset', filters.offset.toString());

        const query = params.toString();
        return this.request<{ emails: Email[]; total: number; limit: number; offset: number }>(
            `/api/emails${query ? `?${query}` : ''}`
        );
    }

    async getEmail(id: string): Promise<Email> {
        return this.request<Email>(`/api/emails/${id}`);
    }

    async cancelEmail(id: string): Promise<Email> {
        return this.request<Email>(`/api/emails/${id}`, {
            method: 'DELETE',
        });
    }

    async getStats(senderId?: string): Promise<Stats> {
        const params = senderId ? `?senderId=${senderId}` : '';
        return this.request<Stats>(`/api/emails/stats${params}`);
    }

    // Sender endpoints
    async createSender(data: CreateSenderRequest): Promise<Sender> {
        return this.request<Sender>('/api/senders', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async listSenders(): Promise<Sender[]> {
        return this.request<Sender[]>('/api/senders');
    }

    async getSender(id: string): Promise<Sender> {
        return this.request<Sender>(`/api/senders/${id}`);
    }

    async updateSender(
        id: string,
        data: { name?: string; rateLimit?: number; isActive?: boolean }
    ): Promise<Sender> {
        return this.request<Sender>(`/api/senders/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async deleteSender(id: string): Promise<void> {
        await this.request<void>(`/api/senders/${id}`, {
            method: 'DELETE',
        });
    }
}

export const api = new ApiClient();
