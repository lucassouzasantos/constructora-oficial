import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface RequestOptions extends RequestInit {
    skipGlobalErrorToast?: boolean;
}

async function fetchWrapper<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { skipGlobalErrorToast, ...customConfig } = options;

    // Add default headers unless overridden
    const headers = {
        'Content-Type': 'application/json',
        ...customConfig.headers,
    };

    const config: RequestInit = {
        ...customConfig,
        headers,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        // Handle no content
        if (response.status === 204) {
            return {} as T;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            // Se o servidor enviou uma mensagem de erro na resposta
            const errorMessage = data?.message || data?.error || `Erro inesperado (${response.status})`;
            if (!skipGlobalErrorToast) {
                toast.error(errorMessage);
            }
            throw new Error(errorMessage);
        }

        return data as T;
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
            if (!skipGlobalErrorToast) {
                toast.error('Não foi possível conectar ao servidor. Verifique sua rede.');
            }
        }
        throw error;
    }
}

export const api = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        fetchWrapper<T>(endpoint, { method: 'GET', ...options }),

    post: <T>(endpoint: string, body: any, options?: RequestOptions) =>
        fetchWrapper<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

    patch: <T>(endpoint: string, body: any, options?: RequestOptions) =>
        fetchWrapper<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        fetchWrapper<T>(endpoint, { method: 'DELETE', ...options }),
};
