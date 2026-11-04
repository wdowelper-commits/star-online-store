import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Check, X, Package } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { productService } from '../../services/productService';
import { Product } from '../../types';
import { formatPrice } from '../../lib/utils';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { EmptyState } from '../../components/common/EmptyState';
import { ROUTES } from '../../constants/routes';

export const SellerProductsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const loadSellerProducts = () => {
    if (user) {
      setProducts(productService.getProductsBySeller(user.id));
    }
  };

  useEffect(() => {
    loadSellerProducts();
  }, [user]);

  const handleToggleActive = (productId: string) => {
    productService.toggleActive(productId);
    loadSellerProducts();
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      productService.deleteProduct(productToDelete.id);
      setProductToDelete(null);
      loadSellerProducts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            My Listed Products
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your store's inventory, pricing, and active status
          </p>
        </div>

        <Link
          to={ROUTES.SELLER_ADD_PRODUCT}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6C47FF] hover:bg-[#5535E8] text-white rounded-xl text-xs font-semibold transition-all shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Koi Product Nahi Mila"
          description="Aapne abhi tak koi product list nahi kiya. Pehla product add karein!"
          actionText="Naya Product Add Karein"
          actionLink={ROUTES.SELLER_ADD_PRODUCT}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Approval</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.thumbnail_url || 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{prod.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">Orders: {prod.order_count}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {prod.category_name || 'Artisan Goods'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatPrice(prod.price)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold tabular-nums ${
                          prod.stock <= prod.low_stock_threshold ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(prod.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          prod.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {prod.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          prod.is_approved
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {prod.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={ROUTES.SELLER_EDIT_PRODUCT(prod.id)}
                          className="p-1.5 text-slate-500 hover:text-[#6C47FF] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(prod)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        title="Delete Product"
        description={`Kya aap waqai "${productToDelete?.title}" ko delete karna chahte hain?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setProductToDelete(null)}
      />
    </div>
  );
};
