export const getFoodEmojis = (text) => {
    if (!text) return "";
    text = text.toLowerCase();
    let icons = [];

    if (text.includes('chicken') || text.includes('non-veg')) icons.push('🍗');
    if (text.includes('egg') || text.includes('omelette')) icons.push('🥚');
    if (text.includes('rice') || text.includes('biryani') || text.includes('pulao')) icons.push('🍚');
    if (text.includes('idli') || text.includes('dosa') || text.includes('chapati') || text.includes('poori') || text.includes('roti') || text.includes('nan')) icons.push('🥞');
    if (text.includes('coffee') || text.includes('tea') || text.includes('milk')) icons.push('☕');
    if (text.includes('juice') || text.includes('drink')) icons.push('🧃');
    if (text.includes('cake') || text.includes('sweet') || text.includes('payasam')) icons.push('🍰');
    if (text.includes('sambar') || text.includes('dal') || text.includes('curry')) icons.push('🥘');
    if (text.includes('vadai') || text.includes('bajji') || text.includes('samosa') || text.includes('puff')) icons.push('🥟');
    if (text.includes('noodles') || text.includes('fried rice')) icons.push('🍜');
    if (text.includes('veg') && !icons.includes('🥗')) icons.push('🥗');

    return icons.join(' ');
};
