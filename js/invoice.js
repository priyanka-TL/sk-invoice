// Invoice Data Management Module
// Handles invoice data structure, localStorage operations, and calculations

class InvoiceManager {
    constructor() {
        // Default business information
        this.defaultBusinessInfo = {
            name: 'SK Constructions and Engineering Solutions',
            email: '',
            phone: '7377377757',
            address: 'NH-66, Majali, Karnataka 581345'
        };
        
        this.currentInvoice = this.createEmptyInvoice();
        this.loadFromLocalStorage();
    }

    // Create empty invoice structure
    createEmptyInvoice() {
        return {
            id: this.generateId(),
            invoiceNumber: this.generateInvoiceNumber(),
            date: new Date().toISOString().split('T')[0],
            dueDate: this.getDefaultDueDate(),
            currency: 'USD',
            business: {
                name: this.defaultBusinessInfo.name,
                email: this.defaultBusinessInfo.email,
                phone: this.defaultBusinessInfo.phone,
                address: this.defaultBusinessInfo.address
            },
            client: {
                name: '',
                email: '',
                address: ''
            },
            items: [],
            taxRate: 0,
            discount: 0,
            notes: '',
            template: 'template1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    // Generate unique ID
    generateId() {
        return 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Generate invoice number
    generateInvoiceNumber() {
        const savedInvoices = this.getAllInvoices();
        const year = new Date().getFullYear();
        const count = savedInvoices.filter(inv => 
            inv.invoiceNumber.startsWith(`INV-${year}`)
        ).length + 1;
        return `INV-${year}-${String(count).padStart(4, '0')}`;
    }

    // Get default due date (30 days from now)
    getDefaultDueDate() {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
    }

    // Load invoice data from form
    loadFromForm() {
        this.currentInvoice = {
            ...this.currentInvoice,
            invoiceNumber: document.getElementById('invoiceNumber').value,
            date: document.getElementById('invoiceDate').value,
            dueDate: document.getElementById('dueDate').value,
            currency: document.getElementById('currency').value,
            business: {
                name: document.getElementById('businessName').value,
                email: document.getElementById('businessEmail').value,
                phone: document.getElementById('businessPhone').value,
                address: document.getElementById('businessAddress').value
            },
            client: {
                name: document.getElementById('clientName').value,
                email: document.getElementById('clientEmail').value,
                address: document.getElementById('clientAddress').value
            },
            items: this.getLineItemsFromForm(),
            taxRate: parseFloat(document.getElementById('taxRate').value) || 0,
            discount: parseFloat(document.getElementById('discount').value) || 0,
            notes: document.getElementById('notes').value,
            template: document.getElementById('templateSelect').value,
            updatedAt: new Date().toISOString()
        };
        return this.currentInvoice;
    }

    // Get line items from form
    getLineItemsFromForm() {
        const items = [];
        const lineItemElements = document.querySelectorAll('.line-item');
        
        lineItemElements.forEach(element => {
            const description = element.querySelector('[data-field="description"]').value;
            const quantity = parseFloat(element.querySelector('[data-field="quantity"]').value) || 0;
            const rate = parseFloat(element.querySelector('[data-field="rate"]').value) || 0;
            
            if (description) {
                items.push({
                    description,
                    quantity,
                    rate,
                    amount: quantity * rate
                });
            }
        });
        
        return items;
    }

    // Load invoice data to form
    loadToForm(invoice) {
        this.currentInvoice = invoice;
        
        document.getElementById('invoiceNumber').value = invoice.invoiceNumber;
        document.getElementById('invoiceDate').value = invoice.date;
        document.getElementById('dueDate').value = invoice.dueDate;
        document.getElementById('currency').value = invoice.currency;
        document.getElementById('businessName').value = invoice.business.name;
        document.getElementById('businessEmail').value = invoice.business.email;
        document.getElementById('businessPhone').value = invoice.business.phone || '';
        document.getElementById('businessAddress').value = invoice.business.address || '';
        document.getElementById('clientName').value = invoice.client.name;
        document.getElementById('clientEmail').value = invoice.client.email || '';
        document.getElementById('clientAddress').value = invoice.client.address || '';
        document.getElementById('taxRate').value = invoice.taxRate;
        document.getElementById('discount').value = invoice.discount;
        document.getElementById('notes').value = invoice.notes || '';
        document.getElementById('templateSelect').value = invoice.template || 'template1';
        
        // Clear existing items
        document.getElementById('lineItems').innerHTML = '';
        
        // Load items
        invoice.items.forEach(item => {
            this.addLineItemToForm(item);
        });
        
        // If no items, add one empty item
        if (invoice.items.length === 0) {
            this.addLineItemToForm();
        }
        
        // Recalculate totals
        this.calculateTotals();
    }

    // Add line item to form
    addLineItemToForm(item = null) {
        const lineItemsContainer = document.getElementById('lineItems');
        const lineItemDiv = document.createElement('div');
        lineItemDiv.className = 'line-item';
        
        lineItemDiv.innerHTML = `
            <div class="form-group">
                <label>Description</label>
                <input type="text" class="form-control" data-field="description" 
                       value="${item ? item.description : ''}" placeholder="Item description">
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="form-control" data-field="quantity" 
                       value="${item ? item.quantity : 1}" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label>Rate</label>
                <input type="number" class="form-control" data-field="rate" 
                       value="${item ? item.rate : 0}" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label>Amount</label>
                <input type="number" class="form-control" data-field="amount" 
                       value="${item ? item.amount : 0}" readonly>
            </div>
            <button type="button" class="remove-item-btn" title="Remove item">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        lineItemsContainer.appendChild(lineItemDiv);
        
        // Add event listeners for calculation
        const quantityInput = lineItemDiv.querySelector('[data-field="quantity"]');
        const rateInput = lineItemDiv.querySelector('[data-field="rate"]');
        const amountInput = lineItemDiv.querySelector('[data-field="amount"]');
        
        const calculateAmount = () => {
            const quantity = parseFloat(quantityInput.value) || 0;
            const rate = parseFloat(rateInput.value) || 0;
            amountInput.value = (quantity * rate).toFixed(2);
            this.calculateTotals();
        };
        
        quantityInput.addEventListener('input', calculateAmount);
        rateInput.addEventListener('input', calculateAmount);
        
        // Remove button
        const removeBtn = lineItemDiv.querySelector('.remove-item-btn');
        removeBtn.addEventListener('click', () => {
            if (document.querySelectorAll('.line-item').length > 1) {
                lineItemDiv.remove();
                this.calculateTotals();
            } else {
                alert('At least one line item is required');
            }
        });
    }

    // Calculate totals
    calculateTotals() {
        const items = this.getLineItemsFromForm();
        const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const currency = document.getElementById('currency').value;
        
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const tax = (subtotal * taxRate) / 100;
        const total = subtotal + tax - discount;
        
        const currencySymbol = this.getCurrencySymbol(currency);
        
        document.getElementById('subtotal').textContent = `${currencySymbol}${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `${currencySymbol}${tax.toFixed(2)}`;
        document.getElementById('discountAmount').textContent = `-${currencySymbol}${discount.toFixed(2)}`;
        document.getElementById('total').textContent = `${currencySymbol}${total.toFixed(2)}`;
        
        return { subtotal, tax, discount, total };
    }

    // Get currency symbol
    getCurrencySymbol(currency) {
        const symbols = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹',
            'AUD': '$',
            'CAD': '$',
            'JPY': '¥'
        };
        return symbols[currency] || '$';
    }

    // Save invoice to localStorage
    saveInvoice() {
        this.loadFromForm();
        const invoices = this.getAllInvoices();
        const existingIndex = invoices.findIndex(inv => inv.id === this.currentInvoice.id);
        
        if (existingIndex >= 0) {
            invoices[existingIndex] = this.currentInvoice;
        } else {
            invoices.push(this.currentInvoice);
        }
        
        localStorage.setItem('invoices', JSON.stringify(invoices));
        this.saveBusinessInfo();
        return this.currentInvoice;
    }

    // Get all invoices from localStorage
    getAllInvoices() {
        const invoices = localStorage.getItem('invoices');
        return invoices ? JSON.parse(invoices) : [];
    }

    // Get invoice by ID
    getInvoiceById(id) {
        const invoices = this.getAllInvoices();
        return invoices.find(inv => inv.id === id);
    }

    // Delete invoice
    deleteInvoice(id) {
        const invoices = this.getAllInvoices();
        const filtered = invoices.filter(inv => inv.id !== id);
        localStorage.setItem('invoices', JSON.stringify(filtered));
    }

    // Save business info for reuse
    saveBusinessInfo() {
        const businessInfo = {
            name: document.getElementById('businessName').value,
            email: document.getElementById('businessEmail').value,
            phone: document.getElementById('businessPhone').value,
            address: document.getElementById('businessAddress').value
        };
        localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
    }

    // Load business info
    loadFromLocalStorage() {
        const businessInfo = localStorage.getItem('businessInfo');
        if (businessInfo) {
            const info = JSON.parse(businessInfo);
            this.currentInvoice.business = info;
        }
        // If no saved info, defaults from createEmptyInvoice() are already set
    }

    // Create new invoice
    newInvoice() {
        const businessInfo = localStorage.getItem('businessInfo');
        this.currentInvoice = this.createEmptyInvoice();
        
        // Use saved business info if available, otherwise use defaults
        if (businessInfo) {
            this.currentInvoice.business = JSON.parse(businessInfo);
        }
        // If no saved info, defaults from createEmptyInvoice() are already set
        
        return this.currentInvoice;
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

// Export for use in other modules
window.InvoiceManager = InvoiceManager;
