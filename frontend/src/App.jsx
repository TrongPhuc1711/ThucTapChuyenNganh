import { Routes,Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Dashboard/Admin/Admin';
import Staff from './pages/Dashboard/Staff';
import Customer from './pages/Dashboard/Customer';
import Home from './pages/Home';
import Categories from './pages/Dashboard/Admin/Categories';
import Products from './pages/Dashboard/Admin/Products';
import StaffManager from './pages/Dashboard/Admin/StaffManager';
import Orders from './pages/Dashboard/Admin/Orders';
export const App = () => {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path='/admin' element={<Admin />} />
      <Route path='/admin/products' element={<Products />} />
      <Route path='/admin/categories' element={<Categories />} />
      <Route path='/admin/staffs' element={<StaffManager />} />
      <Route path='/admin/orders' element={<Orders/>}/>
      <Route path='/staff' element={<Staff />} />
      <Route path='/customer' element={<Customer />} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
};