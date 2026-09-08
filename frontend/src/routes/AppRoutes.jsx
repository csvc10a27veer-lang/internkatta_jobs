// src/routes/AppRoutes.jsx

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import trackVisit from '../utils/trackVisit';
import ErrorBoundary from '../components/ErrorBoundary';

// Layouts
import LandingLayout from '../components/layout/LandingLayout';
import AdminLayout from '../components/layout/AdminLayout';
import UserLayout from '../components/layout/UserLayout';

// Landing Pages
import Home from '../pages/Home';
import Internship from '../pages/Internship';
import InternshipDetail from '../pages/InternshipDetail';
import Training from '../pages/Training';
import TrainingDetail from '../pages/TrainingDetail';
import Courses from '../pages/Courses';
import CourseDetail from '../pages/CourseDetail';
import Cart from '../pages/Cart';
import Contact from '../pages/Contact';
import AdminDashboard from '../admin/AdminDashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminLogin from '../pages/AdminLogin';
import AdminRegister from '../pages/AdminRegister';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import About from '../pages/About';
import FAQ from '../pages/FAQ';
import TermsAndConditions from '../pages/TermsAndConditions';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import RefundPolicy from '../pages/RefundPolicy';
import TermsOfService from '../pages/TermsOfService';
import PaymentCallback from '../pages/PaymentCallback';
import MockPayment from '../pages/MockPayment';
import DownloadCertificate from '../pages/DownloadCertificate';
import VerificationPage from '../pages/VerificationPage';
import NotFound from '../pages/NotFound';

// User Dashboard Pages
import MyCourses from '../userDashboard/MyCourses';
import Profile from '../userDashboard/Profile';
import Certificate from '../userDashboard/Certificate';
import Intrenship from '../userDashboard/Intrenship';
import OfferLetter from '../userDashboard/OfferLetter';
import InternshipLetter from '../userDashboard/InternshipLetter';
import InternshipView from '../userDashboard/InternshipView';
import QuizPage from '../userDashboard/QuizPage';
import UserCoursePlayerView from '../userDashboard/CoursePlayerView'; 

// Admin Dashboard Pages
import AddCourse from '../admin/AddCourse';
import ManageCourse from '../admin/ManageCourse';
import EditCourse from '../admin/EditCourse';
import InquiryHistory from '../admin/InquiryHistory';
import PurchasedHistory from '../admin/PurchasedHistory';
import UserHistory from '../admin/UserHistory';
import AddIntrenship from '../admin/AddIntrenship';
import EditInternship from '../admin/EditInternship';
import ManageIntrenship from '../admin/ManageIntrenship';
import InternshipPurchaseHistory from '../admin/InternshipPurchaseHistory';
import InternshipSubmissions from '../admin/InternshipSubmissions';
import ManageCategories from '../admin/ManageCategories';
import ManageCategoryImages from '../admin/ManageCategoryImages';
import AdminCoursePlayerView from '../admin/CoursePlayerView';
import TrainingRegistrations from '../admin/TrainingRegistrations';
import RecycleBin from '../admin/RecycleBin';
import SiteAnalytics from '../admin/SiteAnalytics';
import InternshipLearningAnalytics from '../admin/InternshipLearningAnalytics';
import AdminQA from '../admin/AdminQA';

// Route Guards
import ProtectedRoute from '../utils/ProtectedRoute';
import AdminRoute from '../utils/AdminRoute';

const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    // avoid logging admin dashboard activity
    if (!location.pathname.startsWith('/admin')) {
      trackVisit(location.pathname);
    }
  }, [location]);
  return null;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <RouteTracker />
        <Routes>
          {/* Landing Layout with Header & Footer */}
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<Home />} />
          <Route path="internship" element={<Internship />} />
          <Route path="internship/:id" element={<InternshipDetail />} />
          <Route path="training" element={<Training />} />
          <Route path="training/:id" element={<TrainingDetail />} />
          <Route path="courses" element={<Courses />} />
          <Route path="course/:id" element={<CourseDetail />} />
          <Route path="cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="contact" element={<Contact />}/>
          <Route path="login" element={<Login/>}/>
          <Route path="register" element={<Register />}/>
          <Route path='/forgot-password' element={<ForgotPassword/>}/>
          <Route path="/reset-password" element={<ResetPassword/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/faq" element={<FAQ/>} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/download-certificate" element={<DownloadCertificate />} />
          
          {/* Catch-all route for undefined paths, rendering the NotFound page with layout */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Public certificate verification routes */}
        <Route path="/verify-certificate/:certificateId" element={<VerificationPage />} />
        <Route path="/verify/:certificateId" element={<VerificationPage />} />

        {/* Standalone Admin Auth Routes */}
        <Route path='admin/login' element={<AdminLogin />}/>
        <Route path='admin/register' element={<AdminRegister />} />

        {/* Payment Callback Route */}
        <Route path="/payment/callback" element={<PaymentCallback />} />
        
        {/* Only include mock payment route in development */}
        {import.meta.env.DEV && (
          <Route path="/payment/mock" element={<MockPayment />} />
        )}

        {/* User Dashboard */}
        <Route path="/user" element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Intrenship />} />
          <Route path="mycourse" element={<MyCourses />} />
          <Route path="profile" element={<Profile />} />
          <Route path="certificate" element={<Certificate />} />
          <Route path='internship' element={<Intrenship />}/>
          <Route path='intrenship' element={<Navigate to="/user/internship" replace />} />
          <Route path='offerletter' element={<OfferLetter />}/>
          <Route path='internshipletter' element={<InternshipLetter />} />
          
          {/* Catch-all for user dashboard */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Standalone Internship View - No Dashboard Sidebar */}
        <Route path="/user/internship-view/:id" element={
          <ProtectedRoute>
            <InternshipView />
          </ProtectedRoute>
        } />

        {/* Standalone Course Player View - No Dashboard Sidebar */}
        <Route path="/user/course-player/:id" element={
          <ProtectedRoute>
            <UserCoursePlayerView />
          </ProtectedRoute>
        } />

        {/* Standalone Quiz Page - No Dashboard Sidebar */}
        <Route path="/user/quiz/:internshipId/:lectureId" element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        } />

        {/* --- THIS IS THE CORRECTED ADMIN ROUTING STRUCTURE --- */}
        {/* Step 1: The Guard Route. This route's only job is to protect its children. */}
        <Route element={<AdminRoute />}>
          {/* Step 2: The Layout Route. This route applies the layout to its children. */}
          {/* All routes nested inside here will have the admin sidebar and header. */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="addcourse" element={<AddCourse />} />
            <Route path="managecourse" element={<ManageCourse />} />
            <Route path="edit-course/:id" element={<EditCourse />} />
            <Route path="inquiry-history" element={<InquiryHistory />} />
            <Route path="purchased-history" element={<PurchasedHistory />} />
            <Route path="user-history" element={<UserHistory />} />
            <Route path="add-internship" element={<AddIntrenship />}/>
            <Route path="manage-internship" element={<ManageIntrenship />}/>
            <Route path="edit-internship/:id" element={<EditInternship />} />
            <Route path='internshipurchasedhistory' element={<InternshipPurchaseHistory />}/>
            <Route path="internship-submissions" element={<InternshipSubmissions />} />
            <Route path="manage-categories" element={<ManageCategories />} />
            <Route path="manage-category-images" element={<ManageCategoryImages />} />
            <Route path="training-registrations" element={<TrainingRegistrations />} />
            <Route path="recycle-bin" element={<RecycleBin />} />
            <Route path="site-analytics" element={<SiteAnalytics />} />
            <Route path="internship-learning-analytics" element={<InternshipLearningAnalytics />} />
            <Route path="qa" element={<AdminQA />} />
            
            {/* Catch-all for admin dashboard */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        {/* Standalone Admin Course Player View - No Dashboard Sidebar */}
        <Route path="/admin/course-player/:id" element={
          <AdminRoute>
            <AdminCoursePlayerView />
          </AdminRoute>
        } />

        {/* Global Catch-all route as absolute fallback */}
        <Route path="*" element={<LandingLayout />}>
          <Route index element={<NotFound />} />
        </Route>
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRoutes;
