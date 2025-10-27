import { isWithinInterval } from "date-fns";
import normalizeDate from "../libs/normalizeDate";

class QuoteAnalyticsReport {
  constructor(data, dateRange ,topCustomersAmount) {
    const start = normalizeDate(dateRange?.startDate);
    const end   = normalizeDate(dateRange?.endDate);
    const hasRange = start && end;
  
    let parsedCount = 0;
    let invalidCount = 0;
    let missingCount = 0;

    this.data = Array.isArray(data)
      ? data.filter((item) => {
        const raw = item["orderdate"];
        if (raw == null || raw === "") {
          missingCount++;
          return false;
        }

          const parsed = normalizeDate(raw);
          if (!parsed) {
            invalidCount++;
            console.warn("❌ Invalid date:", raw, item);
            return false;
          }
  
          if (hasRange) {
            if (isWithinInterval(parsed, { start, end })) {
              parsedCount++;
              return true;
            } else {
              invalidCount++;
              return false;
            }
          } else {
            parsedCount++;
            return true; 
          }
        })
      : [];

      // New Controller

      this.topCustomersAmount = Array.isArray(topCustomersAmount)
      ? topCustomersAmount.filter((item) => {
          const raw = item["OrderDate"];
          if (!raw) return false;
          const parsed = normalizeDate(raw);
          if (!parsed) return false;
          if (hasRange && !isWithinInterval(parsed, { start, end })) {
            return false;
          }
          return true;
        })
      : [];
  
    this.dateRange = hasRange ? { start, end } : null;
  
    // console.log("📦 Total input:", Array.isArray(data) ? data.length : 0);
    // console.log("✅ Parsed (valid dates):", parsedCount);
    // console.log("❌ Failed or out of range:", invalidCount);
    // console.log("🚫 Missing/null/undefined:", missingCount);
    // console.log("📦 After filter:", this.data.length);
  }
  setData(data) {
    this.data = Array.isArray(data) ? data : [];
    return this;
  }
  GetTopCustomersByOrders(showView = "count") {
    const isfetchFrom =  showView === "count" ?  this.data : this.topCustomersAmount;
    console.log("🚀 ~ QuoteAnalyticsReport ~ GetTopCustomersByOrders ~ isfetchFrom:", isfetchFrom)
    const isCase = showView === "count" ? "customername" : "Customername";
    return this._aggregateCustomers(isfetchFrom, showView, isCase);
  }


  GetTopCustomersByOrdersFromApi(showView = "count") {
    return this._aggregateCustomers(this.topCustomersAmount, showView);
  }
  // GetTopCustomersByOrders(showView = "count") {
  //   const groups = {};
  //   this.data.forEach((item) => {
  //     const customer = item["customername"];
  //     if (!customer) return;

  //     if (!groups[customer]) {
  //       groups[customer] = {
  //         name: customer,
  //         orderCount: 0,
  //         salesCount: 0,
  //         orderAmount: 0,
  //         saleAmount: 0,
  //         items: [],
  //       };
  //     }

  //     const group = groups[customer];
  //     group.orderCount += Number(item["ordercount"] || 0);
  //     group.salesCount += Number(item["SalesCount"] || 0);
  //     group.orderAmount += Number(item["orderamount"] || 0);
  //     group.saleAmount += Number(item["saleamount"] || 0);
  //     if (group.items.length < 10) {
  //       group.items.push(item);
  //     }
  //   });

  //   const groupList = Object.values(groups).map((g) => ({
  //     name: g.name,
  //     orderCount: Math.round(g.orderCount),
  //     salesCount: Math.round(g.salesCount),
  //     orderAmount: Math.round(g.orderAmount),
  //     saleAmount: Math.round(g.saleAmount),
  //     items: g.items,
  //   }));

  //   const sorted = groupList.sort((a, b) => {
  //     if (showView === "amount") {
  //       return b.saleAmount - a.saleAmount;
  //     } else {
  //       return b.salesCount - a.salesCount;
  //     }
  //   });

  //   const top9 = sorted.slice(0, 9);
  //   const othersRaw = sorted.slice(9);

  //   if (othersRaw.length > 0) {
  //     const others = {
  //       name: "Others",
  //       orderCount: 0,
  //       salesCount: 0,
  //       orderAmount: 0,
  //       saleAmount: 0,
  //       items: [],
  //     };

  //     for (const entry of othersRaw) {
  //       others.orderCount += entry.orderCount;
  //       others.salesCount += entry.salesCount;
  //       others.orderAmount += entry.orderAmount;
  //       others.saleAmount += entry.saleAmount;
  //       others.items.push(...entry.items.slice(0, 10 - others.items.length));
  //       if (others.items.length >= 10) break;
  //     }

  //     top9.push(others);
  //   }
  //   return top9.map((group) => {
  //     if (showView === "amount") {
  //       return {
  //         name: group.name,
  //         orderAmount: group.orderAmount,
  //         saleAmount: group.saleAmount,
  //         items: group.items,
  //       };
  //     } else {
  //       return {
  //         name: group.name,
  //         orderCount: group.orderCount,
  //         salesCount: group.salesCount,
  //         items: group.items,
  //       };
  //     }
  //   });
  // }
  GetTopSellingDesigns(sort = "high") {
    const groups = {};

    this.data.forEach((item) => {
      const design = item["design"];
      if (!design) return;

      if (!groups[design]) {
        groups[design] = {
          name: design,
          orderCount: 0,
          salesCount: 0,
          orderAmount: 0,
          saleAmount: 0,
          items: [],
        };
      }

      const group = groups[design];
      group.orderCount += Number(item["ordercount"] || 0);
      group.salesCount += Number(item["SalesCount"] || 0);
      group.orderAmount += Number(item["orderamount"] || 0);
      group.saleAmount += Number(item["saleamount"] || 0);

      if (group.items.length < 10) {
        group.items.push(item);
      }
    });

    const groupList = Object.values(groups).map((g) => ({
      name: g.name,
      orderCount: Math.round(g.orderCount),
      salesCount: Math.round(g.salesCount),
      orderAmount: Math.round(g.orderAmount),
      saleAmount: Math.round(g.saleAmount),
      items: g.items,
    }));

    const sorted = groupList.sort((a, b) => {
      return sort === "low" ? a.salesCount - b.salesCount : b.salesCount - a.salesCount;
    });

    const top9 = sorted.slice(0, 9);
    const othersRaw = sorted.slice(9);

    if (othersRaw.length > 0) {
      const others = {
        name: "Others",
        orderCount: 0,
        salesCount: 0,
        orderAmount: 0,
        saleAmount: 0,
        items: [],
      };

      for (const entry of othersRaw) {
        others.orderCount += entry.orderCount;
        others.salesCount += entry.salesCount;
        others.orderAmount += entry.orderAmount;
        others.saleAmount += entry.saleAmount;

        others.items.push(...entry.items.slice(0, 10 - others.items.length));
        if (others.items.length >= 10) break;
      }

      top9.push(others);
    }

    console.log("🚀 ~ QuoteAnalyticsReport ~ GetTopSellingDesigns ~ top9:", top9)
    return top9.map((group) => ({
      name: group.name,
      orderCount: group.orderCount,
      salesCount: group.salesCount,
      orderAmount: group.orderAmount,
      saleAmount: group.saleAmount,
      items: group.items,
    }));
  }
  GetCategoryWiseSale() {
    const groups = {};
    let totalSales = 0;
    let totalOrders = 0;

    this.data.forEach((item) => {
      const category = item["category"];
      if (!category) return;

      if (!groups[category]) {
        groups[category] = {
          name: category,
          orderCount: 0,
          salesCount: 0,
          orderAmount: 0,
          saleAmount: 0,
          items: [],
        };
      }

      const group = groups[category];
      const orderCount = Number(item["ordercount"] || 0);
      const salesCount = Number(item["SalesCount"] || 0);
      const orderAmount = Number(item["orderamount"] || 0);
      const saleAmount = Number(item["saleamount"] || 0);

      group.orderCount += orderCount;
      group.salesCount += salesCount;
      group.orderAmount += orderAmount;
      group.saleAmount += saleAmount;
      if (group.items.length < 10) group.items.push(item);

      totalOrders += orderCount;
      totalSales += salesCount;
    });

    let groupList = Object.values(groups);

    // Sort by salesCount descending
    groupList.sort((a, b) => b.salesCount - a.salesCount);

    const topN = 8;
    const topGroups = groupList.slice(0, topN);
    const restGroups = groupList.slice(topN);

    const sumRest = restGroups.reduce(
      (acc, g) => {
        acc.orderCount += g.orderCount;
        acc.salesCount += g.salesCount;
        acc.orderAmount += g.orderAmount;
        acc.saleAmount += g.saleAmount;
        acc.items.push(...g.items);
        return acc;
      },
      {
        name: "Others",
        orderCount: 0,
        salesCount: 0,
        orderAmount: 0,
        saleAmount: 0,
        items: [],
      }
    );

    const finalGroups = [...topGroups];
    if (restGroups.length > 0) finalGroups.push(sumRest);

    // Calculate percentages — ensure they sum to 100%
    let orderPercentTotal = 0;
    let salesPercentTotal = 0;

    const withPercents = finalGroups.map((g, i, arr) => {
      const isLast = i === arr.length - 1;
      const orderPercent = totalOrders ? (g.orderCount / totalOrders) * 100 : 0;
      const salesPercent = totalSales ? (g.salesCount / totalSales) * 100 : 0;

      const roundedOrder = isLast ? 100 - orderPercentTotal : Math.round(orderPercent);
      const roundedSales = isLast ? 100 - salesPercentTotal : Math.round(salesPercent);

      orderPercentTotal += roundedOrder;
      salesPercentTotal += roundedSales;

      return {
        name: g.name,
        orderCount: Math.round(g.orderCount),
        salesCount: Math.round(g.salesCount),
        orderAmount: Math.round(g.orderAmount),
        saleAmount: Math.round(g.saleAmount),
        orderPercent: roundedOrder,
        salesPercent: roundedSales,
        items: g.items.slice(0, 10),
      };
    });

    return withPercents;
  }
  GetTopManufacturer() {
    const groups = {};
    let totalSales = 0;
    let totalOrders = 0;
    let totalSaleAmount = 0;
    let totalOrderAmount = 0;

    this.data.forEach((item) => {
      const manufacturer = item["manufacturer"];
      if (!manufacturer) return;

      if (!groups[manufacturer]) {
        groups[manufacturer] = {
          name: manufacturer,
          salesCount: 0,
          orderCount: 0,
          saleAmount: 0,
          orderAmount: 0,
          items: [],
        };
      }

      const group = groups[manufacturer];
      const salesCount = Number(item["SalesCount"] || 0);
      const orderCount = Number(item["ordercount"] || 0);
      const saleAmount = Number(item["saleamount"] || 0);
      const orderAmount = Number(item["orderamount"] || 0);

      group.salesCount += salesCount;
      group.orderCount += orderCount;
      group.saleAmount += saleAmount;
      group.orderAmount += orderAmount;

      if (group.items.length < 10) {
        group.items.push(item);
      }

      totalSales += salesCount;
      totalOrders += orderCount;
      totalSaleAmount += saleAmount;
      totalOrderAmount += orderAmount;
    });

    const allGroups = Object.values(groups).map((g) => ({
      name: g.name,
      salesCount: g.salesCount,
      orderCount: g.orderCount,
      saleAmount: g.saleAmount,
      orderAmount: g.orderAmount,
      items: g.items,
    }));

    const sorted = allGroups.sort((a, b) => b.salesCount - a.salesCount);

    const top9 = sorted.slice(0, 9);
    const others = sorted.slice(9);

    if (others.length) {
      const otherGroup = {
        name: "Others",
        salesCount: 0,
        orderCount: 0,
        saleAmount: 0,
        orderAmount: 0,
        items: [],
      };

      others.forEach((g) => {
        otherGroup.salesCount += g.salesCount;
        otherGroup.orderCount += g.orderCount;
        otherGroup.saleAmount += g.saleAmount;
        otherGroup.orderAmount += g.orderAmount;
        otherGroup.items.push(...g.items);
      });

      top9.push(otherGroup);
    }

    // Add percentage after slicing/aggregating
    return top9.map((g) => ({
      ...g,
      salesPercent: totalSales ? Math.round((g.salesCount / totalSales) * 100) : 0,
      orderPercent: totalOrders ? Math.round((g.orderCount / totalOrders) * 100) : 0,
    }));
  }
  _aggregateCustomers(source, showView, isCase) {
    const groups = {};
    source.forEach((item) => {
      const customer = item[isCase];
      if (!customer) return;
  
      if (!groups[customer]) {
        groups[customer] = {
          name: customer,
          orderCount: 0,
          salesCount: 0,
          orderAmount: 0,
          saleAmount: 0,
          items: [],
        };
      }
  
      const g = groups[customer];
      g.orderCount += Number(item["ordercount"] || 0);
      g.salesCount += Number(item["SalesCount"] || 0);
      g.orderAmount += Number(item["OrderAmount"] || 0);
      g.saleAmount += Number(item["SalesAmount"] || 0);
      if (g.items.length < 10) g.items.push(item);
    });
  
    const list = Object.values(groups).map((g) => ({
      name: g.name,
      orderCount: Math.round(g.orderCount),
      salesCount: Math.round(g.salesCount),
      orderAmount: Math.round(g.orderAmount),
      saleAmount: Math.round(g.saleAmount),
      items: g.items,
    }));
  
    const sorted = list.sort((a, b) =>
      showView === "amount" ? b.saleAmount - a.saleAmount : b.salesCount - a.salesCount
    );
  
    // Slice top 9
    const top9 = sorted.slice(0, 9);
    const others = sorted.slice(9);
  
    if (others.length > 0) {
      const otherSummary = others.reduce(
        (acc, item) => {
          acc.orderCount += item.orderCount;
          acc.salesCount += item.salesCount;
          acc.orderAmount += item.orderAmount;
          acc.saleAmount += item.saleAmount;
          acc.items.push(...item.items);
          return acc;
        },
        {
          name: "Others",
          orderCount: 0,
          salesCount: 0,
          orderAmount: 0,
          saleAmount: 0,
          items: [],
        }
      );
  
      return [...top9, otherSummary];
    }
  
    return top9;
  }
  
}

export default QuoteAnalyticsReport;
