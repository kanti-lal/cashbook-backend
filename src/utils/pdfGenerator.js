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
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .summary-box {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
              }
              .summary-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th { background-color: #f8f9fa; }
              .amount { text-align: right; }
              .footer { margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Cashbook Statement</h2>
              <p>${new Date().toLocaleDateString()}</p>
            </div>

            <div class="summary-box">
              <div class="summary-grid">
                <div>
                  <h3>Total IN (+)</h3>
                  <p>₹${totalIn.toFixed(2)}</p>
                </div>
                <div>
                  <h3>Total OUT (-)</h3>
                  <p>₹${totalOut.toFixed(2)}</p>
                </div>
                <div>
                  <h3>Net Balance</h3>
                  <p>₹${(totalIn - totalOut).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Date</th>
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
              Report Generated: ${new Date().toLocaleString()}
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

  static async generatePartyLedgerPDF(
    transactions,
    partyInfo,
    businessInfo,
    res
  ) {
    const browser = await puppeteer.launch();
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
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .summary-box {
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 20px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th { background-color: #f8f9fa; }
            .amount { text-align: right; }
            .footer { margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${partyInfo.type} List Report</h2>
            <p>As of Today - ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="summary-box">
            <div class="summary-grid">
              <div>
                <h3>You'll Get</h3>
                <p>₹${totalGet.toFixed(2)}</p>
              </div>
              <div>
                <h3>You'll Give</h3>
                <p>₹${totalGive.toFixed(2)}</p>
              </div>
              <div>
                <h3>Net Balance</h3>
                <p>₹${(totalGive - totalGet).toFixed(2)} Cr</p>
              </div>
            </div>
          </div>

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
              ${this._generatePartyRows(transactions, partyInfo)}
            </tbody>
          </table>

          <div class="footer">
            Report Generated: ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    await page.setContent(html);
    const pdf = await page.pdf({
      format: "A4",
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await browser.close();

    res.contentType("application/pdf");
    res.send(pdf);
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

        return `
          <tr>
            <td>${date}</td>
            <td class="amount">₹${dayIn.toFixed(2)}</td>
            <td class="amount">₹${dayOut.toFixed(2)}</td>
            <td class="amount">₹${dailyBalance.toFixed(2)}</td>
            <td class="amount">₹${runningBalance.toFixed(2)}</td>
          </tr>
        `;
      })
      .join("");
  }

  static _generatePartyRows(transactions, partyInfo) {
    return `
      <tr>
        <td>${partyInfo.name}</td>
        <td>${partyInfo.phone || ""}</td>
        <td class="amount">₹${transactions
          .filter((t) => t.type === "IN")
          .reduce((sum, t) => sum + t.amount, 0)
          .toFixed(2)}</td>
        <td class="amount">₹${transactions
          .filter((t) => t.type === "OUT")
          .reduce((sum, t) => sum + t.amount, 0)
          .toFixed(2)}</td>
        <td>${transactions[0]?.date || ""}</td>
      </tr>
    `;
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
