import { Routes, Route, Navigate } from 'react-router-dom';
import RoleDashboard from './components/RoleDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Dashboard/Admin/Admin';
import Staff from './pages/Dashboard/Staff/Staff';
import Customer from './pages/Dashboard/Customer/Customer';
import Home from './pages/Home';
import Categories from './pages/Dashboard/Admin/Categories';
import Products from './pages/Dashboard/Admin/Products';
import StaffManager from './pages/Dashboard/Admin/StaffManager';
import CustomerManager from './pages/Dashboard/Admin/CustomerManager';
import Orders from './pages/Dashboard/Admin/Orders';
import BillManager from './pages/Dashboard/Admin/BillManager';
import ThongKe from './pages/Dashboard/Admin/ThongKe';
import StaffOrders from './pages/Dashboard/Staff/StaffOrders';
import StaffProducts from './pages/Dashboard/Staff/StaffProducts';
import CreateOrder from './components/CreateOrders';
import CheckoutOrder from './components/CheckoutOrders';
import PaymentResult from './components/PaymentResult';
import StaffBills from './pages/Dashboard/Staff/StaffBills';
import StaffCustomers from './pages/Dashboard/Staff/StaffCustomer';

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Portal */}
      <Route path="/admin" element={<RoleDashboard role="Admin" />}>
        <Route index element={<Admin />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="staffs" element={<StaffManager />} />
        <Route path="customers" element={<CustomerManager />} />
        <Route path="orders" element={<Orders />} />
        <Route path="bills" element={<BillManager />} />
        <Route path="thongke" element={<ThongKe />} />
        <Route path="create-order" element={<CreateOrder />} />
        <Route path="checkout" element={<CheckoutOrder />} />
      </Route>

      {/* Staff Portal */}
      <Route path="/staff" element={<RoleDashboard role="NhanVien" />}>
        <Route index element={<Staff />} /> 
        <Route path="orders" element={<StaffOrders />} />
        <Route path="products" element={<StaffProducts />} />
        <Route path="bills" element={<StaffBills />} />
        <Route path="customers" element={<StaffCustomers />} />
        <Route path="create-order" element={<CreateOrder />} />
        <Route path="checkout" element={<CheckoutOrder />} />
      </Route>
      
      <Route path="/payment-result" element={<PaymentResult />} />
      <Route path="/customer" element={<Customer />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;