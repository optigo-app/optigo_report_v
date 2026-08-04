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

const data = [
  { "Article No":"GH-31_8G",  "Metal Type":"GOLD 18K",   "Metalquality":"18K",  "Title":"amp3",         "DisplayOrder":300 },
  { "Article No":"GH-31_9G",  "Metal Type":"GOLD 9K",    "Metalquality":"9K",   "Title":"amp1",         "DisplayOrder":1   },
  { "Article No":"GH-31_10S", "Metal Type":"SILVER S925","Metalquality":"S925", "Title":"",             "DisplayOrder":0   },
  { "Article No":"GH-31_11G", "Metal Type":"GOLD 22K",   "Metalquality":"22K",  "Title":"",             "DisplayOrder":0   },
  { "Article No":"GH-31_2G",  "Metal Type":"GOLD 22K",   "Metalquality":"22K",  "Title":"D_New",        "DisplayOrder":50  },
  { "Article No":"GH-31_5G",  "Metal Type":"GOLD 22K",   "Metalquality":"22K",  "Title":"Testing_size", "DisplayOrder":200 },
  { "Article No":"GH-31_7G",  "Metal Type":"GOLD 22K",   "Metalquality":"22K",  "Title":"amp4",         "DisplayOrder":0   },
];

console.log('── Final Sorted Output ─────────────────────────────────────────');
console.log('  #  | Article      | Order | Quality | Title');
console.log('  '+'─'.repeat(55));
const out = sortProductsByMetal(data);
out.forEach((p,i)=>{
  const tag = parseInt(p.DisplayOrder,10)===0 ? ' ← zero (injected)' : '';
  console.log(`  ${String(i+1).padEnd(3)}| ${p['Article No'].padEnd(12)}| ${String(p.DisplayOrder).padEnd(5)} | ${p.Metalquality.padEnd(7)} | ${p.Title}${tag}`);
});
