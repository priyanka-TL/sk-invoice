# 📄 Invoice Generator

A free, open-source invoice generator that runs entirely in your browser. No server, no database, no login required - just create professional invoices instantly!

🔗 **[Live Demo](https://priyanka-TL.github.io/sk-invoice/)**

## ✨ Features

### Core Functionality
- **Create & Edit Invoices** - Complete form with all necessary fields
- **Multiple Templates** - Choose from 3 professional designs (Classic, Modern, Minimal)
- **PDF Export** - Download invoices as high-quality PDF files
- **Print Support** - Print invoices directly from your browser
- **Auto Calculations** - Automatic totals, taxes, and discounts
- **Save & Load** - Store multiple invoices in browser localStorage
- **Offline Ready** - Works offline after initial load
- **Privacy First** - All data stays in your browser, nothing sent to servers

### Invoice Details
- Business information (name, email, phone, address)
- Client information (name, email, address)
- Invoice metadata (number, date, due date)
- Line items with description, quantity, rate, and amount
- Tax rate calculation (percentage-based)
- Discount support (fixed amount)
- Notes and payment terms
- Multiple currency support (USD, EUR, GBP, INR, AUD, CAD, JPY)

### Design Features
- Responsive design (mobile-friendly)
- Modern, clean UI with intuitive navigation
- Real-time calculations as you type
- Template preview before download
- Professional invoice layouts
- Print-optimized designs

## 🚀 Quick Start

### Option 1: Use Online (Recommended)
Simply visit: https://priyanka-TL.github.io/sk-invoice/

### Option 2: Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/priyanka-TL/sk-invoice.git
   cd sk-invoice
   ```

2. Open `index.html` in your web browser:
   ```bash
   # On macOS
   open index.html
   
   # On Linux
   xdg-open index.html
   
   # On Windows
   start index.html
   ```

   Or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (with http-server)
   npx http-server
   ```

3. Navigate to `http://localhost:8000` in your browser

## 📁 Project Structure

```
/
├── index.html              # Main application page
├── css/
│   └── styles.css         # All application styles
├── js/
│   ├── app.js            # Main application logic
│   ├── invoice.js        # Invoice data management & localStorage
│   └── pdf-generator.js  # PDF generation & templates
├── templates/
│   ├── template1.html    # Classic invoice template
│   ├── template2.html    # Modern invoice template
│   └── template3.html    # Minimal invoice template
└── README.md             # This file
```

## 🎨 Templates

### Template 1 - Classic
Traditional black and white design with professional appearance. Perfect for formal business invoicing.

### Template 2 - Modern
Contemporary design with gradient header and purple accent colors. Great for creative businesses.

### Template 3 - Minimal
Clean, minimalist design with subtle styling. Ideal for a refined, understated look.

## 💾 Data Storage

All invoice data is stored locally in your browser using `localStorage`. This means:
- ✅ Your data never leaves your computer
- ✅ Complete privacy and security
- ✅ Works offline after initial load
- ⚠️ Data is browser-specific (not synced across devices)
- ⚠️ Clearing browser data will delete saved invoices

## 🔧 Technical Details

### Technologies Used
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Flexbox and Grid
- **JavaScript (ES6+)** - Pure vanilla JavaScript, no frameworks
- **html2pdf.js** - PDF generation library
- **Font Awesome** - Icons
- **localStorage API** - Client-side data persistence

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

### No Dependencies Required
The application uses CDN links for:
- `html2pdf.js` - PDF generation
- `Font Awesome` - Icons

All other code is pure vanilla JavaScript with no build process required.

## 📱 Usage Guide

### Creating Your First Invoice

1. **Enter Business Information**
   - Fill in your company name, email, phone, and address
   - This information is saved and auto-filled for future invoices

2. **Add Client Details**
   - Enter client name, email, and address

3. **Set Invoice Details**
   - Invoice number (auto-generated but editable)
   - Invoice date and due date
   - Select currency

4. **Add Line Items**
   - Click "Add Item" to add products/services
   - Enter description, quantity, and rate
   - Amount is calculated automatically
   - Add multiple items as needed

5. **Configure Additional Charges**
   - Set tax rate (percentage)
   - Add discount (fixed amount)
   - View real-time total calculations

6. **Add Notes**
   - Include payment terms or additional information

7. **Choose Actions**
   - **Preview** - See how your invoice looks
   - **Save** - Store invoice in browser for later
   - **Download PDF** - Generate and download PDF
   - **Print** - Print invoice directly

### Managing Saved Invoices

1. Click "Saved Invoices" button
2. View all your saved invoices with summary information
3. Actions available:
   - **Edit** - Load and modify an invoice
   - **PDF** - Download PDF directly
   - **Delete** - Remove invoice (requires confirmation)

## 🌐 GitHub Pages Deployment

This site is configured for GitHub Pages deployment:

### Enable GitHub Pages
1. Go to your repository settings
2. Navigate to "Pages" section
3. Under "Source", select the branch (usually `main` or `master`)
4. Select root folder `/`
5. Click "Save"
6. Your site will be published at: `https://[username].github.io/[repository-name]/`

### Custom Domain (Optional)
1. Add a `CNAME` file to the root with your domain
2. Configure your domain's DNS settings
3. Update GitHub Pages settings with your custom domain

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Ideas for Contributions
- Additional invoice templates
- More currency options
- Invoice duplication feature
- Export to other formats (Excel, CSV)
- Invoice numbering patterns
- Company logo upload
- Dark mode theme
- Internationalization (i18n)
- Invoice statistics/reporting

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) for PDF generation
- [Font Awesome](https://fontawesome.com/) for icons
- All contributors and users of this project

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation above

## 🔒 Privacy & Security

- **No data collection** - We don't track, collect, or store any of your data
- **No external requests** - After initial load, works completely offline
- **Browser storage only** - All data stays in your browser's localStorage
- **No authentication** - No passwords or accounts to manage
- **Open source** - Full transparency, review the code yourself

---

Made with ❤️ for freelancers, small businesses, and anyone who needs simple invoicing
