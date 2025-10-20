// PDF Generator Module
// Handles invoice template rendering and PDF generation using html2pdf.js

class PDFGenerator {
    constructor(invoiceManager) {
        this.invoiceManager = invoiceManager;
    }

    // Generate invoice HTML from template
    generateInvoiceHTML(invoice, template = 'template1') {
        const currencySymbol = this.invoiceManager.getCurrencySymbol(invoice.currency);
        const { subtotal, tax, total } = this.calculateTotals(invoice);
        
        let html = `<div class="invoice-template ${template}">`;
        
        // Different header styles based on template
        if (template === 'template1') {
            html += this.generateClassicHeader(invoice);
        } else if (template === 'template2') {
            html += this.generateModernHeader(invoice);
        } else {
            html += this.generateMinimalHeader(invoice);
        }
        
        // Invoice info section
        html += `
            <div class="invoice-info-section">
                <div class="info-block">
                    <h4>From</h4>
                    <p><strong>${invoice.business.name}</strong></p>
                    ${invoice.business.email ? `<p>${invoice.business.email}</p>` : ''}
                    ${invoice.business.phone ? `<p>${invoice.business.phone}</p>` : ''}
                    ${invoice.business.address ? `<p>${invoice.business.address.replace(/\n/g, '<br>')}</p>` : ''}
                </div>
                <div class="info-block">
                    <h4>Bill To</h4>
                    <p><strong>${invoice.client.name}</strong></p>
                    ${invoice.client.email ? `<p>${invoice.client.email}</p>` : ''}
                    ${invoice.client.address ? `<p>${invoice.client.address.replace(/\n/g, '<br>')}</p>` : ''}
                </div>
            </div>
        `;
        
        // Invoice details
        html += `
            <div class="invoice-info-section">
                <div class="info-block">
                    <h4>Invoice Details</h4>
                    <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
                    <p><strong>Date:</strong> ${this.invoiceManager.formatDate(invoice.date)}</p>
                    <p><strong>Due Date:</strong> ${this.invoiceManager.formatDate(invoice.dueDate)}</p>
                </div>
                <div class="info-block"></div>
            </div>
        `;
        
        // Line items table
        html += `
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        invoice.items.forEach(item => {
            html += `
                <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>${currencySymbol}${item.rate.toFixed(2)}</td>
                    <td>${currencySymbol}${item.amount.toFixed(2)}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        // Summary
        html += `
            <div class="invoice-summary">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>${currencySymbol}${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Tax (${invoice.taxRate}%):</span>
                    <span>${currencySymbol}${tax.toFixed(2)}</span>
                </div>
                ${invoice.discount > 0 ? `
                <div class="summary-row">
                    <span>Discount:</span>
                    <span>-${currencySymbol}${invoice.discount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="summary-row total">
                    <span>Total:</span>
                    <span>${currencySymbol}${total.toFixed(2)}</span>
                </div>
            </div>
        `;
        
        // Notes
        if (invoice.notes) {
            html += `
                <div class="invoice-notes">
                    <h4>Notes / Terms</h4>
                    <p>${invoice.notes.replace(/\n/g, '<br>')}</p>
                </div>
            `;
        }
        
        html += `</div>`;
        
        return html;
    }

    // Generate classic header
    generateClassicHeader(invoice) {
        return `
            <div class="invoice-header">
                <div>
                    <div class="invoice-title">INVOICE</div>
                </div>
                <div>
                    <p style="text-align: right; margin: 0;">
                        <strong>${invoice.business.name}</strong>
                    </p>
                </div>
            </div>
        `;
    }

    // Generate modern header
    generateModernHeader(invoice) {
        return `
            <div class="invoice-header">
                <div>
                    <div class="invoice-title">INVOICE</div>
                    <p style="margin: 0; opacity: 0.9;">${invoice.business.name}</p>
                </div>
                <div>
                    <p style="text-align: right; margin: 0; font-size: 1.5rem; font-weight: 700;">
                        ${invoice.invoiceNumber}
                    </p>
                </div>
            </div>
        `;
    }

    // Generate minimal header
    generateMinimalHeader(invoice) {
        return `
            <div class="invoice-header">
                <div>
                    <div class="invoice-title">Invoice</div>
                </div>
                <div>
                    <p style="text-align: right; margin: 0; font-size: 0.875rem; color: #666;">
                        ${invoice.invoiceNumber}
                    </p>
                </div>
            </div>
        `;
    }

    // Calculate totals
    calculateTotals(invoice) {
        const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
        const tax = (subtotal * invoice.taxRate) / 100;
        const total = subtotal + tax - invoice.discount;
        return { subtotal, tax, total };
    }

    // Generate and download PDF
    async generatePDF(invoice, template = 'template1') {
        const html = this.generateInvoiceHTML(invoice, template);
        
        // Create temporary container
        const container = document.createElement('div');
        container.innerHTML = html;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        document.body.appendChild(container);
        
        // PDF options
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `${invoice.invoiceNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                letterRendering: true
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };
        
        try {
            // Generate PDF
            await html2pdf().set(opt).from(container).save();
            
            // Clean up
            document.body.removeChild(container);
            
            return true;
        } catch (error) {
            console.error('PDF generation error:', error);
            document.body.removeChild(container);
            throw error;
        }
    }

    // Generate preview HTML
    generatePreview(invoice, template = 'template1') {
        return this.generateInvoiceHTML(invoice, template);
    }

    // Print invoice
    printInvoice(invoice, template = 'template1') {
        const html = this.generateInvoiceHTML(invoice, template);
        
        // Create print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Invoice - ${invoice.invoiceNumber}</title>
                <link rel="stylesheet" href="css/styles.css">
                <style>
                    body {
                        margin: 0;
                        padding: 20px;
                        background: white;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                    }
                </style>
            </head>
            <body>
                ${html}
                <script>
                    window.onload = function() {
                        window.print();
                        // Close window after printing (or if cancelled)
                        setTimeout(function() {
                            window.close();
                        }, 100);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    }
}

// Export for use in other modules
window.PDFGenerator = PDFGenerator;
