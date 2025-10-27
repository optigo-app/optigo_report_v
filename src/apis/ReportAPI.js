class ReportAPI {
    constructor() {
      if (ReportAPI.instance) return ReportAPI.instance;
      this.baseURL = "http://nzen/jo/api-lib/App/CentralApi";
      this.defaultBody = { Token: "", SpNo: "", SpVer: "", ReqData: "" };
      ReportAPI.instance = this;
    }
  
    initialize({ baseURL, defaultBody } = {}) {
      if (baseURL) this.baseURL = baseURL;
      if (defaultBody) {
        this.defaultBody = { ...this.defaultBody, ...defaultBody };
      }
    }
  
    async request(evt, params = {}) {
      const reqDataObj = {
        Token: this.defaultBody.Token,
        Evt: evt,
        SV: this.defaultBody?.ReqData[0]?.SV || "",
        ...params,
       ...(params.jobno ? { jobno: params.jobno } : {}),
      };
      const body = {
        ...this.defaultBody,
        ReqData: JSON.stringify([reqDataObj]),
      };
      const res = await fetch(this.baseURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Failed to call ${evt}`);
      return res.json();
    }
  }
  
  export default new ReportAPI(); // Always same instance
  