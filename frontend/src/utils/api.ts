import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
    throw new Error('VITE_API_URL não definida. Configure a variável de ambiente no .env ou nas configurações do Vercel/Railway.');
}

interface RequestOptions extends RequestInit {
    skipGlobalErrorToast?: boolean;
}

async function fetchWrapper<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { skipGlobalErrorToast, ...customConfig } = options;

    const token = localStorage.getItem('token');
    const isFormData = customConfig.body instanceof FormData;

    const headers: Record<string, string> = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(customConfig.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...customConfig,
        headers,
    };

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        if (response.status === 204) {
            return {} as T;
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            let errorMessage = data?.message || data?.error;
            if (!errorMessage) {
                if (response.status === 403) errorMessage = 'Você não tem permissão para realizar esta ação.';
                else if (response.status === 404) errorMessage = 'Recurso não encontrado.';
                else if (response.status >= 500) errorMessage = 'Erro no servidor. Tente novamente.';
                else errorMessage = `Erro inesperado (${response.status})`;
            }
            if (!skipGlobalErrorToast) {
                toast.error(Array.isArray(errorMessage) ? errorMessage.join(', ') : String(errorMessage));
            }
            throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : String(errorMessage));
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

    post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
        fetchWrapper<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

    patch: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
        fetchWrapper<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        fetchWrapper<T>(endpoint, { method: 'DELETE', ...options }),

    upload: <T>(endpoint: string, formData: FormData, options?: RequestOptions) =>
        fetchWrapper<T>(endpoint, { method: 'POST', body: formData, ...options }),
};
