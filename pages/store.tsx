import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";

interface CosmeticItem {
  id: number;
  name: string;
  description: string;
  type: string;
  rarity: string;
  price: number;
  isLimited: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
  previewUrl: string | null;
  cssData: any;
  unlockRequirement: string | null;
  createdAt: string;
  isEquipped?: boolean;
}

const rarityColors = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600", 
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-yellow-600"
};

const typeIcons = {
  background: "fas fa-image",
  cursor: "fas fa-mouse-pointer", 
  theme: "fas fa-palette",
  avatar: "fas fa-user-circle",
  badge: "fas fa-award",
  skin: "fas fa-paint-brush"
};

export default function Store() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("all");
  const [purchaseAnimation, setPurchaseAnimation] = useState<number | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/store/cosmetics"],
  });

  const { data: ownedItems = [] } = useQuery({
    queryKey: ["/api/store/owned"],
  });

  const equipMutation = useMutation({
    mutationFn: (vars: { itemId: number; isEquipped: boolean }) =>
      apiRequest(`/api/store/equip`, { method: "POST", body: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/store/owned"] });
      toast({ title: "Updated!", description: "Cosmetic equipment updated." });
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: (itemId: number) => 
      apiRequest(`/api/store/purchase`, {
        method: "POST",
        body: { itemId }
      }),
    onSuccess: (data) => {
      if (data.user) {
        updateUser(data.user);
        queryClient.invalidateQueries({ queryKey: ["/api/store/owned"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        toast({
          title: "Purchase Successful!",
          description: "Item has been added to your collection.",
        });
        setPurchaseAnimation(null);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "You don't have enough DECITS or the item is unavailable.",
        variant: "destructive",
      });
      setPurchaseAnimation(null);
    }
  });

  const handlePurchase = (item: CosmeticItem) => {
    if ((user?.decits || 0) < item.price) {
      toast({
        title: "Insufficient DECITS",
        description: `You need ${item.price - (user?.decits || 0)} more DECITS to purchase this item.`,
        variant: "destructive",
      });
      return;
    }

    setPurchaseAnimation(item.id);
    purchaseMutation.mutate(item.id);
  };

  const filteredItems = items.filter((item: CosmeticItem) => 
    selectedTab === "all" || item.type === selectedTab
  );

  const addDecitsMutation = useMutation({
    mutationFn: (amount: number) => 
      apiRequest(`/api/user/add-decits`, {
        method: "POST",
        body: { amount }
      }),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      toast({
        title: "DECITS Added!",
        description: "Your DECITS balance has been updated.",
      });
    }
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent mb-2">
              DECITS Store
            </h1>
            <p className="text-slate-600 mb-4">Customize your learning experience with exclusive items</p>
            
            {/* DECITS Balance */}
            <div className="inline-flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-lg border border-yellow-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="text-lg font-bold text-yellow-900">{user?.decits || 0} DECITS</span>
              </div>
              
              {/* Test button to add DECITS */}
              <button
                onClick={() => addDecitsMutation.mutate(50)}
                className="px-4 py-1 bg-yellow-500 text-white text-sm rounded-full hover:bg-yellow-600 transition-colors"
              >
                +50 DECITS (Test)
              </button>
            </div>
          </motion.div>

          {/* Category Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-full p-1 shadow-lg">
              {["all", "background", "cursor", "theme", "avatar", "badge", "skin"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
                    selectedTab === tab
                      ? "bg-primary text-white shadow-md"
                      : "text-slate-600 hover:text-primary"
                  }`}
                >
                  {tab === "all" ? "All Items" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading store items...</p>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filteredItems.map((item: CosmeticItem) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ 
                      opacity: 1, 
                      scale: purchaseAnimation === item.id ? 1.1 : 1,
                      boxShadow: purchaseAnimation === item.id 
                        ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
                        : "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300"
                  >
                    {/* Rarity Header */}
                    <div className={`h-2 bg-gradient-to-r ${rarityColors[item.rarity as keyof typeof rarityColors]}`}></div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <i className={`${typeIcons[item.type as keyof typeof typeIcons]} text-primary`}></i>
                          <span className="text-xs text-slate-500 capitalize">{item.type}</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                          item.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                          item.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                          item.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.rarity}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-lg text-slate-800 mb-2">{item.name}</h3>
                      <p className="text-sm text-slate-600 mb-4 min-h-[40px]">{item.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <i className="fas fa-coins text-yellow-500"></i>
                          <span className="font-bold text-yellow-700">{item.price}</span>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePurchase(item)}
                          disabled={purchaseMutation.isPending || (user?.decits || 0) < item.price}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            (user?.decits || 0) >= item.price
                              ? "bg-primary text-white hover:bg-primary-600 shadow-md"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          {purchaseMutation.isPending && purchaseAnimation === item.id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Purchasing...</span>
                            </div>
                          ) : (
                            "Purchase"
                          )}
                        </motion.button>
                        {(() => {
                          const owned = (ownedItems as any[]).find((o: any) => o.id === item.id);
                          if (!owned) return null;
                          const isEquipped = Boolean(owned.isEquipped);
                          return (
                            <button
                              onClick={() => equipMutation.mutate({ itemId: item.id, isEquipped: !isEquipped })}
                              className={`px-3 py-2 rounded-lg text-sm border ${ isEquipped ? 'bg-emerald-500 text-white' : 'bg-white hover:bg-slate-50'} `}
                            >
                              {isEquipped ? 'Equipped' : 'Equip'}
                            </button>
                          );
                        })()}
                      </div>
                      
                      {item.unlockRequirement && (
                        <div className="mt-3 p-2 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-600">
                            <i className="fas fa-lock mr-1"></i>
                            Requires: {item.unlockRequirement}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {filteredItems.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <i className="fas fa-shopping-bag text-6xl text-slate-300 mb-4"></i>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No items found</h3>
              <p className="text-slate-600">Try selecting a different category.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}