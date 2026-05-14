import api from '@/lib/api';

export interface CmsStatus {
    connected: boolean;
    tenantId: string | null;
    connectedAt: string | null;
}

export interface CmsProduct {
    _id: string;
    name: string;
    description: string;
    price: number;
    basePrice?: number;
    additions?: number;
    category: string;
    image?: string;
    images: string[];
    isActive: boolean;
    stock?: number;
    unit?: string;
    slug?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CmsCategory {
    _id: string;
    name: string;
    slug: string;
    categoryType: 'product' | 'service';
    description?: string;
    status: 'Active' | 'Inactive';
    createdAt: string;
}

export interface CmsOrder {
    _id: string;
    id: string; // CMS order number/id
    guestInfo?: {
        name?: string;
        email: string;
        phone?: string;
    };
    status: 'Pending' | 'Paid' | 'Processing' | 'Completed' | 'Cancelled';
    totalAmount: number;
    paymentInfo?: {
        method: string;
        paymentReference: string;
        paidAmount: number;
        paidAt: string;
    };
    shipping: {
        type: 'pickup' | 'shipping';
        price: number;
        town?: string;
    };
    items: Array<{
        productId: string;
        name: string;
        quantity: number;
        basePrice: number;
        totalPrice: number;
    }>;
    createdAt: string;
}

export interface CmsDashboard {
    products: {
        data: CmsProduct[];
        total: number;
    };
    orderStats: {
        totalOrders: number;
        totalRevenue: number;
        escrowBalance: number;
        availableBalance: number;
    };
}

export interface ConnectCmsPayload {
    password: string;
    confirmPassword: string;
}

export interface CreateProductPayload {
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    images?: string[];
    isActive?: boolean;
    stock?: number;
    unit?: string;
}

export interface CreateCategoryPayload {
    name: string;
    categoryType: 'product' | 'service';
    description?: string;
    status?: 'Active' | 'Inactive';
}

function getPrimaryImageUrl(value: unknown): string | undefined {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (Array.isArray(value)) {
        const firstImage = value.find(
            (item): item is string => typeof item === 'string' && item.trim().length > 0,
        );
        return firstImage?.trim();
    }
    return undefined;
}

function normalizeProduct(product: any): CmsProduct {
    const image = getPrimaryImageUrl(product?.image ?? product?.images);
    return {
        ...product,
        image,
        images: image ? [image] : [],
    };
}

function normalizeCollection<T>(payload: any, normalizer: (item: any) => T) {
    if (Array.isArray(payload)) return payload.map(normalizer);
    if (payload && Array.isArray(payload.data)) {
        return {
            ...payload,
            data: payload.data.map(normalizer),
        };
    }
    return payload;
}


export const cmsService = {
    /** Pre-warm CMS session in background after portal login (fire-and-forget) */
    async warmup(password?: string): Promise<{ success: boolean; data: any }> {
        const response = await api.post('/cms/warmup', { password });
        return response.data;
    },

    /** Check if the member's business is connected to the CMS marketplace */
    async getStatus(): Promise<{ success: boolean; data: CmsStatus }> {
        const response = await api.get('/cms/status');
        return response.data;
    },

    /**
     * Activate marketplace seller account.
     * Creates CMS organization + user with the member's chosen password.
     */
    async connect(payload: ConnectCmsPayload): Promise<{ success: boolean; data: { tenantId: string; accessToken: string; message: string } }> {
        const response = await api.post('/cms/connect', payload);
        return response.data;
    },

    /** Login to CMS with marketplace password */
    async login(password: string): Promise<{ success: boolean; data: { accessToken: string } }> {
        const response = await api.post('/cms/login', { password });
        return response.data;
    },

    /** Get marketplace dashboard data (products + orders summary) */
    async getDashboard(): Promise<{ success: boolean; data: CmsDashboard }> {
        const response = await api.get('/cms/dashboard');
        if (response.data?.data?.products) {
            response.data.data = {
                ...response.data.data,
                products: normalizeCollection(response.data.data.products, normalizeProduct),
            };
        }
        return response.data;
    },

    /** List products */
    async getProducts(params?: Record<string, any>): Promise<{ success: boolean; data: any }> {
        const response = await api.get('/cms/products', { params });
        response.data.data = normalizeCollection(response.data.data, normalizeProduct);
        return response.data;
    },

    /** Create a new product */
    async createProduct(payload: CreateProductPayload): Promise<{ success: boolean; data: CmsProduct }> {
        const response = await api.post('/cms/products', payload);
        response.data.data = normalizeProduct(response.data.data);
        return response.data;
    },

    /** Update a product */
    async updateProduct(productId: string, payload: Partial<CreateProductPayload>): Promise<{ success: boolean; data: CmsProduct }> {
        const response = await api.patch(`/cms/products/${productId}`, payload);
        response.data.data = normalizeProduct(response.data.data);
        return response.data;
    },

    /** Delete a product */
    async deleteProduct(productId: string): Promise<{ success: boolean }> {
        const response = await api.delete(`/cms/products/${productId}`);
        return response.data;
    },

    /** Categories */
    async getCategories(params?: Record<string, any>): Promise<{ success: boolean; data: { data: CmsCategory[]; total: number } }> {
        const response = await api.get('/cms/categories', { params });
        return response.data;
    },

    async createCategory(payload: CreateCategoryPayload): Promise<{ success: boolean; data: CmsCategory }> {
        const response = await api.post('/cms/categories', payload);
        return response.data;
    },

    async updateCategory(categoryId: string, payload: Partial<CreateCategoryPayload>): Promise<{ success: boolean; data: CmsCategory }> {
        const response = await api.patch(`/cms/categories/${categoryId}`, payload);
        return response.data;
    },

    async deleteCategory(categoryId: string): Promise<{ success: boolean }> {
        const response = await api.delete(`/cms/categories/${categoryId}`);
        return response.data;
    },

    /** Orders */
    async getOrders(params?: Record<string, any>): Promise<{ success: boolean; data: { data: CmsOrder[]; total: number } }> {
        const response = await api.get('/cms/orders', { params });
        return response.data;
    },

    async updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; data: CmsOrder }> {
        const response = await api.patch(`/cms/orders/${orderId}/status`, { status });
        return response.data;
    },

    async createTestOrder(payload: any): Promise<{ success: boolean; data: CmsOrder }> {
        const response = await api.post('/cms/orders/seed', payload);
        return response.data;
    },

    async uploadImage(file: File): Promise<{ success: boolean; data: { url: string; filename?: string; size?: number; mimeType?: string } }> {
        const formData = new FormData();
        formData.append('files', file);
        const response = await api.post('/cms/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
