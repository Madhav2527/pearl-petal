// ==============================================================================
// PETAL & PEARL — PRICING & CONTRIBUTION ENGINE
// Domain: https://thepearlpetals.in
// Rule: Selling Price = Supplier Cost + Markup (Default ₹50)
// ==============================================================================

export interface PricingSettings {
  defaultMarkup: number; // default ₹50
  freeShippingThreshold: number; // default ₹999
  flatShippingFee: number; // default ₹99
  paymentGatewayFeePercent: number; // default 2% for Razorpay
  paymentGatewayGstPercent: number; // default 18% on gateway fee
}

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  defaultMarkup: 50,
  freeShippingThreshold: 999,
  flatShippingFee: 99,
  paymentGatewayFeePercent: 0.02, // 2%
  paymentGatewayGstPercent: 0.18, // 18%
};

/**
 * Calculates the consumer-facing selling price from the supplier cost.
 * Selling price = supplierCost + markup
 *
 * @param supplierCost The verified unit cost charged by the authorized supplier
 * @param customMarkup Optional specific markup; defaults to DEFAULT_PRICING_SETTINGS.defaultMarkup (₹50)
 * @returns sellingPrice (number)
 */
export function calculateSellingPrice(supplierCost: number, customMarkup?: number | null): number {
  const markup = customMarkup !== undefined && customMarkup !== null ? customMarkup : DEFAULT_PRICING_SETTINGS.defaultMarkup;
  const cost = Math.max(0, Number(supplierCost) || 0);
  return Math.round(cost + markup);
}

/**
 * Calculates shipping fee based on subtotal.
 * Orders >= freeShippingThreshold (₹999) receive FREE shipping.
 * Otherwise, flat shipping fee (₹99) applies.
 */
export function calculateShippingFee(subtotal: number, settings: PricingSettings = DEFAULT_PRICING_SETTINGS): number {
  if (subtotal <= 0) return 0;
  return subtotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingFee;
}

/**
 * Strips confidential supplier cost and internal margins before sending product data to client.
 */
export function sanitizePublicProduct<T extends { supplier_cost?: number; custom_markup?: number | null }>(product: T): Omit<T, "supplier_cost" | "custom_markup"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { supplier_cost, custom_markup, ...publicData } = product;
  return publicData;
}

export interface ContributionBreakdown {
  sellingPrice: number;
  supplierCost: number;
  grossMargin: number;
  shippingCustomerPaid: number;
  shippingActualCost: number;
  paymentGatewayFee: number;
  packagingCost: number;
  netContribution: number;
  contributionMarginPercent: number;
}

/**
 * Computes actual contribution after all fulfillment and operational deductions.
 * Formula: Net Contribution = Selling Price + Shipping Paid - Supplier Cost - Actual Shipping - Gateway Fee - Packaging
 */
export function calculateContribution(params: {
  sellingPrice: number;
  supplierCost: number;
  shippingCustomerPaid: number;
  shippingActualCost?: number;
  packagingCost?: number;
  gatewayFeePercent?: number;
}): ContributionBreakdown {
  const {
    sellingPrice,
    supplierCost,
    shippingCustomerPaid,
    shippingActualCost = 65, // Standard Delhivery/BlueDart e-commerce rate ~₹65
    packagingCost = 25, // Luxury branded box + butter paper + ribbon ~₹25
    gatewayFeePercent = 0.0236, // 2% Razorpay + 18% GST = 2.36%
  } = params;

  const totalCollected = sellingPrice + shippingCustomerPaid;
  const paymentGatewayFee = Math.round(totalCollected * gatewayFeePercent * 100) / 100;
  const grossMargin = sellingPrice - supplierCost;
  
  const totalExpenses = supplierCost + shippingActualCost + paymentGatewayFee + packagingCost;
  const netContribution = Math.round((totalCollected - totalExpenses) * 100) / 100;
  const contributionMarginPercent = totalCollected > 0 
    ? Math.round((netContribution / totalCollected) * 10000) / 100 
    : 0;

  return {
    sellingPrice,
    supplierCost,
    grossMargin,
    shippingCustomerPaid,
    shippingActualCost,
    paymentGatewayFee,
    packagingCost,
    netContribution,
    contributionMarginPercent,
  };
}
