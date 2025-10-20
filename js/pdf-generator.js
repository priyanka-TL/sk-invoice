// PDF Generator Module
// Handles invoice template rendering and PDF generation using html2pdf.js

class PDFGenerator {
    constructor(invoiceManager) {
        this.invoiceManager = invoiceManager;
    }

    // Get inline styles for PDF generation
    getInlineStyles(template = 'template1') {
        return `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                .invoice-template {
                    font-family: 'Helvetica', Arial, sans-serif;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                    background: white;
                    color: #1e293b;
                }
                
                .invoice-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #1e293b;
                }
                
                .invoice-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #4f46e5;
                }
                
                .invoice-info-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                
                .info-block h4 {
                    font-size: 0.875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #64748b;
                    margin-bottom: 0.5rem;
                }
                
                .info-block p {
                    margin-bottom: 0.25rem;
                    font-size: 0.875rem;
                }
                
                .invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 2rem;
                }
                
                .invoice-table th,
                .invoice-table td {
                    padding: 0.75rem;
                    text-align: left;
                    border-bottom: 1px solid #e2e8f0;
                }
                
                .invoice-table th {
                    background: #f8fafc;
                    font-weight: 600;
                    font-size: 0.875rem;
                    text-transform: uppercase;
                }
                
                .invoice-table td {
                    font-size: 0.875rem;
                }
                
                .invoice-table th:last-child,
                .invoice-table td:last-child {
                    text-align: right;
                }
                
                .invoice-summary {
                    margin-left: auto;
                    max-width: 300px;
                }
                
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    font-size: 0.875rem;
                }
                
                .summary-row.total {
                    border-top: 2px solid #1e293b;
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #4f46e5;
                    padding-top: 0.75rem;
                    margin-top: 0.5rem;
                }
                
                .invoice-notes {
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px solid #e2e8f0;
                }
                
                .invoice-notes h4 {
                    font-size: 0.875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #64748b;
                    margin-bottom: 0.5rem;
                }
                
                .invoice-notes p {
                    font-size: 0.875rem;
                    color: #64748b;
                    white-space: pre-wrap;
                }
                
                /* Template 1 - Classic */
                .template1 .invoice-header {
                    border-bottom: 3px solid #000;
                }
                
                .template1 .invoice-title {
                    color: #000;
                }
                
                .template1 .invoice-table th {
                    background: #000;
                    color: white;
                }
                
                /* Template 2 - Modern */
                .template2 .invoice-header {
                    border-bottom: 3px solid #4f46e5;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1.5rem;
                    margin: -2rem -2rem 2rem -2rem;
                }
                
                .template2 .invoice-title {
                    color: white;
                }
                
                .template2 .invoice-info-section .info-block h4 {
                    color: #4f46e5;
                }
                
                .template2 .invoice-table th {
                    background: #4f46e5;
                    color: white;
                }
                
                /* Template 3 - Minimal */
                .template3 {
                    color: #333;
                }
                
                .template3 .invoice-header {
                    border-bottom: 1px solid #e0e0e0;
                }
                
                .template3 .invoice-title {
                    color: #666;
                    font-weight: 300;
                    font-size: 2.5rem;
                }
                
                .template3 .invoice-table th {
                    background: transparent;
                    border-bottom: 2px solid #333;
                    color: #333;
                }
                
                .template3 .invoice-table td {
                    border-bottom: 1px solid #e0e0e0;
                }
                
                /* Template 4 - Minimal Yellow & Black */
                .template4 {
                    color: #333;
                }
                
                .template4 .invoice-header {
                    background: #FFD700;
                    border-bottom: 3px solid #000;
                    padding: 1.5rem;
                    margin: -2rem -2rem 2rem -2rem;
                }
                
                .template4 .invoice-title {
                    color: #000;
                    font-weight: 600;
                    font-size: 2.5rem;
                }
                
                .template4 .invoice-table th {
                    background: #000;
                    color: #FFD700;
                    padding: 12px 10px;
                    font-weight: 600;
                }
                
                .template4 .invoice-table td {
                    border-bottom: 1px solid #e0e0e0;
                }
                
                .template4 .summary-row.total {
                    background: #FFD700;
                    color: #000;
                    padding: 15px;
                    border-radius: 4px;
                    font-weight: 700;
                }
            </style>
        `;
    }

    // Generate invoice HTML from template
    generateInvoiceHTML(invoice, template = 'template1', includeStyles = false) {
        const currencySymbol = this.invoiceManager.getCurrencySymbol(invoice.currency);
        const { subtotal, tax, total } = this.calculateTotals(invoice);
        
        let html = '';
        
        // Add inline styles if requested (for PDF generation)
        if (includeStyles) {
            html += this.getInlineStyles(template);
        }
        
        html += `<div class="invoice-template ${template}">`;
        
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
                ${(invoice.advancePayment || 0) > 0 ? `
                <div class="summary-row">
                    <span>Advance Payment:</span>
                    <span>-${currencySymbol}${(invoice.advancePayment || 0).toFixed(2)}</span>
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
        const total = subtotal + tax - invoice.discount - (invoice.advancePayment || 0);
        return { subtotal, tax, total };
    }

    // Generate and download PDF
    async generatePDF(invoice, template = 'template1') {
        console.log('Starting PDF generation for invoice:', invoice.invoiceNumber);
        console.log('Using template:', template);
        
        // Generate HTML with inline styles for PDF
        const html = this.generateInvoiceHTML(invoice, template, true);
        
        // Create temporary container with proper visibility
        const container = document.createElement('div');
        container.innerHTML = html;
        container.style.position = 'fixed';
        container.style.top = '-10000px';
        container.style.left = '0';
        container.style.width = '800px';
        container.style.background = 'white';
        container.style.zIndex = '-1';
        document.body.appendChild(container);
        
        console.log('Container added to DOM, waiting for styles to render...');
        
        // Wait for styles and fonts to load (important for proper rendering)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // PDF options
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `${invoice.invoiceNumber}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                letterRendering: true,
                logging: false,
                backgroundColor: '#ffffff'
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };
        
        try {
            console.log('Generating PDF with html2pdf...');
            
            // Generate PDF
            await html2pdf().set(opt).from(container).save();
            
            console.log('PDF generated successfully!');
            
            // Clean up
            document.body.removeChild(container);
            
            return true;
        } catch (error) {
            console.error('PDF generation error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                invoice: invoice.invoiceNumber,
                template: template
            });
            
            // Clean up even on error
            if (container && container.parentNode) {
                document.body.removeChild(container);
            }
            
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
