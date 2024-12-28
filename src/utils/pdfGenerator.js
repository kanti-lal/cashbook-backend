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
                </div>
                <div class="summary-item">
                  <h3>Total OUT (-)</h3>
                  <p style="color: #dc2626; font-size: 18px; font-weight: bold;">₹${totalOut.toFixed(
                    2
                  )}</p>
                </div>
                <div class="summary-item">
                  <h3>Net Balance</h3>
                  <p style="color: #9333ea; font-size: 18px; font-weight: bold;">₹${(
                    totalIn - totalOut
                  ).toFixed(2)}</p>
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
                  <h3>You'll Get</h3>
                  <p class="get-amount">₹${totalGet.toFixed(2)}</p>
                </div>
                <div class="summary-item">
                  <h3>You'll Give</h3>
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
                  <th>You'll Get</th>
                  <th>You'll Give</th>
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
    if (transaction.party) {
      return transaction.party.name || transaction.partyName || "N/A";
    }
    return transaction.partyName || "N/A";
  }

  // Helper method to get party type
  static _getPartyType(transaction) {
    if (transaction.party) {
      return transaction.party.type || transaction.partyType || "N/A";
    }
    return transaction.partyType || "N/A";
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
}
