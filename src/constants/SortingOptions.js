export const sortProductsByMetal = (products) => {
  const extractNumber = (str) => {
    const match = String(str || "").match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  };

  const getMetalPriority = (metalType, metalQuality) => {
    const type = String(metalType || "").toUpperCase();
    const qualityStr = String(metalQuality || "").trim();
    const numericValue = extractNumber(qualityStr);

    // Gold Check
    if (type.includes("GOLD")) {
      // Gold usually sorted ascending by K value: 9, 10, 14, 18, 22, 24
      return { category: 1, qualityIndex: numericValue !== null ? numericValue : 999 };
    }

    // Silver Check
    if (type.includes("SILVER") || qualityStr.toLowerCase().startsWith("s")) {
      // Silver usually sorted descending: 999, 925, 800, 750
      return { category: 2, qualityIndex: numericValue !== null ? -numericValue : 0 };
    }

    // Platinum Check
    if (type.includes("PLATINUM") || qualityStr.includes("95") || qualityStr.includes("85")) {
      // Platinum usually sorted descending: 95, 85
      return { category: 3, qualityIndex: numericValue !== null ? -numericValue : 0 };
    }

    return { category: 4, qualityIndex: 0 };
  };

  return [...products].sort((a, b) => {
    const prioA = getMetalPriority(a?.["Metal Type"], a?.Metalquality);
    const prioB = getMetalPriority(b?.["Metal Type"], b?.Metalquality);

    if (prioA.category !== prioB.category) {
      return prioA.category - prioB.category;
    }

    if (prioA.qualityIndex !== prioB.qualityIndex) {
      return prioA.qualityIndex - prioB.qualityIndex;
    }

    // Fallback to Article No sorting if metal details are identical
    const articleA = String(a?.["Article No"] ?? "");
    const articleB = String(b?.["Article No"] ?? "");
    return articleA.localeCompare(articleB);
  });
};

export const GetTagReport = async (jobNo, MasterData, GetTaxMaster, Report, TaxCalculator) => {
  try {
    if (!MasterData.HSN.length && !MasterData.Tax.length) await GetTaxMaster();

    const res = await Report.request("GetScanJobData", { jobno: jobNo });
    if (res?.Status === 202 || res?.Message === "Data Not Found") {
      return {
        status: 202,
        message: "Data Not Found",
        data: [],
      };
    }
    const enrichedProducts = await Promise.all(
      (res?.Data?.DT || []).map(async (pd) => {
        const tax = await TaxCalculator(pd?.ToolItemId, pd);
        return { ...pd, tax };
      })
    );

    if (!enrichedProducts?.length) return [];

    return sortProductsByMetal(enrichedProducts);
  } catch (error) {
    console.error("GetTagReport failed", error);
    return [];
  }
};

// TESTING JOBNO = 1/1236
