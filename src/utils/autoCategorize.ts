export interface AutoCategorizationResult {
  category: string;
  type: 'income' | 'expense' | 'transfer';
  confidence: number;
}

export function autoCategorizeDescription(description: string): AutoCategorizationResult {
  const desc = description.toLowerCase();

  // Salary / Earnings
  if (
    desc.includes('salary') ||
    desc.includes('payroll') ||
    desc.includes('stipend') ||
    desc.includes('wages') ||
    desc.includes('by pay')
  ) {
    return { category: 'Salary', type: 'income', confidence: 0.95 };
  }

  // Business / Client Payment
  if (
    desc.includes('inv') ||
    desc.includes('invoice') ||
    desc.includes('payment received') ||
    desc.includes('client') ||
    desc.includes('business')
  ) {
    return { category: 'Business', type: 'income', confidence: 0.85 };
  }

  // Interest / Dividend
  if (desc.includes('interest') || desc.includes('int.coll') || desc.includes('dividend')) {
    return { category: 'Interest', type: 'income', confidence: 0.9 };
  }

  // Food & Dining
  if (
    desc.includes('swiggy') ||
    desc.includes('zomato') ||
    desc.includes('restaurant') ||
    desc.includes('cafe') ||
    desc.includes('hotel') ||
    desc.includes('bakery') ||
    desc.includes('dhaba') ||
    desc.includes('food') ||
    desc.includes('dominos') ||
    desc.includes('mcdonalds') ||
    desc.includes('kfc')
  ) {
    return { category: 'Food', type: 'expense', confidence: 0.9 };
  }

  // Shopping & Retail
  if (
    desc.includes('amazon') ||
    desc.includes('flipkart') ||
    desc.includes('myntra') ||
    desc.includes('dmart') ||
    desc.includes('d-mart') ||
    desc.includes('bazaar') ||
    desc.includes('mart') ||
    desc.includes('store') ||
    desc.includes('retail') ||
    desc.includes('supermarket') ||
    desc.includes('meesho')
  ) {
    return { category: 'Shopping', type: 'expense', confidence: 0.85 };
  }

  // Travel & Fuel
  if (
    desc.includes('petrol') ||
    desc.includes('diesel') ||
    desc.includes('hpcl') ||
    desc.includes('bpcl') ||
    desc.includes('iocl') ||
    desc.includes('uber') ||
    desc.includes('ola') ||
    desc.includes('rapido') ||
    desc.includes('irctc') ||
    desc.includes('redbus') ||
    desc.includes('toll') ||
    desc.includes('fastag') ||
    desc.includes('metro')
  ) {
    return { category: 'Travel', type: 'expense', confidence: 0.9 };
  }

  // Mobile Recharge & Internet
  if (
    desc.includes('jio') ||
    desc.includes('airtel') ||
    desc.includes('vi ') ||
    desc.includes('vodafone') ||
    desc.includes('bsnl') ||
    desc.includes('recharge')
  ) {
    return { category: 'Mobile Recharge', type: 'expense', confidence: 0.9 };
  }

  if (
    desc.includes('wifi') ||
    desc.includes('broadband') ||
    desc.includes('fiber') ||
    desc.includes('act net') ||
    desc.includes('hathway')
  ) {
    return { category: 'Internet', type: 'expense', confidence: 0.9 };
  }

  // Electricity / Utilities
  if (
    desc.includes('electricity') ||
    desc.includes('power') ||
    desc.includes('msedcl') ||
    desc.includes('bescom') ||
    desc.includes('uppcl') ||
    desc.includes('tneb') ||
    desc.includes('light bill') ||
    desc.includes('electric')
  ) {
    return { category: 'Electricity', type: 'expense', confidence: 0.95 };
  }

  // Rent
  if (desc.includes('rent') || desc.includes('landlord') || desc.includes('house rent')) {
    return { category: 'Rent', type: 'expense', confidence: 0.9 };
  }

  // Medical / Health
  if (
    desc.includes('pharmacy') ||
    desc.includes('medical') ||
    desc.includes('hospital') ||
    desc.includes('clinic') ||
    desc.includes('doctor') ||
    desc.includes('lab') ||
    desc.includes('apollo') ||
    desc.includes('1mg') ||
    desc.includes('netmeds')
  ) {
    return { category: 'Medical', type: 'expense', confidence: 0.9 };
  }

  // Education / Fees
  if (
    desc.includes('school') ||
    desc.includes('college') ||
    desc.includes('tuition') ||
    desc.includes('coaching') ||
    desc.includes('fees') ||
    desc.includes('udemy') ||
    desc.includes('coursera')
  ) {
    return { category: 'Education', type: 'expense', confidence: 0.9 };
  }

  // ATM / Cash Withdrawal (Internal Transfer)
  if (
    desc.includes('atm wdl') ||
    desc.includes('cash wdl') ||
    desc.includes('atm cash') ||
    desc.includes('withdrawal at atm')
  ) {
    return { category: 'Transfer', type: 'transfer', confidence: 0.95 };
  }

  // Default fallback
  return { category: 'Other', type: 'expense', confidence: 0.5 };
}

export function generateDuplicateHash(date: string, amount: number, description: string): string {
  const cleanStr = `${date}_${amount}_${description.toLowerCase().trim()}`;
  let hash = 0;
  for (let i = 0; i < cleanStr.length; i++) {
    const char = cleanStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}`;
}
