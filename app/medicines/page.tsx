'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { 
  Plus, 
  Search, 
  Trash2, 
  AlertTriangle,
  ClipboardList,
  PlusCircle,
  TrendingUp,
  PackageOpen,
  Calendar
} from 'lucide-react';

export default function MedicinesPage() {
  const medicines = useStore((state) => state.medicines);
  const addMedicine = useStore((state) => state.createItemAction);
  const updateMedicine = useStore((state) => state.updateItemAction);
  const deleteMedicine = useStore((state) => state.deleteItemAction);
  const userRole = useStore((state) => state.userRole);

  // States
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState('');
  const [dosageForm, setDosageForm] = useState('Tablet');
  const [strength, setStrength] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Restock states
  const [selectedRestockMedId, setSelectedRestockMedId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState('');

  // Filter medicines
  const filteredMedicines = medicines.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                        m.genericName.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory ? m.category === filterCategory : true;
    return matchSearch && matchCat;
  });

  const categories = Array.from(new Set(medicines.map(m => m.category)));

  const handleAddMedicineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !genericName || !stockQty || !reorderLevel || !expiryDate) return;

    try {
      const payload = {
        name,
        genericName,
        category: category || 'General',
        dosageForm,
        strength,
        manufacturer: manufacturer || 'Unknown',
        stockQty: Number(stockQty),
        reorderLevel: Number(reorderLevel),
        expiryDate,
        unitPrice: Number(unitPrice) || 10
      };
      await addMedicine('medicines', payload);
      setShowAddForm(false);

      // Reset Form
      setName('');
      setGenericName('');
      setCategory('');
      setStrength('');
      setStockQty('');
      setReorderLevel('');
      setExpiryDate('');
      setUnitPrice('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestockMedId || !restockQty) return;

    try {
      const med = medicines.find(m => m.id === selectedRestockMedId);
      if (med) {
        const newQty = med.stockQty + Number(restockQty);
        await updateMedicine('medicines', selectedRestockMedId, { stockQty: newQty });
        setSelectedRestockMedId(null);
        setRestockQty('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this medicine record?")) {
      await deleteMedicine('medicines', id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Pharmacy Store Inventory</h2>
            <p className="text-xs text-slate-500 mt-1">
              Check pharmaceutical stock parameters, expiry thresholds, and dispatch logs.
            </p>
          </div>

          {userRole === 'admin' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 transition"
            >
              <Plus className="h-4 w-4" />
              Register New Batch
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-left">
          <div className="sm:col-span-8 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog by brand name or generic chemical formula..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500 font-semibold text-slate-600"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Medicine form overlay */}
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <form 
              onSubmit={handleAddMedicineSubmit}
              className="w-full max-w-lg bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 relative animate-fade-in-up space-y-4"
            >
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"
              >
                Close
              </button>

              <h3 className="font-extrabold text-slate-800 text-base">Register Medicine Batch</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Brand Name *</label>
                  <input
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Paracetamol"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Generic / Chemical *</label>
                  <input
                    type="text" required value={genericName} onChange={(e) => setGenericName(e.target.value)}
                    placeholder="e.g. Acetaminophen"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Category Category</label>
                  <input
                    type="text" value={category} onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Analgesics"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Strength Dosage</label>
                  <input
                    type="text" value={strength} onChange={(e) => setStrength(e.target.value)}
                    placeholder="e.g. 650mg, 10mg/ml"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Initial Quantity *</label>
                  <input
                    type="number" required value={stockQty} onChange={(e) => setStockQty(e.target.value)}
                    placeholder="500"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reorder limit Warning *</label>
                  <input
                    type="number" required value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="100"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Expiry Date *</label>
                  <input
                    type="date" required value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Unit Pricing (Rs.)</label>
                  <input
                    type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)}
                    placeholder="15"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Register Batch
              </button>
            </form>
          </div>
        )}

        {/* Restock form overlay */}
        {selectedRestockMedId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <form 
              onSubmit={handleRestockSubmit}
              className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 relative animate-fade-in-up space-y-4"
            >
              <button
                type="button"
                onClick={() => setSelectedRestockMedId(null)}
                className="absolute top-4 right-4 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-lg"
              >
                Cancel
              </button>

              <h3 className="font-extrabold text-slate-800 text-base">Restock Medicine Supplies</h3>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Restock Quantity Units</label>
                <input
                  type="number" required min={1} value={restockQty} onChange={(e) => setRestockQty(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-cyan-500 font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Apply Restock Adjustments
              </button>
            </form>
          </div>
        )}

        {/* Medicines Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filteredMedicines.length === 0 ? (
            <div className="col-span-3 p-12 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 font-medium bg-white">
              No inventory items found matching filters.
            </div>
          ) : (
            filteredMedicines.map((med) => {
              const isLowStock = med.stockQty <= med.reorderLevel;
              
              // Expiry Check (within 30 days)
              const expiryDate = new Date(med.expiryDate);
              const daysToExpiry = (expiryDate.getTime() - Date.now()) / (24 * 3600 * 1000);
              const isNearExpiry = daysToExpiry > 0 && daysToExpiry <= 30;

              return (
                <div key={med.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase bg-cyan-50 border border-cyan-100 text-cyan-700 px-2 py-0.5 rounded">
                        {med.category}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm mt-1">{med.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold block">{med.genericName} &bull; {med.strength}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-500 block">Unit Cost</span>
                      <span className="text-sm font-extrabold text-slate-700 block mt-0.5">Rs. {med.unitPrice}</span>
                    </div>
                  </div>

                  {/* Stock Quantity */}
                  <div className="space-y-1.5 border-t border-b border-slate-50 py-3 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Available Stock</span>
                      <span className={`font-bold ${isLowStock ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
                        {med.stockQty} Units
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isLowStock ? 'bg-red-500' : 'bg-cyan-600'
                        }`}
                        style={{ width: `${Math.min(100, (med.stockQty / (med.reorderLevel * 4)) * 100)}%` }}
                      />
                    </div>

                    {/* Expiry Date */}
                    <div className="flex justify-between font-semibold pt-1 text-[11px]">
                      <span className="text-slate-400">Expiry Date</span>
                      <span className={`font-bold ${isNearExpiry ? 'text-orange-600' : 'text-slate-600'}`}>
                        {med.expiryDate}
                      </span>
                    </div>
                  </div>

                  {/* Warning Badges & Actions */}
                  <div className="flex justify-between items-center">
                    
                    <div className="flex gap-1.5 flex-wrap">
                      {isLowStock && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100 animate-pulse">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </span>
                      )}
                      
                      {isNearExpiry && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                          <Calendar className="h-3 w-3" />
                          Expiring Soon
                        </span>
                      )}
                    </div>

                    {userRole === 'admin' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedRestockMedId(med.id)}
                          className="px-2.5 py-1.5 bg-cyan-50 border border-cyan-100 hover:bg-cyan-100/50 rounded-lg text-[10px] font-bold text-cyan-700 transition"
                        >
                          Restock
                        </button>
                        <button
                          onClick={() => handleDelete(med.id)}
                          className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-700 rounded-lg transition"
                          title="Delete Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
