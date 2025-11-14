/**
 * Omega EDI API Client
 * Auto glass shop management system integration
 *
 * API Docs: https://app.omegaedi.com/api/docs/
 * Rate Limit: 200 requests per minute
 */

// ============================================================================
// TYPES
// ============================================================================

export interface OmegaConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface OmegaQuote {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;

  quote_date: string;
  quote_number?: string;

  vehicle_year?: number;
  vehicle_make?: string;
  vehicle_model?: string;
  vin?: string;

  quoted_amount: number;
  tax_amount?: number;
  total_amount: number;

  status?: string;

  raw_data?: any;
}

export interface OmegaInvoice {
  id: string;
  quote_id?: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;

  invoice_date: string;
  invoice_number?: string;
  job_type?: string;

  vehicle_year?: number;
  vehicle_make?: string;
  vehicle_model?: string;
  vin?: string;

  parts_cost?: number;
  labor_cost?: number;
  tax_amount?: number;
  total_amount: number;

  payment_method?: string;
  payment_status?: string;
  status?: string;

  raw_data?: any;
}

export interface OmegaCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface OmegaSyncResult {
  success: boolean;
  recordsFetched: number;
  recordsProcessed: number;
  errors: string[];
}

// ============================================================================
// OMEGA EDI API CLIENT
// ============================================================================

export class OmegaEDIClient {
  private apiKey: string;
  private baseUrl: string;
  private rateLimitRemaining: number = 200;
  private rateLimitResetTime: number = Date.now() + 60000;

  constructor(config: OmegaConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://app.omegaedi.com/api/2.0';
  }

  /**
   * Make authenticated request to Omega EDI API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Check rate limit
    if (Date.now() < this.rateLimitResetTime && this.rateLimitRemaining <= 0) {
      const waitTime = this.rateLimitResetTime - Date.now();
      console.warn(`⏳ Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'api_key': this.apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    console.log(`📡 Omega API Request: ${options.method || 'GET'} ${endpoint}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Update rate limit tracking
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (remaining) this.rateLimitRemaining = parseInt(remaining, 10);
    if (reset) this.rateLimitResetTime = parseInt(reset, 10) * 1000;

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Omega API Error (${response.status}):`, error);
      throw new Error(`Omega API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log(`✅ Omega API Response: ${endpoint}`);
    return data;
  }

  // ==========================================================================
  // QUOTES
  // ==========================================================================

  /**
   * Fetch quotes from Omega EDI
   * @param startDate - Start date for quote range (YYYY-MM-DD)
   * @param endDate - End date for quote range (YYYY-MM-DD)
   */
  async getQuotes(startDate?: string, endDate?: string): Promise<OmegaQuote[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.request<any>(`/quotes${query}`);

    // Transform Omega API response to our format
    return this.transformQuotes(data);
  }

  /**
   * Get single quote by ID
   */
  async getQuote(quoteId: string): Promise<OmegaQuote> {
    const data = await this.request<any>(`/quotes/${quoteId}`);
    const quotes = this.transformQuotes([data]);
    return quotes[0];
  }

  /**
   * Transform Omega quote format to our internal format
   */
  private transformQuotes(rawQuotes: any[]): OmegaQuote[] {
    if (!Array.isArray(rawQuotes)) {
      rawQuotes = [rawQuotes];
    }

    return rawQuotes.map(q => ({
      id: q.id?.toString() || q.quote_id?.toString(),
      customer_id: q.customer_id?.toString(),
      customer_name: q.customer?.name || q.customer_name,
      customer_email: q.customer?.email || q.customer_email,
      customer_phone: q.customer?.phone || q.customer_phone || q.phone,

      quote_date: q.quote_date || q.created_at || new Date().toISOString(),
      quote_number: q.quote_number || q.number,

      vehicle_year: q.vehicle?.year || q.year,
      vehicle_make: q.vehicle?.make || q.make,
      vehicle_model: q.vehicle?.model || q.model,
      vin: q.vehicle?.vin || q.vin,

      quoted_amount: parseFloat(q.subtotal || q.amount || q.total || 0),
      tax_amount: parseFloat(q.tax || q.tax_amount || 0),
      total_amount: parseFloat(q.total || q.grand_total || q.amount || 0),

      status: q.status || 'pending',

      raw_data: q,
    }));
  }

  // ==========================================================================
  // INVOICES / INSTALLS
  // ==========================================================================

  /**
   * Fetch invoices/completed jobs from Omega EDI
   * @param startDate - Start date for invoice range (YYYY-MM-DD)
   * @param endDate - End date for invoice range (YYYY-MM-DD)
   */
  async getInvoices(startDate?: string, endDate?: string): Promise<OmegaInvoice[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const query = params.toString() ? `?${params.toString()}` : '';
    const data = await this.request<any>(`/invoices${query}`);

    return this.transformInvoices(data);
  }

  /**
   * Get single invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<OmegaInvoice> {
    const data = await this.request<any>(`/invoices/${invoiceId}`);
    const invoices = this.transformInvoices([data]);
    return invoices[0];
  }

  /**
   * Transform Omega invoice format to our internal format
   */
  private transformInvoices(rawInvoices: any[]): OmegaInvoice[] {
    if (!Array.isArray(rawInvoices)) {
      rawInvoices = [rawInvoices];
    }

    return rawInvoices.map(inv => ({
      id: inv.id?.toString() || inv.invoice_id?.toString(),
      quote_id: inv.quote_id?.toString(),
      customer_id: inv.customer_id?.toString(),
      customer_name: inv.customer?.name || inv.customer_name,
      customer_email: inv.customer?.email || inv.customer_email,
      customer_phone: inv.customer?.phone || inv.customer_phone || inv.phone,

      invoice_date: inv.invoice_date || inv.completed_at || inv.created_at || new Date().toISOString(),
      invoice_number: inv.invoice_number || inv.number,
      job_type: inv.job_type || inv.type,

      vehicle_year: inv.vehicle?.year || inv.year,
      vehicle_make: inv.vehicle?.make || inv.make,
      vehicle_model: inv.vehicle?.model || inv.model,
      vin: inv.vehicle?.vin || inv.vin,

      parts_cost: parseFloat(inv.parts_cost || inv.parts || 0),
      labor_cost: parseFloat(inv.labor_cost || inv.labor || 0),
      tax_amount: parseFloat(inv.tax || inv.tax_amount || 0),
      total_amount: parseFloat(inv.total || inv.grand_total || inv.amount || 0),

      payment_method: inv.payment_method || inv.payment?.method,
      payment_status: inv.payment_status || inv.payment?.status,
      status: inv.status || 'completed',

      raw_data: inv,
    }));
  }

  // ==========================================================================
  // CUSTOMERS
  // ==========================================================================

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<OmegaCustomer> {
    const data = await this.request<any>(`/customers/${customerId}`);
    return {
      id: data.id?.toString(),
      name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      email: data.email,
      phone: data.phone || data.mobile,
      address: data.address || data.street,
      city: data.city,
      state: data.state,
      zip: data.zip || data.postal_code,
    };
  }

  /**
   * Search customers by phone or email
   */
  async searchCustomers(query: string): Promise<OmegaCustomer[]> {
    const params = new URLSearchParams({ q: query });
    const data = await this.request<any>(`/customers/search?${params.toString()}`);

    if (!Array.isArray(data)) return [];

    return data.map(c => ({
      id: c.id?.toString(),
      name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim(),
      email: c.email,
      phone: c.phone || c.mobile,
      address: c.address || c.street,
      city: c.city,
      state: c.state,
      zip: c.zip || c.postal_code,
    }));
  }

  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================

  /**
   * Test API connection and credentials
   */
  async healthCheck(): Promise<{ success: boolean; message: string }> {
    try {
      // Try to fetch a single quote to verify API access
      await this.request<any>('/quotes?limit=1');
      return {
        success: true,
        message: 'Omega EDI API connection successful',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Omega EDI API connection failed: ${error.message}`,
      };
    }
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create Omega EDI client instance
 * Reads API key from environment variable
 */
export function getOmegaClient(): OmegaEDIClient {
  const apiKey = process.env.OMEGA_EDI_API_KEY;

  if (!apiKey) {
    throw new Error('OMEGA_EDI_API_KEY environment variable is required');
  }

  return new OmegaEDIClient({ apiKey });
}

/**
 * Validate Omega EDI configuration
 */
export function validateOmegaConfig(): {
  isValid: boolean;
  missingVars: string[];
} {
  const requiredVars = ['OMEGA_EDI_API_KEY'];
  const missingVars = requiredVars.filter(v => !process.env[v]);

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}
