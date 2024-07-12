function sanitizeAlgorithm(algorithm) {
    const forbiddenPatterns = [
        /Math\.random\(/g,
        /crypto\.getRandomValues\(/g,
        // Add other randomness-related patterns here
    ];

    for (const pattern of forbiddenPatterns) {
        if (pattern.test(algorithm)) {
            throw new Error("Algorithm contains forbidden randomness logic.");
        }
    }

    return algorithm;
}

module.exports = sanitizeAlgorithm;
