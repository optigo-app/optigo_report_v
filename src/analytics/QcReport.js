import {
  isValid,
  startOfDay,
  endOfDay,
  format,
  isWithinInterval,
  eachDayOfInterval,
} from "date-fns";
import normalizeDate from "../libs/normalizeDate.js";

class QcRejectAnalytics {
  constructor(data, dateRange) {
    this.raw = Array.isArray(data) ? data : [];
    this.dateRange = dateRange || {};

    const start = normalizeDate(this.dateRange.startDate);
    const end = normalizeDate(this.dateRange.endDate);
    this.hasDateRange = Boolean(start && end && isValid(start) && isValid(end));

    if (this.hasDateRange) {
      const intervalStart = startOfDay(start);
      const intervalEnd = endOfDay(end);

      this.data = this.raw.filter((item) => {
        const itemDate = normalizeDate(item?.Date || item?.date);
        if (!itemDate || !isValid(itemDate)) return true;
        return isWithinInterval(itemDate, {
          start: intervalStart,
          end: intervalEnd,
        });
      });
    } else {
      this.data = this.raw;
    }
  }

  isRejected(item) {
    const status = (item?.status || item?.Status || "").toLowerCase();
    return status.includes("reject");
  }

  isApproved(item) {
    const status = (item?.status || item?.Status || "").toLowerCase();
    return status.includes("approv") || status.includes("pass");
  }

  isRework(item) {
    const status = (item?.status || item?.Status || "").toLowerCase();
    const progress = (item?.ProgressStatusName || "").toLowerCase();
    return (
      status.includes("rework") ||
      (!this.isRejected(item) && !this.isApproved(item)) ||
      progress.includes("rework")
    );
  }

  getDateRangeSpan() {
    let minDate = null;
    let maxDate = null;

    this.raw.forEach((item) => {
      const d = normalizeDate(item?.Date || item?.date);
      if (d && isValid(d)) {
        if (!minDate || d < minDate) minDate = d;
        if (!maxDate || d > maxDate) maxDate = d;
      }
    });

    return {
      minDate,
      maxDate,
      count: this.raw.length,
    };
  }

  getKpiMetrics() {
    const totalInspected = this.data.length;
    const uniqueJobs = new Set(this.data.map((d) => d.jobno).filter(Boolean)).size;

    let passedCount = 0;
    let rejectedCount = 0;
    let reworkCount = 0;

    this.data.forEach((item) => {
      if (this.isRejected(item)) {
        rejectedCount++;
      } else if (this.isApproved(item)) {
        passedCount++;
      } else {
        reworkCount++;
      }
    });

    const rejectionRatio =
      totalInspected > 0 ? +((rejectedCount / totalInspected) * 100).toFixed(2) : 0;
    const passRate =
      totalInspected > 0 ? +((passedCount / totalInspected) * 100).toFixed(2) : 0;

    const defectCounts = {};
    this.data.forEach((item) => {
      const reason = (item?.Reason || item?.reason || "").trim();
      if (reason) {
        defectCounts[reason] = (defectCounts[reason] || 0) + 1;
      }
    });

    let topDefect = "None";
    let topDefectCount = 0;
    Object.entries(defectCounts).forEach(([reason, count]) => {
      if (count > topDefectCount) {
        topDefectCount = count;
        topDefect = reason;
      }
    });

    return {
      totalInspected,
      uniqueJobs,
      passedCount,
      rejectedCount,
      reworkCount,
      rejectionRatio,
      passRate,
      topDefect,
      topDefectCount,
    };
  }

  getCategoryQCAnalysis() {
    const categoryMap = {};

    this.data.forEach((item) => {
      const rawCat = (item?.category || item?.Category || "Other").trim();
      const normalizedCat =
        rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase();

      if (!categoryMap[normalizedCat]) {
        categoryMap[normalizedCat] = {
          category: normalizedCat,
          passed: 0,
          rejected: 0,
          rework: 0,
          total: 0,
        };
      }

      if (this.isRejected(item)) {
        categoryMap[normalizedCat].rejected++;
      } else if (this.isApproved(item)) {
        categoryMap[normalizedCat].passed++;
      } else {
        categoryMap[normalizedCat].rework++;
      }
      categoryMap[normalizedCat].total++;
    });

    return Object.values(categoryMap)
      .map((item) => ({
        ...item,
        rejectionRate:
          item.total > 0 ? +((item.rejected / item.total) * 100).toFixed(1) : 0,
        passRate:
          item.total > 0 ? +((item.passed / item.total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }

  getDefectsByType() {
    const defectMap = {};
    let totalDefects = 0;

    this.data.forEach((item) => {
      const reason = (item?.Reason || item?.reason || "").trim();
      if (reason) {
        if (!defectMap[reason]) {
          defectMap[reason] = {
            reason,
            count: 0,
            total: 0,
            passed: 0,
            rejected: 0,
            rework: 0,
          };
        }

        if (this.isRejected(item)) {
          defectMap[reason].rejected++;
        } else if (this.isApproved(item)) {
          defectMap[reason].passed++;
        } else {
          defectMap[reason].rework++;
        }

        defectMap[reason].count++;
        defectMap[reason].total++;
        totalDefects++;
      }
    });

    return Object.values(defectMap)
      .map((item) => ({
        ...item,
        percentage:
          totalDefects > 0 ? +((item.total / totalDefects) * 100).toFixed(1) : 0,
        passRate:
          item.total > 0 ? +((item.passed / item.total) * 100).toFixed(1) : 0,
        rejectionRate:
          item.total > 0 ? +((item.rejected / item.total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }

  getTrendData(granularity = "month") {
    let mode = granularity;

    const start = normalizeDate(this.dateRange?.startDate);
    const end = normalizeDate(this.dateRange?.endDate);
    const hasRange = Boolean(start && end && isValid(start) && isValid(end));

    if (mode === "auto") {
      if (hasRange) {
        const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        mode = diffDays <= 35 ? "day" : "month";
      } else {
        mode = "month";
      }
    }

    // Determine reference year
    let targetYear = 2026;
    const dates = this.data
      .map((item) => normalizeDate(item?.Date || item?.date))
      .filter((d) => d && isValid(d));

    if (dates.length > 0) {
      targetYear = dates[0].getFullYear();
    } else if (start) {
      targetYear = start.getFullYear();
    }

    // 1. MONTH VIEW: Always generate all 12 months (Jan–Dec) by default
    if (mode === "month") {
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];

      const months = monthNames.map((name, idx) => {
        const mNum = String(idx + 1).padStart(2, "0");
        return {
          key: `${targetYear}-${mNum}`,
          label: name,
          month: name,
          fullLabel: `${name} ${targetYear}`,
          total: 0,
          passed: 0,
          rejected: 0,
          rework: 0,
          rejectionRate: 0,
          passRate: 0,
          hasData: false,
          mode: "month",
        };
      });

      const monthIndexMap = {};
      months.forEach((m, idx) => {
        monthIndexMap[m.key] = idx;
      });

      this.data.forEach((item) => {
        const d = normalizeDate(item?.Date || item?.date);
        if (d && isValid(d)) {
          const key = format(d, "yyyy-MM");
          const idx = monthIndexMap[key];
          if (idx !== undefined) {
            months[idx].hasData = true;
            if (this.isRejected(item)) {
              months[idx].rejected++;
            } else if (this.isApproved(item)) {
              months[idx].passed++;
            } else {
              months[idx].rework++;
            }
            months[idx].total++;
          }
        }
      });

      return months.map((m) => ({
        ...m,
        rejectionRate:
          m.total > 0 ? +((m.rejected / m.total) * 100).toFixed(1) : 0,
        passRate:
          m.total > 0 ? +((m.passed / m.total) * 100).toFixed(1) : 0,
      }));
    }

    // 2. DAY VIEW: Generate days in date interval or unique days
    let dayList = [];
    if (hasRange) {
      try {
        const intervalDays = eachDayOfInterval({
          start: startOfDay(start),
          end: startOfDay(end),
        });
        dayList = intervalDays.map((d) => ({
          key: format(d, "yyyy-MM-dd"),
          label: format(d, "dd MMM"),
          month: format(d, "dd MMM"),
          fullLabel: format(d, "dd MMM yyyy"),
          rawDate: d,
          total: 0,
          passed: 0,
          rejected: 0,
          rework: 0,
          rejectionRate: 0,
          passRate: 0,
          hasData: false,
          mode: "day",
        }));
      } catch {
        dayList = [];
      }
    }

    const dayMap = {};
    dayList.forEach((item) => {
      dayMap[item.key] = item;
    });

    this.data.forEach((item) => {
      const d = normalizeDate(item?.Date || item?.date);
      if (d && isValid(d)) {
        const key = format(d, "yyyy-MM-dd");
        if (!dayMap[key]) {
          dayMap[key] = {
            key,
            label: format(d, "dd MMM"),
            month: format(d, "dd MMM"),
            fullLabel: format(d, "dd MMM yyyy"),
            rawDate: d,
            total: 0,
            passed: 0,
            rejected: 0,
            rework: 0,
            hasData: false,
            mode: "day",
          };
        }

        dayMap[key].hasData = true;
        if (this.isRejected(item)) {
          dayMap[key].rejected++;
        } else if (this.isApproved(item)) {
          dayMap[key].passed++;
        } else {
          dayMap[key].rework++;
        }
        dayMap[key].total++;
      }
    });

    return Object.values(dayMap)
      .sort((a, b) => (a.key > b.key ? 1 : -1))
      .map((item) => ({
        ...item,
        rejectionRate:
          item.total > 0 ? +((item.rejected / item.total) * 100).toFixed(1) : 0,
        passRate:
          item.total > 0 ? +((item.passed / item.total) * 100).toFixed(1) : 0,
      }));
  }

  getMonthlyRejectionTrend(granularity = "auto") {
    return this.getTrendData(granularity);
  }

  getQCDisposition() {
    const { passedCount, rejectedCount, totalInspected } =
      this.getKpiMetrics();

    if (totalInspected === 0) return [];

    return [
      {
        name: "Passed",
        value: passedCount,
        percentage: +((passedCount / totalInspected) * 100).toFixed(1),
        color: "#10b981",
      },
      {
        name: "Rejected",
        value: rejectedCount,
        percentage: +((rejectedCount / totalInspected) * 100).toFixed(1),
        color: "#ef4444",
      },
    ].filter((item) => item.value > 0);
  }

  getSkuBatchAnalysis() {
    const skuMap = {};

    this.data.forEach((item) => {
      const sku = (item?.["orderno/sku"] || item?.orderno || "Other").trim();
      if (!skuMap[sku]) {
        skuMap[sku] = {
          sku,
          customer: item?.["Customer name"] || item?.customer || "—",
          total: 0,
          passed: 0,
          rejected: 0,
          rework: 0,
        };
      }

      if (this.isRejected(item)) {
        skuMap[sku].rejected++;
      } else if (this.isApproved(item)) {
        skuMap[sku].passed++;
      } else {
        skuMap[sku].rework++;
      }
      skuMap[sku].total++;
    });

    return Object.values(skuMap)
      .map((item) => ({
        ...item,
        rejectionRate:
          item.total > 0 ? +((item.rejected / item.total) * 100).toFixed(1) : 0,
        passRate:
          item.total > 0 ? +((item.passed / item.total) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }
}

export default QcRejectAnalytics;
