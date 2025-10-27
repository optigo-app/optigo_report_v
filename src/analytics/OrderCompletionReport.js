import { isValid, startOfDay, endOfDay, eachDayOfInterval, format, isWithinInterval } from "date-fns";
import { ShoppingCart, AccessTime, Percent, CheckCircle, HourglassBottom, Warning } from "@mui/icons-material";
import normalizeDate from "../libs/normalizeDate";

class OrderCompletionReport {
  constructor(data, tab, dateRange) {
    this.tab = tab;
    this.dateRange = dateRange;
    this.setData(data); 
  }

  setData(data) {
    const safeData = Array.isArray(data) ? data : [];
    
    const dateFilteredData = this.filterByDateRange(safeData);
    
    this.data = dateFilteredData.filter((item) => {
      const jobStatus = String(item["jobstatus"] || "").trim();
      if (this.tab === 1) return jobStatus === "Dispatched";
      if (this.tab === 0) return jobStatus !== "Dispatched";
      return true;
    });

    console.log(`Final filtered data: ${this.data.length} items`);
    return this;
  }

  filterByDateRange(data) {
    if (!this.dateRange || 
        !this.dateRange.startDate || 
        !this.dateRange.endDate ||
        !isValid(this.dateRange.startDate) || 
        !isValid(this.dateRange.endDate)) {
      console.log('No valid date range provided - showing all data');
      return data;
    }

    const startDate = startOfDay(this.dateRange.startDate);
    const endDate = endOfDay(this.dateRange.endDate);

    console.log(`Filtering data from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);

    const filtered = data.filter((item) => {
      const dateField = this.tab === 1 ? item["saledate"] : item["orderdate"];
      const itemDate = normalizeDate(dateField);

      if (!itemDate) {
        return false;
      }

      return isWithinInterval(itemDate, { start: startDate, end: endDate });
    });

    console.log(`Date filtered: ${filtered.length} items from ${data.length} total`);
    return filtered;
  }

  getDelayDayGrouping() {
    const start = isValid(this.dateRange?.startDate) 
      ? startOfDay(this.dateRange.startDate) 
      : startOfDay(new Date());
    
    const end = isValid(this.dateRange?.endDate) 
      ? endOfDay(this.dateRange.endDate) 
      : endOfDay(new Date());

    const allDates = eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));
    const groups = {};

    this.data.forEach((item) => {
      const dateField = this.tab === 1 ? item["saledate"] : item["orderdate"];
      const itemDate = normalizeDate(dateField);
      
      if (!itemDate) return;

      const dateKey = format(itemDate, "yyyy-MM-dd");
      const deliveryAge = parseFloat(item["deliveryage"]) || 0;

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          items: [],
          totalJobs: 0,
          delayedJobs: 0,
          delayPercent: 0,
        };
      }

      groups[dateKey].items.push(item);
      groups[dateKey].totalJobs += 1;
      if (deliveryAge < 0) groups[dateKey].delayedJobs += 1;
    });

    return allDates.map((date) => {
      const group = groups[date] || {
        date,
        items: [],
        totalJobs: 0,
        delayedJobs: 0,
        delayPercent: 0,
      };

      group.delayPercent = group.totalJobs > 0 ? (group.delayedJobs / group.totalJobs) * 100 : 0;
      return group;
    });
  }

  getCustomerWiseDelayPcs() {
    const groups = {};

    this.data.forEach((item) => {
      const customer = item["customercode"] || "Unknown";
      const deliveryAge = parseFloat(item["deliveryage"]) || 0;

      if (!groups[customer]) {
        groups[customer] = {
          customer,
          items: [],
          totalJobs: 0,
          delayedJobs: 0,
          delayPercent: 0,
          totalDelayDays: 0,
        };
      }

      groups[customer].items.push(item);
      groups[customer].totalJobs += 1;

      if (deliveryAge < 0) {
        groups[customer].delayedJobs += 1;
        groups[customer].totalDelayDays += Math.abs(deliveryAge);
      }
    });

    return Object.values(groups).map((group) => {
      group.delayPercent = group.totalJobs > 0 ? Math.round((group.delayedJobs / group.totalJobs) * 10000) / 100 : 0;
      return group;
    });
  }

  getAverageDeliveryDayByCompanyType() {
    const groups = {};

    this.data.forEach((item) => {
      const companyType = item["companytype"] || "Unknown";
      const leadAge = parseFloat(item["leadage"]) || 0;

      if (!groups[companyType]) {
        groups[companyType] = {
          companyType,
          items: [],
          totalJobs: 0,
          totalDelayDays: 0,
          averageDelayDays: 0,
        };
      }

      groups[companyType].items.push(item);
      groups[companyType].totalJobs += 1;
      groups[companyType].totalDelayDays += Math.abs(leadAge);
    });

    return Object.values(groups).map((group) => {
      group.averageDelayDays = group.totalJobs > 0 ? Math.round(group.totalDelayDays / group.totalJobs) : 0;
      return group;
    });
  }

  getSalesRepWiseDelay() {
    const groups = {};
    
    this.data.forEach((item) => {
      const salesRep = item["salerep"]?.trim() || "Unknown";
      const deliveryAge = parseFloat(item["deliveryage"]) || 0;

      if (!groups[salesRep]) {
        groups[salesRep] = {
          salesRep,
          items: [],
          totalJobs: 0,
          delayedJobs: 0,
          delayPercent: 0,
        };
      }

      groups[salesRep].items.push(item);
      groups[salesRep].totalJobs += 1;
      if (deliveryAge < 0) {
        groups[salesRep].delayedJobs += 1;
      }
    });

    let arr = Object.values(groups).map((group) => {
      group.delayPercent = group.totalJobs > 0 ? Math.round((group.delayedJobs / group.totalJobs) * 10000) / 100 : 0;
      return group;
    });

    arr.sort((a, b) => b.totalJobs - a.totalJobs);
    
    if (arr.length > 10) {
      const top10 = arr.slice(0, 10);
      const others = arr.slice(10);

      const otherGroup = {
        salesRep: "Other",
        items: [],
        totalJobs: 0,
        delayedJobs: 0,
        delayPercent: 0,
      };

      others.forEach((g) => {
        otherGroup.items.push(...g.items);
        otherGroup.totalJobs += g.totalJobs;
        otherGroup.delayedJobs += g.delayedJobs;
      });

      otherGroup.delayPercent = otherGroup.totalJobs > 0 ? Math.round((otherGroup.delayedJobs / otherGroup.totalJobs) * 10000) / 100 : 0;

      return [...top10, otherGroup];
    }

    return arr;
  }

  getCompanyTypeSummary() {
    const groups = {};
    
    this.data.forEach((item) => {
      let companyType = item["companytype"];
      const deliveryAge = parseFloat(item["deliveryage"]) || 0;
      if (companyType === "" || !companyType) companyType = "Blank";
      
      if (!groups[companyType]) {
        groups[companyType] = {
          companyType,
          items: [],
          totalJobs: 0,
          delayedJobs: 0,
          delayPercent: 0,
        };
      }

      groups[companyType].items.push(item);
      groups[companyType].totalJobs += 1;

      if (deliveryAge < 0) {
        groups[companyType].delayedJobs += 1;
      }
    });

    return Object.values(groups).map((group) => {
      group.delayPercent = group.totalJobs > 0 ? Math.round((group.delayedJobs / group.totalJobs) * 10000) / 100 : 0;
      return group;
    });
  }

  getAnalyticsData() {
    const getNum = (val) => parseFloat(val) || 0;
    const totalSoldOrders = this.data.length;
    const delayedOrders = this.data.filter((item) => getNum(item["deliveryage"]) < 0);
    const delayOrders = delayedOrders.length;
    const delayRate = totalSoldOrders ? (delayOrders / totalSoldOrders) * 100 : 0;
    const onTimeDeliveries = totalSoldOrders ? ((totalSoldOrders - delayOrders) / totalSoldOrders) * 100 : 0;
    const totalLeadAge = this.data.reduce((sum, item) => sum + Math.abs(getNum(item["leadage"])), 0);
    const leadAge = totalSoldOrders ? totalLeadAge / totalSoldOrders : 0;
    const totalDelayAge = delayedOrders.reduce((sum, item) => sum + Math.abs(getNum(item["deliveryage"])), 0);
    const delayAge = delayOrders ? totalDelayAge / delayOrders : 0;

    return [
      {
        label: "Total Sold Orders",
        value: +totalSoldOrders.toFixed(0),
        icon: <ShoppingCart fontSize="small" />,
        color: "#6366f1",
        bgColor: "#eef2ff",
      },
      {
        label: "Delay Orders",
        value: +delayOrders.toFixed(0),
        icon: <AccessTime fontSize="small" />,
        color: "#ef4444",
        bgColor: "#fee2e2",
      },
      {
        label: "Delay Rate",
        value: `${+delayRate.toFixed(2)}%`,
        icon: <Percent fontSize="small" />,
        color: "#f97316",
        bgColor: "#fff7ed",
      },
      {
        label: "On-time Deliveries",
        value: `${+onTimeDeliveries.toFixed(0)}%`,
        icon: <CheckCircle fontSize="small" />,
        color: "#22c55e",
        bgColor: "#dcfce7",
      },
      {
        label: "Lead Age",
        value: `${Math.round(leadAge)}`,
        icon: <HourglassBottom fontSize="small" />,
        color: "#06b6d4",
        bgColor: "#ecfeff",
      },
      {
        label: "Delay Age",
        value: `${Math.round(delayAge)}`,
        icon: <Warning fontSize="small" />,
        color: "#8b5cf6",
        bgColor: "#f5f3ff",
      },
    ];
  }
}

export default OrderCompletionReport;


// import { isValid, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval, parse, format, isSameMonth } from "date-fns";
// import { ShoppingCart, AccessTime, Percent, CheckCircle, HourglassBottom, Warning } from "@mui/icons-material";

// class OrderCompletionReport {
//   constructor(data, tab, dateRange) {
//     this.tab = tab;
//     this.setData(data);
//     this.dateRange = dateRange;
//   }
//   setData(data) {
//     const safeData = Array.isArray(data) ? data : [];

//     this.data = safeData.filter((item) => {
//       const jobStatus = String(item["jobstatus"] || "").trim();

//       if (this.tab === 1) return jobStatus === "Dispatched";
//       if (this.tab === 0) return jobStatus !== "Dispatched";

//       return true;
//     });

//     return this;
//   }
//   getDelayDayGrouping() {
//     const parseDate = (str) => {
//       if (!str) return null;
//       let d = parse(str, "dd MMM yyyy", new Date());
//       if (!isValid(d)) d = parse(str, "dd-MM-yyyy", new Date());
//       return d;
//     };

//     const start = isValid(this.dateRange.startDate) ? startOfDay(this.dateRange.startDate) : startOfDay(new Date());

//     const end = isValid(this.dateRange.endDate) ? endOfDay(this.dateRange.endDate) : start;

//     const allDates = eachDayOfInterval({ start, end }).map((d) => format(d, "yyyy-MM-dd"));

//     const groups = {};

//     this.data.forEach((item) => {
//       const rawDate = parseDate(this.tab === 1 ? item["saledate"] : item["orderdate"]);
//       if (!(rawDate instanceof Date) || !isValid(rawDate)) return;

//       const dateKey = format(rawDate, "yyyy-MM-dd");
//       const deliveryAge = parseFloat(item["deliveryage"]) || 0;

//       if (!groups[dateKey]) {
//         groups[dateKey] = {
//           date: dateKey,
//           items: [],
//           totalJobs: 0,
//           delayedJobs: 0,
//           delayPercent: 0,
//         };
//       }

//       groups[dateKey].items.push(item);
//       groups[dateKey].totalJobs += 1;
//       if (deliveryAge < 0) groups[dateKey].delayedJobs += 1;
//     });

//     return allDates.map((date) => {
//       const group = groups[date] || {
//         date,
//         items: [],
//         totalJobs: 0,
//         delayedJobs: 0,
//         delayPercent: 0,
//       };

//       group.delayPercent = group.totalJobs > 0 ? (group.delayedJobs / group.totalJobs) * 100 : 0;

//       return group;
//     });
//   }
//   getCustomerWiseDelayPcs() {
//     const groups = {};

//     this.data.forEach((item) => {
//       const customer = item["customercode"] || "Unknown";
//       const deliveryAge = parseFloat(item["deliveryage"]) || 0;

//       if (!groups[customer]) {
//         groups[customer] = {
//           customer,
//           items: [],
//           totalJobs: 0,
//           delayedJobs: 0,
//           delayPercent: 0,
//           totalDelayDays: 0,
//         };
//       }

//       groups[customer].items.push(item);
//       groups[customer].totalJobs += 1;

//       if (deliveryAge < 0) {
//         groups[customer].delayedJobs += 1;
//         groups[customer].totalDelayDays += Math.abs(deliveryAge);
//       }
//     });
//     return Object.values(groups).map((group) => {
//       group.delayPercent = group.totalJobs > 0 ? Math.round((group.delayedJobs / group.totalJobs) * 10000) / 100 : 0;
//       return group;
//     });
//   }
//   getAverageDeliveryDayByCompanyType() {
//     const groups = {};

//     this.data.forEach((item) => {
//       const companyType = item["companytype"];
//       const leadAge = parseFloat(item["leadage"]) || 0;

//       if (!groups[companyType]) {
//         groups[companyType] = {
//           companyType,
//           items: [],
//           totalJobs: 0,
//           totalDelayDays: 0,
//           averageDelayDays: 0,
//         };
//       }

//       groups[companyType].items.push(item);
//       groups[companyType].totalJobs += 1;
//       groups[companyType].totalDelayDays += Math.abs(leadAge);
//     });
//     return Object.values(groups).map((group) => {
//       group.averageDelayDays = group.totalJobs > 0 ? Math.round(group.totalDelayDays / group.totalJobs) : 0;
//       return group;
//     });
//   }
//   getSalesRepWiseDelay() {
//     const groups = {};
//     this.data.forEach((item) => {
//       const salesRep = item["salerep"]?.trim() || "Unknown";
//       const deliveryAge = parseFloat(item["deliveryage"]) || 0;

//       if (!groups[salesRep]) {
//         groups[salesRep] = {
//           salesRep,
//           items: [],
//           totalJobs: 0,
//           delayedJobs: 0,
//           delayPercent: 0,
//         };
//       }

//       groups[salesRep].items.push(item);
//       groups[salesRep].totalJobs += 1;
//       if (deliveryAge < 0) {
//         groups[salesRep].delayedJobs += 1;
//       }
//     });

//     let arr = Object.values(groups).map((group) => {
//       group.delayPercent = group.totalJobs > 0 ? Math.round((group.delayedJobs / group.totalJobs) * 10000) / 100 : 0;
//       return group;
//     });

//     arr.sort((a, b) => b.totalJobs - a.totalJobs);
    
//     if (arr.length > 10) {
//       const top10 = arr.slice(0, 10);
//       const others = arr.slice(10);

//       const otherGroup = {
//         salesRep: "Other",
//         items: [],
//         totalJobs: 0,
//         delayedJobs: 0,
//         delayPercent: 0,
//       };

//       others.forEach((g) => {
//         otherGroup.items.push(...g.items);
//         otherGroup.totalJobs += g.totalJobs;
//         otherGroup.delayedJobs += g.delayedJobs;
//       });

//       otherGroup.delayPercent = otherGroup.totalJobs > 0 ? Math.round((otherGroup.delayedJobs / otherGroup.totalJobs) * 10000) / 100 : 0;

//       return [...top10, otherGroup];
//     }

//     return arr;
//   }

//   getCompanyTypeSummary() {
//     const groups = {};
//     this.data.forEach((item) => {
//       let companyType = item["companytype"];
//       const deliveryAge = parseFloat(item["deliveryage"]) || 0;
//       if (companyType === "") companyType = "Blank";
//       if (!groups[companyType]) {
//         groups[companyType] = {
//           companyType,
//           items: [],
//           totalJobs: 0,
//           delayedJobs: 0,
//           delayPercent: 0,
//         };
//       }

//       groups[companyType].items.push(item);
//       groups[companyType].totalJobs += 1;

//       if (deliveryAge < 0) {
//         groups[companyType].delayedJobs += 1;
//       }
//     });
//     return Object.values(groups).map((group) => {
//       group.delayPercent = group.totalJobs > 0 ? Math.round((group.delayedJobs / group.totalJobs) * 10000) / 100 : 0;

//       return group;
//     });
//   }
//   getAnalyticsData() {
//     const getNum = (val) => parseFloat(val) || 0;
//     const totalSoldOrders = this.data.length;
//     const delayedOrders = this.data.filter((item) => getNum(item["deliveryage"]) < 0);
//     const delayOrders = delayedOrders.length;
//     const delayRate = totalSoldOrders ? (delayOrders / totalSoldOrders) * 100 : 0;
//     const onTimeDeliveries = totalSoldOrders ? ((totalSoldOrders - delayOrders) / totalSoldOrders) * 100 : 0;
//     const totalLeadAge = this.data.reduce((sum, item) => sum + Math.abs(getNum(item["leadage"])), 0);
//     const leadAge = totalSoldOrders ? totalLeadAge / totalSoldOrders : 0;
//     const totalDelayAge = delayedOrders.reduce((sum, item) => sum + Math.abs(getNum(item["deliveryage"])), 0);
//     const delayAge = delayOrders ? totalDelayAge / delayOrders : 0;

//     return [
//       {
//         label: "Total Sold Orders",
//         value: +totalSoldOrders.toFixed(0),
//         icon: <ShoppingCart fontSize="small" />,
//         color: "#6366f1",
//         bgColor: "#eef2ff",
//       },
//       {
//         label: "Delay Orders",
//         value: +delayOrders.toFixed(0),
//         icon: <AccessTime fontSize="small" />,
//         color: "#ef4444",
//         bgColor: "#fee2e2",
//       },
//       {
//         label: "Delay Rate",
//         value: `${+delayRate.toFixed(2)}%`,
//         icon: <Percent fontSize="small" />,
//         color: "#f97316",
//         bgColor: "#fff7ed",
//       },
//       {
//         label: "On-time Deliveries",
//         value: `${+onTimeDeliveries.toFixed(0)}%`,
//         icon: <CheckCircle fontSize="small" />,
//         color: "#22c55e",
//         bgColor: "#dcfce7",
//       },
//       {
//         label: "Lead Age",
//         value: `${Math.round(leadAge)}`,
//         icon: <HourglassBottom fontSize="small" />,
//         color: "#06b6d4",
//         bgColor: "#ecfeff",
//       },
//       {
//         label: "Delay Age",
//         value: `${Math.round(delayAge)}`,
//         icon: <Warning fontSize="small" />,
//         color: "#8b5cf6",
//         bgColor: "#f5f3ff",
//       },
//     ];
//   }
// }

// export default OrderCompletionReport;
