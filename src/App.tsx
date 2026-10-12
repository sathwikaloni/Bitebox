import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { DietProvider } from './context/DietContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { MealSwapModal } from './components/MealSwapModal';
import { RestaurantMenuModal } from './components/RestaurantMenuModal';
import { AuthModal } from './components/AuthModal';

import { HomePage } from './pages/HomePage';
import { RestaurantsPage } from './pages/RestaurantsPage';
import { DietPlannerPage } from './pages/DietPlannerPage';
import { DietDashboardPage } from './pages/DietDashboardPage';
import { OrdersPage } from './pages/OrdersPage';
import { ProfilePage } from './pages/ProfilePage';

import { Restaurant, Food } from './types';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [featuredFoods, setFeaturedFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        const [rests, foods] = await Promise.all([
          api.getRestaurants(),
          api.getFoods()
        ]);
        setRestaurants(rests);
        setFeaturedFoods(foods);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleViewMenu = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleSearchRestaurants = (query: string) => {
    setRestaurantSearchQuery(query);
    setActiveTab('restaurants');
  };

  const handleOrderSuccess = (orderId: string) => {
    setActiveTab('orders');
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Navigation bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setActiveTab('profile')}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            restaurants={restaurants}
            featuredFoods={featuredFoods}
            onNavigate={setActiveTab}
            onViewMenu={handleViewMenu}
            onSearch={handleSearchRestaurants}
          />
        )}

        {activeTab === 'restaurants' && (
          <RestaurantsPage
            restaurants={restaurants}
            onViewMenu={handleViewMenu}
            initialQuery={restaurantSearchQuery}
          />
        )}

        {activeTab === 'diet-planner' && (
          <DietPlannerPage onNavigate={setActiveTab} />
        )}

        {activeTab === 'dashboard' && (
          <DietDashboardPage onNavigate={setActiveTab} />
        )}

        {activeTab === 'orders' && (
          <OrdersPage onNavigate={setActiveTab} />
        )}

        {activeTab === 'profile' && (
          <ProfilePage onNavigate={setActiveTab} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={setActiveTab} />

      {/* Modals & Overlays */}
      <CartDrawer
        onOpenCheckout={() => setCheckoutModalOpen(true)}
        onNavigate={setActiveTab}
      />

      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <MealSwapModal />

      <RestaurantMenuModal
        restaurant={selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <DietProvider>
          <AppContent />
        </DietProvider>
      </CartProvider>
    </AuthProvider>
  );
}
