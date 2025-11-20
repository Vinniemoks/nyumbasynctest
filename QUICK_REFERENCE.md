# NyumbaSync - Quick Reference Guide

## 🚀 Quick Start

### Start Backend
```bash
cd nyumbasync_backend
npm start
# Server runs on http://localhost:5000
```

### Start Frontend
```bash
cd nyumbasynctest
npm run dev
# App runs on http://localhost:5173
```

---

## 📍 Main Routes

### Properties
- `/properties` - List all properties
- `/properties/stats` - Market statistics
- `/properties/new` - Add new property
- `/properties/:id` - View property details
- `/properties/:id/edit` - Edit property

### Contacts
- `/contacts` - List all contacts
- `/contacts/new` - Add new contact
- `/contacts/:id` - View contact details
- `/contacts/:id/edit` - Edit contact

### Transactions
- `/pipeline` - Kanban board view
- `/transactions/new` - Create new deal
- `/transactions/:id` - View deal details
- `/transactions/:id/edit` - Edit deal

### Dashboard
- `/dashboard` - Main dashboard

---

## 🔑 API Endpoints

### Properties API
```
GET    /api/v2/properties              # List properties
GET    /api/v2/properties/:id          # Get single property
POST   /api/v2/properties              # Create property
PUT    /api/v2/properties/:id          # Update property
DELETE /api/v2/properties/:id          # Delete property
GET    /api/v2/properties/stats/areas  # Area statistics
GET    /api/v2/properties/stats/rent   # Rent statistics
POST   /api/v2/properties/:id/contacts # Link contact
POST   /api/v2/properties/:id/calculate-metrics # Calculate ROI
```

### Contacts API
```
GET    /api/contacts                   # List contacts
GET    /api/contacts/:id               # Get single contact
POST   /api/contacts                   # Create contact
PUT    /api/contacts/:id               # Update contact
DELETE /api/contacts/:id               # Delete contact
GET    /api/contacts/hot-leads         # Get hot leads
GET    /api/contacts/overdue-followups # Get overdue follow-ups
```

### Transactions API
```
GET    /api/v2/transactions                  # List transactions
GET    /api/v2/transactions/:id              # Get single transaction
POST   /api/v2/transactions                  # Create transaction
PUT    /api/v2/transactions/:id              # Update transaction
DELETE /api/v2/transactions/:id              # Delete transaction
GET    /api/v2/transactions/pipeline/active  # Active pipeline
GET    /api/v2/transactions/stats/pipeline   # Pipeline stats
```

---

## 🎯 Common Tasks

### Add a Property
1. Go to `/properties`
2. Click "+ Add Property"
3. Fill in details (title, type, location, rent, etc.)
4. Upload images (optional)
5. Select amenities
6. Click "Create Property"

### Track Investment Performance
1. Open property details
2. Go to "Investment" tab
3. Click "+ Add Investment Data"
4. Enter purchase price, expenses, income
5. Click "Calculate Metrics"
6. View Cap Rate, Cash Flow, and ROI

### Add a Contact
1. Go to `/contacts`
2. Click "+ Add Contact"
3. Fill in basic info (name, phone, email)
4. Set role and status
5. Add buyer profile (optional)
6. Add tags
7. Click "Create Contact"

### Create a Deal
1. Go to `/pipeline`
2. Click "+ New Deal"
3. Select property
4. Add contacts (buyer, seller, agent)
5. Set pipeline stage and probability
6. Set expected close date
7. Click "Create Transaction"

### Link Contact to Property
1. Open property details
2. Go to "Contacts" tab
3. Click "+ Link Contact"
4. Search and select contact
5. Choose relationship type
6. Add notes
7. Click "Link Contact"

---

## 🔍 Search & Filter

### Properties Filters
- **Search**: Property name, area, description
- **Status**: Available, Occupied, Maintenance
- **Type**: Apartment, House, Studio, etc.
- **Area**: Specific location
- **Rent Range**: Min and max rent
- **Bedrooms/Bathrooms**: Exact count
- **Amenities**: Multiple selection

### Contacts Filters
- **Search**: Name, email, phone
- **Role**: Buyer, Seller, Lead, Tenant, etc.
- **Status**: Active, Inactive, Archived
- **Tags**: Custom tags

### Pipeline Views
- **All Deals**: Complete pipeline
- **By Stage**: Filter by specific stage
- **By Probability**: High/medium/low
- **Closing Soon**: Deals closing within 7 days

---

## 📊 Dashboard Metrics

### Key Metrics
- **Total Properties**: Count of all properties
- **Total Contacts**: Count of all contacts
- **Active Deals**: Transactions in pipeline
- **Pipeline Value**: Total value of active deals

### Alerts
- **Hot Leads**: Contacts ready to convert
- **Overdue Follow-ups**: Contacts needing attention
- **Closing Soon**: Deals closing within 7 days

---

## 🔐 User Roles & Permissions

| Feature | Landlord | Manager | Agent | Admin |
|---------|----------|---------|-------|-------|
| View Properties | ✅ Own | ✅ Assigned | ✅ All | ✅ All |
| Add Properties | ✅ | ✅ | ❌ | ✅ |
| Edit Properties | ✅ Own | ✅ Assigned | ❌ | ✅ |
| View Contacts | ❌ | ✅ | ✅ | ✅ |
| Add Contacts | ❌ | ✅ | ✅ | ✅ |
| View Pipeline | ❌ | ✅ | ✅ | ✅ |
| Create Deals | ❌ | ✅ | ✅ | ✅ |
| View Dashboard | ✅ | ✅ | ✅ | ✅ |

---

## 🎨 UI Components

### Buttons
- **Primary**: Main actions (Create, Save, Submit)
- **Secondary**: Alternative actions (Cancel, Back)
- **Danger**: Destructive actions (Delete, Remove)

### Status Badges
- **Available**: Green
- **Occupied**: Orange
- **Maintenance**: Red
- **Active**: Green
- **Inactive**: Gray

### Forms
- **Required fields**: Marked with *
- **Validation**: Real-time feedback
- **Auto-save**: Draft support (where applicable)

---

## 🔄 Automation Triggers

### Property Events
- Property created → Notify team
- Property status changed → Update related deals
- Property viewed → Log interaction

### Contact Events
- Contact created → Send welcome email
- Follow-up overdue → Send reminder
- Status changed to "hot" → Notify agent

### Transaction Events
- Deal created → Create initial tasks
- Stage changed → Update probability
- Deal closed → Archive and report

---

## 💡 Pro Tips

### Properties
- Upload high-quality images for better engagement
- Use descriptive titles with key features
- Update investment data monthly for accurate ROI
- Link all relevant contacts for complete history

### Contacts
- Add tags for easy filtering and segmentation
- Set follow-up dates to never miss opportunities
- Update buyer profiles as preferences change
- Log all interactions for complete history

### Transactions
- Set realistic probabilities for accurate forecasting
- Create tasks for each stage milestone
- Update expected close dates regularly
- Document all communications in notes

### Dashboard
- Check alerts daily for urgent items
- Review pipeline weekly for stuck deals
- Monitor metrics for business insights
- Use quick actions for common tasks

---

## 🐛 Troubleshooting

### Can't see properties?
- Check your role permissions
- Verify you're logged in
- Clear filters if applied

### Images not uploading?
- Check file size (max 5MB)
- Use JPG, PNG, or WebP format
- Try fewer images at once

### Contact not appearing?
- Verify contact exists in system
- Check search spelling
- Try searching by phone or email

### Deal not moving in pipeline?
- Check required tasks are complete
- Verify all milestones are met
- Update probability if needed

---

## 📞 Support

### Documentation
- Technical: `BACKEND_API_REFERENCE.md`
- User Guide: `PROPERTIES_USER_GUIDE.md`
- Setup: `BACKEND_QUICKSTART.md`
- Complete: `COMPLETE_SYSTEM_SUMMARY.md`

### Common Issues
- Check browser console for errors
- Verify API endpoint is running
- Ensure database connection is active
- Review authentication token

---

## 🎓 Learning Path

### For New Users
1. Start with Dashboard overview
2. Add your first property
3. Create a contact
4. Link contact to property
5. Create a deal
6. Explore automation

### For Administrators
1. Review system architecture
2. Configure user roles
3. Set up automation workflows
4. Customize settings
5. Monitor system health
6. Review analytics

---

## 📈 Best Practices

### Data Entry
- Be consistent with naming conventions
- Use standard formats for addresses
- Keep notes detailed but concise
- Update records regularly

### Workflow
- Review dashboard daily
- Follow up on alerts promptly
- Update deal stages in real-time
- Document all client interactions

### Maintenance
- Backup database regularly
- Update property information monthly
- Archive closed deals quarterly
- Review and clean up old data annually

---

## 🚀 Performance Tips

- Use filters to narrow large lists
- Paginate through results
- Upload optimized images
- Close unused browser tabs
- Clear cache if experiencing issues

---

**Quick Reference Version 1.0**
*Last Updated: November 2025*
