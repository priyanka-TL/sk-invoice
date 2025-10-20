// Main Application Module
// Handles UI interactions and coordinates between invoice and PDF modules

class InvoiceApp {
    constructor() {
        this.invoiceManager = new InvoiceManager();
        this.pdfGenerator = new PDFGenerator(this.invoiceManager);
        this.init();
    }

    init() {
        // Initialize with new invoice
        const newInvoice = this.invoiceManager.newInvoice();
        this.invoiceManager.loadToForm(newInvoice);
        
        // Ensure at least one line item is present
        const lineItems = document.querySelectorAll('.line-item');
        if (lineItems.length === 0) {
            this.invoiceManager.addLineItemToForm();
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initial calculation
        this.invoiceManager.calculateTotals();
    }

    setupEventListeners() {
        // New Invoice Button
        document.getElementById('newInvoiceBtn').addEventListener('click', () => {
            this.handleNewInvoice();
        });

        // Saved Invoices Button
        document.getElementById('savedInvoicesBtn').addEventListener('click', () => {
            this.showSavedInvoices();
        });

        // Add Line Item Button
        document.getElementById('addItemBtn').addEventListener('click', () => {
            this.invoiceManager.addLineItemToForm();
        });

        // Preview Button
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.showPreview();
        });

        // Save Button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveInvoice();
        });

        // Download PDF Button
        document.getElementById('downloadPdfBtn').addEventListener('click', () => {
            this.downloadPDF();
        });

        // Print Button
        document.getElementById('printBtn').addEventListener('click', () => {
            this.printInvoice();
        });

        // Close Preview Button
        document.getElementById('closePreviewBtn').addEventListener('click', () => {
            this.closePreview();
        });

        // Close Saved List Button
        document.getElementById('closeSavedListBtn').addEventListener('click', () => {
            this.closeSavedList();
        });

        // Tax and Discount inputs
        document.getElementById('taxRate').addEventListener('input', () => {
            this.invoiceManager.calculateTotals();
        });

        document.getElementById('discount').addEventListener('input', () => {
            this.invoiceManager.calculateTotals();
        });

        document.getElementById('advancePayment').addEventListener('input', () => {
            this.invoiceManager.calculateTotals();
        });

        // Currency change
        document.getElementById('currency').addEventListener('change', () => {
            this.invoiceManager.calculateTotals();
        });

        // Modal buttons
        document.getElementById('modalCancel').addEventListener('click', () => {
            this.hideModal();
        });

        // Form validation
        document.getElementById('invoiceForm').addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    handleNewInvoice() {
        if (this.hasUnsavedChanges()) {
            this.showModal(
                'Create New Invoice?',
                'You have unsaved changes. Are you sure you want to create a new invoice?',
                () => {
                    this.createNewInvoice();
                }
            );
        } else {
            this.createNewInvoice();
        }
    }

    createNewInvoice() {
        const newInvoice = this.invoiceManager.newInvoice();
        this.invoiceManager.loadToForm(newInvoice);
        this.showNotification('New invoice created', 'success');
        this.hideModal();
    }

    hasUnsavedChanges() {
        // Simple check - in a real app, you'd compare current form state with saved state
        const invoiceNumber = document.getElementById('invoiceNumber').value;
        const clientName = document.getElementById('clientName').value;
        return invoiceNumber || clientName;
    }

    showPreview() {
        if (!this.validateForm()) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const invoice = this.invoiceManager.loadFromForm();
        const template = document.getElementById('templateSelect').value;
        const previewHTML = this.pdfGenerator.generatePreview(invoice, template);
        
        document.getElementById('previewContent').innerHTML = previewHTML;
        document.getElementById('invoiceEditor').classList.add('hidden');
        document.getElementById('savedInvoicesList').classList.add('hidden');
        document.getElementById('invoicePreview').classList.remove('hidden');
        
        window.scrollTo(0, 0);
    }

    closePreview() {
        document.getElementById('invoicePreview').classList.add('hidden');
        document.getElementById('invoiceEditor').classList.remove('hidden');
    }

    saveInvoice() {
        if (!this.validateForm()) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            const invoice = this.invoiceManager.saveInvoice();
            this.showNotification(`Invoice ${invoice.invoiceNumber} saved successfully!`, 'success');
        } catch (error) {
            console.error('Error saving invoice:', error);
            this.showNotification('Error saving invoice. Please try again.', 'error');
        }
    }

    async downloadPDF() {
        if (!this.validateForm()) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Show loading overlay
        const loadingOverlay = this.showLoadingOverlay('Generating PDF...');
        
        try {
            const invoice = this.invoiceManager.loadFromForm();
            const template = document.getElementById('templateSelect').value;
            
            console.log('Initiating PDF download for invoice:', invoice.invoiceNumber);
            
            // Generate PDF
            await this.pdfGenerator.generatePDF(invoice, template);
            
            // Hide loading overlay
            this.hideLoadingOverlay(loadingOverlay);
            
            this.showNotification('PDF downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error generating PDF:', error);
            console.error('Error details:', error.message);
            
            // Hide loading overlay
            this.hideLoadingOverlay(loadingOverlay);
            
            this.showNotification('Failed to generate PDF. Please check the console for details and try again.', 'error');
        }
    }

    printInvoice() {
        if (!this.validateForm()) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            const invoice = this.invoiceManager.loadFromForm();
            const template = document.getElementById('templateSelect').value;
            this.pdfGenerator.printInvoice(invoice, template);
        } catch (error) {
            console.error('Error printing invoice:', error);
            this.showNotification('Error printing invoice. Please try again.', 'error');
        }
    }

    showSavedInvoices() {
        const invoices = this.invoiceManager.getAllInvoices();
        const listContainer = document.getElementById('invoicesList');
        
        if (invoices.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No saved invoices yet</p>
                    <p style="font-size: 0.875rem;">Create and save your first invoice to see it here.</p>
                </div>
            `;
        } else {
            // Sort by date (newest first)
            invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            listContainer.innerHTML = invoices.map(invoice => {
                const totals = this.calculateInvoiceTotals(invoice);
                const currencySymbol = this.invoiceManager.getCurrencySymbol(invoice.currency);
                
                return `
                    <div class="invoice-card" data-invoice-id="${invoice.id}">
                        <h4>${invoice.invoiceNumber}</h4>
                        <p><strong>Client:</strong> ${invoice.client.name}</p>
                        <p><strong>Date:</strong> ${this.invoiceManager.formatDate(invoice.date)}</p>
                        <p><strong>Amount:</strong> ${currencySymbol}${totals.total.toFixed(2)}</p>
                        <div class="invoice-card-actions">
                            <button class="btn btn-small btn-info load-invoice-btn" data-invoice-id="${invoice.id}">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-small btn-success download-invoice-btn" data-invoice-id="${invoice.id}">
                                <i class="fas fa-download"></i> PDF
                            </button>
                            <button class="btn btn-small btn-danger delete-invoice-btn" data-invoice-id="${invoice.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Add event listeners to buttons
            document.querySelectorAll('.load-invoice-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.invoiceId;
                    this.loadInvoice(id);
                });
            });
            
            document.querySelectorAll('.download-invoice-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.invoiceId;
                    this.downloadSavedInvoice(id);
                });
            });
            
            document.querySelectorAll('.delete-invoice-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btn.dataset.invoiceId;
                    this.deleteInvoice(id);
                });
            });
        }
        
        document.getElementById('invoiceEditor').classList.add('hidden');
        document.getElementById('invoicePreview').classList.add('hidden');
        document.getElementById('savedInvoicesList').classList.remove('hidden');
        
        window.scrollTo(0, 0);
    }

    closeSavedList() {
        document.getElementById('savedInvoicesList').classList.add('hidden');
        document.getElementById('invoiceEditor').classList.remove('hidden');
    }

    loadInvoice(id) {
        const invoice = this.invoiceManager.getInvoiceById(id);
        if (invoice) {
            this.invoiceManager.loadToForm(invoice);
            this.closeSavedList();
            this.showNotification('Invoice loaded', 'success');
        }
    }

    async downloadSavedInvoice(id) {
        const invoice = this.invoiceManager.getInvoiceById(id);
        if (invoice) {
            // Show loading overlay
            const loadingOverlay = this.showLoadingOverlay('Generating PDF...');
            
            try {
                console.log('Downloading saved invoice:', invoice.invoiceNumber);
                
                await this.pdfGenerator.generatePDF(invoice, invoice.template);
                
                // Hide loading overlay
                this.hideLoadingOverlay(loadingOverlay);
                
                this.showNotification('PDF downloaded successfully!', 'success');
            } catch (error) {
                console.error('Error generating PDF:', error);
                console.error('Error details:', error.message);
                
                // Hide loading overlay
                this.hideLoadingOverlay(loadingOverlay);
                
                this.showNotification('Failed to generate PDF. Please check the console for details and try again.', 'error');
            }
        }
    }

    deleteInvoice(id) {
        const invoice = this.invoiceManager.getInvoiceById(id);
        if (invoice) {
            this.showModal(
                'Delete Invoice?',
                `Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`,
                () => {
                    this.invoiceManager.deleteInvoice(id);
                    this.showSavedInvoices();
                    this.showNotification('Invoice deleted', 'success');
                    this.hideModal();
                }
            );
        }
    }

    calculateInvoiceTotals(invoice) {
        const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
        const tax = (subtotal * invoice.taxRate) / 100;
        const total = subtotal + tax - invoice.discount - (invoice.advancePayment || 0);
        return { subtotal, tax, total };
    }

    validateForm() {
        const requiredFields = [
            'businessName',
            'businessEmail',
            'clientName',
            'invoiceNumber',
            'invoiceDate'
        ];
        
        for (const fieldId of requiredFields) {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.focus();
                return false;
            }
        }
        
        // Check if at least one line item exists
        const lineItems = document.querySelectorAll('.line-item');
        if (lineItems.length === 0) {
            this.showNotification('Please add at least one line item', 'error');
            return false;
        }
        
        return true;
    }

    showModal(title, message, onConfirm) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('modal').classList.remove('hidden');
        
        const confirmBtn = document.getElementById('modalConfirm');
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            if (onConfirm) onConfirm();
            this.hideModal();
        });
    }

    hideModal() {
        document.getElementById('modal').classList.add('hidden');
    }

    showLoadingOverlay(message = 'Loading...') {
        // Create loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 2rem 3rem;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        `;
        
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        spinner.style.cssText = `
            border: 4px solid #f3f4f6;
            border-top: 4px solid #4f46e5;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        `;
        
        const text = document.createElement('p');
        text.textContent = message;
        text.style.cssText = `
            font-size: 1rem;
            color: #1e293b;
            font-weight: 600;
            margin: 0;
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        if (!document.querySelector('style[data-loading-styles]')) {
            style.setAttribute('data-loading-styles', 'true');
            document.head.appendChild(style);
        }
        
        content.appendChild(spinner);
        content.appendChild(text);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        return overlay;
    }

    hideLoadingOverlay(overlay) {
        if (overlay && overlay.parentNode) {
            overlay.style.animation = 'fadeOut 0.3s ease';
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) {
                    document.body.removeChild(overlay);
                }
            }, 300);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 6px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            font-size: 0.875rem;
        `;
        notification.textContent = message;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        if (!document.querySelector('style[data-notification-styles]')) {
            style.setAttribute('data-notification-styles', 'true');
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.invoiceApp = new InvoiceApp();
});
