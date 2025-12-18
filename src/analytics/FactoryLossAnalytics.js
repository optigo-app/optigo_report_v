import { isValid, startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth } from "date-fns";

class FactoryLossAnalytics {
  constructor(data) {
    this.data = Array.isArray(data) ? data : [];
    // console.log("Constructor: Initial data", this.data.length); // Log initial data length
  }

  setData(data) {
    this.data = Array.isArray(data) ? data : [];
    // console.log("setData: New data set", this.data.length); // Log new data set length
    return this;
  }

  extractPurePrcLoss(value) {
    if (!value || typeof value !== "string") return 0;
    return parseFloat(value.split("|")[1].trim()) || 0;
  }

  getPurePrcLossRange(value) {
    // console.log('getPurePrcLossRange: Checking PurePrcLoss value', value); // Log value
    if (value < 10) return "0 - 10%";
    if (value < 15) return "10 - 15%";
    if (value < 20) return "15 - 20%";
    if (value < 25) return "20 - 25%";
    if (value < 30) return "25 - 30%";
    if (value < 40) return "30 - 40%";
    if (value < 50) return "40 - 50%";
    return "Above 50%";
  }

  formatDate(dateString) {
    if (!dateString) return "Invalid Date";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "Invalid Date" : date.toISOString().split("T")[0];
    } catch {
      return "Invalid Date";
    }
  }

  getCategoryGrouping() {
    // console.log('getCategoryGrouping: Start grouping categories');
    const groups = {};

    this.data.forEach((item) => {
      const category = item.category || "Unknown";
      const grossLoss = parseFloat(item["Gross Loss"]) || 0;
      const netLoss = parseFloat(item["NetWt (F+M)"]) || 0;

      // console.log(`getCategoryGrouping: Processing item with category ${category}`); // Log item category

      if (!groups[category]) {
        groups[category] = {
          category,
          items: [],
          totalGrossLoss: 0,
          totalNetLoss: 0,
          factoryLoss: 0,
        };
      }

      groups[category].items.push(item);
      groups[category].totalGrossLoss += grossLoss;
      groups[category].totalNetLoss += netLoss;
    });

    Object.values(groups).forEach((group) => {
      group.factoryLoss = group.totalNetLoss > 0 ? (group.totalGrossLoss / group.totalNetLoss) * 100 : 0;
    });

    // console.log('getCategoryGrouping: Grouping completed', groups); // Log grouped data
    return Object.values(groups);
  }

  getLocationGrouping() {
    // console.log('getLocationGrouping: Start grouping by location');
    const groups = {};

    this.data.forEach((item) => {
      const location = item.Locationname || "Unknown";
      const grossLoss = parseFloat(item["Gross Loss"]) || 0;
      const netLoss = parseFloat(item["NetWt (F+M)"]) || 0;

      // console.log(`getLocationGrouping: Processing item with location ${location}`); // Log item location

      if (!groups[location]) {
        groups[location] = {
          location,
          items: [],
          totalGrossLoss: 0,
          totalNetLoss: 0,
          factoryLoss: 0,
        };
      }

      groups[location].items.push(item);
      groups[location].totalGrossLoss += grossLoss;
      groups[location].totalNetLoss += netLoss;
    });

    Object.values(groups).forEach((group) => {
      group.factoryLoss = group.totalNetLoss > 0 ? (group.totalGrossLoss / group.totalNetLoss) * 100 : 0;
    });

    // console.log('getLocationGrouping: Grouping completed', groups); // Log grouped data
    return Object.values(groups);
  }

  getRangeGrouping() {
    const updatedData = [];
    
    const ranges = ["0 - 10%", "10 - 15%", "15 - 20%", "20 - 25%", "25 - 30%", "30 - 40%", "40 - 50%", "Above 50%"];
    
    //Group data by Designcode and CustomerCode and calculate the merged PurePrcLoss
    const groupedData = {};
    
    this.data.forEach((item) => {
      const [purePrcLossStr, grossPrcLossStr] = (item["PurePrcLoss||GrossPrcLoss"] || "").split(" | ");
  
      // Clean the strings and extract PurePrcLoss and GrossPrcLoss values
      const cleanPurePrcLossStr = purePrcLossStr.trim().replace(/[^\d.-]/g, '');
      const cleanGrossPrcLossStr = grossPrcLossStr.trim().replace(/[^\d.-]/g, '');
      
      item.PurePrcLoss = parseFloat(cleanPurePrcLossStr) || 0;
      item.GrossPrcLoss = parseFloat(cleanGrossPrcLossStr) || 0;
  
      const grossLoss = parseFloat(item["Gross Loss"]);
      const netLoss = parseFloat(item["NetWt (F+M)"]);
  
      const validGrossLoss = isNaN(grossLoss) ? 0 : grossLoss;
      const validNetLoss = isNaN(netLoss) ? 0 : netLoss;
  
      // Group by Designcode and CustomerCode
      const designCustomerKey = `${item.Designcode}-${item.CustomerCode}`;
      
      if (!groupedData[designCustomerKey]) {
          groupedData[designCustomerKey] = { count: 0, sumPurePrcLoss: 0, sumGrossLoss: 0, sumNetLoss: 0, items: [] };
      }
  
      groupedData[designCustomerKey].count++;
      groupedData[designCustomerKey].sumPurePrcLoss += item.PurePrcLoss;
      groupedData[designCustomerKey].sumGrossLoss += validGrossLoss;
      groupedData[designCustomerKey].sumNetLoss += validNetLoss;
      groupedData[designCustomerKey].items.push(item);
    });
  
    Object.values(groupedData).forEach(group => {
      const avgPurePrcLoss = group.sumPurePrcLoss / group.count;
      const realGrossLoss = group.sumNetLoss > 0 ? (group.sumGrossLoss / group.sumNetLoss) * 100 : 0;
  
      const mergedItem = { 
          ...group.items[0], 
          Designcode: `${group.items[0].Designcode} (${group.count})`, 
          PurePrcLoss: avgPurePrcLoss,
          CntedGrsPrcL: realGrossLoss 
      };
  
      updatedData.push(mergedItem);
    });  
    
    // Now that we have processed the data, update this.data with updatedData
    // this.data = updatedData;

    // Proceed with the remaining logic for range grouping
    const groups = Object.fromEntries(ranges.map((range) => [range, { range, items: [], totalGrossLoss: 0, totalNetLoss: 0, factoryLoss: 0 }]));

    updatedData.forEach((item) => {
        const range = this.getPurePrcLossRange(item.CntedGrsPrcL);
        const grossLoss = parseFloat(item["Gross Loss"]) || 0;
        const netLoss = parseFloat(item["NetWt (F+M)"]) || 0;

        groups[range].items.push(item);
        groups[range].totalGrossLoss += grossLoss;
        groups[range].totalNetLoss += netLoss;
    });

    // Calculate factory loss for each range group
    Object.values(groups).forEach((group) => {
        group.factoryLoss = group.totalNetLoss > 0 ? (group.totalGrossLoss / group.totalNetLoss) * 100 : 0;
    });

    // Return the groups that have items (filter out empty groups)
    return Object.values(groups).filter((g) => g.items.length > 0);
  }


  getDayGrouping(dateRange = {}) {
    // console.log('getDayGrouping: Start grouping by day with date range:', dateRange); // Log date range
    const start = isValid(dateRange.startDate) ? startOfDay(dateRange.startDate) : startOfDay(new Date());
    const end = isValid(dateRange.endDate) ? endOfDay(dateRange.endDate) : start;

    const monthStart = startOfMonth(start);
    const monthEnd = endOfMonth(end);

    const allDates = eachDayOfInterval({ start: monthStart, end: monthEnd }).map((d) =>
      format(d, "yyyy-MM-dd")
    );

    const groups = {};

    this.data.forEach((item) => {
      const rawDate = new Date(item.ExportBatchDate);
      if (!isValid(rawDate) || !isSameMonth(rawDate, start)) return;

      const dateKey = format(rawDate, "yyyy-MM-dd");
      const grossLoss = parseFloat(item["Gross Loss"]) || 0;
      const netLoss = parseFloat(item["NetWt (F+M)"]) || 0;

      // console.log(`getDayGrouping: Processing item with ExportBatchDate ${item.ExportBatchDate}, GrossLoss ${grossLoss}, NetLoss ${netLoss}`); // Log item data

      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          items: [],
          totalGrossLoss: 0,
          totalNetLoss: 0,
          factoryLoss: 0,
        };
      }

      groups[dateKey].items.push(item);
      groups[dateKey].totalGrossLoss += grossLoss;
      groups[dateKey].totalNetLoss += netLoss;
    });

    const result = allDates.map((date) => {
      const group = groups[date] || {
        date,
        items: [],
        totalGrossLoss: 0,
        totalNetLoss: 0,
        factoryLoss: 0,
      };

      group.factoryLoss =
        group.totalNetLoss > 0
          ? parseFloat(((group.totalGrossLoss / group.totalNetLoss) * 100).toFixed(3)) // Convert to number
          : 0;

      // console.log(`getDayGrouping: Final group for date ${date}:`, group); // Log final result for each date
      return group;
    });

    return result;
  }

  getUniqueMetalTypes() {
    // console.log('getUniqueMetalTypes: Extracting unique metal types');
    const uniqueSet = new Set();

    this.data.forEach((item) => {
      if (item.MetalType && typeof item.MetalType === "string") {
        const baseType = item.MetalType.trim().split(" ")[0].toUpperCase();
        if (baseType) uniqueSet.add(baseType);
      }
    });

    // console.log('getUniqueMetalTypes: Unique metal types', Array.from(uniqueSet).sort()); // Log unique metal types
    return Array.from(uniqueSet).sort();
  }

  getOverallFactoryLoss() {
    // console.log('getOverallFactoryLoss: Calculating total factory loss');
    let totalGrossLoss = 0;
    let totalNetLoss = 0;

    this.data.forEach((item) => {
      totalGrossLoss += parseFloat(item["Gross Loss"]) || 0;
      totalNetLoss += parseFloat(item["NetWt (F+M)"]) || 0;
    });

    const factoryLoss = totalNetLoss > 0 ? (totalGrossLoss / totalNetLoss) * 100 : 0;

    // console.log('getOverallFactoryLoss: Total Gross Loss', totalGrossLoss, 'Total Net Loss', totalNetLoss, 'Factory Loss', factoryLoss); // Log final loss values
    return {
      totalGrossLoss,
      totalNetLoss,
      factoryLoss,
    };
  }
}

export default FactoryLossAnalytics;
