export const formatCurrency = (val: number, currency: string) => {
    const rates: Record<string, { rate: number, symbol: string }> = {
        'INR': { rate: 1, symbol: '₹' },
        'USD': { rate: 0.012, symbol: '$' },
        'SAR': { rate: 0.045, symbol: '﷼' },
        'AUD': { rate: 0.018, symbol: 'A$' },
        'CAD': { rate: 0.016, symbol: 'C$' },
        'SGD': { rate: 0.016, symbol: 'S$' },
    };

    const cur = rates[currency] || rates['INR'];
    let converted = val * cur.rate;
    const absVal = Math.abs(converted);
    const sign = converted < 0 ? '-' : '';

    if (currency === 'INR') {
        if (absVal >= 10000000) {
            return `${sign}${cur.symbol}${(absVal / 10000000).toFixed(2)} Cr`;
        } else if (absVal >= 100000) {
            return `${sign}${cur.symbol}${(absVal / 100000).toFixed(2)} L`;
        } else if (absVal >= 1000) {
            return `${sign}${cur.symbol}${(absVal / 1000).toFixed(2)} K`;
        }
        return `${sign}${cur.symbol}${absVal.toFixed(2)}`;
    } else {
        if (absVal >= 1000000) {
            return `${sign}${cur.symbol}${(absVal / 1000000).toFixed(2)} M`;
        } else if (absVal >= 1000) {
            return `${sign}${cur.symbol}${(absVal / 1000).toFixed(2)} K`;
        }
        return `${sign}${cur.symbol}${absVal.toFixed(2)}`;
    }
};
