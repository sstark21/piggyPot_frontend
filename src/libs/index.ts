const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'narrowSymbol',
    })
        .format(amount)
        .replace('$', '$ ');
};

export { formatUSD };
