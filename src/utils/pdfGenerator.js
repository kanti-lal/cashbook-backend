import puppeteer from "puppeteer";

export class PDFGenerator {
  static async generateTransactionsPDF(transactions, businessInfo) {
    // Launch browser with specific configurations
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--font-render-hinting=none",
      ],
    });

    try {
      const page = await browser.newPage();

      // Set content security policy
      await page.setExtraHTTPHeaders({
        "Content-Security-Policy": "default-src 'self' 'unsafe-inline'",
      });

      const totalIn = transactions
        .filter((t) => t.type === "IN")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalOut = transactions
        .filter((t) => t.type === "OUT")
        .reduce((sum, t) => sum + t.amount, 0);

      // Add cash and online calculations
      const cashIn = transactions
        .filter(
          (t) => t.type === "IN" && t.paymentMode?.toLowerCase() === "cash"
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const cashOut = transactions
        .filter(
          (t) => t.type === "OUT" && t.paymentMode?.toLowerCase() === "cash"
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const onlineIn = transactions
        .filter(
          (t) => t.type === "IN" && t.paymentMode?.toLowerCase() === "online"
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const onlineOut = transactions
        .filter(
          (t) => t.type === "OUT" && t.paymentMode?.toLowerCase() === "online"
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; font-size: 14px; }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                background-color: #9333ea;
                color: white;
                padding: 20px;
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .business-name {
                font-size: 24px;
                font-weight: bold;
              }
              .header-right {
                text-align: right;
              }
              .summary-box {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .summary-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
              }
              .summary-item {
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                text-align: center;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              th, td {
                border: 1px solid #ddd;
                padding: 10px;
                text-align: left;
                font-size: 12px;
              }
              th { 
                background-color: #9333ea15; 
                color: #9333ea;
              }
              tr:nth-child(even) { background-color: #f8f9fa; }
              tr:hover { background-color: #f3f4f6; }
              .amount { text-align: right; }
              .footer { 
                margin-top: 20px; 
                color: #666; 
                font-size: 11px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="business-name">${
                businessInfo?.name || "Business Name"
              }</div>
              <div class="header-right">
                <h2>Cashbook Statement</h2>
                <p>${new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div class="summary-box">
              <div class="summary-grid">
                <div class="summary-item">
                  <h3>Total IN (+)</h3>
                  <p style="color: #16a34a; font-size: 18px; font-weight: bold;">₹${totalIn.toFixed(
                    2
                  )}</p>
                  <div style="font-size: 12px; color: #666; margin-top: 5px;">
                    Cash: ₹${cashIn.toFixed(2)}<br>
                    Online: ₹${onlineIn.toFixed(2)}
                  </div>
                </div>
                <div class="summary-item">
                  <h3>Total OUT (-)</h3>
                  <p style="color: #dc2626; font-size: 18px; font-weight: bold;">₹${totalOut.toFixed(
                    2
                  )}</p>
                  <div style="font-size: 12px; color: #666; margin-top: 5px;">
                    Cash: ₹${cashOut.toFixed(2)}<br>
                    Online: ₹${onlineOut.toFixed(2)}
                  </div>
                </div>
                <div class="summary-item">
                  <h3>Net Balance</h3>
                  <p style="color: #9333ea; font-size: 18px; font-weight: bold;">₹${(
                    totalIn - totalOut
                  ).toFixed(2)}</p>
                  <div style="font-size: 12px; color: #666; margin-top: 5px;">
                    Cash: ₹${(cashIn - cashOut).toFixed(2)}<br>
                    Online: ₹${(onlineIn - onlineOut).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Total IN</th>
                  <th>Total OUT</th>
                  <th>Daily Balance</th>
                  <th>Total Balance</th>
                </tr>
              </thead>
              <tbody>
                ${this._generateTransactionRows(transactions)}
              </tbody>
            </table>

            <div class="footer">
              <p>Report Generated: ${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `;

      // Set content with specific wait options
      await page.setContent(html, {
        waitUntil: ["load", "networkidle0"],
        timeout: 30000,
      });

      // Generate PDF with specific settings
      const buffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
        preferCSSPageSize: true,
        displayHeaderFooter: false,
      });

      return buffer;
    } finally {
      await browser.close();
    }
  }

  static async generatePartyLedgerPDF(transactions, partyInfo, businessInfo) {
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--font-render-hinting=none",
      ],
    });

    try {
      const page = await browser.newPage();

      const totalGet = transactions
        .filter((t) => t.type === "IN")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalGive = transactions
        .filter((t) => t.type === "OUT")
        .reduce((sum, t) => sum + t.amount, 0);

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                font-size: 14px;
                line-height: 1.6;
                color: #333;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                background-color: #9333ea;
                color: white;
                padding: 20px;
                border-radius: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .business-name {
                font-size: 24px;
                font-weight: bold;
              }
              .header-right {
                text-align: right;
              }
              .party-info {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
                border: 1px solid #e2e8f0;
              }
              .party-info h3 {
                margin: 0;
                color: #9333ea;
                font-size: 18px;
              }
              .party-details {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin-top: 15px;
              }
              .party-detail-item {
                font-size: 14px;
              }
              .summary-box {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
                background-color: white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .summary-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
              }
              .summary-item {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                border: 1px solid #e2e8f0;
              }
              .summary-item h3 {
                margin: 0 0 10px 0;
                color: #4b5563;
                font-size: 16px;
              }
              .summary-item p {
                margin: 0;
                font-size: 20px;
                font-weight: bold;
              }
              .get-amount { color: #16a34a; }
              .give-amount { color: #dc2626; }
              .net-amount { color: #9333ea; }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              th, td {
                border: 1px solid #e2e8f0;
                padding: 12px;
                text-align: left;
                font-size: 13px;
              }
              th { 
                background-color: #9333ea15;
                color: #9333ea;
                font-weight: 600;
              }
              tr:nth-child(even) { background-color: #f8f9fa; }
              tr:hover { background-color: #f3f4f6; }
              .amount { 
                text-align: right;
                font-family: monospace;
                font-size: 14px;
              }
              .footer { 
                margin-top: 30px; 
                color: #666; 
                font-size: 12px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
                padding-top: 20px;
              }
              .transaction-date {
                color: #666;
                font-size: 12px;
              }
              .status-badge {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
              }
              .status-completed {
                background-color: #dcfce7;
                color: #16a34a;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="business-name">${
                businessInfo?.name || "Business Name"
              }</div>
              <div class="header-right">
                <h2>${partyInfo.type} Ledger Statement</h2>
                <p>${new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div class="party-info">
              <h3>${partyInfo.type} Information</h3>
              <div class="party-details">
                <div class="party-detail-item">
                  <strong>Name:</strong> ${partyInfo.name}
                </div>
                <div class="party-detail-item">
                  <strong>Phone:</strong> ${partyInfo.phoneNumber || "N/A"}
                </div>
              </div>
            </div>

            <div class="summary-box">
              <div class="summary-grid">
                <div class="summary-item">
                  <h3>You Got</h3>
                  <p class="get-amount">₹${totalGet.toFixed(2)}</p>
                </div>
                <div class="summary-item">
                  <h3>You Gave</h3>
                  <p class="give-amount">₹${totalGive.toFixed(2)}</p>
                </div>
                <div class="summary-item">
                  <h3>Net Balance</h3>
                  <p class="net-amount">₹${(totalGet - totalGive).toFixed(
                    2
                  )}</p>
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>You Got</th>
                  <th>You Gave</th>
                  <th>Running Balance</th>
                </tr>
              </thead>
              <tbody>
                ${this._generateDetailedPartyRows(transactions)}
              </tbody>
            </table>

            <div class="footer">
              <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `;

      await page.setContent(html, {
        waitUntil: ["load", "networkidle0"],
        timeout: 30000,
      });

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
        preferCSSPageSize: true,
      });

      return pdf;
    } finally {
      await browser.close();
    }
  }

  static _generateTransactionRows(transactions) {
    let runningBalance = 0;
    const groupedByDate = this._groupTransactionsByDate(transactions);

    return Object.entries(groupedByDate)
      .map(([date, dayTransactions]) => {
        const dayIn = dayTransactions
          .filter((t) => t.type === "IN")
          .reduce((sum, t) => sum + t.amount, 0);
        const dayOut = dayTransactions
          .filter((t) => t.type === "OUT")
          .reduce((sum, t) => sum + t.amount, 0);
        const dailyBalance = dayIn - dayOut;
        runningBalance += dailyBalance;

        // Create rows for each transaction in the day
        return dayTransactions
          .map(
            (transaction) => `
          <tr>
            <td>${date}</td>
            <td>${this._getPartyName(transaction)}</td>
            <td>${this._getPartyType(transaction)}</td>
            <td class="amount">${
              transaction.type === "IN"
                ? `₹${transaction.amount.toFixed(2)}`
                : "-"
            }</td>
            <td class="amount">${
              transaction.type === "OUT"
                ? `₹${transaction.amount.toFixed(2)}`
                : "-"
            }</td>
            <td class="amount">₹${dailyBalance.toFixed(2)}</td>
            <td class="amount">₹${runningBalance.toFixed(2)}</td>
          </tr>
        `
          )
          .join("");
      })
      .join("");
  }

  // Helper method to get party name
  static _getPartyName(transaction) {
    return transaction.partyName || "N/A";
  }

  // Helper method to get party type
  static _getPartyType(transaction) {
    // if (transaction.party) {
    //   return transaction.party.type || transaction.partyType || "N/A";
    // }
    return transaction.paymentMode || transaction.Type || "N/A";
  }

  static _generateDetailedPartyRows(transactions) {
    let runningBalance = 0;
    return transactions
      .map((transaction) => {
        const amount = transaction.amount;
        if (transaction.type === "IN") {
          runningBalance += amount;
        } else {
          runningBalance -= amount;
        }

        return `
          <tr>
            <td class="transaction-date">
              ${new Date(transaction.date).toLocaleDateString()}
            </td>
            <td>${transaction.description || "No description"}</td>
            <td class="amount">${
              transaction.type === "IN" ? `₹${amount.toFixed(2)}` : "-"
            }</td>
            <td class="amount">${
              transaction.type === "OUT" ? `₹${amount.toFixed(2)}` : "-"
            }</td>
            <td class="amount" style="color: ${
              runningBalance >= 0 ? "#16a34a" : "#dc2626"
            }">
              ₹${Math.abs(runningBalance).toFixed(2)} ${
          runningBalance >= 0 ? "Dr" : "Cr"
        }
            </td>
          </tr>
        `;
      })
      .join("");
  }

  static _groupTransactionsByDate(transactions) {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {});
  }

  static async generateAllPartiesLedgerPDF(
    partiesData = [],
    businessInfo = {},
    partyType = "Customer"
  ) {
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--font-render-hinting=none",
      ],
    });

    try {
      const page = await browser.newPage();

      // Format date properly
      const currentDate = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      // Ensure partiesData is an array and contains valid data
      const parties = Array.isArray(partiesData) ? partiesData : [];

      // Calculate totals properly
      let totalGet = 0;
      let totalGive = 0;

      // Process each party's transactions
      parties.forEach((party) => {
        // Get the actual party data
        const partyData = party.party || party;
        const transactions = party.transactions || [];

        let partyGet = 0;
        let partyGive = 0;

        // Calculate from transactions
        transactions.forEach((transaction) => {
          if (transaction.type === "IN") {
            partyGet += Number(transaction.amount) || 0;
          } else if (transaction.type === "OUT") {
            partyGive += Number(transaction.amount) || 0;
          }
        });

        totalGet += partyGet;
        totalGive += partyGive;
      });

      const netBalance = totalGet - totalGive;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                font-size: 14px;
                line-height: 1.6;
                color: #333;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
              }
              .report-title {
                font-size: 24px;
                font-weight: normal;
                margin-bottom: 10px;
                color: #333;
              }
              .summary-box {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                display: flex;
                justify-content: space-between;
              }
              .summary-item {
                text-align: center;
                flex: 1;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f8f9fa;
                font-weight: normal;
              }
              .amount {
                text-align: right;
                font-family: monospace;
              }
              .get-amount { color: #16a34a; }
              .give-amount { color: #dc2626; }
              .net-amount { color: #9333ea; }
              .footer {
                margin-top: 20px;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="report-title">${partyType} List Report</div>
              <div>(As of Today - ${currentDate})</div>
            </div>

            <div class="summary-box">
              <div class="summary-item">
                <div>You'll Get</div>
                <div class="get-amount">₹${totalGet.toFixed(2)}</div>
              </div>
              <div class="summary-item">
                <div>You'll Give</div>
                <div class="give-amount">₹${totalGive.toFixed(2)}</div>
              </div>
              <div class="summary-item">
                <div>Net Balance</div>
                <div class="net-amount">₹${Math.abs(netBalance).toFixed(2)} ${
        netBalance >= 0 ? "Dr" : "Cr"
      }</div>
              </div>
            </div>

            <div>No. of ${partyType}: ${parties.length} (All)</div>

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Details</th>
                  <th>You'll Get</th>
                  <th>You'll Give</th>
                  <th>Collection Date</th>
                </tr>
              </thead>
              <tbody>
                ${
                  parties.length > 0
                    ? parties
                        .map((partyEntry) => {
                          console.log({ partyEntry });
                          // Get the actual party data
                          const party = partyEntry.info || partyEntry;
                          const transactions = partyEntry.transactions || [];

                          // Calculate individual party totals
                          let partyGet = 0;
                          let partyGive = 0;

                          transactions.forEach((transaction) => {
                            if (transaction.type === "IN") {
                              partyGet += Number(transaction.amount) || 0;
                            } else if (transaction.type === "OUT") {
                              partyGive += Number(transaction.amount) || 0;
                            }
                          });

                          return `
                    <tr>
                      <td>${party.name || "-"}</td>
                      <td>${party.phoneNumber || "-"}</td>
                      <td class="amount">${partyGet.toFixed(2)}</td>
                      <td class="amount">${partyGive.toFixed(2)}</td>
                      <td>${party.createdAt || "-"}</td>
                    </tr>
                  `;
                        })
                        .join("")
                    : `
                  <tr>
                    <td>N/A</td>
                    <td></td>
                    <td class="amount">0.00</td>
                    <td class="amount">0.00</td>
                    <td></td>
                  </tr>
                `
                }
                <tr style="background-color: #f8f9fa;">
                  <td colspan="2">Grand Total</td>
                  <td class="amount">${totalGet.toFixed(2)}</td>
                  <td class="amount">${totalGive.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              Report Generated: ${new Date().toLocaleString("en-IN")}
            </div>
          </body>
        </html>
      `;

      await page.setContent(html, {
        waitUntil: ["load", "networkidle0"],
        timeout: 30000,
      });

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
        preferCSSPageSize: true,
      });

      return pdf;
    } finally {
      await browser.close();
    }
  }
}
