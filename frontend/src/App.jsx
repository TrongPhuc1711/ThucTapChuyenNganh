import { Routes,Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Dashboard/Admin/Admin';
import Staff from './pages/Dashboard/Staff';
import Customer from './pages/Dashboard/Customer';
import Home from './pages/Home';
import Categories from './pages/Dashboard/Admin/Categories';
import Products from './pages/Dashboard/Admin/Products';

export const App = () => {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path='/admin' element={<Admin />} />
      <Route path='/admin/products' element={<Products />} />
      <Route path='/admin/categories' element={<Categories />} />
      <Route path='/staff' element={<Staff />} />
      <Route path='/customer' element={<Customer />} />
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
};