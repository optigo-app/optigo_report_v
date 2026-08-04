const sortProductsByMetal = (products) => {
    const extractNumber = (str) => {
        const match = String(str || "").match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
    };

    const getMetalPriority = (metalType, metalQuality) => {
        const type = String(metalType || "").toUpperCase();
        const qualityStr = String(metalQuality || "").trim();
        const numericValue = extractNumber(qualityStr);

        if (type.includes("GOLD")) return { category: 1, qualityIndex: numericValue !== null ? numericValue : 999 };
        if (type.includes("SILVER") || qualityStr.toLowerCase().startsWith("s")) return { category: 2, qualityIndex: numericValue !== null ? -numericValue : 0 };
        if (type.includes("PLATINUM") || qualityStr.includes("95") || qualityStr.includes("85")) return { category: 3, qualityIndex: numericValue !== null ? -numericValue : 0 };
        return { category: 4, qualityIndex: 0 };
    };

    const getGroupKey = (p) => {
        const type = String(p?.["Metal Type"] || "").trim().toUpperCase();
        const quality = String(p?.Metalquality || "").trim().toUpperCase();
        return `${type}||${quality}`;
    };

    const zeroOrderItems = [];
    const restItems = [];

    products.forEach((p) => {
        const n = parseInt(p?.DisplayOrder, 10);
        if (!isNaN(n) && n === 0) {
            zeroOrderItems.push(p);
        } else {
            restItems.push(p);
        }
    });

    const sorted = [...restItems].sort((a, b) => {
        const orderA = parseInt(a?.DisplayOrder, 10);
        const orderB = parseInt(b?.DisplayOrder, 10);
        const hasA = !isNaN(orderA) && orderA > 0;
        const hasB = !isNaN(orderB) && orderB > 0;

        if (hasA && hasB) {
            if (orderA !== orderB) return orderA - orderB;
        } else if (hasA) {
            return -1;
        } else if (hasB) {
            return 1;
        }

        const prioA = getMetalPriority(a?.["Metal Type"], a?.Metalquality);
        const prioB = getMetalPriority(b?.["Metal Type"], b?.Metalquality);

        if (prioA.category !== prioB.category) return prioA.category - prioB.category;
        if (prioA.qualityIndex !== prioB.qualityIndex) return prioA.qualityIndex - prioB.qualityIndex;

        return String(a?.["Article No"] ?? "").localeCompare(String(b?.["Article No"] ?? ""));
    });

    const zeroGroups = {};
    zeroOrderItems.forEach(z => {
        const key = getGroupKey(z);
        if (!zeroGroups[key]) zeroGroups[key] = [];
        zeroGroups[key].push(z);
    });

    const finalSorted = [];
    const insertedZeroGroups = new Set();

    for (const item of sorted) {
        finalSorted.push(item);

        const key = getGroupKey(item);
        if (zeroGroups[key] && !insertedZeroGroups.has(key)) {
            finalSorted.push(...zeroGroups[key]);
            insertedZeroGroups.add(key);
        }
    }

    const orphans = [];
    for (const key in zeroGroups) {
        if (!insertedZeroGroups.has(key)) {
            orphans.push(...zeroGroups[key]);
        }
    }

    orphans.sort((a, b) => {
        const prioA = getMetalPriority(a?.["Metal Type"], a?.Metalquality);
        const prioB = getMetalPriority(b?.["Metal Type"], b?.Metalquality);
        if (prioA.category !== prioB.category) return prioA.category - prioB.category;
        if (prioA.qualityIndex !== prioB.qualityIndex) return prioA.qualityIndex - prioB.qualityIndex;
        return String(a?.["Article No"] ?? "").localeCompare(String(b?.["Article No"] ?? ""));
    });

    return [...finalSorted, ...orphans];
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



{
    `
GH-31_8G | GOLD 18K | 18K | DisplayOrder: 300
GH-31_9G | GOLD 9K | 9K | DisplayOrder: 1
GH-31_10S | SILVER S925 | S925 | DisplayOrder: 0 ← zero
GH-31_11G | GOLD 22K | 22K | DisplayOrder: 0 ← zero
GH-31_2G | GOLD 22K | 22K | DisplayOrder: 50
GH-31_5G | GOLD 22K | 22K | DisplayOrder: 200
GH-31_7G | GOLD 22K | 22K | DisplayOrder: 0 ← zero


wrong
1  GH-31_10S  | 0   | S925  |               ← orphan, prepended
2  GH-31_9G   | 1   | 9K    | amp1
3  GH-31_2G   | 50  | 22K   | D_New         ← first 22K
4  GH-31_7G   | 0   | 22K   | amp4          ← zero injected after first 22K
5  GH-31_11G  | 0   | 22K   |               ← zero injected after first 22K
6  GH-31_5G   | 200 | 22K   | Testing_size
7  GH-31_8G   | 300 | 18K   | amp3



GH-31_9G | GOLD 9K | 9K | DisplayOrder: 1
GH-31_2G | GOLD 22K | 22K | DisplayOrder: 50
GH-31_11G | GOLD 22K | 22K | DisplayOrder: 0 ← zero
GH-31_7G | GOLD 22K | 22K | DisplayOrder: 0 ← zero
GH-31_5G | GOLD 22K | 22K | DisplayOrder: 200
GH-31_8G | GOLD 18K | 18K | DisplayOrder: 300
GH-31_10S | SILVER S925 | S925 | DisplayOrder: 0 ← zero


Green :  #0d3c3cff  
Golden : #c79762
`

}