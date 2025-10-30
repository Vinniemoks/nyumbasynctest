import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import SectionErrorBoundary from '../../components/SectionErrorBoundary';
import LoadingSpinner from '../../components/LoadingSpinner';
import { TenantProvider } from '../../context/TenantContext';

// Eager load critical components
import Overview from './Overview';
import PropertyDetails from './PropertyDetails';

// Lazy load other components for code splitting
const RentDashboard = lazy(() => import('./RentManagement/RentDashboard'));
const PaymentHistory = lazy(() => import('./RentManagement/PaymentHistory'));
const AutopaySettings = lazy(() => import('./RentManagement/AutopaySettings'));
const MaintenanceList = lazy(() => import('./Maintenance/MaintenanceList'));
const CreateRequest = lazy(() => import('./Maintenance/CreateRequest'));
const RequestDetails = lazy(() => import('./Maintenance/RequestDetails'));
const VendorDirectory = lazy(() => import('./Vendors/VendorDirectory'));
const VendorProfile = lazy(() => import('./Vendors/VendorProfile'));
const DocumentList = lazy(() => import('./Documents/DocumentList'));
const UtilityDashboard = lazy(() => import('./Utilities/UtilityDashboard'));
const BillDetails = lazy(() => import('./Utilities/BillDetails'));
const UsageTrends = lazy(() => import('./Utilities/UsageTrends'));
const CostSplitter = lazy(() => import('./Utilities/CostSplitter'));
const Announcements = lazy(() => import('./Community/Announcements'));
const BulletinBoard = lazy(() => import('./Community/BulletinBoard'));
const IssueReporter = lazy(() => import('./Community/IssueReporter'));
const CreatePost = lazy(() => import('./Community/CreatePost'));
const LeaseInfo = lazy(() => import('./Lease/LeaseInfo'));
const RenewalRequest = lazy(() => import('./Lease/RenewalRequest'));
const MoveOutRequest = lazy(() => import('./MoveOut/MoveOutRequest'));
const MoveOutStatus = lazy(() => import('./MoveOut/MoveOutStatus'));
const DepositRefund = lazy(() => import('./MoveOut/DepositRefund'));
const GuestList = lazy(() => import('./Guests/GuestList'));
const RegisterGuest = lazy(() => import('./Guests/RegisterGuest'));
const EmergencyContacts = lazy(() => import('./Emergency/EmergencyContacts'));
const ReportEmergency = lazy(() => import('./Emergency/ReportEmergency'));
const EvacuationMap = lazy(() => import('./Emergency/EvacuationMap'));
const Communication = lazy(() => import('./Communication'));

const TenantDashboard = () => {
  const menuItems = [
    { path: '/tenant-dashboard', label: 'Dashboard', icon: 'fas fa-home' },
    { path: '/tenant-dashboard/property', label: 'My Property', icon: 'fas fa-building' },
    { path: '/tenant-dashboard/rent', label: 'Rent', icon: 'fas fa-money-bill-wave' },
    { path: '/tenant-dashboard/maintenance', label: 'Maintenance', icon: 'fas fa-tools' },
    { path: '/tenant-dashboard/vendors', label: 'Vendors', icon: 'fas fa-user-tie' },
    { path: '/tenant-dashboard/documents', label: 'Documents', icon: 'fas fa-file-alt' },
    { path: '/tenant-dashboard/utilities', label: 'Utilities', icon: 'fas fa-bolt' },
    { path: '/tenant-dashboard/community', label: 'Community', icon: 'fas fa-users' },
    { path: '/tenant-dashboard/lease', label: 'Lease', icon: 'fas fa-file-contract' },
    { path: '/tenant-dashboard/guests', label: 'Guests', icon: 'fas fa-user-friends' },
    { path: '/tenant-dashboard/messages', label: 'Messages', icon: 'fas fa-envelope' },
    { path: '/tenant-dashboard/emergency', label: 'Emergency', icon: 'fas fa-exclamation-triangle' }
  ];

  return (
    <TenantProvider>
      <DashboardLayout role="tenant" menuItems={menuItems}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route index element={
              <SectionErrorBoundary section="Overview" title="Dashboard Error">
                <Overview />
              </SectionErrorBoundary>
            } />
            <Route path="property" element={
              <SectionErrorBoundary section="Property" title="Property Details Error">
                <PropertyDetails />
              </SectionErrorBoundary>
            } />
            
            {/* Rent Management Routes */}
            <Route path="rent" element={
              <SectionErrorBoundary section="Rent" title="Rent Dashboard Error">
                <RentDashboard />
              </SectionErrorBoundary>
            } />
          <Route path="rent/history" element={
            <SectionErrorBoundary section="Payment History" title="Payment History Error">
              <PaymentHistory />
            </SectionErrorBoundary>
          } />
          <Route path="rent/autopay" element={
            <SectionErrorBoundary section="Autopay" title="Autopay Settings Error">
              <AutopaySettings />
            </SectionErrorBoundary>
          } />
          
          {/* Maintenance Routes */}
          <Route path="maintenance" element={
            <SectionErrorBoundary section="Maintenance" title="Maintenance List Error">
              <MaintenanceList />
            </SectionErrorBoundary>
          } />
          <Route path="maintenance/new" element={
            <SectionErrorBoundary section="Create Request" title="Create Request Error">
              <CreateRequest />
            </SectionErrorBoundary>
          } />
          <Route path="maintenance/:id" element={
            <SectionErrorBoundary section="Request Details" title="Request Details Error">
              <RequestDetails />
            </SectionErrorBoundary>
          } />
          
          {/* Vendor Routes */}
          <Route path="vendors" element={
            <SectionErrorBoundary section="Vendors" title="Vendor Directory Error">
              <VendorDirectory />
            </SectionErrorBoundary>
          } />
          <Route path="vendors/:vendorId" element={
            <SectionErrorBoundary section="Vendor Profile" title="Vendor Profile Error">
              <VendorProfile />
            </SectionErrorBoundary>
          } />
          
          {/* Document Routes */}
          <Route path="documents" element={
            <SectionErrorBoundary section="Documents" title="Document List Error">
              <DocumentList />
            </SectionErrorBoundary>
          } />
          
          {/* Utility Routes */}
          <Route path="utilities" element={
            <SectionErrorBoundary section="Utilities" title="Utility Dashboard Error">
              <UtilityDashboard />
            </SectionErrorBoundary>
          } />
          <Route path="utilities/:id" element={
            <SectionErrorBoundary section="Bill Details" title="Bill Details Error">
              <BillDetails />
            </SectionErrorBoundary>
          } />
          <Route path="utilities/trends" element={
            <SectionErrorBoundary section="Usage Trends" title="Usage Trends Error">
              <UsageTrends />
            </SectionErrorBoundary>
          } />
          <Route path="utilities/split" element={
            <SectionErrorBoundary section="Cost Splitter" title="Cost Splitter Error">
              <CostSplitter />
            </SectionErrorBoundary>
          } />
          
          {/* Community Routes */}
          <Route path="community" element={
            <SectionErrorBoundary section="Community" title="Announcements Error">
              <Announcements />
            </SectionErrorBoundary>
          } />
          <Route path="community/bulletin" element={
            <SectionErrorBoundary section="Bulletin Board" title="Bulletin Board Error">
              <BulletinBoard />
            </SectionErrorBoundary>
          } />
          <Route path="community/bulletin/create" element={
            <SectionErrorBoundary section="Create Post" title="Create Post Error">
              <CreatePost />
            </SectionErrorBoundary>
          } />
          <Route path="community/report-issue" element={
            <SectionErrorBoundary section="Issue Reporter" title="Issue Reporter Error">
              <IssueReporter />
            </SectionErrorBoundary>
          } />
          
          {/* Lease Routes */}
          <Route path="lease" element={
            <SectionErrorBoundary section="Lease" title="Lease Info Error">
              <LeaseInfo />
            </SectionErrorBoundary>
          } />
          <Route path="lease/renew" element={
            <SectionErrorBoundary section="Renewal" title="Renewal Request Error">
              <RenewalRequest />
            </SectionErrorBoundary>
          } />
          
          {/* Move-Out Routes */}
          <Route path="move-out" element={
            <SectionErrorBoundary section="Move-Out" title="Move-Out Request Error">
              <MoveOutRequest />
            </SectionErrorBoundary>
          } />
          <Route path="move-out/status" element={
            <SectionErrorBoundary section="Move-Out Status" title="Move-Out Status Error">
              <MoveOutStatus />
            </SectionErrorBoundary>
          } />
          <Route path="move-out/deposit" element={
            <SectionErrorBoundary section="Deposit Refund" title="Deposit Refund Error">
              <DepositRefund />
            </SectionErrorBoundary>
          } />
          
          {/* Guest Routes */}
          <Route path="guests" element={
            <SectionErrorBoundary section="Guests" title="Guest List Error">
              <GuestList />
            </SectionErrorBoundary>
          } />
          <Route path="guests/register" element={
            <SectionErrorBoundary section="Register Guest" title="Register Guest Error">
              <RegisterGuest />
            </SectionErrorBoundary>
          } />
          
          {/* Emergency Routes */}
          <Route path="emergency" element={
            <SectionErrorBoundary section="Emergency" title="Emergency Contacts Error">
              <EmergencyContacts />
            </SectionErrorBoundary>
          } />
          <Route path="emergency/report" element={
            <SectionErrorBoundary section="Report Emergency" title="Report Emergency Error">
              <ReportEmergency />
            </SectionErrorBoundary>
          } />
          <Route path="emergency/evacuation" element={
            <SectionErrorBoundary section="Evacuation" title="Evacuation Map Error">
              <EvacuationMap />
            </SectionErrorBoundary>
          } />
          
          {/* Communication Routes */}
          <Route path="messages" element={
            <SectionErrorBoundary section="Messages" title="Communication Error">
              <Communication />
            </SectionErrorBoundary>
          } />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/tenant-dashboard" replace />} />
          </Routes>
        </Suspense>
      </DashboardLayout>
    </TenantProvider>
  );
};

export default TenantDashboard;
