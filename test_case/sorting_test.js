const sortProductsByMetal = (products) => {
    const extractNumber = (str) => {
        const match = String(str || "").match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
    };

    const getMetalPriority = (metalType, metalQuality) => {
        const type = String(metalType || "").toUpperCase();
        const qualityStr = String(metalQuality || "").trim();
        const numericValue = extractNumber(qualityStr);

        if (type.includes("GOLD")) {
            return { category: 1, qualityIndex: numericValue !== null ? numericValue : 999 };
        }
        if (type.includes("SILVER") || qualityStr.toLowerCase().startsWith("s")) {
            return { category: 2, qualityIndex: numericValue !== null ? -numericValue : 0 };
        }
        if (type.includes("PLATINUM") || qualityStr.includes("95") || qualityStr.includes("85")) {
            return { category: 3, qualityIndex: numericValue !== null ? -numericValue : 0 };
        }
        return { category: 4, qualityIndex: 0 };
    };

    return [...products].sort((a, b) => {
        const prioA = getMetalPriority(a?.["Metal Type"], a?.Metalquality);
        const prioB = getMetalPriority(b?.["Metal Type"], b?.Metalquality);
        if (prioA.category !== prioB.category) return prioA.category - prioB.category;
        if (prioA.qualityIndex !== prioB.qualityIndex) return prioA.qualityIndex - prioB.qualityIndex;
        return String(a?.["Article No"] ?? "").localeCompare(String(b?.["Article No"] ?? ""));
    });
};

const testData = [
    { "Article No": "A", "Metal Type": "GOLD", "Metalquality": "22K" },
    { "Article No": "B", "Metal Type": "GOLD", "Metalquality": "18kt" },
    { "Article No": "C", "Metal Type": "GOLD", "Metalquality": "9K" },
    { "Article No": "D", "Metal Type": "SILVER", "Metalquality": "S 925" },
    { "Article No": "E", "Metal Type": "SILVER", "Metalquality": "999 Silver" },
    { "Article No": "F", "Metal Type": "PLATINUM", "Metalquality": "95" },
    { "Article No": "G", "Metal Type": "PLATINUM", "Metalquality": "85 PT" },
    { "Article No": "H", "Metal Type": "GOLD", "Metalquality": "6K" },
    { "Article No": "I", "Metal Type": "GOLD", "Metalquality": "14 K" },
    { "Article No": "J", "Metal Type": "SILVER", "Metalquality": "S800" },
];

console.log("Original Order:");
testData.forEach(p => console.log(`${p["Metal Type"]} (${p.Metalquality}) - ${p["Article No"]}`));

const sorted = sortProductsByMetal(testData);

console.log("\nSorted Order:");
sorted.forEach(p => console.log(`${p["Metal Type"]} (${p.Metalquality}) - ${p["Article No"]}`));

console.log("\nVerification of sequence:");
const resultSequence = sorted.map(p => p.Metalquality.toUpperCase().replace(/\s+/g, ""));
console.log(resultSequence.join(" -> "));
