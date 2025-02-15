export function isPositiveNumber(str) {
    const num = parseFloat(str);
    return !isNaN(num) && num > 0 && isFinite(num);
}

export function isValidEmail(email) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
}