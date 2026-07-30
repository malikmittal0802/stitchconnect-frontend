import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './Components/LandingPage';
import Login from './Components/Login'; 
import Signup from './Components/Signup'; 
import CustomerDashboard from './customer/CustomerDashboard';
import CustomerProfile from './customer/CustomerProfile';
import TailorDiscovery from './customer/TailorDiscovery';
import TailorReviews from './customer/TailorReviews';
import LeaveReview from "./customer/LeaveReview";
import TailorDashboard from './Tailor/TailorDashboard';
import TailorProfile from './Tailor/TailorProfile';
import ArtisanPublicProfile from './Tailor/ArtisanPublicProfile';

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            fontFamily: 'Cormorant Garamond, serif',
            borderRadius: '0px',
            background: '#2C2C2C',
            color: '#fff',
            fontSize: '14px',
            letterSpacing: '0.1em'
          },
        }}
      />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup/>} />
        
        <Route path="/marketplace" element={<TailorDiscovery />} />
        <Route path="/artisan/:id" element={<ArtisanPublicProfile />} />
        <Route path="/review" element={<TailorReviews />} />
        <Route path="/leave-review/:id" element={<LeaveReview />} />

        <Route path="/customer-profile" element={<CustomerProfile />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />

        <Route path="/tailor-profile" element={<TailorProfile />} />
        <Route path="/tailor-dashboard" element={<TailorDashboard />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;