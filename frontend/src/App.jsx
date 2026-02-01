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
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path='/admin' element={<RoleDashboard role="admin" />}>
        <Route index element={<Admin />} />
        <Route path='/admin/products' element={<Products />} />
        <Route path='/admin/categories' element={<Categories />} />
        <Route path='/admin/staffs' element={<StaffManager />} />
        <Route path='/admin/customers' element={<CustomerManager />} />
        <Route path='/admin/orders' element={<Orders />} />
        <Route path='/admin/bills' element={<BillManager />} />
        <Route path='/admin/thongke' element={<ThongKe />} />
        <Route path="/admin/create-order" element={<CreateOrder />} />
        <Route path="/admin/checkout" element={<CheckoutOrder />} />
      </Route>

      <Route path='/staff' element={<RoleDashboard role="NhanVien" />}>
        <Route index element={<Staff />} /> 
        <Route path='/staff/orders' element={<StaffOrders />} />
        <Route path='/staff/products' element={<StaffProducts />} />
        <Route path='/staff/bills' element={<StaffBills />} />
        <Route path='/staff/customers' element={<StaffCustomers />} />
        <Route path="/staff/create-order" element={<CreateOrder />} />
        <Route path="/staff/checkout" element={<CheckoutOrder />} />
      </Route>
      
      <Route path="/payment-result" element={<PaymentResult />} />
      <Route path='/customer' element={<Customer />} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
};